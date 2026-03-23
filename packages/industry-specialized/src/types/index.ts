// @ts-nocheck
/**
 * Shared types for specialized industries
 */

// Agriculture types
export interface Farm {
  id: string;
  name: string;
  location: string;
  size: number; // in acres/hectares
  crops: Crop[];
  livestock?: Livestock[];
  equipment: FarmEquipment[];
  certifications: string[];
}

export interface Crop {
  id: string;
  name: string;
  variety: string;
  plantingDate: Date;
  harvestDate?: Date;
  expectedYield: number;
  actualYield?: number;
  status: 'planted' | 'growing' | 'harvested' | 'failed';
  notes?: string;
}

export interface Livestock {
  id: string;
  type: string;
  breed: string;
  count: number;
  healthRecords: HealthRecord[];
}

export interface HealthRecord {
  date: Date;
  treatment: string;
  veterinarian: string;
  notes?: string;
}

export interface FarmEquipment {
  id: string;
  name: string;
  type: string;
  purchaseDate: Date;
  maintenanceSchedule?: MaintenanceSchedule;
}

export interface MaintenanceSchedule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  lastMaintenance: Date;
  nextMaintenance: Date;
}

// Books types
export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  publicationDate: Date;
  genre: string[];
  price: number;
  stock: number;
  format: 'paperback' | 'hardcover' | 'ebook' | 'audiobook';
  pages?: number;
  language: string;
  description?: string;
}

export interface Publisher {
  id: string;
  name: string;
  contactInfo: ContactInfo;
  books: Book[];
}

export interface Author {
  id: string;
  name: string;
  biography?: string;
  books: Book[];
}

// Electronics types
export interface ElectronicProduct {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: string;
  specifications: TechnicalSpecs;
  warranty: WarrantyInfo;
  price: number;
  stock: number;
  releaseDate: Date;
}

export interface TechnicalSpecs {
  processor?: string;
  memory?: string;
  storage?: string;
  display?: string;
  battery?: string;
  connectivity: string[];
  dimensions?: string;
  weight?: string;
  operatingSystem?: string;
}

export interface WarrantyInfo {
  duration: number; // months
  type: 'limited' | 'full' | 'extended';
  provider: string;
  coverage: string[];
}

// Furniture types
export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  style: string;
  material: string;
  dimensions: Dimensions;
  price: number;
  stock: number;
  roomType: string;
  assemblyRequired: boolean;
  careInstructions?: string;
}

export interface Dimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'inch';
}

// Jewelry types
export interface JewelryItem {
  id: string;
  name: string;
  category: 'ring' | 'necklace' | 'bracelet' | 'earrings' | 'other';
  metal: string;
  gemstones?: Gemstone[];
  weight: number; // in grams
  price: number;
  stock: number;
  certification?: Certification;
}

export interface Gemstone {
  type: string;
  carat: number;
  cut: string;
  color: string;
  clarity: string;
}

export interface Certification {
  authority: string;
  certificateNumber: string;
  date: Date;
  authenticity: boolean;
}

// Toys types
export interface Toy {
  id: string;
  name: string;
  category: string;
  ageGroup: string; // e.g., "3-5 years"
  safetyRating: 'A' | 'B' | 'C' | 'D';
  materials: string[];
  price: number;
  stock: number;
  educationalValue?: string;
  chokingHazard: boolean;
}

// Cloud Hosting types
export interface HostingPlan {
  id: string;
  name: string;
  resources: Resources;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  sslCertificate: boolean;
  backupFrequency: string;
}

export interface Resources {
  cpu: number; // cores
  ram: number; // GB
  storage: number; // GB
  bandwidth: number; // GB/month
}

export interface ServerInstance {
  id: string;
  name: string;
  status: 'running' | 'stopped' | 'error';
  ipAddress: string;
  location: string;
  plan: HostingPlan;
  uptime: number; // percentage
  lastBackup: Date;
}

// Crypto types
export interface Cryptocurrency {
  id: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  supply: SupplyInfo;
}

export interface SupplyInfo {
  circulating: number;
  total: number;
  max?: number;
}

export interface Wallet {
  id: string;
  address: string;
  currency: string;
  balance: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive';
  amount: number;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

// SaaS types
export interface SoftwareProduct {
  id: string;
  name: string;
  description: string;
  category: string;
  pricingPlans: PricingPlan[];
  features: string[];
  integrations: string[];
  trialPeriod?: number; // days
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  billingCycle: 'monthly' | 'annual';
  features: string[];
  limitations: string[];
  userLimit?: number;
}

// Artistry types
export interface Artwork {
  id: string;
  title: string;
  artist: string;
  medium: string;
  dimensions: string;
  yearCreated: number;
  price: number;
  availability: 'available' | 'sold' | 'commission';
  imageUrl: string;
  description?: string;
}

export interface ArtistPortfolio {
  id: string;
  artistName: string;
  bio: string;
  artworks: Artwork[];
  commissions: Commission[];
  contactInfo: ContactInfo;
}

export interface Commission {
  id: string;
  clientName: string;
  description: string;
  price: number;
  deadline: Date;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'delivered';
}

// Beauty types
export interface BeautyService {
  id: string;
  name: string;
  category: string;
  duration: number; // minutes
  price: number;
  ingredients?: string[];
  suitableFor: string[];
  contraindications?: string[];
}

export interface Treatment {
  id: string;
  serviceName: string;
  clientName: string;
  date: Date;
  duration: number;
  notes?: string;
  productsUsed: string[];
  followUpRequired: boolean;
}

// Sports types
export interface SportsEquipment {
  id: string;
  name: string;
  sport: string;
  category: string;
  brand: string;
  sizeOptions: string[];
  price: number;
  stock: number;
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'professional';
}

export interface TrainingProgram {
  id: string;
  name: string;
  sport: string;
  duration: number; // weeks
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  sessions: TrainingSession[];
  price: number;
}

export interface TrainingSession {
  id: string;
  day: number;
  title: string;
  duration: number; // minutes
  focus: string[];
  intensity: 'low' | 'medium' | 'high';
}

// Common types
export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  address?: string;
}

export interface Review {
  id: string;
  rating: number; // 1-5
  comment?: string;
  reviewerName: string;
  date: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxStock: number;
  supplier: string;
  lastRestocked: Date;
}