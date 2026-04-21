type TransformOpts = {
  width?: number
  height?: number
  quality?: number
  resize?: 'cover' | 'contain' | 'fill'
}

/**
 * Rewrites a Supabase public-storage URL to its on-the-fly render endpoint so
 * the CDN returns a resized/recompressed image instead of the full-res
 * original. Non-Supabase URLs (or nulls) are returned unchanged — safe to call
 * on any image field.
 *
 * /storage/v1/object/public/bucket/key  →
 * /storage/v1/render/image/public/bucket/key?width=…&resize=cover&quality=…
 */
export function supabaseImage(
  url: string | null | undefined,
  opts: TransformOpts = {},
): string | null {
  if (!url) return null
  if (!url.includes('/storage/v1/object/public/')) return url

  const transformed = url.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/',
  )
  const params = new URLSearchParams()
  if (opts.width) params.set('width', String(opts.width))
  if (opts.height) params.set('height', String(opts.height))
  if (opts.quality) params.set('quality', String(opts.quality))
  if (opts.resize) params.set('resize', opts.resize)
  const qs = params.toString()
  return qs ? `${transformed}?${qs}` : transformed
}
