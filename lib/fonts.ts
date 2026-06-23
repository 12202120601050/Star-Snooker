import { Oswald, Inter } from 'next/font/google'

// Display face — condensed, bold, sporty: fits a snooker/sports club wordmark.
export const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
})

// Body face — clean and highly legible.
export const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
})
