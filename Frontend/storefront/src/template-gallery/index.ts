/**
 * Template Gallery
 * 
 * Unified exports for all storefront templates with metadata,
 * categorization, and helper functions for template selection.
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  industry: string;
  thumbnail?: string;
  previewUrl?: string;
  features: string[];
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  isPremium: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  version: string;
}

export type TemplateCategory =
  | "ecommerce"
  | "services"
  | "saas"
  | "education"
  | "healthcare"
  | "food"
  | "fashion"
  | "realestate"
  | "automotive"
  | "technology"
  | "creative"
  | "other";

// Base templates (free tier)
const BASE_TEMPLATES: Template[] = [
  {
    id: "base",
    name: "Base Store",
    description: "Clean, minimal starting point for any store",
    category: "ecommerce",
    industry: "general",
    features: ["Responsive", "SEO Ready", "Fast Loading"],
    colorScheme: { primary: "#10b981", secondary: "#1f2937", accent: "#f59e0b" },
    isPremium: false,
    version: "1.0.0",
  },
  {
    id: "standard",
    name: "Standard Store",
    description: "Professional template with all essential features",
    category: "ecommerce",
    industry: "general",
    features: ["Product Grid", "Cart", "Checkout", "Search"],
    colorScheme: { primary: "#3b82f6", secondary: "#1e40af", accent: "#f97316" },
    isPremium: false,
    version: "1.0.0",
  },
];

// E-commerce templates (23 total)
const ECOMMERCE_TEMPLATES: Template[] = [
  {
    id: "grover",
    name: "Grover",
    description: "Modern grocery and food delivery template",
    category: "food",
    industry: "grocery",
    features: ["Category Navigation", "Quick Add", "Delivery Schedule", "Fresh Tags"],
    colorScheme: { primary: "#16a34a", secondary: "#fbbf24", accent: "#ef4444" },
    isPremium: true,
    isPopular: true,
    version: "1.0.0",
  },
  {
    id: "fashion",
    name: "Fashion Hub",
    description: "Elegant fashion and apparel storefront",
    category: "fashion",
    industry: "fashion",
    features: ["Lookbook", "Size Guide", "Wishlist", "Quick View"],
    colorScheme: { primary: "#111827", secondary: "#6b7280", accent: "#ec4899" },
    isPremium: true,
    isPopular: true,
    version: "1.0.0",
  },
  {
    id: "fashun",
    name: "Fashun",
    description: "Modern fashion boutique template",
    category: "fashion",
    industry: "fashion",
    features: ["Collections", "Trending", "Size Guide", "Style Quiz"],
    colorScheme: { primary: "#1f2937", secondary: "#4b5563", accent: "#f472b6" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "electronics",
    name: "TechStore",
    description: "Electronics and gadgets template",
    category: "technology",
    industry: "electronics",
    features: ["Spec Comparisons", "Reviews", "Tech Specs", "Bundle Deals"],
    colorScheme: { primary: "#2563eb", secondary: "#1e40af", accent: "#3b82f6" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "furniture",
    name: "Home Living",
    description: "Furniture and home decor template",
    category: "ecommerce",
    industry: "furniture",
    features: ["Room View", "AR Preview", "Dimensions", "Assembly Guide"],
    colorScheme: { primary: "#92400e", secondary: "#b45309", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "jewelry",
    name: "Lux Jewels",
    description: "Premium jewelry and accessories",
    category: "fashion",
    industry: "jewelry",
    features: ["360 View", "Gift Box", "Engraving", "Certificate"],
    colorScheme: { primary: "#1f2937", secondary: "#d1d5db", accent: "#fbbf24" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "beauty",
    name: "Glow Beauty",
    description: "Beauty and cosmetics storefront",
    category: "fashion",
    industry: "beauty",
    features: ["Skin Quiz", "Shade Finder", "Samples", "Routines"],
    colorScheme: { primary: "#ec4899", secondary: "#f472b6", accent: "#8b5cf6" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "sports",
    name: "SportZone",
    description: "Sports equipment and apparel",
    category: "ecommerce",
    industry: "sports",
    features: ["Team Gear", "Size Chart", "Performance", "Training Plans"],
    colorScheme: { primary: "#dc2626", secondary: "#1f2937", accent: "#fbbf24" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "toys",
    name: "ToyLand",
    description: "Toys and games for children",
    category: "ecommerce",
    industry: "toys",
    features: ["Age Filter", "Safety Info", "Gift Wrap", "Play Guide"],
    colorScheme: { primary: "#f59e0b", secondary: "#10b981", accent: "#3b82f6" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "books",
    name: "BookHaven",
    description: "Bookstore with reading features",
    category: "ecommerce",
    industry: "books",
    features: ["Preview", "Reviews", "Recommendations", "E-book"],
    colorScheme: { primary: "#7c3aed", secondary: "#1f2937", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "petcare",
    name: "PetPal Store",
    description: "Pet supplies and products",
    category: "ecommerce",
    industry: "petcare",
    features: ["Pet Profile", "Auto-Delivery", "Vet Chat", "Grooming"],
    colorScheme: { primary: "#ea580c", secondary: "#7c2d12", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "baby",
    name: "Baby Essentials",
    description: "Baby products and nursery items",
    category: "ecommerce",
    industry: "baby",
    features: ["Age Groups", "Safety", "Registry", "Growth Guide"],
    colorScheme: { primary: "#f472b6", secondary: "#93c5fd", accent: "#fde047" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "crypto",
    name: "Crypto Store",
    description: "Crypto merchandise and hardware",
    category: "technology",
    industry: "crypto",
    features: ["Hardware", "Merch", "Education", "Prices"],
    colorScheme: { primary: "#8b5cf6", secondary: "#6366f1", accent: "#22d3ee" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "food",
    name: "FoodMarket",
    description: "General food and grocery store",
    category: "food",
    industry: "food",
    features: ["Recipes", "Fresh", "Delivery", "Subscriptions"],
    colorScheme: { primary: "#ea580c", secondary: "#16a34a", accent: "#fbbf24" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "travel",
    name: "Travel Gear",
    description: "Travel accessories and luggage",
    category: "ecommerce",
    industry: "travel",
    features: ["Destinations", "Packing", "Guides", "Deals"],
    colorScheme: { primary: "#0ea5e9", secondary: "#0284c7", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "automotive",
    name: "AutoParts",
    description: "Automotive parts and accessories",
    category: "automotive",
    industry: "automotive",
    features: ["VIN Lookup", "Parts Finder", "Guides", "Tools"],
    colorScheme: { primary: "#dc2626", secondary: "#1f2937", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  // Agriculture & Fresh Market
  {
    id: "agriculture",
    name: "FarmMarket",
    description: "Farm fresh produce and agriculture",
    category: "food",
    industry: "agriculture",
    features: ["Farm Direct", "Seasonal", "Organic", "Bulk"],
    colorScheme: { primary: "#16a34a", secondary: "#65a30d", accent: "#ea580c" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "freshmarket",
    name: "FreshMarket",
    description: "Local fresh produce market",
    category: "food",
    industry: "grocery",
    features: ["Local", "Organic", "Daily Fresh", "Seasonal"],
    colorScheme: { primary: "#22c55e", secondary: "#16a34a", accent: "#f97316" },
    isPremium: true,
    version: "1.0.0",
  },
  // Arts & Crafts
  {
    id: "artistry",
    name: "Artistry",
    description: "Art supplies and handmade goods",
    category: "creative",
    industry: "art",
    features: ["Supplies", "Gallery", "Classes", "Custom"],
    colorScheme: { primary: "#9333ea", secondary: "#c084fc", accent: "#fbbf24" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "craftcorner",
    name: "Craft Corner",
    description: "Craft supplies and DIY materials",
    category: "creative",
    industry: "crafts",
    features: ["DIY", "Supplies", "Tutorials", "Community"],
    colorScheme: { primary: "#ec4899", secondary: "#f472b6", accent: "#8b5cf6" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "craftbrew",
    name: "CraftBrew",
    description: "Home brewing supplies and kits",
    category: "food",
    industry: "beverages",
    features: ["Kits", "Ingredients", "Equipment", "Guides"],
    colorScheme: { primary: "#d97706", secondary: "#b45309", accent: "#fcd34d" },
    isPremium: true,
    version: "1.0.0",
  },
  // Outdoor & Lifestyle
  {
    id: "campout",
    name: "CampOut",
    description: "Camping and outdoor gear",
    category: "ecommerce",
    industry: "outdoor",
    features: ["Gear", "Guides", "Locations", "Checklists"],
    colorScheme: { primary: "#166534", secondary: "#15803d", accent: "#dc2626" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "gardenia",
    name: "Gardenia",
    description: "Garden supplies and plants",
    category: "ecommerce",
    industry: "garden",
    features: ["Plants", "Tools", "Seeds", "Advice"],
    colorScheme: { primary: "#16a34a", secondary: "#15803d", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "greenlife",
    name: "GreenLife",
    description: "Eco-friendly and sustainable products",
    category: "ecommerce",
    industry: "eco",
    features: ["Sustainable", "Zero Waste", "Organic", "Ethical"],
    colorScheme: { primary: "#15803d", secondary: "#16a34a", accent: "#0ea5e9" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "homecraft",
    name: "HomeCraft",
    description: "Home improvement and decor",
    category: "ecommerce",
    industry: "home",
    features: ["Tools", "Decor", "DIY", "Inspiration"],
    colorScheme: { primary: "#78350f", secondary: "#92400e", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  // Kids & Play
  {
    id: "kidspace",
    name: "KidSpace",
    description: "Kids furniture and room decor",
    category: "ecommerce",
    industry: "kids",
    features: ["Furniture", "Decor", "Storage", "Themes"],
    colorScheme: { primary: "#3b82f6", secondary: "#8b5cf6", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "playzone",
    name: "PlayZone",
    description: "Toys and play equipment",
    category: "ecommerce",
    industry: "toys",
    features: ["Indoor", "Outdoor", "Educational", "Active"],
    colorScheme: { primary: "#ec4899", secondary: "#f59e0b", accent: "#3b82f6" },
    isPremium: true,
    version: "1.0.0",
  },
  // Wellness & Fitness
  {
    id: "fitpulse",
    name: "FitPulse",
    description: "Fitness equipment and supplements",
    category: "ecommerce",
    industry: "fitness",
    features: ["Equipment", "Supplements", "Programs", "Trackers"],
    colorScheme: { primary: "#dc2626", secondary: "#991b1b", accent: "#fbbf24" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "wellness",
    name: "Wellness Co",
    description: "Wellness products and supplements",
    category: "healthcare",
    industry: "wellness",
    features: ["Supplements", "Skincare", "Essentials", "Bundles"],
    colorScheme: { primary: "#059669", secondary: "#10b981", accent: "#8b5cf6" },
    isPremium: true,
    version: "1.0.0",
  },
  // Fashion & Style
  {
    id: "stylehub",
    name: "StyleHub",
    description: "Streetwear and urban fashion",
    category: "fashion",
    industry: "streetwear",
    features: ["Trends", "Drops", "Collabs", "Limited"],
    colorScheme: { primary: "#18181b", secondary: "#27272a", accent: "#dc2626" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "vintagewoods",
    name: "Vintage Woods",
    description: "Vintage and rustic furniture",
    category: "ecommerce",
    industry: "furniture",
    features: ["Vintage", "Rustic", "Handmade", "Unique"],
    colorScheme: { primary: "#78350f", secondary: "#92400e", accent: "#ca8a04" },
    isPremium: true,
    version: "1.0.0",
  },
  // Automotive & Industrial
  {
    id: "autodealer",
    name: "AutoDealer",
    description: "Car dealership template",
    category: "automotive",
    industry: "dealership",
    features: ["Inventory", "Financing", "Trade-in", "Test Drive"],
    colorScheme: { primary: "#1e40af", secondary: "#3b82f6", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "autolane",
    name: "AutoLane",
    description: "Auto parts and accessories",
    category: "automotive",
    industry: "parts",
    features: ["Parts", "Accessories", "Tools", "Guides"],
    colorScheme: { primary: "#dc2626", secondary: "#1f2937", accent: "#fbbf24" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "gearvault",
    name: "GearVault",
    description: "Tools and industrial equipment",
    category: "ecommerce",
    industry: "industrial",
    features: ["Tools", "Equipment", "Safety", "Wholesale"],
    colorScheme: { primary: "#374151", secondary: "#4b5563", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "toolcraft",
    name: "ToolCraft",
    description: "Hand tools and power tools",
    category: "ecommerce",
    industry: "tools",
    features: ["Hand Tools", "Power Tools", "Storage", "Brands"],
    colorScheme: { primary: "#b91c1c", secondary: "#dc2626", accent: "#fbbf24" },
    isPremium: true,
    version: "1.0.0",
  },
  // Tech & Modern
  {
    id: "techgear",
    name: "TechGear",
    description: "Tech accessories and gadgets",
    category: "technology",
    industry: "accessories",
    features: ["Cases", "Cables", "Audio", "Smart"],
    colorScheme: { primary: "#1e40af", secondary: "#3b82f6", accent: "#06b6d4" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "cryptovault",
    name: "CryptoVault",
    description: "Crypto hardware and security",
    category: "technology",
    industry: "crypto",
    features: ["Wallets", "Security", "Mining", "Education"],
    colorScheme: { primary: "#7c3aed", secondary: "#8b5cf6", accent: "#22d3ee" },
    isPremium: true,
    version: "1.0.0",
  },
  // Creative & Media
  {
    id: "photoframe",
    name: "PhotoFrame",
    description: "Photography and camera gear",
    category: "creative",
    industry: "photography",
    features: ["Cameras", "Lenses", "Accessories", "Printing"],
    colorScheme: { primary: "#1f2937", secondary: "#374151", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "musicflow",
    name: "MusicFlow",
    description: "Musical instruments and gear",
    category: "creative",
    industry: "music",
    features: ["Instruments", "Audio", "Sheets", "Lessons"],
    colorScheme: { primary: "#7c3aed", secondary: "#8b5cf6", accent: "#ec4899" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "studiobox",
    name: "StudioBox",
    description: "Recording and studio equipment",
    category: "creative",
    industry: "studio",
    features: ["Recording", "Mixing", "Instruments", "Space"],
    colorScheme: { primary: "#1f2937", secondary: "#4b5563", accent: "#ef4444" },
    isPremium: true,
    version: "1.0.0",
  },
  // Business & Trade
  {
    id: "tradehub",
    name: "TradeHub",
    description: "B2B wholesale trading platform",
    category: "ecommerce",
    industry: "b2b",
    features: ["Bulk", "Wholesale", "RFQ", "Suppliers"],
    colorScheme: { primary: "#1e40af", secondary: "#3b82f6", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  // Party & Events
  {
    id: "partypop",
    name: "PartyPop",
    description: "Party supplies and decorations",
    category: "ecommerce",
    industry: "events",
    features: ["Decorations", "Balloons", "Themes", "Favors"],
    colorScheme: { primary: "#ec4899", secondary: "#f472b6", accent: "#fbbf24" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "nightpulse",
    name: "NightPulse",
    description: "Nightlife and entertainment supplies",
    category: "ecommerce",
    industry: "nightlife",
    features: ["Lighting", "Sound", "Effects", "Rentals"],
    colorScheme: { primary: "#1e1b4b", secondary: "#312e81", accent: "#a855f7" },
    isPremium: true,
    version: "1.0.0",
  },
  // Urban & Modern
  {
    id: "urbanscape",
    name: "UrbanScape",
    description: "Urban living and lifestyle products",
    category: "ecommerce",
    industry: "urban",
    features: ["Modern", "Compact", "Smart", "Design"],
    colorScheme: { primary: "#18181b", secondary: "#27272a", accent: "#06b6d4" },
    isPremium: true,
    version: "1.0.0",
  },
  // Zen & Spiritual
  {
    id: "zenith",
    name: "Zenith",
    description: "Spiritual and wellness products",
    category: "healthcare",
    industry: "spiritual",
    features: ["Meditation", "Yoga", "Crystals", "Books"],
    colorScheme: { primary: "#7c3aed", secondary: "#8b5cf6", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  // Aquatic
  {
    id: "aquavibe",
    name: "AquaVibe",
    description: "Aquarium and aquatic supplies",
    category: "ecommerce",
    industry: "aquatic",
    features: ["Fish", "Tanks", "Supplies", "Maintenance"],
    colorScheme: { primary: "#0ea5e9", secondary: "#0284c7", accent: "#06b6d4" },
    isPremium: true,
    version: "1.0.0",
  },
];

// Service templates (13 total)
const SERVICE_TEMPLATES: Template[] = [
  {
    id: "services",
    name: "Service Pro",
    description: "Professional services template",
    category: "services",
    industry: "services",
    features: ["Booking", "Portfolio", "Testimonials", "Quote Form"],
    colorScheme: { primary: "#0f172a", secondary: "#334155", accent: "#0ea5e9" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "healthcare",
    name: "MediCare",
    description: "Healthcare and medical services",
    category: "healthcare",
    industry: "healthcare",
    features: ["Appointments", "Doctors", "Insurance", "Portal"],
    colorScheme: { primary: "#0ea5e9", secondary: "#0284c7", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "realestate",
    name: "PropertyPlus",
    description: "Real estate listings and services",
    category: "realestate",
    industry: "realestate",
    features: ["Listings", "Map View", "Virtual Tour", "Mortgage Calc"],
    colorScheme: { primary: "#1e40af", secondary: "#3b82f6", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "automotive",
    name: "AutoPro",
    description: "Automotive sales and services",
    category: "automotive",
    industry: "automotive",
    features: ["Inventory", "Financing", "Service Booking", "Trade-in"],
    colorScheme: { primary: "#dc2626", secondary: "#1f2937", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "events",
    name: "EventMaster",
    description: "Event planning and tickets",
    category: "services",
    industry: "events",
    features: ["Ticketing", "Calendar", "Seating", "Check-in"],
    colorScheme: { primary: "#7c3aed", secondary: "#6d28d9", accent: "#ec4899" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "hospitality",
    name: "HotelBook",
    description: "Hotels and hospitality services",
    category: "services",
    industry: "hospitality",
    features: ["Reservations", "Rooms", "Amenities", "Dining"],
    colorScheme: { primary: "#b45309", secondary: "#92400e", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  // Additional Service Templates
  {
    id: "blissbo",
    name: "BlissBo",
    description: "Spa and wellness services",
    category: "healthcare",
    industry: "wellness",
    features: ["Bookings", "Treatments", "Membership", "Gift Cards"],
    colorScheme: { primary: "#ec4899", secondary: "#f472b6", accent: "#a855f7" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "eventhorizon",
    name: "EventHorizon",
    description: "Event management platform",
    category: "services",
    industry: "events",
    features: ["Planning", "Vendors", "Budget", "Timeline"],
    colorScheme: { primary: "#7c3aed", secondary: "#8b5cf6", accent: "#ec4899" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "hoperise",
    name: "HopeRise",
    description: "Nonprofit and charity platform",
    category: "services",
    industry: "nonprofit",
    features: ["Donations", "Campaigns", "Volunteers", "Impact"],
    colorScheme: { primary: "#059669", secondary: "#10b981", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "jobnexus",
    name: "JobNexus",
    description: "Job board and recruitment",
    category: "services",
    industry: "jobs",
    features: ["Listings", "Applications", "Resumes", "Companies"],
    colorScheme: { primary: "#1e40af", secondary: "#3b82f6", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "larkhomes",
    name: "LarkHomes",
    description: "Property rentals and listings",
    category: "realestate",
    industry: "rentals",
    features: ["Listings", "Applications", "Payments", "Maintenance"],
    colorScheme: { primary: "#0891b2", secondary: "#0e7490", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "legalease",
    name: "LegalEase",
    description: "Legal services and consultation",
    category: "services",
    industry: "legal",
    features: ["Consultation", "Documents", "Cases", "Billing"],
    colorScheme: { primary: "#1e3a8a", secondary: "#1e40af", accent: "#fbbf24" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "medicare",
    name: "MediCare Pro",
    description: "Medical clinic services",
    category: "healthcare",
    industry: "clinic",
    features: ["Appointments", "Records", "Prescriptions", "Billing"],
    colorScheme: { primary: "#0ea5e9", secondary: "#0284c7", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "medibay",
    name: "MediBay",
    description: "Medical equipment and supplies",
    category: "healthcare",
    industry: "medical-supplies",
    features: ["Equipment", "Supplies", "Orders", "Support"],
    colorScheme: { primary: "#0891b2", secondary: "#0e7490", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "petpal",
    name: "PetPal Services",
    description: "Pet services and care",
    category: "services",
    industry: "pet-services",
    features: ["Grooming", "Walking", "Boarding", "Training"],
    colorScheme: { primary: "#ea580c", secondary: "#c2410c", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "staysavvy",
    name: "StaySavvy",
    description: "Vacation rentals and stays",
    category: "services",
    industry: "vacation",
    features: ["Properties", "Bookings", "Reviews", "Host Tools"],
    colorScheme: { primary: "#ea580c", secondary: "#c2410c", accent: "#0ea5e9" },
    isPremium: true,
    version: "1.0.0",
  },
];

// SaaS templates (6 total)
const SAAS_TEMPLATES: Template[] = [
  {
    id: "saas",
    name: "SaaS Starter",
    description: "Software as a Service template",
    category: "saas",
    industry: "technology",
    features: ["Pricing Plans", "Features Grid", "Demo", "Integrations"],
    colorScheme: { primary: "#6366f1", secondary: "#4f46e5", accent: "#10b981" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "cloudhost",
    name: "CloudHost",
    description: "Hosting and cloud services",
    category: "saas",
    industry: "hosting",
    features: ["Server Plans", "Uptime", "Support", "Control Panel"],
    colorScheme: { primary: "#0891b2", secondary: "#0e7490", accent: "#22d3ee" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "saasflow",
    name: "SaaSFlow",
    description: "Modern SaaS application template",
    category: "saas",
    industry: "technology",
    features: ["Dashboard", "Analytics", "Team", "API"],
    colorScheme: { primary: "#7c3aed", secondary: "#8b5cf6", accent: "#06b6d4" },
    isPremium: true,
    version: "1.0.0",
  },
];

// Education templates (4 total)
const EDUCATION_TEMPLATES: Template[] = [
  {
    id: "edulearn",
    name: "EduLearn",
    description: "Online courses and learning",
    category: "education",
    industry: "education",
    features: ["Courses", "Lessons", "Quizzes", "Certificates", "Progress"],
    colorScheme: { primary: "#059669", secondary: "#047857", accent: "#f59e0b" },
    isPremium: true,
    isNew: true,
    version: "1.0.0",
  },
  {
    id: "codecamp",
    name: "CodeCamp",
    description: "Coding bootcamp and tech education",
    category: "education",
    industry: "technology",
    features: ["Tracks", "Projects", "Mentorship", "Career"],
    colorScheme: { primary: "#1e40af", secondary: "#1e3a8a", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
  {
    id: "courseacademy",
    name: "CourseAcademy",
    description: "Course creation and learning platform",
    category: "education",
    industry: "education",
    features: ["Courses", "Instructors", "Community", "Certificates"],
    colorScheme: { primary: "#0891b2", secondary: "#0e7490", accent: "#f59e0b" },
    isPremium: true,
    version: "1.0.0",
  },
];

// All templates combined (70 total)
export const ALL_TEMPLATES: Template[] = [
  ...BASE_TEMPLATES,
  ...ECOMMERCE_TEMPLATES,
  ...SERVICE_TEMPLATES,
  ...SAAS_TEMPLATES,
  ...EDUCATION_TEMPLATES,
];

// Template categories with counts
export const TEMPLATE_CATEGORIES = [
  { id: "all", name: "All Templates", count: ALL_TEMPLATES.length },
  { id: "ecommerce", name: "E-Commerce", count: ECOMMERCE_TEMPLATES.length + BASE_TEMPLATES.length },
  { id: "services", name: "Services", count: SERVICE_TEMPLATES.length },
  { id: "saas", name: "SaaS", count: SAAS_TEMPLATES.length },
  { id: "education", name: "Education", count: EDUCATION_TEMPLATES.length },
];

// Helper functions
export function getTemplatesByCategory(category: TemplateCategory | "all"): Template[] {
  if (category === "all") return ALL_TEMPLATES;
  return ALL_TEMPLATES.filter((t) => t.category === category);
}

export function getTemplateById(id: string): Template | null {
  return ALL_TEMPLATES.find((t) => t.id === id) || null;
}

export function getTemplatesByIndustry(industry: string): Template[] {
  return ALL_TEMPLATES.filter(
    (t) => t.industry.toLowerCase() === industry.toLowerCase()
  );
}

export function getPremiumTemplates(): Template[] {
  return ALL_TEMPLATES.filter((t) => t.isPremium);
}

export function getFreeTemplates(): Template[] {
  return ALL_TEMPLATES.filter((t) => !t.isPremium);
}

export function getNewTemplates(): Template[] {
  return ALL_TEMPLATES.filter((t) => t.isNew);
}

export function getPopularTemplates(): Template[] {
  return ALL_TEMPLATES.filter((t) => t.isPopular);
}

export function searchTemplates(query: string): Template[] {
  const lowerQuery = query.toLowerCase();
  return ALL_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.industry.toLowerCase().includes(lowerQuery) ||
      t.features.some((f) => f.toLowerCase().includes(lowerQuery))
  );
}

export function getRelatedTemplates(templateId: string, limit = 3): Template[] {
  const template = getTemplateById(templateId);
  if (!template) return [];

  return ALL_TEMPLATES.filter(
    (t) =>
      t.id !== templateId &&
      (t.category === template.category || t.industry === template.industry)
  ).slice(0, limit);
}

// Template recommendation based on industry
export function getRecommendedTemplate(industry: string): Template | null {
  const matches = getTemplatesByIndustry(industry);
  if (matches.length > 0) {
    return matches.find((t) => t.isPopular) || matches[0];
  }

  return BASE_TEMPLATES[1];
}

// Default export
export default {
  templates: ALL_TEMPLATES,
  categories: TEMPLATE_CATEGORIES,
  getByCategory: getTemplatesByCategory,
  getById: getTemplateById,
  getByIndustry: getTemplatesByIndustry,
  getPremium: getPremiumTemplates,
  getFree: getFreeTemplates,
  getNew: getNewTemplates,
  getPopular: getPopularTemplates,
  search: searchTemplates,
  getRelated: getRelatedTemplates,
  getRecommended: getRecommendedTemplate,
};
