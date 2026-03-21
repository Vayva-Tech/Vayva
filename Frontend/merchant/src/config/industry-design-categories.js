// ============================================================================
// INDUSTRY TO DESIGN CATEGORY MAPPING
// ============================================================================
// Maps each industry to its optimal visual design category based on:
// - Brand perception (luxury vs. professional vs. energetic)
// - Target audience expectations
// - Industry conventions
// ============================================================================
export const INDUSTRY_DESIGN_CATEGORIES = {
    // Commerce archetype - mostly signature (clean, professional)
    retail: "signature",
    fashion: "glass", // Premium luxury feel
    electronics: "signature", // Clean tech aesthetic
    beauty: "glass", // Premium spa/beauty aesthetic
    grocery: "natural", // Fresh, organic, warm
    b2b: "signature", // Professional, trustworthy
    wholesale: "signature", // Business-focused
    one_product: "signature", // Focused, clean
    // SaaS/Technology
    saas: "dark", // Modern tech-forward
    marketplace: "signature", // Trustworthy platform
    // Food archetype
    food: "bold", // High energy, vibrant
    restaurant: "bold", // Front-of-house energy
    catering: "natural", // Warm, inviting hospitality
    // Bookings archetype
    services: "signature", // Professional services
    salon: "glass", // Beauty premium aesthetic
    spa: "glass", // Luxury wellness
    real_estate: "glass", // Premium property showcase
    automotive: "dark", // Sleek, modern vehicles
    travel_hospitality: "natural", // Warm, welcoming travel
    hotel: "natural", // Comfortable accommodation
    fitness: "natural", // Health-focused energy
    healthcare: "signature", // Clean, trustworthy medical
    legal: "signature", // Professional,严肃 legal
    // Content archetype
    digital: "dark", // Tech product showcase
    events: "bold", // High-energy entertainment
    blog_media: "signature", // Clean publishing
    creative_portfolio: "glass", // Artistic, premium creative
    education: "dark", // Modern Dark design for education platform
    nonprofit: "natural", // Warm, community-focused
    nightlife: "bold", // Vibrant, energetic venues
    jobs: "signature", // Professional career platform
};
// Design category descriptions for UI display
export const DESIGN_CATEGORY_LABELS = {
    signature: "Signature (Clean & Professional)",
    glass: "Glassmorphism (Premium & Luxurious)",
    bold: "Bold (High Energy & Vibrant)",
    dark: "Dark Mode (Modern & Tech-Focused)",
    natural: "Natural (Warm & Organic)",
};
// Default presets for each design category
export const DEFAULT_PRESETS = {
    signature: "clean-blue",
    glass: "creative-purple", // Creative Agency default for glass category
    bold: "electric-purple",
    dark: "midnight-luxe",
    natural: "forest-mist",
};
// Get design category for an industry slug
export function getDesignCategoryForIndustry(industrySlug) {
    return INDUSTRY_DESIGN_CATEGORIES[industrySlug] || "signature";
}
// Get default preset for a design category
export function getDefaultPresetForCategory(category) {
    return DEFAULT_PRESETS[category] || "clean-blue";
}
// Check if industry has a specific design category override
export function hasDesignCategoryOverride(industrySlug) {
    return industrySlug in INDUSTRY_DESIGN_CATEGORIES;
}
