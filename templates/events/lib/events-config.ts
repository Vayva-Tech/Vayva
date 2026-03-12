/**
 * Events template industry configuration
 * Connects the template to @vayva/industry-events package concepts
 */

export const EVENTS_CONFIG = {
  industry: 'events' as const,
  branding: {
    name: 'EVENTHUB',
    primaryColor: 'purple',
    tagline: 'Discover Amazing Events',
  },
  features: {
    ticketing: true,
    seating: true,
    vendorManagement: true,
    qrCheckIn: true,
    onlineEvents: true,
    eventCreation: true,
  },
  categories: [
    { id: 'conference', name: 'Conferences', icon: 'mic2' },
    { id: 'concert', name: 'Concerts', icon: 'music' },
    { id: 'festival', name: 'Festivals', icon: 'party-popper' },
    { id: 'workshop', name: 'Workshops', icon: 'users' },
    { id: 'sports', name: 'Sports', icon: 'trophy' },
    { id: 'corporate', name: 'Corporate', icon: 'briefcase' },
    { id: 'networking', name: 'Networking', icon: 'handshake' },
    { id: 'exhibition', name: 'Exhibitions', icon: 'gallery' },
  ],
  cities: ['Lagos', 'Abuja', 'Port Harcourt', 'Kano', 'Ibadan', 'Online'],
} as const;

export const SAMPLE_EVENTS = [
  {
    id: 'evt-001',
    title: 'Tech Innovation Summit 2025',
    category: 'conference' as const,
    date: 'Mar 15-17, 2025',
    startDate: new Date('2025-03-15'),
    location: 'Lagos',
    venue: 'Eko Convention Centre',
    isOnline: false,
    status: 'published' as const,
    tiers: [
      { id: 'tier-1', name: 'General Admission', price: 25000, quantity: 500, quantitySold: 312 },
      { id: 'tier-2', name: 'VIP Access', price: 75000, quantity: 100, quantitySold: 67 },
      { id: 'tier-3', name: 'Executive Pass', price: 150000, quantity: 20, quantitySold: 14 },
    ],
    description: '3-day summit bringing together tech leaders, innovators, and entrepreneurs from across Africa.',
    gradient: 'from-blue-500 to-purple-600',
  },
  {
    id: 'evt-002',
    title: 'Afrobeat Music Festival',
    category: 'concert' as const,
    date: 'Mar 22, 2025',
    startDate: new Date('2025-03-22'),
    location: 'Abuja',
    venue: 'National Arts Theatre',
    isOnline: false,
    status: 'published' as const,
    tiers: [
      { id: 'tier-1', name: 'Standing', price: 15000, quantity: 2000, quantitySold: 1456 },
      { id: 'tier-2', name: 'Seated', price: 35000, quantity: 500, quantitySold: 387 },
      { id: 'tier-3', name: 'VIP Lounge', price: 80000, quantity: 50, quantitySold: 43 },
    ],
    description: 'An electrifying night of Afrobeats with top Nigerian and African artists.',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'evt-003',
    title: 'Lagos Business Growth Summit',
    category: 'corporate' as const,
    date: 'Apr 5, 2025',
    startDate: new Date('2025-04-05'),
    location: 'Lagos',
    venue: 'Oriental Hotel Lagos',
    isOnline: false,
    status: 'published' as const,
    tiers: [
      { id: 'tier-1', name: 'Standard', price: 50000, quantity: 300, quantitySold: 178 },
      { id: 'tier-2', name: 'Premium', price: 120000, quantity: 80, quantitySold: 52 },
    ],
    description: 'Connect with Lagos business leaders and learn strategies for business growth in 2025.',
    gradient: 'from-emerald-500 to-teal-600',
  },
  {
    id: 'evt-004',
    title: 'Digital Marketing Masterclass',
    category: 'workshop' as const,
    date: 'Apr 12, 2025',
    startDate: new Date('2025-04-12'),
    location: 'Online',
    venue: 'Virtual',
    isOnline: true,
    status: 'published' as const,
    tiers: [
      { id: 'tier-1', name: 'Online Access', price: 8000, quantity: 1000, quantitySold: 234 },
      { id: 'tier-2', name: 'Online + Recording', price: 15000, quantity: 500, quantitySold: 89 },
    ],
    description: 'Master digital marketing strategies for social media, SEO, and paid advertising.',
    gradient: 'from-pink-500 to-rose-600',
  },
] as const;

export type SampleEvent = typeof SAMPLE_EVENTS[number];
