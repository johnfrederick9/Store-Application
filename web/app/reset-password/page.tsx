import Link from 'next/link'
import { redirect } from 'next/navigation'
import { KeyRound } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import ResetPasswordForm from './reset-password-form'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Someone landed here without a valid recovery session — send them to ask
  // for a new link.
  if (!user) redirect('/forgot-password')

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-gradient-to-b from-[var(--brand-soft)] to-transparent" />

      <div className="mx-auto max-w-md px-6 py-10">
        <div className="mt-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-sm">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Choose a new password
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Signed in as <span className="font-medium">{user.email}</span>
          </p>
        </div>

        <div className="card mt-8 p-6 sm:p-7">
          <ResetPasswordForm />
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Changed your mind?{' '}
          <Link
            href="/dashboard"
            className="font-medium text-[var(--brand)] hover:text-[var(--brand-hover)]"
          >
            Go to dashboard
          </Link>
        </p>
      </div>
    </main>
  )
}
