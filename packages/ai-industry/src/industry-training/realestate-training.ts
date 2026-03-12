/**
 * Real Estate Industry Training Data
 * Industry-specific scenarios and responses for real estate
 */

import type { IndustryContext, TrainingScenario, IndustrySlug } from '../types';

export const realEstateContext: IndustryContext = {
  industry: 'realestate',
  terminology: {
    'listing': 'Property for sale or rent',
    'cma': 'Comparative Market Analysis - price comparison report',
    'dom': 'Days on Market - time since listing',
    'fsbo': 'For Sale By Owner - no agent involved',
    'contingency': 'Condition that must be met for sale to proceed',
    'earnest_money': 'Deposit showing buyer commitment',
    'escrow': 'Third party holding funds during transaction',
    'appraisal': 'Professional property valuation',
    'inspection': 'Professional property condition review',
    'closing': 'Final transaction completion',
    'mortgage': 'Loan for property purchase',
    'hoa': 'Homeowners Association',
    'square_footage': 'Property size measurement',
    'curb_appeal': 'Visual attractiveness from street',
  },
  workflows: [
    'Lead capture -> Qualification -> Property search -> Showings -> Offer -> Contract -> Closing',
    'Listing appointment -> CMA -> Pricing -> Marketing -> Showings -> Offers -> Negotiation -> Closing',
    'Buyer consultation -> Pre-approval -> Property tours -> Offer writing -> Inspection -> Closing',
  ],
  kpis: [
    'Days on market',
    'List-to-sale price ratio',
    'Showing to offer ratio',
    'Lead conversion rate',
    'Average transaction value',
    'Client satisfaction score',
  ],
  commonIssues: [
    'Financing falling through',
    'Low appraisal values',
    'Inspection issues',
    'Title problems',
    'Buyer cold feet',
    'Multiple offer situations',
  ],
};

export const realEstateScenarios: TrainingScenario[] = [
  // FAQ Scenarios
  {
    id: 're-faq-001',
    category: 'faq',
    industry: 'realestate' as IndustrySlug,
    language: 'en',
    question: 'What is my home worth?',
    answer: 'I can prepare a complimentary Comparative Market Analysis (CMA) for your property. This will show recent sales of similar homes in your area. Would you like me to schedule a brief visit to assess your home\'s condition and unique features for a more accurate valuation?',
    variations: [
      'Home valuation?',
      'Property value?',
      'How much can I sell for?',
      'Market value of my house?',
    ],
  },
  {
    id: 're-faq-002',
    category: 'faq',
    industry: 'realestate' as IndustrySlug,
    language: 'en',
    question: 'How long will it take to sell?',
    answer: 'Average days on market in your area is currently 45 days, but this varies by price point and condition. Well-priced homes in good condition typically sell within 30 days. I can provide a more specific timeline after seeing your property.',
    variations: [
      'Selling timeline?',
      'How quickly can you sell?',
      'Days on market?',
      'When will my house sell?',
    ],
  },
  {
    id: 're-faq-003',
    category: 'faq',
    industry: 'realestate' as IndustrySlug,
    language: 'en',
    question: 'What are your commission rates?',
    answer: 'Our commission is competitive and covers full marketing, professional photography, listing syndication, showings coordination, negotiation, and transaction management. Let\'s discuss your specific needs and I can provide a detailed breakdown of services and value.',
    variations: [
      'Agent fees?',
      'How much do you charge?',
      'Commission structure?',
      'What does it cost to list?',
    ],
  },
  
  // Product (Property) Scenarios
  {
    id: 're-product-001',
    category: 'product',
    industry: 'realestate' as IndustrySlug,
    language: 'en',
    question: 'Tell me about this property',
    answer: 'This [TYPE] features [BEDROOMS] bedrooms, [BATHROOMS] bathrooms, and [SQFT] square feet. Key highlights include [FEATURES]. It has been on the market for [DOM] days. Would you like to schedule a showing or receive the full property disclosure?',
    variations: [
      'Property details?',
      'More info on this listing',
      'What does this house have?',
      'Listing information?',
    ],
  },
  {
    id: 're-product-002',
    category: 'product',
    industry: 'realestate' as IndustrySlug,
    language: 'en',
    question: 'Are there any offers on this property?',
    answer: 'I can check the current offer status for you. In this market, properties are receiving multiple offers within days. I recommend we move quickly if you are interested. Would you like me to prepare a competitive offer strategy?',
    variations: [
      'Any bids yet?',
      'Offer status?',
      'Multiple offers?',
      'Still available?',
    ],
  },
  
  // Order (Transaction) Scenarios
  {
    id: 're-order-001',
    category: 'order',
    industry: 'realestate' as IndustrySlug,
    language: 'en',
    question: 'How do I make an offer?',
    answer: 'I will prepare a comprehensive offer package including price, terms, contingencies, and timeline. We will need your pre-approval letter and earnest money deposit. I recommend we submit within 24 hours. Let\'s discuss your offer strategy.',
    variations: [
      'Making an offer',
      'Offer process',
      'How to bid',
      'Submitting offer',
    ],
  },
  {
    id: 're-order-002',
    category: 'order',
    industry: 'realestate' as IndustrySlug,
    language: 'en',
    question: 'What happens after inspection?',
    answer: 'After inspection, we will review the report and decide on repair requests. You can ask for repairs, credits, or walk away if major issues are found. We have [X] days to complete this negotiation per your contract.',
    variations: [
      'Inspection results',
      'Repair negotiations',
      'After home inspection',
      'Inspection contingency',
    ],
  },
  
  // Support Scenarios
  {
    id: 're-support-001',
    category: 'support',
    industry: 'realestate' as IndustrySlug,
    language: 'en',
    question: 'The appraisal came in low',
    answer: 'A low appraisal is challenging but not uncommon. We have options: negotiate price reduction, challenge the appraisal with comparable sales, or you can bring additional cash to closing. Let me review the appraisal and comparable sales to advise on the best approach.',
    variations: [
      'Appraisal issue',
      'Value too low',
      'Appraisal gap',
      'Low valuation',
    ],
  },
  
  // Sales Scenarios
  {
    id: 're-sales-001',
    category: 'sales',
    industry: 'realestate' as IndustrySlug,
    language: 'en',
    question: 'What areas do you recommend?',
    answer: 'Based on your criteria (budget, commute, schools), I recommend [AREA 1] for its [BENEFITS] and [AREA 2] for its [BENEFITS]. Both have strong appreciation potential and good rental demand. Would you like me to set up property alerts for these areas?',
    variations: [
      'Best neighborhoods?',
      'Where should I look?',
      'Area recommendations?',
      'Good investment areas?',
    ],
  },
];

// Multi-language scenarios
export const realEstateScenariosYO: TrainingScenario[] = [
  {
    id: 're-yo-001',
    category: 'faq',
    industry: 'realestate' as IndustrySlug,
    language: 'yo',
    question: 'Ìyì ilé mi wo ni?',
    answer: 'Mo lè ṣe àtúnyẹ̀wò Ọjà Ìfiwéra (CMA) fún ohun-ini rẹ. Èyí yóò fi àwọn títà àìpẹ́ tí irú ilé náà wá hàn nínú agbègbè rẹ.',
    variations: [],
  },
];

export const realEstateScenariosHA: TrainingScenario[] = [
  {
    id: 're-ha-001',
    category: 'faq',
    industry: 'realestate' as IndustrySlug,
    language: 'ha',
    question: 'Nawa ne gidana na ya kai?',
    answer: 'Zan iya shirya CMA kyauta don dukiyarku. Wannan zai nuna sayayyen kwanan nan na gidaje masu kama da juna a yankinku.',
    variations: [],
  },
];

export const realEstateScenariosIG: TrainingScenario[] = [
  {
    id: 're-ig-001',
    category: 'faq',
    industry: 'realestate' as IndustrySlug,
    language: 'ig',
    question: 'Gịnị bụ ụlọ m?',
    answer: 'M nwere ike imepụta CMA nke naefu maka ihe onwunwe gị. Nke a gaegosi ụdị ụlọ naere emere nso nime mpaghara gị.',
    variations: [],
  },
];

export const realEstateScenariosPCM: TrainingScenario[] = [
  {
    id: 're-pcm-001',
    category: 'faq',
    industry: 'realestate' as IndustrySlug,
    language: 'pcm',
    question: 'How much my house worth?',
    answer: 'I fit prepare free Comparative Market Analysis for your property. E go show recent sales of similar homes for your area.',
    variations: [],
  },
];

export const getRealEstateScenarios = (language?: string): TrainingScenario[] => {
  const allScenarios = [
    ...realEstateScenarios,
    ...realEstateScenariosYO,
    ...realEstateScenariosHA,
    ...realEstateScenariosIG,
    ...realEstateScenariosPCM,
  ];
  
  if (language) {
    return allScenarios.filter(s => s.language === language);
  }
  return allScenarios;
};

export default {
  context: realEstateContext,
  scenarios: realEstateScenarios,
  getScenarios: getRealEstateScenarios,
};
