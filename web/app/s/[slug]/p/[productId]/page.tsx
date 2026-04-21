import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ImageIcon, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/format'
import { supabaseImage } from '@/lib/image'
import { AddToCartButton } from './add-to-cart'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>
}): Promise<Metadata> {
  const { slug, productId } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id, name')
    .eq('slug', slug)
    .maybeSingle()

  if (!store) return { title: 'Product not found' }

  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('id', productId)
    .eq('store_id', store.id)
    .eq('active', true)
    .maybeSingle()

  if (!product) return { title: 'Product not found' }

  const title = product.name
  const description =
    product.description?.trim().slice(0, 160) ||
    `Available at ${store.name}.`
  const ogImage = supabaseImage(product.image_url, {
    width: 1200,
    height: 630,
    resize: 'cover',
  })
  const canonical = `/s/${slug}/p/${productId}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: 'website',
      ...(ogImage && { images: [{ url: ogImage, width: 1200, height: 630 }] }),
    },
    twitter: {
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage && { images: [ogImage] }),
    },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string; productId: string }>
}) {
  const { slug, productId } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id, currency')
    .eq('slug', slug)
    .maybeSingle()

  if (!store) notFound()

  const { data: product } = await supabase
    .from('products')
    .select('id, name, description, price_cents, image_url, stock, active')
    .eq('id', productId)
    .eq('store_id', store.id)
    .eq('active', true)
    .maybeSingle()

  if (!product) notFound()

  const currency = store.currency ?? 'USD'

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-12">
      <Link
        href={`/s/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        All products
      </Link>

      <div className="mt-6 grid gap-8 sm:grid-cols-2 sm:gap-10">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-200">
          {product.image_url ? (
            <Image
              src={supabaseImage(product.image_url, { width: 1200, resize: 'cover', quality: 80 })!}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-gray-300">
              <ImageIcon className="h-16 w-16" />
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-3 text-2xl text-gray-900">
            {formatPrice(product.price_cents, currency)}
          </p>

          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
            <Package className="h-3.5 w-3.5" />
            {product.stock === 0
              ? 'Out of stock'
              : `${product.stock} in stock`}
          </div>

          {product.description && (
            <p className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
              {product.description}
            </p>
          )}

          <div className="mt-8 sm:mt-auto sm:pt-8">
            <AddToCartButton
              storeSlug={slug}
              productId={product.id}
              productName={product.name}
              maxStock={product.stock}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
