import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="mx-auto max-w-md px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Store not found</h1>
      <p className="mt-2 text-sm text-gray-600">
        This link may be wrong, or the store may have been removed.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
      >
        Home
      </Link>
    </main>
  )
}
