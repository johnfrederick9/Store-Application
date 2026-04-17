import { NextResponse } from 'next/server'
import type Stripe from 'stripe'
import { getStripe } from '@/lib/stripe'
import { createServiceClient } from '@/lib/supabase/service'
import { sendOrderConfirmation } from '@/lib/email'

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET

  if (!signature || !secret) {
    return NextResponse.json(
      { error: 'Missing signature or secret' },
      { status: 400 },
    )
  }

  let event: Stripe.Event
  try {
    event = await getStripe().webhooks.constructEventAsync(
      body,
      signature,
      secret,
    )
  } catch (err) {
    console.error('[stripe webhook] signature verification failed', err)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 },
    )
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const session = event.data.object as Stripe.Checkout.Session
  const supabase = createServiceClient()

  // Idempotency: a retried delivery will hit the unique constraint on
  // stripe_session_id and return the already-created order.
  const { data: existing } = await supabase
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ received: true, duplicate: true })
  }

  const draftId = session.metadata?.draft_id
  const storeId = session.metadata?.store_id
  const customerName =
    session.customer_details?.name ??
    (session.metadata?.customer_name || null)
  const customerEmail =
    session.customer_details?.email ?? session.customer_email ?? null

  if (!draftId || !storeId || !customerEmail) {
    console.error('[stripe webhook] missing metadata', { id: session.id })
    return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
  }

  const { data: draft, error: draftError } = await supabase
    .from('checkout_drafts')
    .select('items')
    .eq('id', draftId)
    .maybeSingle()

  if (draftError || !draft) {
    console.error('[stripe webhook] draft not found', { draftId })
    return NextResponse.json({ error: 'Draft not found' }, { status: 500 })
  }

  const cartItems = draft.items as { p: string; q: number }[]
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return NextResponse.json(
      { error: 'Bad draft.items' },
      { status: 400 },
    )
  }

  // Re-read product prices server-side so we record authoritative amounts.
  const ids = cartItems.map((i) => i.p)
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price_cents, stock')
    .in('id', ids)

  if (!products || products.length === 0) {
    return NextResponse.json(
      { error: 'Products not found' },
      { status: 500 },
    )
  }

  const lines = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.p)
      return product
        ? {
            product_id: product.id,
            name: product.name,
            quantity: item.q,
            price_cents: product.price_cents,
          }
        : null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  const totalCents = lines.reduce(
    (sum, l) => sum + l.price_cents * l.quantity,
    0,
  )

  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      store_id: storeId,
      customer_email: customerEmail,
      customer_name: customerName,
      total_cents: totalCents,
      status: 'paid',
      stripe_session_id: session.id,
    })
    .select('id')
    .single()

  if (orderError || !order) {
    if (orderError?.code === '23505') {
      return NextResponse.json({ received: true, duplicate: true })
    }
    console.error('[stripe webhook] order insert failed', orderError)
    return NextResponse.json(
      { error: 'Failed to record order' },
      { status: 500 },
    )
  }

  const itemRows = lines.map((l) => ({
    order_id: order.id,
    product_id: l.product_id,
    quantity: l.quantity,
    price_cents: l.price_cents,
  }))

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(itemRows)

  if (itemsError) {
    console.error('[stripe webhook] order_items insert failed', itemsError)
    // Do not 500 — order row is recorded. Logged for reconciliation.
  }

  // Decrement stock. Non-atomic but acceptable for MVP; oversells get refunded manually.
  for (const line of lines) {
    const current = products.find((p) => p.id === line.product_id)
    if (!current) continue
    const nextStock = Math.max(0, current.stock - line.quantity)
    await supabase
      .from('products')
      .update({ stock: nextStock })
      .eq('id', line.product_id)
  }

  // Fetch store for email
  const { data: store } = await supabase
    .from('stores')
    .select('name, currency')
    .eq('id', storeId)
    .maybeSingle()

  await sendOrderConfirmation({
    to: customerEmail,
    storeName: store?.name ?? 'Store',
    orderId: order.id,
    currency: store?.currency ?? 'USD',
    totalCents,
    lines: lines.map((l) => ({
      name: l.name,
      quantity: l.quantity,
      unitCents: l.price_cents,
    })),
  })

  return NextResponse.json({ received: true, orderId: order.id })
}
