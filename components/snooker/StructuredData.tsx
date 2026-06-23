import { SITE } from '@/lib/site'

// Schema.org LocalBusiness markup so Star Snooker Academy can show up with rich
// details (address, phone, hours, price range) in Google and Maps.
export function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SportsActivityLocation',
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    image: `${SITE.url}/images/logo.svg`,
    telephone: SITE.phonePrimaryRaw,
    priceRange: SITE.priceRange,
    address: {
      '@type': 'PostalAddress',
      streetAddress: SITE.streetAddress,
      addressLocality: SITE.city,
      addressRegion: SITE.region,
      postalCode: SITE.postalCode,
      addressCountry: SITE.country,
    },
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      opens: '10:00',
      closes: '23:59',
    },
  }

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
