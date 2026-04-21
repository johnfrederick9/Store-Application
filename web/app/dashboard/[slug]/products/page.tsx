import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ImageIcon, Package, Plus, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/format'
import { supabaseImage } from '@/lib/image'
import { parsePage, totalPages } from '@/lib/pagination'
import { Pagination } from '@/components/pagination'
import { Badge, EmptyState, PageHeader } from '@/components/ui'
import { toggleProductActive } from './actions'

const PAGE_SIZE = 24

type Status = 'all' | 'active' | 'inactive'

function pickStatus(v: string | string[] | undefined): Status {
  const raw = Array.isArray(v) ? v[0] : v
  return raw === 'active' || raw === 'inactive' ? raw : 'all'
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    page?: string
    q?: string
    status?: string
  }>
}) {
  const { slug } = await params
  const sp = await searchParams
  const { page, offset, rangeEnd } = parsePage(sp, PAGE_SIZE)

  const q = (Array.isArray(sp.q) ? sp.q[0] : sp.q)?.trim() ?? ''
  const status = pickStatus(sp.status)

  const supabase = await createClient()

  const { data: store } = await supabase
    .from('stores')
    .select('id, name, slug, currency')
    .eq('slug', slug)
    .maybeSingle()

  if (!store) notFound()

  let query = supabase
    .from('products')
    .select('id, name, price_cents, stock, active, image_url', {
      count: 'exact',
    })
    .eq('store_id', store.id)

  if (q) query = query.ilike('name', `%${q}%`)
  if (status === 'active') query = query.eq('active', true)
  if (status === 'inactive') query = query.eq('active', false)

  const { data: products, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, rangeEnd)

  const pages = totalPages(count, PAGE_SIZE)
  const currency = store.currency ?? 'USD'
  const hasFilters = q !== '' || status !== 'all'
  const paginationQuery = { q: q || undefined, status: status === 'all' ? undefined : status }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={`/dashboard/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {store.name}
      </Link>

      <div className="mt-4">
        <PageHeader
          title="Products"
          description={
            count !== null && count > 0
              ? `${count} ${hasFilters ? 'matching' : 'total in your catalog'}.`
              : undefined
          }
          action={
            <Link
              href={`/dashboard/${slug}/products/new`}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
              New product
            </Link>
          }
        />
      </div>

      <form
        action={`/dashboard/${slug}/products`}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by name"
            className="input pl-10"
          />
        </div>
        <select
          name="status"
          defaultValue={status}
          className="input sm:w-40"
        >
          <option value="all">All products</option>
          <option value="active">Active only</option>
          <option value="inactive">Hidden only</option>
        </select>
        <button type="submit" className="btn-secondary">
          Apply
        </button>
        {hasFilters && (
          <Link
            href={`/dashboard/${slug}/products`}
            className="btn-ghost"
          >
            Clear
          </Link>
        )}
      </form>

      {!products || products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Package className="h-6 w-6" />}
            title={
              hasFilters
                ? 'No products match your filters'
                : page > 1
                  ? 'No products on this page'
                  : 'No products yet'
            }
            description={
              hasFilters
                ? 'Try clearing the search or status filter.'
                : page > 1
                  ? undefined
                  : 'Add your first product to start selling.'
            }
            action={
              !hasFilters && page === 1 ? (
                <Link
                  href={`/dashboard/${slug}/products/new`}
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4" />
                  Add your first product
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <>
          <ul className="card mt-8 divide-y divide-gray-200">
            {products.map((p) => (
              <li key={p.id}>
                <div className="flex items-center gap-4 px-4 py-3">
                  <Link
                    href={`/dashboard/${slug}/products/${p.id}`}
                    className="flex flex-1 items-center gap-4 min-w-0"
                  >
                    {p.image_url ? (
                      <Image
                        src={supabaseImage(p.image_url, { width: 112, resize: 'cover' })!}
                        alt=""
                        width={56}
                        height={56}
                        className="h-14 w-14 rounded-lg object-cover ring-1 ring-gray-200"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900">
                        {p.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500">
                        <span className="tabular-nums font-medium text-gray-700">
                          {formatPrice(p.price_cents, currency)}
                        </span>
                        <span>·</span>
                        <span
                          className={
                            p.stock === 0
                              ? 'font-medium text-red-700'
                              : 'text-gray-500'
                          }
                        >
                          {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                        </span>
                      </div>
                    </div>
                  </Link>
                  <form
                    action={async () => {
                      'use server'
                      await toggleProductActive(slug, p.id, !p.active)
                    }}
                  >
                    <button type="submit" className="transition hover:opacity-80">
                      {p.active ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge>Hidden</Badge>
                      )}
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>

          <Pagination
            basePath={`/dashboard/${slug}/products`}
            page={page}
            totalPages={pages}
            query={paginationQuery}
          />
        </>
      )}
    </main>
  )
}
