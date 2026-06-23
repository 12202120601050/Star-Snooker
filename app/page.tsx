import { MotionProvider } from '@/components/site/motion'
import { StructuredData } from '@/components/snooker/StructuredData'
import { Nav } from '@/components/snooker/Nav'
import { Hero } from '@/components/snooker/Hero'
import { Games } from '@/components/snooker/Games'
import { PriceList } from '@/components/snooker/PriceList'
import { Visit } from '@/components/snooker/Visit'
import { Footer } from '@/components/snooker/Footer'

export default function HomePage() {
  return (
    <MotionProvider>
      <StructuredData />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-red focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        Skip to content
      </a>

      <div className="bg-ink font-body text-white">
        <Nav />
        <main id="main">
          <Hero />
          <Games />
          <PriceList />
          <Visit />
        </main>
        <Footer />
      </div>
    </MotionProvider>
  )
}
