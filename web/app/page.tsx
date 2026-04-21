import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Check,
  CreditCard,
  Globe2,
  Image as ImageIcon,
  Package,
  Palette,
  Rocket,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  Zap,
} from 'lucide-react'

export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[var(--background)]">
      <BackgroundFX />

      <header className="sticky top-0 z-20 border-b border-gray-200/60 bg-white/70 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-semibold tracking-tight"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--brand)] to-fuchsia-600 text-white shadow-sm">
              <ShoppingBag className="h-4 w-4" />
            </div>
            Storefront
          </Link>
          <nav className="hidden items-center gap-1 text-sm text-gray-600 md:flex">
            <a
              href="#features"
              className="rounded-md px-3 py-1.5 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="rounded-md px-3 py-1.5 transition hover:bg-gray-100 hover:text-gray-900"
            >
              How it works
            </a>
            <a
              href="#pricing"
              className="rounded-md px-3 py-1.5 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-ghost">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary">
              Get started
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {/* Hero */}
        <section className="pt-16 pb-20 text-center sm:pt-24 sm:pb-24">
          <Link
            href="/signup"
            className="group mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--brand-soft)] bg-white/80 px-3 py-1 text-xs font-medium text-[var(--brand)] shadow-sm backdrop-blur transition hover:border-[var(--brand)]/40 hover:bg-white"
          >
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[var(--brand)] text-white">
              <Sparkles className="h-2.5 w-2.5" />
            </span>
            New · Built for solo sellers
            <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" />
          </Link>

          <h1 className="mx-auto mt-7 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            Launch your store{' '}
            <span className="relative whitespace-nowrap">
              <span className="bg-gradient-to-r from-[var(--brand)] via-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                in 10 minutes
              </span>
              <svg
                aria-hidden="true"
                viewBox="0 0 240 10"
                className="absolute -bottom-2 left-0 h-2 w-full text-fuchsia-400/60"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,6 Q60,2 120,6 T240,6"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-balance text-base text-gray-600 sm:text-lg">
            The simplest way to start selling online. Add products, take card
            payments, and ship orders — no code, no marketplace fees.
          </p>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/signup"
              className="btn-primary !px-6 !py-3 text-base shadow-lg shadow-[var(--brand)]/20"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-secondary !px-6 !py-3 text-base">
              I have an account
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              No credit card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Keep 100% of your revenue
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 text-emerald-600" />
              Cancel anytime
            </span>
          </div>

          {/* Product mockup */}
          <div className="relative mt-16 sm:mt-20">
            <div className="pointer-events-none absolute -inset-x-6 -top-4 -bottom-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-[var(--brand-soft)] via-white to-fuchsia-50 blur-2xl" />
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl shadow-gray-900/10 ring-1 ring-black/5">
              <BrowserChrome url="yourshop.com" />
              <StorefrontMockup />
            </div>
          </div>
        </section>

        {/* Social proof / stats */}
        <section className="pb-16 sm:pb-20">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-4">
            <Stat label="Launch time" value="< 10 min" />
            <Stat label="Platform fees" value="0%" />
            <Stat label="Payment methods" value="Cards + Apple Pay" />
            <Stat label="Uptime" value="99.95%" />
          </div>
        </section>

        {/* Features */}
        <section id="features" className="pb-20 sm:pb-28">
          <SectionHeader
            eyebrow="Everything you need"
            title="Built for shipping, not showing off"
            description="We skipped theme marketplaces, app stores, and AI copy generators. What's left is a fast, reliable way to sell."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Launch in minutes"
              description="Name, logo, first product. You're live. No theme engine to wrestle with."
              accent="indigo"
            />
            <FeatureCard
              icon={<CreditCard className="h-5 w-5" />}
              title="Real payments, day one"
              description="Stripe Checkout handles cards, Apple Pay, and Google Pay. You get paid directly."
              accent="violet"
            />
            <FeatureCard
              icon={<Truck className="h-5 w-5" />}
              title="Orders you can ship"
              description="Every order comes with shipping address, email, and a clear status to update."
              accent="fuchsia"
            />
            <FeatureCard
              icon={<Palette className="h-5 w-5" />}
              title="Looks great out of the box"
              description="A thoughtful storefront design with responsive product grids and cart — no tweaking."
              accent="rose"
            />
            <FeatureCard
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Secure by default"
              description="Row-level security, validated payments, and webhook-authoritative orders."
              accent="emerald"
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Know what's happening"
              description="A clean dashboard with orders, paid revenue, and recent activity at a glance."
              accent="cyan"
            />
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="pb-20 sm:pb-28">
          <SectionHeader
            eyebrow="How it works"
            title="From nothing to your first sale"
            description="Three steps. No code. No setup fees."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            <Step
              number="01"
              icon={<Rocket className="h-5 w-5" />}
              title="Create your store"
              description="Pick a name and slug. Your storefront is live at /s/your-slug immediately."
            />
            <Step
              number="02"
              icon={<ImageIcon className="h-5 w-5" />}
              title="Add products"
              description="Upload photos, set prices, track stock. Publish with a single toggle."
            />
            <Step
              number="03"
              icon={<Globe2 className="h-5 w-5" />}
              title="Share the link"
              description="Customers check out with Stripe. You get an email and an order to ship."
            />
          </div>
        </section>

        {/* Final CTA */}
        <section id="pricing" className="pb-24 sm:pb-32">
          <div className="relative overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-[var(--brand)] via-violet-600 to-fuchsia-600 p-10 text-center text-white shadow-xl sm:p-14">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(600px_circle_at_center,white,transparent)]"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <div className="relative">
              <Package className="mx-auto h-8 w-8 opacity-90" />
              <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
                Start selling today.
              </h2>
              <p className="mx-auto mt-3 max-w-md text-balance text-white/85">
                Free to try. No platform fees. Pay only the standard Stripe
                processing rate when you sell.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-medium text-gray-900 shadow-sm transition hover:bg-gray-100"
                >
                  Create your store
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/30 bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur transition hover:bg-white/20"
                >
                  Sign in
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-gray-500 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded bg-[var(--brand)] text-white">
              <ShoppingBag className="h-3 w-3" />
            </div>
            <span>Storefront · A simple way to sell online</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hover:text-gray-900">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-gray-900">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function BackgroundFX() {
  return (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] bg-gradient-to-b from-[var(--brand-soft)] via-fuchsia-50/40 to-transparent" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[720px] opacity-60 [mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
        style={{
          backgroundImage:
            'radial-gradient(circle, rgba(79,70,229,0.18) 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-40 -z-10 h-[380px] w-[380px] rounded-full bg-fuchsia-300/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-32 top-80 -z-10 h-[380px] w-[380px] rounded-full bg-indigo-400/20 blur-3xl"
      />
    </>
  )
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="inline-flex items-center rounded-full border border-[var(--brand-soft)] bg-white px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-[var(--brand)]">
        {eyebrow}
      </div>
      <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-balance text-gray-600">{description}</p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-5 py-5 text-center">
      <div className="text-xl font-semibold tracking-tight text-gray-900 sm:text-2xl">
        {value}
      </div>
      <div className="mt-1 text-xs text-gray-500">{label}</div>
    </div>
  )
}

const ACCENTS: Record<
  string,
  { bg: string; text: string; ring: string }
> = {
  indigo: {
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    ring: 'group-hover:ring-indigo-200',
  },
  violet: {
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    ring: 'group-hover:ring-violet-200',
  },
  fuchsia: {
    bg: 'bg-fuchsia-50',
    text: 'text-fuchsia-600',
    ring: 'group-hover:ring-fuchsia-200',
  },
  rose: {
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    ring: 'group-hover:ring-rose-200',
  },
  emerald: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    ring: 'group-hover:ring-emerald-200',
  },
  cyan: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    ring: 'group-hover:ring-cyan-200',
  },
}

function FeatureCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: React.ReactNode
  title: string
  description: string
  accent: keyof typeof ACCENTS
}) {
  const a = ACCENTS[accent]
  return (
    <div
      className={`card group relative overflow-hidden p-6 ring-1 ring-transparent transition hover:-translate-y-0.5 hover:shadow-md ${a.ring}`}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-lg ${a.bg} ${a.text}`}
      >
        {icon}
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
        {description}
      </p>
    </div>
  )
}

function Step({
  number,
  icon,
  title,
  description,
}: {
  number: string
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="card relative p-6">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--brand-soft)] text-[var(--brand)]">
          {icon}
        </div>
        <span className="font-mono text-xs font-medium text-gray-400">
          {number}
        </span>
      </div>
      <h3 className="mt-4 text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-600">
        {description}
      </p>
    </div>
  )
}

function BrowserChrome({ url }: { url: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-4 py-2.5">
      <div className="flex gap-1.5">
        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
      </div>
      <div className="ml-3 flex-1">
        <div className="mx-auto inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500">
          <ShieldCheck className="h-3 w-3 text-emerald-600" />
          {url}
        </div>
      </div>
    </div>
  )
}

function StorefrontMockup() {
  const products = [
    { name: 'Cotton tee', price: '$24', tint: 'from-rose-100 to-rose-200' },
    {
      name: 'Canvas tote',
      price: '$18',
      tint: 'from-amber-100 to-amber-200',
    },
    {
      name: 'Ceramic mug',
      price: '$14',
      tint: 'from-emerald-100 to-emerald-200',
    },
    { name: 'Sticker pack', price: '$6', tint: 'from-sky-100 to-sky-200' },
    {
      name: 'Enamel pin',
      price: '$9',
      tint: 'from-violet-100 to-violet-200',
    },
    {
      name: 'Print A3',
      price: '$28',
      tint: 'from-fuchsia-100 to-fuchsia-200',
    },
  ]
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 px-6 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
          <div className="text-sm font-semibold text-gray-900">Little Goods</div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-sm">
          <ShoppingBag className="h-3.5 w-3.5" />
          Cart · 2
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {products.map((p) => (
          <div
            key={p.name}
            className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div
              className={`aspect-square bg-gradient-to-br ${p.tint}`}
            />
            <div className="flex items-center justify-between px-3 py-2">
              <span className="truncate text-xs font-medium text-gray-900">
                {p.name}
              </span>
              <span className="text-xs font-semibold tabular-nums text-gray-900">
                {p.price}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
