'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShoppingBag,
} from 'lucide-react'
import { useActionState, useState } from 'react'
import { signIn, type LoginState } from './actions'

async function action(_: LoginState, formData: FormData): Promise<LoginState> {
  return signIn(_, formData)
}

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(
    action,
    null,
  )
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[320px] bg-gradient-to-b from-[var(--brand-soft)] to-transparent" />

      <div className="mx-auto max-w-md px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div className="mt-10 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand)] text-white shadow-sm">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Sign in to manage your store.
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

            <div>
              <div className="flex items-baseline justify-between">
                <label htmlFor="password" className="label">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-[var(--brand)] hover:text-[var(--brand-hover)]"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative mt-1.5">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  minLength={6}
                  placeholder="••••••••"
                  className="input pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
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
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          New here?{' '}
          <Link
            href="/signup"
            className="font-medium text-[var(--brand)] hover:text-[var(--brand-hover)]"
          >
            Create an account
          </Link>
        </p>
      </div>
    </main>
  )
}
