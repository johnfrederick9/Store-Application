import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ImageIcon, PackageOpen } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/format'
import { supabaseImage } from '@/lib/image'
import { parsePage, totalPages } from '@/lib/pagination'
import { Pagination } from '@/components/pagination'
import { EmptyState } from '@/components/ui'

const PAGE_SIZE = 24

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('name, logo_url')
    .eq('slug', slug)
    .maybeSingle()

  if (!store) return { title: 'Store not found' }

  const title = store.name
  const description = `Shop ${store.name} online. Fast checkout, real payments, straight to you.`
  const ogImage = supabaseImage(store.logo_url, {
    width: 1200,
    height: 630,
    resize: 'cover',
  })
  const canonical = `/s/${slug}`

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

export default async function StorefrontHome({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const { page, offset, rangeEnd } = parsePage(sp, PAGE_SIZE)

  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id, currency')
    .eq('slug', slug)
    .maybeSingle()

  if (!store) notFound()

  const { data: products, count } = await supabase
    .from('products')
    .select('id, name, price_cents, image_url, stock', { count: 'exact' })
    .eq('store_id', store.id)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .range(offset, rangeEnd)

  const currency = store.currency ?? 'USD'
  const pages = totalPages(count, PAGE_SIZE)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {!products || products.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="h-6 w-6" />}
          title={
            page > 1 ? 'No products on this page' : 'Nothing here yet'
          }
          description={
            page > 1
              ? undefined
              : 'This store is still setting up. Check back soon.'
          }
        />
      ) : (
        <>
          <ul className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/s/${slug}/p/${p.id}`}
                  className="group block"
                >
                  <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 ring-1 ring-gray-200">
                    {p.image_url ? (
                      <Image
                        src={supabaseImage(p.image_url, { width: 600, resize: 'cover', quality: 75 })!}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <ImageIcon className="h-10 w-10" />
                      </div>
                    )}
                    {p.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                          Sold out
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2.5">
                    <p className="line-clamp-1 text-sm font-medium text-gray-900">
                      {p.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatPrice(p.price_cents, currency)}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          <Pagination
            basePath={`/s/${slug}`}
            page={page}
            totalPages={pages}
          />
        </>
      )}
    </main>
  )
}
