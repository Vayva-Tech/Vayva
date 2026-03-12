/**
 * Fashion Industry Training Data
 * Industry-specific scenarios and responses for fashion e-commerce
 */

import type { IndustryContext, TrainingScenario, IndustrySlug } from '../types';

export const fashionContext: IndustryContext = {
  industry: 'fashion',
  terminology: {
    'collection': 'A curated group of garments released together',
    'lookbook': 'Visual catalog showing styled outfits',
    'drop': 'Limited release of new items',
    'size_curve': 'Distribution of sizes in inventory',
    'sell_through_rate': 'Percentage of inventory sold in a period',
    'markdown': 'Discounted pricing on seasonal items',
    'wholesale': 'B2B sales at bulk pricing',
    'consignment': 'Inventory owned by designer until sold',
    'fast_fashion': 'Rapidly produced, trend-driven clothing',
    'capsule_wardrobe': 'Minimal, versatile collection of clothing',
  },
  workflows: [
    'Browse collection -> View product details -> Check size availability -> Add to cart -> Checkout',
    'Style consultation -> Outfit recommendation -> Size guidance -> Purchase -> Delivery tracking',
    'Wholesale inquiry -> Catalog review -> Pricing negotiation -> Order placement -> Production timeline',
    'Return request -> Condition verification -> Refund processing -> Inventory update',
  ],
  kpis: [
    'Sell-through rate',
    'Average order value',
    'Return rate',
    'Size stockout rate',
    'Collection conversion rate',
    'Wholesale order value',
  ],
  commonIssues: [
    'Size availability and fit concerns',
    'Color accuracy in photos vs reality',
    'Return policy for worn items',
    'Stockouts of popular sizes',
    'Delayed drops and restocks',
    'Wholesale minimum order requirements',
  ],
};

export const fashionScenarios: TrainingScenario[] = [
  // FAQ Scenarios
  {
    id: 'fashion-faq-001',
    category: 'faq',
    industry: 'fashion' as IndustrySlug,
    language: 'en',
    question: 'What size should I order?',
    answer: 'I recommend checking our size guide for each product. Our items run true to size, but if you are between sizes, I suggest sizing up for a relaxed fit or down for a more fitted look. Would you like me to help you find the measurements for a specific item?',
    variations: [
      'Do these run small or large?',
      'What is the sizing like?',
      'Should I size up or down?',
      'Are these true to size?',
    ],
  },
  {
    id: 'fashion-faq-002',
    category: 'faq',
    industry: 'fashion' as IndustrySlug,
    language: 'en',
    question: 'When is the next drop?',
    answer: 'Our next collection drops on [DATE] at [TIME]. Sign up for our newsletter to get early access and exclusive previews. Would you like me to notify you when it goes live?',
    variations: [
      'When are you releasing new items?',
      'Any new collections coming?',
      'When is the restock?',
      'New drop date?',
    ],
  },
  {
    id: 'fashion-faq-003',
    category: 'faq',
    industry: 'fashion' as IndustrySlug,
    language: 'en',
    question: 'Do you offer wholesale?',
    answer: 'Yes, we offer wholesale for qualified retailers. Our minimum order is ₦500,000 with NET 30 payment terms. I can connect you with our wholesale team to discuss pricing and catalog access.',
    variations: [
      'Can I buy in bulk?',
      'Wholesale pricing available?',
      'B2B orders?',
      'Do you sell to boutiques?',
    ],
  },
  
  // Product Scenarios
  {
    id: 'fashion-product-001',
    category: 'product',
    industry: 'fashion' as IndustrySlug,
    language: 'en',
    question: 'What fabric is this dress made of?',
    answer: 'This dress is made from 100% organic cotton with a satin finish. It is breathable, machine washable, and gets softer with each wear. The fabric has a slight stretch for comfort.',
    variations: [
      'Material composition?',
      'What is this made of?',
      'Fabric details?',
      'Is this cotton or polyester?',
    ],
  },
  {
    id: 'fashion-product-002',
    category: 'product',
    industry: 'fashion' as IndustrySlug,
    language: 'en',
    question: 'Will you restock the sold out sizes?',
    answer: 'Yes, we are restocking sizes M and L in the black colorway next week. The navy and olive colors are being discontinued. Would you like me to notify you when your size is back?',
    variations: [
      'Any restock coming?',
      'When will size L be back?',
      'Sold out items restocking?',
      'Back in stock soon?',
    ],
  },
  
  // Order Scenarios
  {
    id: 'fashion-order-001',
    category: 'order',
    industry: 'fashion' as IndustrySlug,
    language: 'en',
    question: 'Can I modify my order?',
    answer: 'I can help modify your order if it has not shipped yet. What would you like to change - the size, color, or shipping address?',
    variations: [
      'Change my order',
      'Can I add items to my order?',
      'Update shipping address',
      'Change size on order',
    ],
  },
  {
    id: 'fashion-order-002',
    category: 'order',
    industry: 'fashion' as IndustrySlug,
    language: 'en',
    question: 'What is your return policy?',
    answer: 'We accept returns within 14 days of delivery for unworn items with tags attached. Sale items are final sale. For wholesale orders, returns are accepted within 30 days. I can help initiate a return if needed.',
    variations: [
      'Can I return this?',
      'Return window?',
      'How do I return?',
      'Exchange policy?',
    ],
  },
  
  // Support Scenarios
  {
    id: 'fashion-support-001',
    category: 'support',
    industry: 'fashion' as IndustrySlug,
    language: 'en',
    question: 'My order arrived damaged',
    answer: 'I am sorry to hear that! Please send photos of the damage to support@[store].com and we will send a replacement immediately. No need to return the damaged item.',
    variations: [
      'Item came torn',
      'Damaged in shipping',
      'Quality issue with my order',
      'Defective item received',
    ],
  },
  
  // Sales Scenarios
  {
    id: 'fashion-sales-001',
    category: 'sales',
    industry: 'fashion' as IndustrySlug,
    language: 'en',
    question: 'What would look good with these pants?',
    answer: 'Those wide-leg trousers would pair beautifully with our cropped blazer in cream or the silk blouse in sage. For shoes, the block heel sandals would complete the look. Would you like me to create a complete outfit for you?',
    variations: [
      'Style recommendations?',
      'What matches this?',
      'Outfit ideas?',
      'How should I wear this?',
    ],
  },
];

// Yoruba fashion scenarios
export const fashionScenariosYO: TrainingScenario[] = [
  {
    id: 'fashion-yo-001',
    category: 'faq',
    industry: 'fashion' as IndustrySlug,
    language: 'yo',
    question: 'Ìwọ̀n wo ni mo yẹ kí n tọ́ka?',
    answer: 'Mo ṣàpẹẹlẹ pé ẹ wo àlàyé ìwọ̀n wa fún ọ̀kọ̀ọ̀kan ọjà. Àwọn nǹkan wa tọ́ka ìwọ̀n tó yẹ, ṣùgbọ́n tí ẹ bá wà láàrin ìwọ̀n méjì, mo ṣàpẹẹlẹ pé ẹ tẹ̀ sí i tó tóbi fún ìfaradà tàbí kéré fún ìfaradà tó yẹ gidigidi.',
    variations: ['Ìwọ̀n wọ̀nyí kéré tàbí tóbi?'],
  },
];

// Hausa fashion scenarios
export const fashionScenariosHA: TrainingScenario[] = [
  {
    id: 'fashion-ha-001',
    category: 'faq',
    industry: 'fashion' as IndustrySlug,
    language: 'ha',
    question: 'Wanne girma ya dace in yi oda?',
    answer: 'Na ba da shawarar duba jagorar girman mu don kowane samfur. Abubuwanmu suna gudana da gaskiya ga girma, amma idan kuna tsakanin girma, na ba da shawarar girman sama don jin dadi ko ƙasa don dube-dube mai dace.',
    variations: ['Wadannan suna karami ko manya?'],
  },
];

// Igbo fashion scenarios
export const fashionScenariosIG: TrainingScenario[] = [
  {
    id: 'fashion-ig-001',
    category: 'faq',
    industry: 'fashion' as IndustrySlug,
    language: 'ig',
    question: 'Kedu nha kwesịghị m ịtụ iwu?',
    answer: 'A na-atụ aro m ịlele ntuziaka nha anyị maka ihe ọ bụla. Ihe ndị anyị na-agba nha kwesịrị ekwesị, ma ọ bụrụ na ị nọ n etiti nha abụọ, a tụrụ aro ka ị bulie elu maka nhazi dị mma ma ọ bụ ala maka nhazi dị mma.',
    variations: ['Ndị a kere ma ọ bụ ukwu?'],
  },
];

// Pidgin fashion scenarios
export const fashionScenariosPCM: TrainingScenario[] = [
  {
    id: 'fashion-pcm-001',
    category: 'faq',
    industry: 'fashion' as IndustrySlug,
    language: 'pcm',
    question: 'Which size I go order?',
    answer: 'I suggest make you check our size guide for each product. Our items dey run true to size, but if you dey between sizes, I suggest make you size up for relaxed fit or down for more fitted look.',
    variations: ['These ones dey small or big?'],
  },
];

export const getFashionScenarios = (language?: string): TrainingScenario[] => {
  const allScenarios = [
    ...fashionScenarios,
    ...fashionScenariosYO,
    ...fashionScenariosHA,
    ...fashionScenariosIG,
    ...fashionScenariosPCM,
  ];
  
  if (language) {
    return allScenarios.filter(s => s.language === language);
  }
  return allScenarios;
};

export default {
  context: fashionContext,
  scenarios: fashionScenarios,
  getScenarios: getFashionScenarios,
};
