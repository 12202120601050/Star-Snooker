/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Serve modern formats where supported (smaller than the source PNGs/WebP).
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [{ protocol: 'http', hostname: 'localhost' }],
  },
  experimental: {
    outputFileTracingExcludes: {
      '*': ['node_modules/@swc/core*']
    }
  }
}

module.exports = nextConfig
