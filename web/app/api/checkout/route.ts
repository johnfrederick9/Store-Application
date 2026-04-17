import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { getStripe } from '@/lib/stripe'

const bodySchema = z.object({
  storeSlug: z.string().min(1),
  customerEmail: z.string().email(),
  customerName: z.string().min(1).max(120).optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(999),
      }),
    )
    .min(1)
    .max(50),
})

export async function POST(request: Request) {
  let parsed
  try {
    parsed = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { storeSlug, customerEmail, customerName, items } = parsed

  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, currency')
    .eq('slug', storeSlug)
    .maybeSingle()

  if (!store) {
    return NextResponse.json({ error: 'Store not found' }, { status: 404 })
  }

  const ids = items.map((i) => i.productId)
  const { data: products } = await supabase
    .from('products')
    .select('id, name, price_cents, image_url, stock, active')
    .eq('store_id', store.id)
    .in('id', ids)

  if (!products || products.length !== items.length) {
    return NextResponse.json(
      { error: 'Some items are no longer available' },
      { status: 409 },
    )
  }

  const currency = (store.currency ?? 'USD').toLowerCase()
  const lineItems: {
    quantity: number
    price_data: {
      currency: string
      product_data: { name: string; images?: string[] }
      unit_amount: number
    }
  }[] = []

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)
    if (!product || !product.active) {
      return NextResponse.json(
        { error: `"${product?.name ?? 'Item'}" is no longer available` },
        { status: 409 },
      )
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        {
          error: `Only ${product.stock} of "${product.name}" in stock`,
        },
        { status: 409 },
      )
    }
    lineItems.push({
      quantity: item.quantity,
      price_data: {
        currency,
        product_data: {
          name: product.name,
          ...(product.image_url ? { images: [product.image_url] } : {}),
        },
        unit_amount: product.price_cents,
      },
    })
  }

  // Persist the cart intent in a draft row. Stripe metadata has a 500-char
  // limit per key, so inlining items breaks at ~10 items. We pass only the
  // draft id and the webhook looks up the full cart from Postgres.
  const { data: draft, error: draftError } = await supabase
    .from('checkout_drafts')
    .insert({
      store_id: store.id,
      items: items.map((i) => ({ p: i.productId, q: i.quantity })),
    })
    .select('id')
    .single()

  if (draftError || !draft) {
    return NextResponse.json(
      { error: 'Failed to prepare checkout' },
      { status: 500 },
    )
  }

  const origin =
    request.headers.get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!

  const session = await getStripe().checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: customerEmail,
    shipping_address_collection: { allowed_countries: ['US', 'CA', 'GB'] },
    success_url: `${origin}/s/${storeSlug}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/s/${storeSlug}/cart`,
    metadata: {
      draft_id: draft.id,
      store_id: store.id,
      store_slug: storeSlug,
      customer_name: customerName ?? '',
    },
  })

  if (!session.url) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 },
    )
  }

  return NextResponse.json({ url: session.url })
}
