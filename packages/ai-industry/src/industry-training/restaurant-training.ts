/**
 * Restaurant Industry Training Data
 * Industry-specific scenarios and responses for restaurant/food service
 */

import type { IndustryContext, TrainingScenario, IndustrySlug } from '../types';

export const restaurantContext: IndustryContext = {
  industry: 'restaurant',
  terminology: {
    '86': 'Item is sold out/unavailable',
    'fire': 'Start cooking an order',
    'all_day': 'Total count of items needed',
    'mise_en_place': 'Preparation of ingredients before service',
    'cover': 'One customer served',
    'turn': 'Complete service of a table',
    'comp': 'Complimentary/free item',
    'void': 'Cancel/remove an item from order',
    'course': 'Group of dishes served together',
    'check': 'Bill/request for payment',
    'reservation': 'Pre-booked table',
    'walk_in': 'Customer without reservation',
    'prep_time': 'Time to prepare a dish',
    'food_cost': 'Cost of ingredients as percentage of price',
  },
  workflows: [
    'Reservation -> Seating -> Order -> Kitchen -> Service -> Payment',
    'Walk-in -> Waitlist -> Seating -> Order -> Kitchen -> Service -> Payment',
    'Online order -> Kitchen confirmation -> Prep -> Packaging -> Delivery pickup',
    'Table turn -> Reset -> Next seating',
  ],
  kpis: [
    'Table turn time',
    'Average prep time',
    'Food cost percentage',
    'Orders per hour',
    'Customer satisfaction',
    'Reservation no-show rate',
  ],
  commonIssues: [
    'Long wait times during peak hours',
    '86 items running out',
    'Kitchen backup during rush',
    'Reservation overbooking',
    'Special dietary requests',
    'Delivery delays',
  ],
};

export const restaurantScenarios: TrainingScenario[] = [
  // FAQ Scenarios
  {
    id: 'rest-faq-001',
    category: 'faq',
    industry: 'restaurant' as IndustrySlug,
    language: 'en',
    question: 'Do you take reservations?',
    answer: 'Yes, we accept reservations up to 30 days in advance. You can book through our website, app, or by calling us. We hold tables for 15 minutes past the reservation time. For parties of 8+, please call directly.',
    variations: [
      'Can I book a table?',
      'How do I make a reservation?',
      'Do I need to reserve?',
      'Table booking available?',
    ],
  },
  {
    id: 'rest-faq-002',
    category: 'faq',
    industry: 'restaurant' as IndustrySlug,
    language: 'en',
    question: 'What are your hours?',
    answer: 'We are open Monday-Thursday 11AM-10PM, Friday-Saturday 11AM-11PM, and Sunday 10AM-9PM. Our kitchen closes 30 minutes before closing time. Happy hour is 4-7PM weekdays.',
    variations: [
      'When do you open?',
      'What time do you close?',
      'Opening hours?',
      'Are you open today?',
    ],
  },
  {
    id: 'rest-faq-003',
    category: 'faq',
    industry: 'restaurant' as IndustrySlug,
    language: 'en',
    question: 'Do you have vegetarian options?',
    answer: 'Yes, we have a full vegetarian menu with 15+ options, including vegan and gluten-free choices. Our kitchen can also modify most dishes to accommodate dietary restrictions. Please let your server know about any allergies.',
    variations: [
      'Vegan options?',
      'Gluten free menu?',
      'Allergen information?',
      'Dietary restrictions?',
    ],
  },
  
  // Order Scenarios
  {
    id: 'rest-order-001',
    category: 'order',
    industry: 'restaurant' as IndustrySlug,
    language: 'en',
    question: 'How long will my order take?',
    answer: 'Current wait time is about 25-30 minutes for dine-in and 35-40 minutes for delivery. I will fire your order now and it should be ready by [TIME]. Would you like me to text you when it is ready?',
    variations: [
      'When will my food be ready?',
      'Prep time?',
      'How long is the wait?',
      'Order status?',
    ],
  },
  {
    id: 'rest-order-002',
    category: 'order',
    industry: 'restaurant' as IndustrySlug,
    language: 'en',
    question: 'Can I modify my order?',
    answer: 'I can modify your order if the kitchen has not started preparing it yet. What would you like to change? For allergies or dietary restrictions, we take those very seriously and will ensure your meal is prepared safely.',
    variations: [
      'Change my order',
      'Add something to my order',
      'Remove item from order',
      'Special instructions?',
    ],
  },
  
  // Product (Menu) Scenarios
  {
    id: 'rest-product-001',
    category: 'product',
    industry: 'restaurant' as IndustrySlug,
    language: 'en',
    question: 'What do you recommend?',
    answer: 'Our chef recommends the grilled salmon with lemon herb sauce - it is our most popular dish. For something lighter, the Mediterranean salad is excellent. Would you like me to suggest wine pairings as well?',
    variations: [
      'What is good here?',
      'Popular dishes?',
      'Chef recommendation?',
      'What should I order?',
    ],
  },
  {
    id: 'rest-product-002',
    category: 'product',
    industry: 'restaurant' as IndustrySlug,
    language: 'en',
    question: 'Is the [dish] spicy?',
    answer: 'The [dish] has a mild spice level, rated 2/5. I can ask the kitchen to make it milder or spicier based on your preference. Our menu indicates spice levels with chili icons.',
    variations: [
      'How spicy is this?',
      'Can you make it less spicy?',
      'Spice level?',
      'Is this hot?',
    ],
  },
  
  // Support Scenarios
  {
    id: 'rest-support-001',
    category: 'support',
    industry: 'restaurant' as IndustrySlug,
    language: 'en',
    question: 'My order is wrong',
    answer: 'I apologize for the error! I will have the kitchen remake that immediately. Please keep the incorrect dish - our mistake. Your correct order will be ready in 10 minutes.',
    variations: [
      'This is not what I ordered',
      'Wrong item received',
      'Order mistake',
      'Missing items from order',
    ],
  },
  {
    id: 'rest-support-002',
    category: 'support',
    industry: 'restaurant' as IndustrySlug,
    language: 'en',
    question: 'The food is cold',
    answer: 'I am so sorry to hear that. Let me have the kitchen remake that fresh for you right away. Would you like us to comp a dessert for the inconvenience?',
    variations: [
      'Food not hot',
      'Temperature issue',
      'Cold meal',
    ],
  },
  
  // Sales Scenarios
  {
    id: 'rest-sales-001',
    category: 'sales',
    industry: 'restaurant' as IndustrySlug,
    language: 'en',
    question: 'Do you do catering?',
    answer: 'Yes, we offer full-service catering for events of 20-200 guests. Our catering menu includes customizable packages starting at ₦5,000 per person. I can connect you with our catering manager to discuss your event details.',
    variations: [
      'Catering services?',
      'Private events?',
      'Large group orders?',
      'Event catering?',
    ],
  },
];

// Multi-language scenarios
export const restaurantScenariosYO: TrainingScenario[] = [
  {
    id: 'rest-yo-001',
    category: 'faq',
    industry: 'restaurant' as IndustrySlug,
    language: 'yo',
    question: 'Ṣé ẹ gba àkọsílẹ̀ ibi?',
    answer: 'Bẹ́ẹ̀ni, a gba àwọn àkọsílẹ̀ tó tó ọjọ́ 30 ṣáájú. O lè bóòkù nípasẹ̀ ààyè ayélujára wa, àwọn ètò, tàbí nípasẹ̀ ìpè wa.',
    variations: [],
  },
];

export const restaurantScenariosHA: TrainingScenario[] = [
  {
    id: 'rest-ha-001',
    category: 'faq',
    industry: 'restaurant' as IndustrySlug,
    language: 'ha',
    question: 'Kuna karɓar ajiye wurin?',
    answer: 'Eh, muna karɓar ajiye har zuwa kwanaki 30 gaba. Zaku iya yin lissafi ta yanar gizo, app, ko ta kiran mu.',
    variations: [],
  },
];

export const restaurantScenariosIG: TrainingScenario[] = [
  {
    id: 'rest-ig-001',
    category: 'faq',
    industry: 'restaurant' as IndustrySlug,
    language: 'ig',
    question: 'Ị na-anabata nọmba?',
    answer: 'Ee, anyị na-anabata nọmba ruo ụbọchị 30 nke ọma. Ị nwere ike ịbụkwa site na weebụsaịtị anyị, ngwa, ma ọ bụ site na ịkpọkwa anyị.',
    variations: [],
  },
];

export const restaurantScenariosPCM: TrainingScenario[] = [
  {
    id: 'rest-pcm-001',
    category: 'faq',
    industry: 'restaurant' as IndustrySlug,
    language: 'pcm',
    question: 'Una dey take reservation?',
    answer: 'Yes, we dey accept reservation reach 30 days before. You fit book through our website, app, or call us.',
    variations: [],
  },
];

export const getRestaurantScenarios = (language?: string): TrainingScenario[] => {
  const allScenarios = [
    ...restaurantScenarios,
    ...restaurantScenariosYO,
    ...restaurantScenariosHA,
    ...restaurantScenariosIG,
    ...restaurantScenariosPCM,
  ];
  
  if (language) {
    return allScenarios.filter(s => s.language === language);
  }
  return allScenarios;
};

export default {
  context: restaurantContext,
  scenarios: restaurantScenarios,
  getScenarios: getRestaurantScenarios,
};
