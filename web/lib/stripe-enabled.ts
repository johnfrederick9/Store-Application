// Server-only: do not import from client components.
// Checkout is "on" only when Stripe is configured AND not explicitly disabled.
export function isStripeEnabled(): boolean {
  if (process.env.STRIPE_ENABLED === 'false') return false
  return !!process.env.STRIPE_SECRET_KEY
}
