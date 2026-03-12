/**
 * Automotive template industry configuration
 * Connects the template to @vayva/industry-automotive package concepts
 */

export const AUTOMOTIVE_CONFIG = {
  industry: 'automotive' as const,
  branding: {
    name: 'MOTORS',
    primaryColor: 'blue',
    tagline: 'Drive Your Dream Car',
  },
  features: {
    inventory: true,
    testDrives: true,
    financing: true,
    service: true,
    tradeIns: true,
    warranties: true,
  },
  vehicleConditions: [
    { id: 'new', name: 'New', badge: 'NEW' },
    { id: 'certified_pre_owned', name: 'Certified Pre-Owned', badge: 'CPO' },
    { id: 'used', name: 'Pre-Owned', badge: 'USED' },
  ],
  makes: [
    'Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes-Benz', 
    'Audi', 'Lexus', 'Nissan', 'Hyundai', 'Kia'
  ],
  bodyTypes: [
    'Sedan', 'SUV', 'Hatchback', 'Pickup', 'Coupe', 'Convertible', 'Van', 'Wagon'
  ],
  fuelTypes: [
    'Petrol', 'Diesel', 'Electric', 'Hybrid'
  ],
} as const;

export const SAMPLE_VEHICLES = [
  {
    id: 'veh-001',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2024,
    trim: 'C 300',
    color: 'Obsidian Black',
    condition: 'new' as const,
    mileage: 0,
    price: 4500000,
    fuelType: 'petrol' as const,
    transmission: 'automatic' as const,
    bodyType: 'sedan' as const,
    features: ['Leather Seats', 'Sunroof', 'Navigation', 'Heated Seats', 'Blind Spot Assist'],
    image: '🚗',
    warranty: 60, // months
  },
  {
    id: 'veh-002',
    make: 'BMW',
    model: 'X5 xDrive',
    year: 2023,
    trim: 'xDrive40i',
    color: 'Mineral White',
    condition: 'certified_pre_owned' as const,
    mileage: 15000,
    price: 5200000,
    fuelType: 'petrol' as const,
    transmission: 'automatic' as const,
    bodyType: 'suv' as const,
    features: ['Panoramic Sunroof', 'Premium Sound', 'Parking Assistant', 'Wireless Charging'],
    image: '🚙',
    warranty: 36,
  },
  {
    id: 'veh-003',
    make: 'Lexus',
    model: 'RX 350',
    year: 2024,
    trim: 'Premium',
    color: 'Ultrasonic Blue',
    condition: 'new' as const,
    mileage: 0,
    price: 3800000,
    fuelType: 'hybrid' as const,
    transmission: 'automatic' as const,
    bodyType: 'suv' as const,
    features: ['Mark Levinson Audio', 'Adaptive Cruise', 'Lane Keeping', 'Apple CarPlay'],
    image: '🚙',
    warranty: 72,
  },
  {
    id: 'veh-004',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    trim: 'SE',
    color: 'Midnight Black',
    condition: 'used' as const,
    mileage: 28000,
    price: 2100000,
    fuelType: 'petrol' as const,
    transmission: 'automatic' as const,
    bodyType: 'sedan' as const,
    features: ['Backup Camera', 'Bluetooth', 'Remote Start', 'Alloy Wheels'],
    image: '🚗',
    warranty: 12,
  },
] as const;

export const FINANCING_TERMS = [
  { months: 12, apr: 4.9 },
  { months: 24, apr: 5.9 },
  { months: 36, apr: 6.9 },
  { months: 48, apr: 7.9 },
  { months: 60, apr: 8.9 },
  { months: 72, apr: 9.9 },
] as const;

export type SampleVehicle = typeof SAMPLE_VEHICLES[number];
