import { MotionProvider } from '@/components/site/motion'
import { StructuredData } from '@/components/snooker/StructuredData'
import { Preloader } from '@/components/snooker/Preloader'
import { NavLux } from '@/components/snooker/NavLux'
import { HeroLux } from '@/components/snooker/HeroLux'
import { StatsBar } from '@/components/snooker/StatsBar'
import { AboutLux } from '@/components/snooker/AboutLux'
import { TablesShowcase } from '@/components/snooker/TablesShowcase'
import { Amenities } from '@/components/snooker/Amenities'
import { GalleryLux } from '@/components/snooker/GalleryLux'
import { Tournament } from '@/components/snooker/Tournament'
import { Reviews } from '@/components/snooker/Reviews'
import { ContactLux } from '@/components/snooker/ContactLux'
import { BookingCTA } from '@/components/snooker/BookingCTA'
import { FooterLux } from '@/components/snooker/FooterLux'

export default function HomePage() {
  return (
    <MotionProvider>
      <StructuredData />

      {/* Preloader */}
      <Preloader />

      {/* Skip to content */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-lg focus:bg-gold focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-ink"
      >
        Skip to content
      </a>

      <div className="bg-ink font-body text-white">
        <NavLux />

        <main id="main">
          <HeroLux />
          <StatsBar />
          <AboutLux />
          <TablesShowcase />
          <Amenities />
          <GalleryLux />
          <Tournament />
          <Reviews />
          <ContactLux />
          <BookingCTA />
        </main>

        <FooterLux />
      </div>
    </MotionProvider>
  )
}
