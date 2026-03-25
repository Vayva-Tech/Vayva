/**
 * Social Sharing Add-On - Share products and content
 * 
 * Features:
 * - Share buttons for products and posts
 * - WhatsApp, Twitter, Facebook sharing
 * - Copy link functionality
 * - Share analytics
 */

import type { AddOnDefinition } from '../types';

export const SOCIAL_SHARING_ADDON: AddOnDefinition = {
  id: 'vayva.social-share',
  name: 'Social Sharing',
  description: 'Let visitors share your products and content on social media. Includes WhatsApp, Twitter, Facebook, and more.',
  tagline: 'Amplify your reach with social sharing',
  version: '1.0.0',
  category: 'marketing',
  
  author: {
    name: 'Vayva',
    isOfficial: true,
    isVerified: true,
  },
  
  icon: 'ShareNetwork',
  tags: ['social', 'sharing', 'viral', 'marketing', 'social-media'],
  
  compatibleTemplates: ['*'],
  conflictsWith: [],
  requires: [],
  
  previewImages: {
    thumbnail: '/addons/social-share/thumbnail.png',
    screenshots: ['/addons/social-share/screenshot-1.png'],
  },
  
  installationType: 'automatic',
  canUninstall: true,
  installTimeEstimate: 1,
  
  versionHistory: [
    {
      version: '1.0.0',
      date: new Date().toISOString(),
      changes: ['Initial release'],
    },
  ],
  
  provides: {
    components: [
      {
        mountPoint: 'product-detail',
        componentName: 'ShareButtons',
        priority: 80,
        conditions: {
          pageTypes: ['product'],
          authState: 'any',
        },
      },
      {
        mountPoint: 'post-content',
        componentName: 'ShareBar',
        priority: 25,
        conditions: {
          pageTypes: ['post'],
          authState: 'any',
        },
      },
      {
        mountPoint: 'product-card',
        componentName: 'QuickShare',
        priority: 35,
        conditions: {
          pageTypes: ['home', 'category'],
          authState: 'any',
        },
      },
    ],
    apiRoutes: [
      {
        path: '/api/addons/social-share/track',
        methods: ['POST'],
        description: 'Track share events',
      },
    ],
    databaseModels: ['ShareAnalytics'],
  },
  
  configSchema: {
    fields: [
      {
        key: 'platforms',
        label: 'Enabled Platforms',
        type: 'multiselect',
        description: 'Which social platforms to show',
        options: [
          { label: 'WhatsApp', value: 'whatsapp' },
          { label: 'Twitter/X', value: 'twitter' },
          { label: 'Facebook', value: 'facebook' },
          { label: 'Telegram', value: 'telegram' },
          { label: 'LinkedIn', value: 'linkedin' },
          { label: 'Copy Link', value: 'copy' },
        ],
        required: false,
      },
      {
        key: 'buttonStyle',
        label: 'Button Style',
        type: 'select',
        options: [
          { label: 'Icons Only', value: 'icons' },
          { label: 'Icons with Text', value: 'icons-text' },
          { label: 'Buttons', value: 'buttons' },
          { label: 'Floating Bar', value: 'floating' },
        ],
        defaultValue: 'icons',
        required: false,
      },
      {
        key: 'position',
        label: 'Position',
        type: 'select',
        options: [
          { label: 'Below Content', value: 'below' },
          { label: 'Above Content', value: 'above' },
          { label: 'Side (Sticky)', value: 'side' },
          { label: 'Floating', value: 'floating' },
        ],
        defaultValue: 'below',
        required: false,
      },
      {
        key: 'showShareCount',
        label: 'Show Share Count',
        type: 'boolean',
        description: 'Display number of shares',
        defaultValue: false,
        required: false,
      },
      {
        key: 'customMessage',
        label: 'Custom Share Message',
        type: 'string',
        description: 'Default text when sharing (user can edit)',
        defaultValue: 'Check this out!',
        required: false,
      },
      {
        key: 'includeImage',
        label: 'Include Product Image',
        type: 'boolean',
        description: 'Include product image in share',
        defaultValue: true,
        required: false,
      },
    ],
  },
  
  defaultConfig: {
    platforms: ['whatsapp', 'twitter', 'facebook', 'copy'],
    buttonStyle: 'icons',
    position: 'below',
    showShareCount: false,
    customMessage: 'Check this out!',
    includeImage: true,
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
    'WhatsApp, Twitter, Facebook, more',
    'Custom share messages',
    'Multiple button styles',
    'Share analytics',
    'Mobile-optimized',
  ],
  
  docs: {
    setup: 'Share buttons automatically appear on product and blog post pages. Choose which platforms to enable in settings.',
  },
};

export default SOCIAL_SHARING_ADDON;
