import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.shortName,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0b',
    theme_color: '#0a0a0b',
    icons: [{ src: '/images/logo.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
