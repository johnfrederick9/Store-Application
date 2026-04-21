'use client'

import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/lib/cart'

export function CartBadge({ storeSlug }: { storeSlug: string }) {
  const { count } = useCart(storeSlug)

  return (
    <Link
      href={`/s/${storeSlug}/cart`}
      className="relative inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm font-medium text-gray-900 shadow-sm transition hover:border-gray-300 hover:shadow"
      aria-label={`Cart (${count} items)`}
    >
      <ShoppingBag className="h-4 w-4" />
      Cart
      {count > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--brand)] px-1.5 text-[11px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  )
}
