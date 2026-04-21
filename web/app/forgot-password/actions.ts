'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export type ForgotPasswordState =
  | { ok?: boolean; error?: string }
  | null

export async function requestPasswordReset(
  _prev: ForgotPasswordState,
  formData: FormData,
): Promise<ForgotPasswordState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()

  if (!email) return { error: 'Email is required.' }

  const supabase = await createClient()
  const origin =
    (await headers()).get('origin') ?? process.env.NEXT_PUBLIC_APP_URL!

  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/reset-password`,
  })

  // Always return ok — don't leak whether an account exists.
  return { ok: true }
}
