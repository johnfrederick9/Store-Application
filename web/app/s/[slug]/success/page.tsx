import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, ImageIcon, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/format'
import { supabaseImage } from '@/lib/image'
import { ClearCartOnMount } from './clear-cart'

type ReceiptItem = {
  name: string
  quantity: number
  price_cents: number
  image_url: string | null
}

type Receipt = {
  id: string
  created_at: string
  total_cents: number
  status: string
  customer_email: string
  customer_name: string | null
  store: { name: string; slug: string; currency: string | null }
  items: ReceiptItem[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ session_id?: string }>
}) {
  const { slug } = await params
  const { session_id } = await searchParams

  let receipt: Receipt | null = null
  if (session_id) {
    const supabase = await createClient()
    const { data } = await supabase.rpc('get_order_receipt', {
      p_session_id: session_id,
    })
    receipt = (data as Receipt | null) ?? null
  }

  const currency = receipt?.store.currency ?? 'USD'

  return (
    <main className="relative mx-auto max-w-2xl px-4 py-12 sm:px-6 sm:py-16">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[400px] bg-gradient-to-b from-emerald-50 to-transparent" />
      <ClearCartOnMount storeSlug={slug} />

      <div className="text-center">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <div className="absolute inset-0 animate-ping rounded-full bg-emerald-200 opacity-50" />
          <Check className="relative h-9 w-9 text-emerald-600" strokeWidth={3} />
        </div>

        <h1 className="mt-8 text-3xl font-semibold tracking-tight sm:text-4xl">
          Thanks for your order!
        </h1>
        <p className="mt-3 text-base text-gray-600">
          Your payment went through. We&apos;re on it.
        </p>

        {receipt && (
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200">
            <Mail className="h-4 w-4 text-gray-400" />
            Receipt sent to {receipt.customer_email}
          </div>
        )}
      </div>

      {receipt ? (
        <section className="card mt-10 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Order
                </p>
                <p className="mt-0.5 font-mono text-sm text-gray-900">
                  #{receipt.id.slice(0, 8)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Date
                </p>
                <p className="mt-0.5 text-sm text-gray-900">
                  {formatDate(receipt.created_at)}
                </p>
              </div>
            </div>
          </div>

          <ul className="divide-y divide-gray-200">
            {receipt.items.map((item, idx) => (
              <li
                key={`${item.name}-${idx}`}
                className="flex items-center gap-4 px-5 py-4"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100 ring-1 ring-gray-200">
                  {item.image_url ? (
                    <Image
                      src={supabaseImage(item.image_url, {
                        width: 112,
                        resize: 'cover',
                      })!}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                      <ImageIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Quantity {item.quantity}
                  </p>
                </div>
                <div className="text-right text-sm font-medium tabular-nums text-gray-900">
                  {formatPrice(item.price_cents * item.quantity, currency)}
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
            <div className="flex items-center justify-between text-base font-semibold">
              <span>Total</span>
              <span className="tabular-nums">
                {formatPrice(receipt.total_cents, currency)}
              </span>
            </div>
          </div>
        </section>
      ) : (
        <p className="mt-8 text-center text-sm text-gray-500">
          Receipt details are still being processed — check your email in a
          minute for the full breakdown.
        </p>
      )}

      <div className="mt-10 flex justify-center">
        <Link
          href={`/s/${slug}`}
          className="btn-primary !px-6 !py-3 text-base"
        >
          Back to store
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {session_id && !receipt && (
        <p className="mt-6 break-all text-center text-xs text-gray-400">
          Reference: <code className="font-mono">{session_id}</code>
        </p>
      )}
    </main>
  )
}
