import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ChevronRight, Receipt, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatPrice } from '@/lib/format'
import { parsePage, totalPages } from '@/lib/pagination'
import { Pagination } from '@/components/pagination'
import { EmptyState, PageHeader } from '@/components/ui'
import { StatusPill } from './status-pill'

const PAGE_SIZE = 50

const STATUSES = ['pending', 'paid', 'shipped', 'cancelled'] as const
type Status = (typeof STATUSES)[number] | 'all'

function pickStatus(v: string | string[] | undefined): Status {
  const raw = Array.isArray(v) ? v[0] : v
  return (STATUSES as readonly string[]).includes(raw ?? '')
    ? (raw as Status)
    : 'all'
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

export default async function OrdersPage({
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
    .select('id, name, currency')
    .eq('slug', slug)
    .maybeSingle()

  if (!store) notFound()

  let query = supabase
    .from('orders')
    .select(
      'id, customer_email, customer_name, total_cents, status, created_at',
      { count: 'exact' },
    )
    .eq('store_id', store.id)

  if (q) {
    // Postgrest 'or' chaining with ilike — match across email OR name.
    query = query.or(`customer_email.ilike.%${q}%,customer_name.ilike.%${q}%`)
  }
  if (status !== 'all') query = query.eq('status', status)

  const { data: orders, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, rangeEnd)

  const currency = store.currency ?? 'USD'
  const pages = totalPages(count, PAGE_SIZE)
  const hasFilters = q !== '' || status !== 'all'
  const paginationQuery = {
    q: q || undefined,
    status: status === 'all' ? undefined : status,
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
      <Link
        href={`/dashboard/${slug}`}
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {store.name}
      </Link>

      <div className="mt-4">
        <PageHeader
          title="Orders"
          description={
            count !== null && count > 0
              ? `${count} ${hasFilters ? 'matching' : 'total'}.`
              : undefined
          }
        />
      </div>

      <form
        action={`/dashboard/${slug}/orders`}
        className="mt-6 flex flex-col gap-3 sm:flex-row"
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search by customer name or email"
            className="input pl-10"
          />
        </div>
        <select name="status" defaultValue={status} className="input sm:w-44">
          <option value="all">All statuses</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="shipped">Shipped</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button type="submit" className="btn-secondary">
          Apply
        </button>
        {hasFilters && (
          <Link href={`/dashboard/${slug}/orders`} className="btn-ghost">
            Clear
          </Link>
        )}
      </form>

      {!orders || orders.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            icon={<Receipt className="h-6 w-6" />}
            title={
              hasFilters
                ? 'No orders match your filters'
                : page > 1
                  ? 'No orders on this page'
                  : 'No orders yet'
            }
            description={
              hasFilters
                ? 'Try clearing the search or status filter.'
                : page > 1
                  ? undefined
                  : "They'll show up here as customers check out."
            }
          />
        </div>
      ) : (
        <>
          <div className="card mt-8 overflow-hidden">
            <div className="hidden border-b border-gray-200 bg-gray-50 px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-gray-500 sm:block">
              <div className="grid grid-cols-[160px_1fr_120px_120px_40px] gap-4">
                <div>Date</div>
                <div>Customer</div>
                <div>Total</div>
                <div>Status</div>
                <div />
              </div>
            </div>
            <ul className="divide-y divide-gray-200">
              {orders.map((o) => (
                <li key={o.id}>
                  <Link
                    href={`/dashboard/${slug}/orders/${o.id}`}
                    className="block px-4 py-3 transition hover:bg-gray-50"
                  >
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-[160px_1fr_120px_120px_40px] sm:items-center sm:gap-4">
                      <div className="text-xs text-gray-500 sm:text-sm">
                        {formatDate(o.created_at)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {o.customer_name ?? o.customer_email}
                        </p>
                        {o.customer_name && (
                          <p className="truncate text-xs text-gray-500">
                            {o.customer_email}
                          </p>
                        )}
                      </div>
                      <div className="text-sm font-medium tabular-nums text-gray-900">
                        {formatPrice(o.total_cents, currency)}
                      </div>
                      <div>
                        <StatusPill status={o.status} />
                      </div>
                      <ChevronRight className="hidden h-4 w-4 text-gray-400 sm:block" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Pagination
            basePath={`/dashboard/${slug}/orders`}
            page={page}
            totalPages={pages}
            query={paginationQuery}
          />
        </>
      )}
    </main>
  )
}
