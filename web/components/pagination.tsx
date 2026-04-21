import Link from 'next/link'

export function Pagination({
  basePath,
  page,
  totalPages,
  query,
}: {
  basePath: string
  page: number
  totalPages: number
  query?: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null

  const prev = page > 1 ? page - 1 : null
  const next = page < totalPages ? page + 1 : null

  const href = (p: number) => {
    const params = new URLSearchParams()
    if (query) {
      for (const [k, v] of Object.entries(query)) {
        if (v) params.set(k, v)
      }
    }
    params.set('page', String(p))
    return `${basePath}?${params.toString()}`
  }

  return (
    <nav className="mt-6 flex items-center justify-between text-sm">
      {prev ? (
        <Link
          href={href(prev)}
          className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
        >
          ← Previous
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-md border border-gray-200 px-3 py-1.5 text-gray-400">
          ← Previous
        </span>
      )}

      <span className="text-gray-500">
        Page {page} of {totalPages}
      </span>

      {next ? (
        <Link
          href={href(next)}
          className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50"
        >
          Next →
        </Link>
      ) : (
        <span className="cursor-not-allowed rounded-md border border-gray-200 px-3 py-1.5 text-gray-400">
          Next →
        </span>
      )}
    </nav>
  )
}
