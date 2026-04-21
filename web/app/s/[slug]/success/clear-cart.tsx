'use client'

import { useEffect } from 'react'
import { useCart } from '@/lib/cart'

export function ClearCartOnMount({ storeSlug }: { storeSlug: string }) {
  const { clear } = useCart(storeSlug)
  useEffect(() => {
    clear()
  }, [clear])
  return null
}
