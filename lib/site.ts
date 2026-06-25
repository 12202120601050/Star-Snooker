// Single source of truth for the Star Snooker Academy site: brand, contact,
// games and pricing. Update here and every section stays in sync.

export const SITE = {
  name: 'Star Snooker Academy',
  shortName: 'Star Snooker',
  tagline: "Anand's premium snooker & games club",
  description:
    'Star Snooker Academy in Vallabh Vidyanagar, Anand — 3 championship snooker tables, mini snooker, pool, carrom, table tennis and chess, with a chilled canteen. Walk in and play.',
  url: 'https://starsnooker.vercel.app', // placeholder until hosting is decided
  city: 'Vallabh Vidyanagar',
  region: 'Gujarat',
  country: 'IN',
  postalCode: '388120',
  streetAddress: '4th Floor, Vraj Prime Complex, Opp. NCC Office, Iskcon Mandir Road',
  phonePrimaryDisplay: '+91 96018 18268',
  phonePrimaryRaw: '+919601818268',
  phoneSecondaryDisplay: '+91 91060 05507',
  phoneSecondaryRaw: '+919106005507',
  hours: 'Open Daily · Morning to Late Night',
  priceRange: '₹50–₹240',
} as const

export const LINKS = {
  whatsapp:
    'https://wa.me/919601818268?text=Hi!%20I%20want%20to%20book%20a%20table%20at%20Star%20Snooker%20Academy.',
  maps: 'https://maps.app.goo.gl/6D8Gow7oe3SZFrSi7',
  instagram: 'https://www.instagram.com/star_snooker__academy',
  phonePrimary: 'tel:+919601818268',
  phoneSecondary: 'tel:+919106005507',
} as const

export function bookUrl(what: string) {
  const text = `Hi! I want to book ${what} at Star Snooker Academy. Is it available?`
  return `https://wa.me/919601818268?text=${encodeURIComponent(text)}`
}

export const NAV_ITEMS = [
  { href: '#games', label: 'Games' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#visit', label: 'Visit' },
] as const

export const HERO_STATS = [
  { value: 9, prefix: '', suffix: '', label: 'Game Tables' },
  { value: 6, prefix: '', suffix: '', label: 'Game Types' },
  { value: 50, prefix: '₹', suffix: '', label: 'From / Hour' },
] as const

// Showcase cards. `frame`/`hour` may be a string range (e.g. player tiers).
export type Game = {
  name: string
  sub: string
  icon: 'snooker' | 'pool' | 'carrom' | 'tabletennis' | 'chess' | 'zapminton'
  frame: number | string | null
  hour: number | string | null
}

export const GAMES: Game[] = [
  { name: 'Royal Snooker', sub: '2 championship tables', icon: 'snooker', frame: 120, hour: '200–240' },
  { name: 'Mini Snooker', sub: '3 tables · quick frames', icon: 'snooker', frame: 80, hour: 150 },
  { name: 'Pool', sub: '4 tables · 8-ball & 9-ball', icon: 'pool', frame: 80, hour: 150 },
  { name: 'Carrom', sub: '2 or 4 players', icon: 'carrom', frame: '60–80', hour: '100–150' },
  { name: 'Table Tennis', sub: '2 or 4 players', icon: 'tabletennis', frame: '60–80', hour: '100–150' },
  { name: 'Chess', sub: 'Per hour', icon: 'chess', frame: null, hour: 50 },
  { name: 'Zapminton', sub: 'Badminton + Zapball', icon: 'zapminton', frame: 60, hour: 100 },
]

// Price list shown on the site (frame = half hour).
export const PRICE_ROWS: Array<{ name: string; frame: number | null; hour: number | null }> = [
  { name: 'Royal Snooker · Table 1', frame: 120, hour: 240 },
  { name: 'Royal Snooker · Table 2', frame: 120, hour: 200 },
  { name: 'Mini Snooker', frame: 80, hour: 150 },
  { name: 'Pool', frame: 80, hour: 150 },
  { name: 'Carrom · 2 Players', frame: 60, hour: 100 },
  { name: 'Carrom · 4 Players', frame: 80, hour: 150 },
  { name: 'Table Tennis · 2 Players', frame: 60, hour: 100 },
  { name: 'Table Tennis · 4 Players', frame: 80, hour: 150 },
  { name: 'Chess', frame: null, hour: 50 },
  { name: 'Zapminton', frame: 60, hour: 100 },
]
