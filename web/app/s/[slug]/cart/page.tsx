import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CartClient } from './cart-client'

export default async function CartPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id, currency')
    .eq('slug', slug)
    .maybeSingle()

  if (!store) notFound()

  return (
    <CartClient
      storeSlug={slug}
      storeId={store.id}
      currency={store.currency ?? 'USD'}
    />
  )
}
