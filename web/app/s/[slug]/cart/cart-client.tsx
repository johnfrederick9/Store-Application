'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ImageIcon,
  Info,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
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

export function CartClient({
  storeSlug,
  storeId,
  currency,
  checkoutEnabled,
}: {
  storeSlug: string
  storeId: string
  currency: string
  checkoutEnabled: boolean
}) {
  const { items, setQuantity, remove, clear } = useCart(storeSlug)
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    if (items.length === 0) {
      setProducts([])
      return
    }
    const supabase = createClient()
    const ids = items.map((i) => i.productId)
    supabase
      .from('products')
      .select('id, name, price_cents, image_url, stock')
      .eq('store_id', storeId)
      .eq('active', true)
      .in('id', ids)
      .then(({ data }) => setProducts(data ?? []))
  }, [items, storeId])

  if (products === null) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <p className="text-sm text-gray-500">Loading…</p>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href={`/s/${storeSlug}`}
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Continue shopping
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          Your cart
        </h1>
        <div className="mt-8">
          <EmptyState
            icon={<ShoppingBag className="h-6 w-6" />}
            title="Your cart is empty"
            description="Add something you like — you can check out any time."
            action={
              <Link href={`/s/${storeSlug}`} className="btn-primary">
                Browse products
              </Link>
            }
          />
        </div>
      </main>
    )
  }

  const lineItems = items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      return product ? { ...item, product } : null
    })
    .filter((x): x is NonNullable<typeof x> => x !== null)

  const missing = items.length - lineItems.length
  const subtotal = lineItems.reduce(
    (sum, li) => sum + li.product.price_cents * li.quantity,
    0,
  )

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={`/s/${storeSlug}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Continue shopping
      </Link>

      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
        Your cart
      </h1>

      {missing > 0 && (
        <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800 ring-1 ring-amber-200">
          {missing} item{missing > 1 ? 's are' : ' is'} no longer available and
          {missing > 1 ? ' have' : ' has'} been removed.
        </div>
      )}

      <ul className="card mt-6 divide-y divide-gray-200">
        {lineItems.map((li) => (
          <li key={li.productId} className="flex gap-4 p-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
              {li.product.image_url ? (
                <Image
                  src={supabaseImage(li.product.image_url, { width: 160, resize: 'cover' })!}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  <ImageIcon className="h-6 w-6" />
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col">
              <div className="flex justify-between gap-2">
                <Link
                  href={`/s/${storeSlug}/p/${li.product.id}`}
                  className="text-sm font-medium hover:underline"
                >
                  {li.product.name}
                </Link>
                <p className="text-sm font-medium tabular-nums">
                  {formatPrice(
                    li.product.price_cents * li.quantity,
                    currency,
                  )}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                {formatPrice(li.product.price_cents, currency)} each
              </p>

              <div className="mt-auto flex items-center justify-between pt-3">
                <div className="flex items-center rounded-lg border border-gray-200 bg-white">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(li.productId, li.quantity - 1)
                    }
                    className="flex h-8 w-8 items-center justify-center text-gray-700 transition hover:bg-gray-50"
                    aria-label="Decrease"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm tabular-nums">
                    {li.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(li.productId, li.quantity + 1)
                    }
                    disabled={li.quantity >= li.product.stock}
                    className="flex h-8 w-8 items-center justify-center text-gray-700 transition hover:bg-gray-50 disabled:opacity-40"
                    aria-label="Increase"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(li.productId)}
                  className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-red-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={clear}
          className="text-sm text-gray-500 hover:underline"
        >
          Clear cart
        </button>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-gray-500">
            Subtotal
          </p>
          <p className="text-2xl font-semibold tabular-nums">
            {formatPrice(subtotal, currency)}
          </p>
        </div>
      </div>

      {checkoutEnabled ? (
        <>
          <Link
            href={`/s/${storeSlug}/checkout`}
            className="btn-primary mt-6 !w-full !py-3 text-base"
          >
            Checkout
          </Link>
          <p className="mt-3 text-center text-xs text-gray-500">
            Shipping and taxes calculated at checkout
          </p>
        </>
      ) : (
        <>
          <div className="mt-6 flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-800 ring-1 ring-amber-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Checkout is temporarily unavailable — this store is in demo mode.
              You can still browse and build a cart.
            </span>
          </div>
          <button
            type="button"
            disabled
            className="btn-primary mt-4 !w-full !py-3 text-base"
            aria-disabled="true"
          >
            Checkout unavailable (demo)
          </button>
        </>
      )}
    </main>
  )
}
