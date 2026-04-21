export type PageInfo = {
  page: number // 1-indexed for UX
  pageSize: number
  offset: number
  rangeEnd: number // inclusive, suitable for supabase .range()
}

export function parsePage(
  searchParams: { page?: string | string[] } | undefined,
  pageSize: number,
): PageInfo {
  const raw = Array.isArray(searchParams?.page)
    ? searchParams?.page[0]
    : searchParams?.page
  const parsed = Number.parseInt(raw ?? '1', 10)
  const page = Number.isFinite(parsed) && parsed > 0 ? parsed : 1
  const offset = (page - 1) * pageSize
  return {
    page,
    pageSize,
    offset,
    rangeEnd: offset + pageSize - 1,
  }
}

export function totalPages(total: number | null, pageSize: number): number {
  if (!total || total <= 0) return 1
  return Math.max(1, Math.ceil(total / pageSize))
}
