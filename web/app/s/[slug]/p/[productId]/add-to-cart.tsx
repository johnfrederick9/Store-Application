'use client'

import { Check, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useCart } from '@/lib/cart'

export function AddToCartButton({
  storeSlug,
  productId,
  productName,
  maxStock,
}: {
  storeSlug: string
  productId: string
  productName: string
  maxStock: number
}) {
  const { add, items } = useCart(storeSlug)
  const [flash, setFlash] = useState(false)

  const inCart = items.find((i) => i.productId === productId)?.quantity ?? 0
  const canAdd = inCart < maxStock

  if (maxStock === 0) {
    return (
      <button
        type="button"
        disabled
        className="w-full rounded-lg bg-gray-200 px-5 py-3 text-sm font-medium text-gray-500"
      >
        Sold out
      </button>
    )
  }

  return (
    <button
      type="button"
      disabled={!canAdd}
      onClick={() => {
        add(productId, 1)
        setFlash(true)
        toast.success(`${productName} added to cart`)
        setTimeout(() => setFlash(false), 1500)
      }}
      className="btn-primary !w-full !py-3 text-base"
    >
      {flash ? (
        <>
          <Check className="h-4 w-4" />
          Added
        </>
      ) : !canAdd ? (
        `Max ${maxStock} in cart`
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" />
          {inCart > 0 ? `Add another (${inCart} in cart)` : 'Add to cart'}
        </>
      )}
    </button>
  )
}
