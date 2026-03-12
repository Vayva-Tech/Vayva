// ============================================================================
// INDUSTRY-SPECIFIC DEMO DATA GENERATORS
// ============================================================================
// Each industry gets realistic, relevant products that match the template's
// intended use case. No more "Minimal Tee" in food restaurants.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hashString(input: any) {
    let h = 2166136261;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pick<T>(arr: T[], idx: number): T {
    return arr[idx % arr.length];
}

export type DemoStore = ReturnType<typeof getDemoStore>;
export type DemoProduct = DemoStore['products'][number];

// ============================================================================
// INDUSTRY DATA LIBRARIES
// ============================================================================

const STORE_NAMES_BY_INDUSTRY: Record<string, string[]> = {
    food: ["ChopNow Kitchen", "Lagos Bites", "Abuja Flavors", "Port Harcourt Plates", "Kaduna Kitchen"],
    electronics: ["Gizmo Tech", "Lagos Gadgets", "TechHub Nigeria", "Digital Zone", "Smart Devices"],
    fashion: ["A&A Fashion", "Lagos Style", "Nigerian Threads", "Urban Wear", "Luxe Apparel"],
    beauty: ["Bloome & Home", "Glow Beauty", "Natural Essence", "Skin Care Pro", "Beauty Haven"],
    realestate: ["HomeList NG", "Lagos Properties", "Abuja Homes", "Prime Real Estate", "Dream Homes"],
    services: ["Bookly Pro", "Service Hub", "Expert Connect", "Pro Services", "Skill Masters"],
    events: ["Ticketly", "EventHub NG", "Nigerian Events", "Celebration Pro", "Party Central"],
    education: ["Eduflow", "Learn Nigeria", "Skill Academy", "Knowledge Hub", "Study Pro"],
    automotive: ["AutoHub NG", "Lagos Motors", "Car Connect", "Drive Nigeria", "Auto World"],
    nonprofit: ["GiveFlow", "Charity NG", "Hope Foundation", "Impact Nigeria", "Give Back"],
    marketplace: ["MarketHub", "Nigerian Market", "Trade Hub", "Vendor Connect", "MultiStore"],
    b2b: ["BulkTrade", "B2B Nigeria", "Wholesale Hub", "Trade Connect", "Business Supply"],
    nightlife: ["Noir Club", "Pulse Events", "Nightlife NG", "VIP Venues", "Party Lagos"],
    digital: ["FileVault", "Digital Assets", "Download Hub", "E-Products NG", "Digital Store"],
    default: ["Vayva Store", "Lagos Luxe", "Abuja Essentials", "Port Harcourt Picks", "Kaduna Co."],
};

const CATEGORIES_BY_INDUSTRY: Record<string, string[]> = {
    food: ["Starters", "Mains", "Sides", "Desserts", "Drinks", "Combos"],
    electronics: ["Phones", "Laptops", "Accessories", "Audio", "Gaming", "Smart Home"],
    fashion: ["New Arrivals", "Dresses", "Tops", "Bottoms", "Shoes", "Accessories"],
    beauty: ["Skincare", "Makeup", "Haircare", "Fragrances", "Tools", "Sets"],
    realestate: ["For Sale", "For Rent", "Commercial", "Land", "New Developments", "Luxury"],
    services: ["Consultation", "Treatment", "Repair", "Installation", "Maintenance", "Training"],
    events: ["Upcoming", "Concerts", "Workshops", "Sports", "Theater", "Networking"],
    education: ["Beginner", "Intermediate", "Advanced", "Certification", "Live Classes", "Recorded"],
    automotive: ["Sedans", "SUVs", "Trucks", "Electric", "Luxury", "Parts & Accessories"],
    nonprofit: ["Active Campaigns", "Education", "Health", "Environment", "Emergency", "Community"],
    marketplace: ["Electronics", "Fashion", "Home", "Sports", "Books", "Artisanal"],
    b2b: ["Raw Materials", "Equipment", "Supplies", "Packaging", "Wholesale Lots", "MOQ Specials"],
    nightlife: ["Tonight", "This Weekend", "Tables", "Bottle Service", "Events", "Guest List"],
    digital: ["E-Books", "Software", "Templates", "Music", "Courses", "Graphics"],
    default: ["New In", "Best Sellers", "Accessories", "Essentials", "Gifts"],
};

const IMAGES_BY_INDUSTRY: Record<string, string[]> = {
    food: [
        "/images/demo/food/jollof-rice.jpg",
        "/images/demo/food/suya.jpg",
        "/images/demo/food/pounded-yam.jpg",
        "/images/demo/food/pepper-soup.jpg",
        "/images/demo/food/chin-chin.jpg",
        "/images/demo/food/zobo.jpg",
        "/images/demo/food/moi-moi.jpg",
        "/images/demo/food/egusi.jpg",
    ],
    electronics: [
        "/images/demo/tech/iphone.jpg",
        "/images/demo/tech/laptop.jpg",
        "/images/demo/tech/headphones.jpg",
        "/images/demo/tech/smartwatch.jpg",
        "/images/demo/tech/speaker.jpg",
        "/images/demo/tech/camera.jpg",
        "/images/demo/tech/gaming.jpg",
        "/images/demo/tech/tablet.jpg",
    ],
    fashion: [
        "/images/demo/fashion/dress.jpg",
        "/images/demo/fashion/shirt.jpg",
        "/images/demo/fashion/sneakers.jpg",
        "/images/demo/fashion/bag.jpg",
        "/images/demo/fashion/jewelry.jpg",
        "/images/demo/fashion/ankara.jpg",
        "/images/demo/fashion/suit.jpg",
        "/images/demo/fashion/casual.jpg",
    ],
    beauty: [
        "/images/demo/beauty/serum.jpg",
        "/images/demo/beauty/moisturizer.jpg",
        "/images/demo/beauty/lipstick.jpg",
        "/images/demo/beauty/foundation.jpg",
        "/images/demo/beauty/shampoo.jpg",
        "/images/demo/beauty/perfume.jpg",
        "/images/demo/beauty/mask.jpg",
        "/images/demo/beauty/tools.jpg",
    ],
    realestate: [
        "/images/demo/realestate/house1.jpg",
        "/images/demo/realestate/house2.jpg",
        "/images/demo/realestate/apartment.jpg",
        "/images/demo/realestate/villa.jpg",
        "/images/demo/realestate/commercial.jpg",
        "/images/demo/realestate/land.jpg",
        "/images/demo/realestate/luxury.jpg",
        "/images/demo/realestate/modern.jpg",
    ],
    default: [
        "/images/template-previews/default-desktop.png",
        "/images/template-previews/default-mobile.png",
    ],
};

// ============================================================================
// PRODUCT LIBRARIES BY INDUSTRY
// ============================================================================

const FOOD_PRODUCTS = [
    { name: "Jollof Rice Special", price: 2500, description: "Authentic Nigerian jollof rice with grilled chicken and plantain." },
    { name: "Suya Platter", price: 1500, description: "Spicy grilled beef skewers with onions and pepper sauce." },
    { name: "Pounded Yam & Egusi", price: 3500, description: "Smooth pounded yam served with rich egusi soup and assorted meat." },
    { name: "Pepper Soup", price: 2000, description: "Spicy goat meat pepper soup with traditional spices." },
    { name: "Moi Moi", price: 800, description: "Steamed bean pudding with eggs and fish." },
    { name: "Chin Chin", price: 500, description: "Crunchy Nigerian snack, perfect for any occasion." },
    { name: "Zobo Drink", price: 400, description: "Refreshing hibiscus drink with ginger and pineapple." },
    { name: "Akara (Bean Cakes)", price: 600, description: "Deep-fried bean cakes, crispy outside, soft inside." },
    { name: "Efo Riro", price: 2800, description: "Rich vegetable stew with palm oil and smoked fish." },
    { name: "Amala & Gbegiri", price: 3200, description: "Smooth yam flour with bean soup and ewedu." },
    { name: "Ofada Rice", price: 3000, description: "Local rice with special ofada sauce and assorted meat." },
    { name: "Fried Rice Combo", price: 2700, description: "Nigerian fried rice with grilled turkey and coleslaw." },
];

const ELECTRONICS_PRODUCTS = [
    { name: "iPhone 15 Pro Max", price: 1200000, description: "256GB - Natural Titanium. 48MP camera system." },
    { name: "Samsung Galaxy S24", price: 950000, description: "256GB - AI-powered smartphone with 200MP camera." },
    { name: "MacBook Air M3", price: 1450000, description: "13-inch with 8GB RAM, 256GB SSD." },
    { name: "AirPods Pro 2", price: 180000, description: "Active noise cancellation, spatial audio." },
    { name: "Sony WH-1000XM5", price: 280000, description: "Industry-leading noise canceling headphones." },
    { name: "iPad Air 5", price: 520000, description: "10.9-inch, M1 chip, 64GB WiFi." },
    { name: "Nintendo Switch OLED", price: 280000, description: "Gaming console with vibrant 7-inch screen." },
    { name: "DJI Mini 4 Pro", price: 750000, description: "Lightweight drone with 4K camera and obstacle avoidance." },
    { name: 'Samsung 55" 4K TV', price: 450000, description: "Crystal UHD with smart features and HDR." },
    { name: "JBL Flip 6", price: 85000, description: "Portable waterproof speaker with powerful sound." },
    { name: "PlayStation 5", price: 580000, description: "Next-gen gaming console with DualSense controller." },
    { name: "Canon EOS R50", price: 650000, description: "Mirrorless camera with 24MP APS-C sensor." },
];

const FASHION_PRODUCTS = [
    { name: "Ankara Maxi Dress", price: 15000, description: "Vibrant African print dress with modern cut." },
    { name: "Linen Button Shirt", price: 12000, description: "Breathable linen shirt in neutral tones." },
    { name: "Classic Sneakers", price: 25000, description: "White leather sneakers, versatile everyday wear." },
    { name: "Leather Crossbody Bag", price: 18000, description: "Genuine leather bag with adjustable strap." },
    { name: "Gold Chain Necklace", price: 8500, description: "18K gold-plated chain, water-resistant." },
    { name: "Denim Jacket", price: 22000, description: "Classic blue denim with vintage wash." },
    { name: "Pleated Midi Skirt", price: 14000, description: "Elegant pleated skirt in soft pastel." },
    { name: "Athletic Joggers", price: 11000, description: "Comfortable cotton blend with side pockets." },
    { name: "Silk Scarf", price: 6500, description: "Luxurious silk with artistic print." },
    { name: "Block Heel Sandals", price: 16000, description: "Comfortable 2-inch heel in neutral leather." },
    { name: "Structured Blazer", price: 28000, description: "Tailored blazer for professional occasions." },
    { name: "Graphic Tee", price: 5500, description: "Cotton tee with unique Nigerian artist design." },
];

const BEAUTY_PRODUCTS = [
    { name: "Vitamin C Serum", price: 8500, description: "Brightening serum with 20% vitamin C." },
    { name: "Hydrating Moisturizer", price: 6500, description: "24-hour hydration with hyaluronic acid." },
    { name: "Matte Lipstick", price: 3500, description: "Long-lasting formula in 12 shades." },
    { name: "Full Coverage Foundation", price: 7500, description: "Flawless finish for all skin tones." },
    { name: "Hair Growth Oil", price: 4500, description: "Castor and coconut oil blend for natural hair." },
    { name: "Oud Perfume", price: 12000, description: "Luxurious Arabian oud fragrance, 50ml." },
    { name: "Clay Face Mask", price: 4000, description: "Detoxifying mask with bentonite clay." },
    { name: "Makeup Brush Set", price: 9500, description: "10 professional brushes with carrying case." },
    { name: "Shea Body Butter", price: 3500, description: "Pure shea butter from Ghana, unscented." },
    { name: "Nail Polish Collection", price: 6000, description: "6-piece set with top and base coat." },
    { name: "Eyeshadow Palette", price: 8500, description: "18 highly pigmented shades, matte and shimmer." },
    { name: "Sunscreen SPF 50", price: 5500, description: "Broad spectrum protection, lightweight formula." },
];

const REAL_ESTATE_PRODUCTS = [
    { name: "3-Bedroom Apartment in Lekki", price: 45000000, description: "Modern apartment with pool, gym, and 24/7 security. 180sqm." },
    { name: "4-Bedroom Duplex in Ikoyi", price: 120000000, description: "Luxury duplex with BQ, elevator, and waterfront view." },
    { name: "2-Bedroom Flat in Yaba", price: 25000000, description: "Newly renovated flat close to tech hub. 90sqm." },
    { name: "Commercial Space in Ikeja", price: 65000000, description: "Office space with parking, 300sqm, prime location." },
    { name: "Land in Epe", price: 5000000, description: "600sqm dry land with C of O, fast developing area." },
    { name: "5-Bedroom Mansion in Banana Island", price: 450000000, description: "Ultra-luxury mansion with cinema and pool." },
    { name: "1-Bedroom Studio in VI", price: 18000000, description: "Compact luxury studio, perfect for young professionals." },
    { name: "Warehouse in Apapa", price: 85000000, description: "5000sqm warehouse with loading bay and office." },
];

const SERVICES_PRODUCTS = [
    { name: "Hair Styling Session", price: 5000, description: "Professional braiding or styling, 2 hours." },
    { name: "Home Cleaning", price: 8000, description: "Deep cleaning for 3-bedroom apartment." },
    { name: "Business Consultation", price: 25000, description: "1-hour strategy session with industry expert." },
    { name: "Fitness Training", price: 15000, description: "Personal training session, customized plan." },
    { name: "Photography Session", price: 35000, description: "2-hour shoot with 20 edited photos." },
    { name: "Plumbing Repair", price: 12000, description: "Leak repair and pipe maintenance." },
    { name: "Catering (20 guests)", price: 45000, description: "Full Nigerian menu with service staff." },
    { name: "Event Planning", price: 50000, description: "Coordination for birthdays or small weddings." },
];

const EVENTS_PRODUCTS = [
    { name: "Afrobeats Concert - VIP", price: 50000, description: "Premium seating with backstage access and drinks." },
    { name: "Comedy Night", price: 8000, description: "Stand-up show featuring top Nigerian comedians." },
    { name: "Tech Workshop", price: 15000, description: "Full-day coding or design workshop with certificate." },
    { name: "Food Festival Pass", price: 5000, description: "All-access to tastings and cooking demos." },
    { name: "Football Match - VIP", price: 25000, description: "VIP box with catering, 10 seats available." },
    { name: "Art Exhibition", price: 3000, description: "Contemporary Nigerian art showcase with wine." },
    { name: "Music Festival - 3 Day Pass", price: 35000, description: "Weekend pass to Lagos' biggest music festival." },
    { name: "Business Networking Event", price: 12000, description: "Connect with entrepreneurs, includes dinner." },
];

const EDUCATION_PRODUCTS = [
    { name: "Web Development Bootcamp", price: 85000, description: "12-week intensive, HTML to React with portfolio." },
    { name: "Data Science Fundamentals", price: 65000, description: "Python, statistics, and machine learning basics." },
    { name: "UI/UX Design Masterclass", price: 45000, description: "Figma mastery with real client projects." },
    { name: "Digital Marketing Course", price: 35000, description: "SEO, social media, and paid ads strategy." },
    { name: "Public Speaking Workshop", price: 25000, description: "2-day intensive with presentation practice." },
    { name: "Financial Literacy Program", price: 20000, description: "Personal finance, investing, and budgeting." },
    { name: "Photography Masterclass", price: 40000, description: "From basics to professional shooting." },
    { name: "Business Writing Course", price: 18000, description: "Professional emails, proposals, and reports." },
];

const AUTOMOTIVE_PRODUCTS = [
    { name: "Toyota Corolla 2020", price: 8500000, description: "45,000km, full service history, accident-free." },
    { name: "Honda Accord 2019", price: 7800000, description: "Sport trim, 60,000km, leather interior." },
    { name: "Lexus RX 350 2021", price: 25000000, description: "Luxury SUV, 25,000km, full options." },
    { name: "Mercedes-Benz C300 2020", price: 22000000, description: "AMG line, panoramic roof, low mileage." },
    { name: "BMW X5 2019", price: 28000000, description: "xDrive40i, premium package, 35,000km." },
    { name: "Tesla Model 3 2022", price: 32000000, description: "Dual motor AWD, autopilot, 15,000km." },
    { name: "Hyundai Elantra 2021", price: 6500000, description: "Compact sedan, excellent fuel economy." },
    { name: "Kia Sportage 2020", price: 9200000, description: "Family SUV with warranty remaining." },
];

const NONPROFIT_PRODUCTS = [
    { name: "School Building Fund", price: 1000, description: "Help build classrooms in rural communities. Every ₦1000 counts." },
    { name: "Medical Supplies Campaign", price: 5000, description: "Provide essential medicines to clinics." },
    { name: "Clean Water Initiative", price: 2500, description: "Fund borehole drilling for villages." },
    { name: "Scholarship Program", price: 10000, description: "Sponsor a child's education for one term." },
    { name: "Food Security Project", price: 3000, description: "Support farming cooperatives with seeds and tools." },
    { name: "Youth Skills Training", price: 5000, description: "Fund vocational training for unemployed youth." },
    { name: "Emergency Relief", price: 2000, description: "Rapid response to flood and disaster victims." },
    { name: "Maternal Health Support", price: 4000, description: "Provide prenatal care and safe delivery kits." },
];

const MARKETPLACE_PRODUCTS = [
    { name: "Handwoven Basket", price: 3500, description: "Artisan-made from local grasses, various sizes." },
    { name: "Organic Honey (1L)", price: 4500, description: "Pure, unfiltered honey from local beekeepers." },
    { name: "Custom Art Portrait", price: 15000, description: "Digital or canvas portrait from your photo." },
    { name: "Homemade Soy Candles", price: 2800, description: "Natural soy wax in recycled glass jars." },
    { name: "Upcycled Fashion", price: 8500, description: "Unique pieces made from reclaimed materials." },
    { name: "Traditional Spices Set", price: 6500, description: "10 authentic Nigerian spices in gift box." },
    { name: "Handmade Leather Wallet", price: 5500, description: "Crafted by local artisans, genuine leather." },
    { name: "Natural Soap Collection", price: 3200, description: "6-pack of handmade soaps with essential oils." },
];

const B2B_PRODUCTS = [
    { name: "Rice - 50kg Bag (MOQ: 10)", price: 45000, description: "Premium long grain rice, bulk wholesale pricing." },
    { name: "Cooking Oil - 25L Drum", price: 28000, description: "Vegetable oil for restaurants and caterers." },
    { name: "Packaging Boxes (MOQ: 500)", price: 15000, description: "Custom branded boxes in various sizes." },
    { name: "Office Stationery Set", price: 8500, description: "Bulk pens, paper, and supplies for teams." },
    { name: "Industrial Cleaning Supplies", price: 22000, description: "Concentrated cleaners for commercial use." },
    { name: "Raw Shea Butter (MOQ: 20kg)", price: 35000, description: "Bulk shea for cosmetics manufacturing." },
    { name: "Uniform Fabric Rolls", price: 45000, description: "Wholesale textile for corporate uniforms." },
    { name: "Safety Equipment Bundle", price: 65000, description: "Helmets, gloves, and vests for construction." },
];

const NIGHTLIFE_PRODUCTS = [
    { name: "VIP Table - Friday Night", price: 100000, description: "Reserved table for 6 with bottle service." },
    { name: "General Admission", price: 5000, description: "Entry to club with standard access." },
    { name: "Bottle Service - Premium", price: 75000, description: "VIP table + 2 premium bottles + mixers." },
    { name: "Birthday Package", price: 150000, description: "Table for 10, cake, and birthday shoutout." },
    { name: "DJ Set Event", price: 8000, description: "Special guest DJ performance, limited tickets." },
    { name: "Ladies Night Special", price: 3000, description: "Entry + 2 complimentary drinks (Thu)." },
    { name: "New Year's Eve Gala", price: 50000, description: "Premium access to NYE countdown event." },
    { name: "Private Event Booking", price: 500000, description: "Full venue rental for private parties." },
];

const DIGITAL_PRODUCTS = [
    { name: "Business Plan Template", price: 5000, description: "Professional template with financial projections." },
    { name: "Social Media Kit (50 Templates)", price: 8500, description: "Canva templates for Instagram and Facebook." },
    { name: "E-book: Start Your Business", price: 3500, description: "Step-by-step guide to Nigerian business registration." },
    { name: "Invoice Template Pack", price: 2500, description: "10 professional invoice designs, Excel & PDF." },
    { name: "Music Production Kit", price: 12000, description: "500+ samples and loops for Afrobeat production." },
    { name: "Online Course: Excel Mastery", price: 15000, description: "From basics to advanced formulas and pivot tables." },
    { name: "Stock Photo Collection", price: 4500, description: "1000+ Nigerian lifestyle and business photos." },
    { name: "Legal Contract Templates", price: 7500, description: "Employment, service, and NDA agreements." },
];

// ============================================================================
// MAIN DEMO DATA GENERATOR
// ============================================================================

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDemoStore(templateSlug: string) {
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_DEMO_PREVIEW !== "true") {
        throw new Error("Demo data generation is disabled in production.");
    }

    const seed = hashString(templateSlug);
    const industry = detectIndustryFromSlug(templateSlug);
    
    const storeNames = STORE_NAMES_BY_INDUSTRY[industry] || STORE_NAMES_BY_INDUSTRY.default;
    const categories = CATEGORIES_BY_INDUSTRY[industry] || CATEGORIES_BY_INDUSTRY.default;
    const images = IMAGES_BY_INDUSTRY[industry] || IMAGES_BY_INDUSTRY.default;
    const productLibrary = getProductLibrary(industry);
    
    const plans = ["STARTER", "GROWTH", "PRO"];
    
    // Generate 24 products with industry-specific data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = Array.from({ length: 24 }).map((_: any, i: any) => {
        const productData = productLibrary[i % productLibrary.length];
        const cat = pick(categories, seed + i);
        const priceVariation = ((seed + i * 7919) % 20) - 10; // -10% to +10% variation
        const adjustedPrice = Math.round(productData.price * (1 + priceVariation / 100));
        
        return {
            id: `demo-${seed}-${i}`,
            slug: `demo-product-${seed}-${i}`,
            name: productData.name,
            price: adjustedPrice,
            image: pick(images, seed + i),
            description: productData.description,
            category: cat,
            // Industry-specific metadata
            ...(industry === "realestate" && { 
                location: "Lagos, Nigeria",
                bedrooms: [2, 3, 4, 5][i % 4],
                bathrooms: [1, 2, 3, 4][i % 4],
                sqm: [80, 120, 180, 250, 400][i % 5],
            }),
            ...(industry === "food" && {
                prepTime: [10, 15, 20, 25, 30][i % 5],
                calories: [200, 350, 500, 650, 800][i % 5],
            }),
            ...(industry === "electronics" && {
                warranty: "12 months",
                inStock: true,
            }),
            ...(industry === "services" && {
                duration: [30, 60, 90, 120, 180][i % 5],
                deposit: Math.round(adjustedPrice * 0.3),
            }),
            ...(industry === "events" && {
                date: new Date(Date.now() + (i + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
                venue: "Lagos Venue",
            }),
        };
    });

    return {
        storeName: pick(storeNames, seed),
        slug: `demo-store-${seed}`,
        plan: pick(plans, seed),
        categories,
        products,
        industry,
        // Store metadata
        description: getStoreDescription(industry),
        location: "Lagos, Nigeria",
        rating: 4.5 + ((seed % 10) / 10), // 4.5 - 5.0
        reviewCount: 50 + (seed % 200),
    };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function detectIndustryFromSlug(slug: string): string {
    const industryMap: Record<string, string> = {
        "vayva-chopnow": "food",
        "slice-life-pizza": "food",
        "vayva-coffee-house": "food",
        "vayva-burger-joint": "food",
        "vayva-sushi-bar": "food",
        "vayva-bakery": "food",
        "vayva-gizmo-tech": "electronics",
        "vayva-active-gear": "electronics",
        "vayva-aa-fashion": "fashion",
        "vayva-sneaker-drop": "fashion",
        "vayva-kids-world": "fashion",
        "vayva-bloome-home": "beauty",
        "vayva-beauty-box": "beauty",
        "vayva-homelist": "realestate",
        "vayva-bookly-pro": "services",
        "vayva-gym-flow": "services",
        "vayva-law-firm": "services",
        "vayva-clean-crew": "services",
        "vayva-ticketly": "events",
        "vayva-pulse-events": "events",
        "vayva-eduflow": "education",
        "vayva-bulktrade": "b2b",
        "vayva-markethub": "marketplace",
        "vayva-giveflow": "nonprofit",
        "vayva-noir-club": "nightlife",
        "vayva-file-vault": "digital",
    };
    
    for (const [key, industry] of Object.entries(industryMap)) {
        if (slug.includes(key) || key.includes(slug)) {
            return industry;
        }
    }
    
    // Fallback detection
    if (slug.includes("food") || slug.includes("chop") || slug.includes("pizza") || slug.includes("burger")) return "food";
    if (slug.includes("tech") || slug.includes("gizmo") || slug.includes("gadget")) return "electronics";
    if (slug.includes("fashion") || slug.includes("cloth") || slug.includes("wear")) return "fashion";
    if (slug.includes("beauty") || slug.includes("glow") || slug.includes("skin")) return "beauty";
    if (slug.includes("home") || slug.includes("property") || slug.includes("estate")) return "realestate";
    if (slug.includes("service") || slug.includes("book") || slug.includes("appoint")) return "services";
    if (slug.includes("event") || slug.includes("ticket")) return "events";
    if (slug.includes("edu") || slug.includes("learn") || slug.includes("course")) return "education";
    if (slug.includes("auto") || slug.includes("car") || slug.includes("vehicle")) return "automotive";
    if (slug.includes("donate") || slug.includes("charity") || slug.includes("give")) return "nonprofit";
    if (slug.includes("market") || slug.includes("vendor")) return "marketplace";
    if (slug.includes("b2b") || slug.includes("bulk") || slug.includes("trade")) return "b2b";
    if (slug.includes("club") || slug.includes("night") || slug.includes("party")) return "nightlife";
    if (slug.includes("digital") || slug.includes("download") || slug.includes("file")) return "digital";
    
    return "default";
}

function getProductLibrary(industry: string) {
    const libraries: Record<string, Array<{ name: string; price: number; description: string }>> = {
        food: FOOD_PRODUCTS,
        electronics: ELECTRONICS_PRODUCTS,
        fashion: FASHION_PRODUCTS,
        beauty: BEAUTY_PRODUCTS,
        realestate: REAL_ESTATE_PRODUCTS,
        services: SERVICES_PRODUCTS,
        events: EVENTS_PRODUCTS,
        education: EDUCATION_PRODUCTS,
        automotive: AUTOMOTIVE_PRODUCTS,
        nonprofit: NONPROFIT_PRODUCTS,
        marketplace: MARKETPLACE_PRODUCTS,
        b2b: B2B_PRODUCTS,
        nightlife: NIGHTLIFE_PRODUCTS,
        digital: DIGITAL_PRODUCTS,
        default: FASHION_PRODUCTS, // Fallback
    };
    
    return libraries[industry] || libraries.default;
}

function getStoreDescription(industry: string): string {
    const descriptions: Record<string, string> = {
        food: "Authentic Nigerian cuisine delivered to your door. Fresh ingredients, traditional recipes.",
        electronics: "Latest gadgets and tech at competitive prices. Warranty included on all items.",
        fashion: "Contemporary African fashion blending tradition with modern style.",
        beauty: "Premium skincare and beauty products for the Nigerian climate.",
        realestate: "Your trusted partner for properties across Nigeria. Verified listings only.",
        services: "Professional services delivered by verified experts. Book online instantly.",
        events: "Nigeria's premier ticketing platform. Secure, fast, and reliable.",
        education: "Unlock your potential with courses from industry experts.",
        automotive: "Quality vehicles with transparent history and fair pricing.",
        nonprofit: "Join us in making a difference. Every donation counts.",
        marketplace: "Discover unique products from Nigerian artisans and businesses.",
        b2b: "Wholesale supplies for your business. Competitive pricing, reliable delivery.",
        nightlife: "Experience Lagos nightlife at its finest. VIP treatment guaranteed.",
        digital: "Instant access to digital assets. Download and use immediately.",
        default: "Quality products for everyday needs. Shop with confidence.",
    };
    
    return descriptions[industry] || descriptions.default;
}

// ============================================================================
// TEMPLATE CREATION TEMPLATE
// ============================================================================

export interface TemplateDefinition {
    id: string;
    slug: string;
    displayName: string;
    category: string;
    industry: string;
    businessModel: string;
    primaryUseCase: string;
    requiredPlan: string;
    defaultTheme: "light" | "dark";
    status: "active" | "draft" | "deprecated";
    layoutKey: string;
    componentProps?: Record<string, unknown>;
    preview?: {
        thumbnailUrl: string | null;
        mobileUrl: string | null;
        desktopUrl: string | null;
    };
    compare: {
        headline: string;
        bullets: string[];
        bestFor: string[];
        keyModules: string[];
    };
    routes: string[];
    onboardingProfile: {
        prefill: {
            industryCategory: string;
            deliveryEnabled?: boolean;
            paymentsEnabled?: boolean;
        };
        skipSteps?: string[];
        requireSteps?: string[];
    };
}

export const TEMPLATE_CREATION_TEMPLATE: TemplateDefinition = {
    id: "template-id",
    slug: "template-slug",
    displayName: "Template Display Name",
    category: "Category",
    industry: "industry_slug",
    businessModel: "Business Model",
    primaryUseCase: "Primary Use Case Description",
    requiredPlan: "free",
    defaultTheme: "light",
    status: "active",
    layoutKey: "LayoutComponentName",
    componentProps: {
        // Template-specific props that make it unique
        heroText: "Hero Headline",
        heroSubtext: "Supporting subtext",
        showFeatureX: true,
        colorScheme: "primary",
    },
    preview: {
        thumbnailUrl: "/images/templates/your-template/thumbnail.jpg",
        mobileUrl: "/images/templates/your-template/mobile.jpg",
        desktopUrl: "/images/templates/your-template/desktop.jpg",
    },
    compare: {
        headline: "One-line value proposition",
        bullets: [
            "Key feature 1 with benefit",
            "Key feature 2 with benefit",
            "Key feature 3 with benefit",
        ],
        bestFor: ["Target audience 1", "Target audience 2"],
        keyModules: ["Module 1", "Module 2", "Module 3"],
    },
    routes: ["/", "/products/:slug", "/checkout"],
    onboardingProfile: {
        prefill: {
            industryCategory: "industry_slug",
            deliveryEnabled: true,
            paymentsEnabled: true,
        },
        requireSteps: ["finance"],
    },
};

// ============================================================================
// TEMPLATE SCREENSHOT GENERATION HELPERS
// ============================================================================

export function getTemplateScreenshotPaths(templateSlug: string) {
    return {
        thumbnail: `/images/templates/${templateSlug}/thumbnail.jpg`,
        mobile: `/images/templates/${templateSlug}/mobile.jpg`,
        desktop: `/images/templates/${templateSlug}/desktop.jpg`,
        // Fallback paths if specific images don't exist
        fallback: {
            thumbnail: "/images/template-previews/default-thumbnail.jpg",
            mobile: "/images/template-previews/default-mobile.jpg",
            desktop: "/images/template-previews/default-desktop.jpg",
        },
    };
}

export function validateTemplateImages(templateSlug: string): boolean {
    // This would check if images exist in the public folder
    // Returns true if all required images exist
    const paths = getTemplateScreenshotPaths(templateSlug);
    // Implementation would check filesystem or do HEAD requests
    return true; // Placeholder
}
