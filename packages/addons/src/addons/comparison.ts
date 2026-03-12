/**
 * Product Comparison Add-On - Compare products side-by-side
 * 
 * Features:
 * - Compare up to 4 products
 * - Highlight differences
 * - Add from product cards
 * - Mobile-friendly comparison view
 */

import { AddOnDefinition } from '../../types';

export const COMPARISON_ADDON: AddOnDefinition = {
  id: 'vayva.comparison',
  name: 'Product Comparison',
  description: 'Let customers compare products side-by-side with feature highlights and differences.',
  tagline: 'Help customers decide with side-by-side comparison',
  version: '1.0.0',
  category: 'ecommerce',
  
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  
  icon: 'ArrowsHorizontal',
  tags: ['comparison', 'products', 'shopping', 'decision'],
  
  compatibleTemplates: ['*'],
  conflictsWith: [],
  requires: [],
  
  previewImages: {
    thumbnail: '/addons/comparison/thumbnail.png',
    screenshots: ['/addons/comparison/screenshot-1.png'],
  },
  
  installationType: 'automatic',
  canUninstall: true,
  installTimeEstimate: 2,
  
  versionHistory: [
    {
      version: '1.0.0',
      date: new Date().toISOString(),
      changes: ['Initial release'],
    },
  ],
  
  provides: {
    pages: [
      {
        route: '/compare',
        title: 'Compare Products',
        description: 'Product comparison page',
        layout: 'full-width',
      },
    ],
    components: [
      {
        mountPoint: 'product-card',
        componentName: 'CompareButton',
        priority: 40,
        conditions: {
          pageTypes: ['home', 'category', 'product'],
          authState: 'any',
        },
      },
      {
        mountPoint: 'product-detail',
        componentName: 'AddToCompare',
        priority: 60,
        conditions: {
          pageTypes: ['product'],
          authState: 'any',
        },
      },
      {
        mountPoint: 'floating-button',
        componentName: 'ComparisonWidget',
        priority: 30,
        conditions: {
          pageTypes: ['home', 'category', 'product'],
          authState: 'any',
        },
      },
    ],
    apiRoutes: [
      {
        path: '/api/addons/comparison/products',
        methods: ['GET'],
        description: 'Get products for comparison',
      },
    ],
  },
  
  configSchema: {
    fields: [
      {
        key: 'maxProducts',
        label: 'Maximum Products',
        type: 'number',
        description: 'Maximum products to compare at once',
        defaultValue: 4,
        required: false,
        validation: { min: 2, max: 6 },
      },
      {
        key: 'showDifferences',
        label: 'Highlight Differences',
        type: 'boolean',
        description: 'Highlight different values between products',
        defaultValue: true,
        required: false,
      },
      {
        key: 'autoSuggest',
        label: 'Auto-Suggest Similar',
        type: 'boolean',
        description: 'Suggest similar products to compare',
        defaultValue: true,
        required: false,
      },
      {
        key: 'compareFields',
        label: 'Fields to Compare',
        type: 'multiselect',
        description: 'Which product fields to show in comparison',
        options: [
          { label: 'Price', value: 'price' },
          { label: 'Rating', value: 'rating' },
          { label: 'Description', value: 'description' },
          { label: 'Specifications', value: 'specifications' },
          { label: 'Availability', value: 'availability' },
          { label: 'Images', value: 'images' },
        ],
        required: false,
      },
    ],
  },
  
  defaultConfig: {
    maxProducts: 4,
    showDifferences: true,
    autoSuggest: true,
    compareFields: ['price', 'rating', 'description', 'specifications'],
  },
  
  configRequired: false,
  
  pricing: {
    type: 'free',
  },
  
  stats: {
    installCount: 0,
    rating: 0,
    reviewCount: 0,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  
  highlights: [
    'Compare up to 6 products',
    'Highlight differences',
    'Mobile-friendly view',
    'Auto-suggest similar items',
    'Custom field selection',
  ],
  
  docs: {
    setup: 'Comparison buttons automatically appear on product cards and detail pages.',
  },
};

export default COMPARISON_ADDON;
