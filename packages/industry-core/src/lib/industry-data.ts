/**
 * Industry Archetype Data
 * 
 * Comprehensive descriptions, features, and recommendations for all supported industries
 * across the 4 base archetypes: Commerce, Food & Beverage, Bookings & Events, Content & Services.
 */

export interface IndustryArchetype {
  id: string;
  name: string;
  archetype: 'commerce' | 'food_beverage' | 'bookings_events' | 'content_services';
  description: string;
  shortDescription: string;
  icon: string;
  bestFor: string[];
  keyFeatures: string[];
  typicalUseCase: string;
  setupTime: 'Quick (1-2 days)' | 'Medium (3-5 days)' | 'Extended (1-2 weeks)';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  popularTemplates: string[];
  integrations: string[];
  kpis: string[];
  complianceRequirements?: string[];
  seasonalPatterns?: string[];
}

export const INDUSTRY_ARCHETYPES: Record<string, IndustryArchetype> = {
  // COMMERCE ARCHETYPE
  retail: {
    id: 'retail',
    name: 'Retail Store',
    archetype: 'commerce',
    description: 'Physical or online retail stores selling products directly to consumers. Perfect for boutiques, convenience stores, electronics shops, and general merchandise retailers.',
    shortDescription: 'Sell products directly to customers',
    icon: '🏪',
    bestFor: ['Boutiques', 'Convenience stores', 'Electronics shops', 'General merchandise'],
    keyFeatures: [
      'Product catalog management',
      'Inventory tracking',
      'Point of Sale (POS) integration',
      'Customer loyalty programs',
      'Multi-channel sales',
    ],
    typicalUseCase: 'A fashion boutique managing inventory, processing in-store and online sales, and running seasonal promotions.',
    setupTime: 'Medium (3-5 days)',
    difficulty: 'Intermediate',
    popularTemplates: ['fashion', 'electronics', 'general-store'],
    integrations: ['Paystack', 'Flutterwave', 'WhatsApp Business', 'Instagram Shopping'],
    kpis: ['Daily Sales', 'Average Transaction Value', 'Inventory Turnover', 'Customer Retention Rate'],
    seasonalPatterns: ['Black Friday surge', 'End-of-year holidays', 'Back-to-school period'],
  },
  
  ecommerce: {
    id: 'ecommerce',
    name: 'E-commerce Store',
    archetype: 'commerce',
    description: 'Online-first retail businesses selling products through digital storefronts. Ideal for D2C brands, dropshipping stores, and marketplace sellers.',
    shortDescription: 'Online store selling products digitally',
    icon: '🛒',
    bestFor: ['D2C brands', 'Dropshipping', 'Digital products', 'Marketplace sellers'],
    keyFeatures: [
      'Shopping cart functionality',
      'Payment gateway integration',
      'Order management',
      'Shipping calculations',
      'Abandoned cart recovery',
      'Product reviews',
    ],
    typicalUseCase: 'An online clothing brand selling exclusively through their website with automated order fulfillment.',
    setupTime: 'Medium (3-5 days)',
    difficulty: 'Intermediate',
    popularTemplates: ['ecommerce-pro', 'minimal-store', 'brand-showcase'],
    integrations: ['Paystack', 'Stripe', 'DHL', 'FedEx', 'Mailchimp'],
    kpis: ['Conversion Rate', 'Cart Abandonment Rate', 'Customer Lifetime Value', 'Average Order Value'],
  },

  wholesale: {
    id: 'wholesale',
    name: 'Wholesale & Distribution',
    archetype: 'commerce',
    description: 'B2B businesses selling products in bulk to retailers, institutions, or other businesses. Supports tiered pricing and volume discounts.',
    shortDescription: 'B2B bulk sales and distribution',
    icon: '📦',
    bestFor: ['Manufacturers', 'Distributors', 'Importers/exporters', 'Wholesalers'],
    keyFeatures: [
      'Bulk ordering',
      'Tiered pricing',
      'Quote generation',
      'Minimum order quantities',
      'Net payment terms',
      'Account management',
    ],
    typicalUseCase: 'A food distributor selling restaurant supplies to multiple restaurants with volume-based pricing.',
    setupTime: 'Extended (1-2 weeks)',
    difficulty: 'Advanced',
    popularTemplates: ['wholesale-catalog', 'b2b-portal'],
    integrations: ['QuickBooks', 'SAP', 'Salesforce'],
    kpis: ['Order Volume', 'B2B Customer Acquisition', 'Quote-to-Order Ratio'],
  },

  // FOOD & BEVERAGE ARCHETYPE
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant',
    archetype: 'food_beverage',
    description: 'Full-service restaurants, cafes, and dining establishments. Features table management, menu customization, and reservation systems.',
    shortDescription: 'Full-service dining establishment',
    icon: '🍽️',
    bestFor: ['Fine dining', 'Casual dining', 'Family restaurants', 'Cafes'],
    keyFeatures: [
      'Table reservations',
      'Digital menus',
      'Order management',
      'Table turnover tracking',
      'Staff scheduling',
      'Kitchen display system',
    ],
    typicalUseCase: 'A mid-size restaurant managing reservations, taking orders, and coordinating kitchen operations.',
    setupTime: 'Medium (3-5 days)',
    difficulty: 'Intermediate',
    popularTemplates: ['restaurant-classic', 'modern-bistro', 'cafe-cozy'],
    integrations: ['OpenTable', 'Uber Eats', 'Glovo', 'Jumia Food'],
    kpis: ['Table Turnover Rate', 'Average Check Size', 'Food Cost Percentage', 'Cover Count'],
    complianceRequirements: ['Food safety certification', 'Health department permits', 'Liquor license (if applicable)'],
  },

  quick_service: {
    id: 'quick_service',
    name: 'Quick Service Restaurant',
    archetype: 'food_beverage',
    description: 'Fast food, takeaways, and quick service restaurants focused on speed and efficiency. Includes self-service kiosks and mobile ordering.',
    shortDescription: 'Fast food and quick takeaway',
    icon: '🍔',
    bestFor: ['Fast food chains', 'Takeaway shops', 'Food trucks', 'Cloud kitchens'],
    keyFeatures: [
      'Quick order processing',
      'Self-service kiosks',
      'Mobile ordering',
      'Delivery integration',
      'Queue management',
      'Combo deals',
    ],
    typicalUseCase: 'A fast-food chain processing high-volume orders quickly with delivery and pickup options.',
    setupTime: 'Quick (1-2 days)',
    difficulty: 'Beginner',
    popularTemplates: ['fast-food-modern', 'takeaway-express'],
    integrations: ['Uber Eats', 'DoorDash', 'Glovo'],
    kpis: ['Order Speed', 'Drive-through Time', 'Delivery Time', 'Order Accuracy'],
  },

  bakery: {
    id: 'bakery',
    name: 'Bakery & Patisserie',
    archetype: 'food_beverage',
    description: 'Bakeries, patisseries, and custom cake shops. Features pre-order system, custom design requests, and pickup scheduling.',
    shortDescription: 'Custom cakes and baked goods',
    icon: '🍰',
    bestFor: ['Artisan bakeries', 'Cake decorators', 'Patisseries', 'Wedding cake specialists'],
    keyFeatures: [
      'Custom order forms',
      'Pickup scheduling',
      'Design gallery',
      'Ingredient transparency',
      'Seasonal specials',
      'Gift cards',
    ],
    typicalUseCase: 'A boutique bakery taking custom wedding cake orders with design consultations and tasting appointments.',
    setupTime: 'Quick (1-2 days)',
    difficulty: 'Beginner',
    popularTemplates: ['bakery-artisan', 'cake-boutique'],
    integrations: ['Instagram', 'Pinterest', 'WhatsApp'],
    kpis: ['Custom Order Rate', 'Average Order Value', 'Seasonal Sales', 'Repeat Customers'],
  },

  // BOOKINGS & EVENTS ARCHETYPE
  events: {
    id: 'events',
    name: 'Event Planning & Management',
    archetype: 'bookings_events',
    description: 'Event planners, wedding coordinators, and event management companies. Features client management, vendor coordination, and timeline tracking.',
    shortDescription: 'Professional event planning services',
    icon: '🎉',
    bestFor: ['Wedding planners', 'Corporate events', 'Party planners', 'Festival organizers'],
    keyFeatures: [
      'Client portal',
      'Vendor management',
      'Timeline creation',
      'Budget tracking',
      'Guest list management',
      'Seating charts',
    ],
    typicalUseCase: 'A wedding planning company managing multiple clients, coordinating vendors, and tracking event timelines.',
    setupTime: 'Extended (1-2 weeks)',
    difficulty: 'Advanced',
    popularTemplates: ['wedding-elegant', 'event-pro'],
    integrations: ['Calendly', 'Zoom', 'Trello', 'Asana'],
    kpis: ['Events per Month', 'Client Satisfaction Score', 'Vendor Performance', 'Profit Margin per Event'],
  },

  hospitality: {
    id: 'hospitality',
    name: 'Hotel & Accommodation',
    archetype: 'bookings_events',
    description: 'Hotels, guesthouses, bed & breakfasts, and vacation rentals. Features room booking, check-in/check-out management, and housekeeping schedules.',
    shortDescription: 'Accommodation and lodging services',
    icon: '🏨',
    bestFor: ['Boutique hotels', 'B&Bs', 'Vacation rentals', 'Hostels'],
    keyFeatures: [
      'Room availability calendar',
      'Online booking engine',
      'Check-in automation',
      'Housekeeping management',
      'Guest communication',
      'Channel management',
    ],
    typicalUseCase: 'A boutique hotel managing room bookings, guest communications, and housekeeping schedules.',
    setupTime: 'Extended (1-2 weeks)',
    difficulty: 'Advanced',
    popularTemplates: ['hotel-boutique', 'bnb-cozy'],
    integrations: ['Booking.com', 'Airbnb', 'Expedia', 'TripAdvisor'],
    kpis: ['Occupancy Rate', 'Average Daily Rate (ADR)', 'RevPAR', 'Guest Satisfaction Score'],
  },

  beauty_salon: {
    id: 'beauty_salon',
    name: 'Beauty Salon & Spa',
    archetype: 'bookings_events',
    description: 'Beauty salons, spas, barbershops, and wellness centers. Features appointment booking, staff scheduling, and service menus.',
    shortDescription: 'Beauty and wellness appointments',
    icon: '💅',
    bestFor: ['Hair salons', 'Spas', 'Barbershops', 'Nail studios'],
    keyFeatures: [
      'Online booking',
      'Staff schedules',
      'Service menus',
      'Package deals',
      'Membership programs',
      'Automated reminders',
    ],
    typicalUseCase: 'A full-service salon managing stylist appointments, spa treatments, and product sales.',
    setupTime: 'Quick (1-2 days)',
    difficulty: 'Beginner',
    popularTemplates: ['salon-modern', 'spa-serenity'],
    integrations: ['Square', 'Fresha', 'Mindbody'],
    kpis: ['Booking Rate', 'No-show Rate', 'Average Ticket', 'Retail Sales per Service'],
  },

  healthcare_clinic: {
    id: 'healthcare_clinic',
    name: 'Healthcare Clinic',
    archetype: 'bookings_events',
    description: 'Medical clinics, dental practices, physiotherapy centers, and healthcare providers. Features patient records, appointment scheduling, and insurance billing.',
    shortDescription: 'Medical and healthcare services',
    icon: '🏥',
    bestFor: ['Medical clinics', 'Dental practices', 'Physiotherapy', 'Specialist consultants'],
    keyFeatures: [
      'Patient portal',
      'Appointment scheduling',
      'Electronic health records',
      'Prescription management',
      'Insurance billing',
      'Telemedicine integration',
    ],
    typicalUseCase: 'A medical clinic managing patient appointments, maintaining health records, and processing insurance claims.',
    setupTime: 'Extended (1-2 weeks)',
    difficulty: 'Advanced',
    popularTemplates: ['clinic-modern', 'dental-care'],
    integrations: ['Practo', 'MyHealthRecord', 'Insurance portals'],
    kpis: ['Patient Volume', 'Wait Time', 'Patient Satisfaction', 'Claim Approval Rate'],
    complianceRequirements: ['HIPAA compliance', 'Medical data protection', 'Professional licensing'],
  },

  fitness: {
    id: 'fitness',
    name: 'Fitness & Gym',
    archetype: 'bookings_events',
    description: 'Gyms, fitness studios, yoga centers, and personal training facilities. Features class scheduling, membership management, and progress tracking.',
    shortDescription: 'Fitness classes and gym memberships',
    icon: '🏋️',
    bestFor: ['Gyms', 'Yoga studios', 'CrossFit boxes', 'Personal trainers'],
    keyFeatures: [
      'Class scheduling',
      'Membership management',
      'Trainer booking',
      'Progress tracking',
      'Challenge programs',
      'Nutrition plans',
    ],
    typicalUseCase: 'A fitness studio managing group classes, personal training sessions, and membership renewals.',
    setupTime: 'Medium (3-5 days)',
    difficulty: 'Intermediate',
    popularTemplates: ['gym-power', 'yoga-zen'],
    integrations: ['Mindbody', 'Glofox', 'Strava'],
    kpis: ['Membership Growth', 'Class Attendance Rate', 'Retention Rate', 'Revenue per Member'],
  },

  // CONTENT & SERVICES ARCHETYPE
  professional_services: {
    id: 'professional_services',
    name: 'Professional Services',
    archetype: 'content_services',
    description: 'Consultants, lawyers, accountants, and professional service providers. Features client management, time tracking, and invoicing.',
    shortDescription: 'Consulting and professional advisory',
    icon: '💼',
    bestFor: ['Consultants', 'Lawyers', 'Accountants', 'Business advisors'],
    keyFeatures: [
      'Client portal',
      'Time tracking',
      'Project management',
      'Invoicing',
      'Document sharing',
      'Appointment scheduling',
    ],
    typicalUseCase: 'A business consulting firm managing client projects, tracking billable hours, and generating invoices.',
    setupTime: 'Medium (3-5 days)',
    difficulty: 'Intermediate',
    popularTemplates: ['consulting-pro', 'legal-services'],
    integrations: ['Slack', 'Zoom', 'DocuSign', 'Xero'],
    kpis: ['Billable Utilization', 'Client Retention', 'Project Profitability', 'Revenue per Consultant'],
  },

  creative_agency: {
    id: 'creative_agency',
    name: 'Creative Agency',
    archetype: 'content_services',
    description: 'Marketing agencies, design studios, content creators, and creative professionals. Features portfolio showcase, project pipelines, and client collaboration.',
    shortDescription: 'Marketing, design, and creative work',
    icon: '🎨',
    bestFor: ['Marketing agencies', 'Design studios', 'Video producers', 'Content creators'],
    keyFeatures: [
      'Portfolio gallery',
      'Project pipeline',
      'Client collaboration',
      'Asset management',
      'Time tracking',
      'Proposal generation',
    ],
    typicalUseCase: 'A digital marketing agency showcasing portfolios, managing campaigns, and collaborating with clients.',
    setupTime: 'Medium (3-5 days)',
    difficulty: 'Intermediate',
    popularTemplates: ['agency-modern', 'creative-studio'],
    integrations: ['Behance', 'Dribbble', 'Adobe Creative Cloud', 'Trello'],
    kpis: ['Project Win Rate', 'Client Satisfaction', 'Creative Output', 'Agency Utilization'],
  },

  education: {
    id: 'education',
    name: 'Education & Training',
    archetype: 'content_services',
    description: 'Schools, tutoring centers, online course creators, and educational institutions. Features course management, student tracking, and learning materials.',
    shortDescription: 'Educational courses and training programs',
    icon: '📚',
    bestFor: ['Online courses', 'Tutoring centers', 'Training providers', 'Workshop hosts'],
    keyFeatures: [
      'Course catalog',
      'Student enrollment',
      'Learning management',
      'Quiz and assessments',
      'Certificate generation',
      'Progress tracking',
    ],
    typicalUseCase: 'An online education platform offering courses with video lessons, quizzes, and certificates.',
    setupTime: 'Extended (1-2 weeks)',
    difficulty: 'Advanced',
    popularTemplates: ['academy-online', 'tutoring-center'],
    integrations: ['Zoom', 'Google Classroom', 'Teachable', 'Kajabi'],
    kpis: ['Student Enrollment', 'Course Completion Rate', 'Student Satisfaction', 'Revenue per Student'],
  },

  nonprofit: {
    id: 'nonprofit',
    name: 'Nonprofit & NGO',
    archetype: 'content_services',
    description: 'Charities, NGOs, foundations, and nonprofit organizations. Features donation management, fundraising campaigns, and volunteer coordination.',
    shortDescription: 'Charitable organization and fundraising',
    icon: '❤️',
    bestFor: ['Charities', 'NGOs', 'Foundations', 'Community organizations'],
    keyFeatures: [
      'Donation processing',
      'Fundraising campaigns',
      'Donor management',
      'Grant tracking',
      'Volunteer coordination',
      'Impact reporting',
    ],
    typicalUseCase: 'A nonprofit organization managing donations, running fundraising campaigns, and coordinating volunteers.',
    setupTime: 'Medium (3-5 days)',
    difficulty: 'Intermediate',
    popularTemplates: ['nonprofit-impact', 'charity-foundation'],
    integrations: ['PayPal Giving Fund', 'GoFundMe', 'Mailchimp', 'Salesforce NPSP'],
    kpis: ['Total Donations', 'Donor Retention Rate', 'Campaign ROI', 'Cost per Dollar Raised'],
  },

  real_estate: {
    id: 'real_estate',
    name: 'Real Estate Agency',
    archetype: 'content_services',
    description: 'Real estate agencies, property managers, and realtors. Features property listings, virtual tours, and lead management.',
    shortDescription: 'Property sales and management',
    icon: '🏠',
    bestFor: ['Real estate agencies', 'Property managers', 'Realtors', 'Rental agencies'],
    keyFeatures: [
      'Property listings',
      'Virtual tours',
      'Lead management',
      'Appointment scheduling',
      'Contract management',
      'Market analysis',
    ],
    typicalUseCase: 'A real estate agency listing properties, scheduling viewings, and managing client relationships.',
    setupTime: 'Medium (3-5 days)',
    difficulty: 'Intermediate',
    popularTemplates: ['realestate-luxury', 'property-management'],
    integrations: ['Zillow', 'Realtor.com', 'DocuSign', 'Calendly'],
    kpis: ['Listings Sold', 'Average Sale Price', 'Days on Market', 'Lead Conversion Rate'],
  },

  automotive: {
    id: 'automotive',
    name: 'Automotive Services',
    archetype: 'content_services',
    description: 'Car dealerships, auto repair shops, car washes, and automotive service providers. Features service booking, vehicle tracking, and parts inventory.',
    shortDescription: 'Vehicle sales and maintenance services',
    icon: '🚗',
    bestFor: ['Car dealerships', 'Auto repair', 'Car washes', 'Detailing services'],
    keyFeatures: [
      'Service booking',
      'Vehicle inventory',
      'Parts management',
      'Service history',
      'Maintenance reminders',
      'Estimate generation',
    ],
    typicalUseCase: 'An auto repair shop managing service appointments, tracking vehicles, and sending maintenance reminders.',
    setupTime: 'Medium (3-5 days)',
    difficulty: 'Intermediate',
    popularTemplates: ['auto-dealer', 'repair-shop'],
    integrations: ['AutoTrader', 'Cars.com', 'ShopWare'],
    kpis: ['Services per Day', 'Average Repair Order', 'Customer Retention', 'Parts Turnover'],
  },
};

/**
 * Get industry by ID with fallback
 */
export function getIndustryById(id: string): IndustryArchetype | null {
  return INDUSTRY_ARCHETYPES[id] || null;
}

/**
 * Get all industries for a specific archetype
 */
export function getIndustriesByArchetype(archetype: string): IndustryArchetype[] {
  return Object.values(INDUSTRY_ARCHETYPES).filter(
    (industry) => industry.archetype === archetype
  );
}

/**
 * Search industries by keyword
 */
export function searchIndustries(query: string): IndustryArchetype[] {
  const searchTerm = query.toLowerCase();
  return Object.values(INDUSTRY_ARCHETYPES).filter(
    (industry) =>
      industry.name.toLowerCase().includes(searchTerm) ||
      industry.description.toLowerCase().includes(searchTerm) ||
      industry.bestFor.some((target) => target.toLowerCase().includes(searchTerm))
  );
}

/**
 * Get recommended industry based on use case
 */
export function getRecommendedIndustry(useCase: string): IndustryArchetype | null {
  const useCaseLower = useCase.toLowerCase();
  
  // Simple keyword matching for recommendations
  if (useCaseLower.includes('sell') && useCaseLower.includes('product')) {
    return INDUSTRY_ARCHETYPES.retail;
  }
  if (useCaseLower.includes('online') && useCaseLower.includes('store')) {
    return INDUSTRY_ARCHETYPES.ecommerce;
  }
  if (useCaseLower.includes('restaurant') || useCaseLower.includes('food')) {
    return INDUSTRY_ARCHETYPES.restaurant;
  }
  if (useCaseLower.includes('event')) {
    return INDUSTRY_ARCHETYPES.events;
  }
  if (useCaseLower.includes('booking') || useCaseLower.includes('appointment')) {
    return INDUSTRY_ARCHETYPES.beauty_salon;
  }
  if (useCaseLower.includes('course') || useCaseLower.includes('teach')) {
    return INDUSTRY_ARCHETYPES.education;
  }
  if (useCaseLower.includes('donation') || useCaseLower.includes('charity')) {
    return INDUSTRY_ARCHETYPES.nonprofit;
  }

  return null;
}
