/**
 * Mortgage Calculator Add-On
 * 
 * Property mortgage and affordability calculator
 */

import { AddOnDefinition } from '../../types';

export const MORTGAGE_CALCULATOR_ADDON: AddOnDefinition = {
  id: 'vayva.mortgage-calculator',
  name: 'Mortgage Calculator',
  description: 'Interactive mortgage calculator with monthly payments, amortization schedule, and affordability analysis',
  tagline: 'Calculate your dream home payments',
  version: '1.0.0',
  category: 'storefront',
  price: 0,
  isFree: true,
  developer: 'Vayva',
  icon: 'Calculator',
  tags: ['real-estate', 'mortgage', 'calculator', 'finance', 'property'],
  compatibleTemplates: ['realestate', 'property', 'rentals'],
  mountPoints: ['hero-section', 'product-detail', 'page-sidebar'],
  previewImages: {
    thumbnail: '/addons/mortgage-calculator/thumbnail.png',
    screenshots: ['/addons/mortgage-calculator/screenshot-1.png'],
  },
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  pricing: {
    type: 'free',
  },
  stats: {
    installCount: 890,
    rating: 4.7,
    reviewCount: 45,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  provides: {
    pages: [
      { route: '/mortgage-calculator', title: 'Mortgage Calculator' },
    ],
    components: [
      { mountPoint: 'hero-section', componentName: 'MortgageCalculatorHero' },
      { mountPoint: 'product-detail', componentName: 'PropertyMortgageCalc' },
      { mountPoint: 'page-sidebar', componentName: 'AffordabilityWidget' },
    ],
    apiRoutes: [
      { path: '/api/mortgage/calculate', methods: ['POST'] },
      { path: '/api/mortgage/rates', methods: ['GET'] },
    ],
    databaseModels: ['MortgageCalculation'],
  },
  highlights: [
    'Payment breakdown',
    'Amortization schedule',
    'Rate comparisons',
    'Affordability check',
    'Nigerian banks rates',
  ],
  installTimeEstimate: 3,
};

export const MORTGAGE_CALCULATOR_MODELS = `
model MortgageCalculation {
  id          String   @id @default(cuid())
  storeId     String
  customerId  String?
  sessionId   String?
  propertyId  String?
  propertyPrice Decimal @db.Decimal(12, 2)
  downPayment Decimal @db.Decimal(12, 2)
  loanAmount  Decimal @db.Decimal(12, 2)
  interestRate Decimal @db.Decimal(5, 2)
  loanTerm    Int      // years
  monthlyPayment Decimal @db.Decimal(10, 2)
  totalInterest Decimal @db.Decimal(12, 2)
  totalCost   Decimal @db.Decimal(12, 2)
  bankName    String?
  createdAt   DateTime @default(now())
  
  @@index([storeId, customerId])
  @@index([createdAt])
}
`;

export default MORTGAGE_CALCULATOR_ADDON;
