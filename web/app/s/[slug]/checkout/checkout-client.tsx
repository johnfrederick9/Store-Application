'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { ArrowLeft, ImageIcon, Lock, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useCart } from '@/lib/cart'
import { formatPrice } from '@/lib/format'
import { supabaseImage } from '@/lib/image'
import { EmptyState } from '@/components/ui'

type Product = {
  id: string
  name: string
  price_cents: number
  image_url: string | null
  stock: number
}

export function CheckoutClient({
  storeSlug,
  storeId,
  currency,
}: {
  storeSlug: string
  storeId: string
  currency: string
}) {
  const { items } = useCart(storeSlug)
  const [products, setProducts] = useState<Product[] | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (items.length === 0) {
      setProducts([])
      return
    }
    const supabase = createClient()
    supabase
      .from('products')
      .select('id, name, price_cents, image_url, stock')
      .eq('store_id', storeId)
      .eq('active', true)
      .in(
        'id',
        items.map((i) => i.productId),
      )
      .then(({ data }) => setProducts(data ?? []))
  }, [items, storeId])

  const lineItems = (products ?? [])
    .map((product) => {
      const cartItem = items.find((i) => i.productId === product.id)
      return cartItem ? { product, quantity: cartItem.quantity } : null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  const subtotal = lineItems.reduce(
    (sum, li) => sum + li.product.price_cents * li.quantity,
    0,
  )

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          storeSlug,
          customerEmail: email,
          customerName: name || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error ?? 'Checkout failed')
      }
      window.location.href = data.url
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Checkout failed')
      setSubmitting(false)
    }
  }

  if (products === null) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm text-gray-500">Loading…</p>
      </main>
    )
  }

  if (items.length === 0 || lineItems.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <h1 className="text-2xl font-semibold tracking-tight">Checkout</h1>
        <div className="mt-6">
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Nothing to check out"
            description="Your cart is empty."
            action={
              <Link href={`/s/${storeSlug}`} className="btn-primary">
                Keep shopping
              </Link>
            }
          />
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={`/s/${storeSlug}/cart`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cart
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        Checkout
      </h1>

      <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900">
            Contact information
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input mt-1.5"
                placeholder="you@example.com"
              />
              <p className="hint">Receipt and shipping updates are sent here.</p>
            </div>

            <div>
              <label htmlFor="name" className="label">
                Name <span className="font-normal text-gray-500">(optional)</span>
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input mt-1.5"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary mt-6 !w-full !py-3 text-base"
          >
            {submitting ? (
              'Redirecting to Stripe…'
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Pay securely with Stripe
              </>
            )}
          </button>

          <p className="mt-3 text-center text-xs text-gray-500">
            Shipping address collected on the next step
          </p>
        </form>

        <aside className="card h-fit p-5">
          <h2 className="text-sm font-semibold text-gray-900">Order summary</h2>
          <ul className="mt-4 divide-y divide-gray-100">
            {lineItems.map((li) => (
              <li key={li.product.id} className="flex items-center gap-3 py-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                  {li.product.image_url ? (
                    <Image
                      src={supabaseImage(li.product.image_url, { width: 96, resize: 'cover' })!}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 text-sm">
                  <p className="line-clamp-1 font-medium">{li.product.name}</p>
                  <p className="text-xs text-gray-500">× {li.quantity}</p>
                </div>
                <p className="text-sm tabular-nums">
                  {formatPrice(
                    li.product.price_cents * li.quantity,
                    currency,
                  )}
                </p>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
            <span className="text-sm text-gray-600">Subtotal</span>
            <span className="text-base font-semibold tabular-nums">
              {formatPrice(subtotal, currency)}
            </span>
          </div>
        </aside>
      </div>
    </main>
  )
}
