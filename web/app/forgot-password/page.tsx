'use client'

import Link from 'next/link'
import { ArrowLeft, KeyRound, Mail } from 'lucide-react'
import { useActionState } from 'react'
import {
  requestPasswordReset,
  type ForgotPasswordState,
} from './actions'

async function action(
  _: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  return requestPasswordReset(_, formData)
}

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState<
    ForgotPasswordState,
    FormData
  >(action, null)

  if (state?.ok) {
    return (
      <main className="relative min-h-screen">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-gradient-to-b from-[var(--brand-soft)] to-transparent" />
        <div className="mx-auto max-w-md px-6 py-20 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <Mail className="h-6 w-6" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold tracking-tight">
            Check your inbox
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            If an account exists for that email, we sent a link to reset your
            password. It will expire in an hour.
          </p>
          <Link href="/login" className="btn-secondary mt-8">
            Back to sign in
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-gradient-to-b from-[var(--brand-soft)] to-transparent" />

      <div className="mx-auto max-w-md px-6 py-10">
        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>

        <div className="mt-10 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-sm">
            <KeyRound className="h-5 w-5" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Reset your password
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Enter your email and we&apos;ll send you a link.
          </p>
        </div>

        <div className="card mt-8 p-6 sm:p-7">
          <form action={formAction} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="label">
                Email
              </label>
              <div className="relative mt-1.5">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="input pl-10"
                />
              </div>
            </div>

            {state?.error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="btn-primary mt-2 !py-2.5"
            >
              {pending ? 'Sending link…' : 'Send reset link'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Remembered it?{' '}
          <Link
            href="/login"
            className="font-medium text-[var(--brand)] hover:text-[var(--brand-hover)]"
          >
            Sign in
          </Link>
        </p>
      </div>

    </main>
  )
}
