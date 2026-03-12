/**
 * Travel template industry configuration
 * Connects the template to @vayva/industry-travel package concepts
 */

export const TRAVEL_CONFIG = {
  industry: 'travel' as const,
  branding: {
    name: 'VayvaTravel',
    primaryColor: 'primary',
    tagline: 'Discover Your Next Adventure',
  },
  features: {
    bookings: true,
    itineraries: true,
    flights: true,
    hotels: true,
    packages: true,
    carRentals: true,
    cruises: true,
    visaServices: true,
  },
  continents: [
    { id: 'africa', name: 'Africa', popular: true },
    { id: 'asia', name: 'Asia', popular: true },
    { id: 'europe', name: 'Europe', popular: true },
    { id: 'north-america', name: 'North America', popular: true },
    { id: 'south-america', name: 'South America', popular: false },
    { id: 'oceania', name: 'Oceania', popular: false },
  ],
  popularDestinations: [
    { id: 'bali', name: 'Bali, Indonesia', country: 'Indonesia', continent: 'asia', price: 899, rating: 4.9, image: '🏝️' },
    { id: 'paris', name: 'Paris, France', country: 'France', continent: 'europe', price: 1299, rating: 4.8, image: '🗼' },
    { id: 'tokyo', name: 'Tokyo, Japan', country: 'Japan', continent: 'asia', price: 1599, rating: 4.9, image: '🗾' },
    { id: 'dubai', name: 'Dubai, UAE', country: 'United Arab Emirates', continent: 'asia', price: 1199, rating: 4.7, image: '🏙️' },
    { id: 'maldives', name: 'Maldives', country: 'Maldives', continent: 'asia', price: 2499, rating: 5.0, image: '🏝️' },
    { id: 'london', name: 'London, UK', country: 'United Kingdom', continent: 'europe', price: 999, rating: 4.6, image: '🏰' },
    { id: 'new-york', name: 'New York, USA', country: 'United States', continent: 'north-america', price: 1399, rating: 4.7, image: '🗽' },
    { id: 'sydney', name: 'Sydney, Australia', country: 'Australia', continent: 'oceania', price: 1699, rating: 4.5, image: '🦘' },
  ],
} as const;

export const TRAVEL_PACKAGES = [
  {
    id: 'pkg-001',
    title: '7-Day Bali Adventure',
    destination: 'Bali, Indonesia',
    type: 'tour_package' as const,
    duration: 7,
    price: 899,
    highlights: [
      '3-Star Accommodation',
      'Daily Breakfast Included',
      'Temple Tours & Cultural Visits',
      'Rice Terrace Trekking',
      'Beach Activities',
      'Airport Transfers'
    ],
    inclusions: ['Hotel', 'Breakfast', 'Transport', 'Guide'],
    exclusions: ['Flights', 'Visa', 'Travel Insurance'],
    difficulty: 'easy' as const,
    image: '🏝️',
  },
  {
    id: 'pkg-002',
    title: '5-Day Paris Discovery',
    destination: 'Paris, France',
    type: 'tour_package' as const,
    duration: 5,
    price: 1299,
    highlights: [
      '4-Star Central Hotel',
      'City Tour with Local Guide',
      'Louvre Museum Entry',
      'Seine River Cruise',
      'Eiffel Tower Visit',
      'Daily Continental Breakfast'
    ],
    inclusions: ['Hotel', 'Breakfast', 'City Tour', 'Museum Entry'],
    exclusions: ['Flights', 'Meals', 'Visa'],
    difficulty: 'easy' as const,
    image: '🗼',
  },
  {
    id: 'pkg-003',
    title: '8-Day Tokyo Explorer',
    destination: 'Tokyo, Japan',
    type: 'tour_package' as const,
    duration: 8,
    price: 1599,
    highlights: [
      'Modern Hotel in Shinjuku',
      'Bullet Train Experience',
      'Traditional Tea Ceremony',
      'Tokyo Disneyland Day Pass',
      'Shopping District Tours',
      'All Meals Included'
    ],
    inclusions: ['Hotel', 'All Meals', 'Transport', 'Activities'],
    exclusions: ['Flights', 'Visa'],
    difficulty: 'moderate' as const,
    image: '🗾',
  },
  {
    id: 'pkg-004',
    title: 'Luxury Maldives Getaway',
    destination: 'Maldives',
    type: 'tour_package' as const,
    duration: 6,
    price: 2499,
    highlights: [
      'Overwater Villa Stay',
      'Private Beach Access',
      'Snorkeling & Diving',
      'Spa Treatments Included',
      'Romantic Sunset Cruises',
      'All-Inclusive Dining'
    ],
    inclusions: ['Luxury Accommodation', 'All Meals', 'Activities', 'Spa'],
    exclusions: ['Flights', 'Visa'],
    difficulty: 'easy' as const,
    image: '🏝️',
  },
] as const;

export type TravelPackage = typeof TRAVEL_PACKAGES[number];
