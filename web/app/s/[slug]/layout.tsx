import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseImage } from '@/lib/image'
import { CartBadge } from './cart-badge'

export default async function StorefrontLayout({
  params,
  children,
}: {
  params: Promise<{ slug: string }>
  children: React.ReactNode
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('name, slug, logo_url')
    .eq('slug', slug)
    .maybeSingle()

  if (!store) notFound()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href={`/s/${store.slug}`}
            className="flex items-center gap-3"
          >
            {store.logo_url ? (
              <Image
                src={supabaseImage(store.logo_url, { width: 72, resize: 'cover' })!}
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 rounded-lg object-cover ring-1 ring-gray-200"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-sm font-semibold text-[var(--brand)]">
                {store.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="text-base font-semibold tracking-tight">
              {store.name}
            </span>
          </Link>
          <CartBadge storeSlug={store.slug} />
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <p>
          <span className="font-medium text-gray-700">{store.name}</span>{' '}
          · Powered by Storefront
        </p>
      </footer>
    </div>
  )
}
