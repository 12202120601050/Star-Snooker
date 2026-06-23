import type { Metadata, Viewport } from 'next'
import './globals.css'
import { oswald, inter } from '@/lib/fonts'
import { SITE } from '@/lib/site'

const TITLE = `${SITE.name} — Snooker, Pool & Games in Anand`

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: TITLE,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [
    'snooker Anand',
    'snooker club Vallabh Vidyanagar',
    'pool table Anand',
    'carrom table tennis Anand',
    'Star Snooker Academy',
    'snooker near me Anand',
  ],
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE.url,
    siteName: SITE.name,
    title: TITLE,
    description: SITE.description,
    images: [{ url: '/images/logo.svg', width: 200, height: 200, alt: SITE.name }],
  },
  twitter: {
    card: 'summary',
    title: TITLE,
    description: SITE.description,
    images: ['/images/logo.svg'],
  },
  icons: { icon: '/images/logo.svg' },
  robots: { index: true, follow: true },
}

export const viewport: Viewport = {
  themeColor: '#0a0a0b',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${oswald.variable} ${inter.variable}`}>
      <body>{children}</body>
    </html>
  )
}
