import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Storefront — sell online in 10 minutes',
    template: '%s — Storefront',
  },
  description:
    'The simplest way to launch an online store. Add products, take payments, and ship — no code.',
  icons: {
    icon: '/storefront_logo.svg',
    shortcut: '/storefront_logo.svg',
    apple: '/storefront_logo.svg',
  },
  openGraph: {
    type: 'website',
    siteName: 'Storefront',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
            },
          }}
        />
      </body>
    </html>
  )
}
