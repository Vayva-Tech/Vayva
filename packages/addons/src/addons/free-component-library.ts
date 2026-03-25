/**
 * Free Component Library Add-On
 * 
 * A comprehensive collection of free interactive components and animations
 * from Framer University and other third-party sources.
 * 
 * All components are FREE for all merchants - no gating, no restrictions.
 * Designed to enhance any website with beautiful interactions.
 */

import type { AddOnDefinition } from '../types';

export const FREE_COMPONENT_LIBRARY_ADDON: AddOnDefinition = {
  id: 'vayva.free-component-library',
  name: 'Free Component Library',
  tagline: 'Beautiful interactive components for your website',
  description: `Enhance your website with a curated collection of free interactive components and animations. No coding required - just install and customize.

**What's Included:**

🎨 **Hover Effects Pack**
- Magnetic tooltips that follow your cursor
- Mask reveal effects on image hover
- Rotation button animations
- Scramble glitch text effects
- X-ray image inspection

✨ **Form Enhancements**
- Soulful form submit states with animations
- Click-to-copy email components
- Animated input focus states
- Success/error message transitions

🧭 **Navigation Components**
- Gooey dropdown menus with fluid animations
- Icon morphing transitions
- Unusual navigation selectors
- Border morph tab switchers

📜 **Scroll Animations**
- Unmask sections as users scroll
- Image sequence scroll animations
- Kinetic grid layouts
- Pixel image load effects

🎯 **Interactive Elements**
- 3D sticker drag components
- Wood toggle switches
- Image scratch-off reveals
- Scribble pad components

All components are fully responsive, accessible, and customizable via CSS.`,
  version: '1.0.0',
  category: 'content',
  icon: 'Sparkles',
  tags: ['free', 'components', 'animations', 'effects', 'framer', 'interactions', 'ui'],
  compatibleTemplates: ['*'], // Works with all templates
  author: {
    name: 'Vayva + Framer University',
    isOfficial: true,
    isVerified: true,
    url: 'https://framer.university',
  },
  pricing: {
    type: 'free',
  },
  isFree: true,
  price: 0,
  developer: 'Vayva',
  installationType: 'automatic',
  isDefault: false,
  canUninstall: true,
  installTimeEstimate: 2,
  stats: {
    installCount: 0,
    rating: 5.0,
    reviewCount: 0,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  highlights: [
    '25+ free interactive components',
    'Zero configuration required',
    'Works with any template',
    'Fully customizable',
    'Mobile responsive',
    'Accessibility friendly',
    'No coding needed',
    'One-click install',
  ],
  provides: {
    components: [
      // Hover Effects - product-card mount point
      { mountPoint: 'product-card', componentName: 'MagneticTooltip', priority: 10 },
      { mountPoint: 'product-card', componentName: 'MaskRevealHover', priority: 20 },
      { mountPoint: 'product-card', componentName: 'XRayHover', priority: 30 },
      
      // Hover Effects - product-detail mount point
      { mountPoint: 'product-detail', componentName: 'MagneticTooltip', priority: 10 },
      { mountPoint: 'product-detail', componentName: 'ImageScratch', priority: 20 },
      
      // Buttons - hero-section mount point
      { mountPoint: 'hero-section', componentName: 'RotationButton', priority: 10 },
      { mountPoint: 'hero-section', componentName: 'ScrambleGlitchText', priority: 20 },
      { mountPoint: 'hero-section', componentName: 'Sticker3D', priority: 30 },
      
      // Navigation - header-nav mount point
      { mountPoint: 'header-nav', componentName: 'GooeyDropdown', priority: 10 },
      { mountPoint: 'header-nav', componentName: 'IconMorpher', priority: 20 },
      { mountPoint: 'header-nav', componentName: 'NavItemSelector', priority: 30 },
      
      // Forms - page-footer mount point
      { mountPoint: 'page-footer', componentName: 'SoulfulFormSubmit', priority: 10 },
      { mountPoint: 'page-footer', componentName: 'ClickToCopyEmail', priority: 20 },
      
      // Tabs - product-detail mount point
      { mountPoint: 'product-detail', componentName: 'BorderMorphTabs', priority: 40 },
      
      // Scroll Animations - below-fold mount point
      { mountPoint: 'below-fold', componentName: 'UnmaskOnScroll', priority: 10 },
      { mountPoint: 'below-fold', componentName: 'ImageSequenceScroll', priority: 20 },
      { mountPoint: 'below-fold', componentName: 'KineticGrid', priority: 30 },
      
      // Interactive - floating-button mount point
      { mountPoint: 'floating-button', componentName: 'WoodToggle', priority: 10 },
      { mountPoint: 'floating-button', componentName: 'ScribblePad', priority: 20 },
      
      // Loading - product-card mount point
      { mountPoint: 'product-card', componentName: 'PixelLoadEffect', priority: 40 },
      
      // Category header
      { mountPoint: 'category-header', componentName: 'ScrambleGlitchText', priority: 10 },
      
      // Page sidebar
      { mountPoint: 'page-sidebar', componentName: 'KineticGrid', priority: 10 },
    ],
    apiRoutes: [
      { path: '/api/free-components/track', methods: ['POST'], description: 'Track component usage analytics' },
    ],
  },
  configSchema: {
    fields: [
      {
        key: 'enableHoverEffects',
        label: 'Enable Hover Effects',
        type: 'boolean',
        description: 'Enable magnetic tooltips, mask reveals, and rotation buttons',
        defaultValue: true,
        required: false,
      },
      {
        key: 'enableFormAnimations',
        label: 'Enable Form Animations',
        type: 'boolean',
        description: 'Enable submit states and copy-to-clipboard components',
        defaultValue: true,
        required: false,
      },
      {
        key: 'enableNavAnimations',
        label: 'Enable Navigation Animations',
        type: 'boolean',
        description: 'Enable gooey dropdowns and icon morphers',
        defaultValue: true,
        required: false,
      },
      {
        key: 'enableScrollAnimations',
        label: 'Enable Scroll Animations',
        type: 'boolean',
        description: 'Enable unmask on scroll and image sequences',
        defaultValue: true,
        required: false,
      },
      {
        key: 'enableInteractiveElements',
        label: 'Enable Interactive Elements',
        type: 'boolean',
        description: 'Enable 3D stickers, toggles, and scratch pads',
        defaultValue: true,
        required: false,
      },
      {
        key: 'animationSpeed',
        label: 'Animation Speed',
        type: 'select',
        description: 'Control the overall speed of animations',
        defaultValue: 'normal',
        required: false,
        options: [
          { label: 'Slow', value: 'slow' },
          { label: 'Normal', value: 'normal' },
          { label: 'Fast', value: 'fast' },
        ],
      },
      {
        key: 'primaryColor',
        label: 'Primary Color',
        type: 'color',
        description: 'Primary accent color for components',
        defaultValue: '#3b82f6',
        required: false,
      },
      {
        key: 'reduceMotion',
        label: 'Reduce Motion',
        type: 'boolean',
        description: 'Respect user preference for reduced motion (accessibility)',
        defaultValue: true,
        required: false,
      },
    ],
    sections: [
      {
        title: 'Component Categories',
        description: 'Choose which component categories to enable',
        fields: ['enableHoverEffects', 'enableFormAnimations', 'enableNavAnimations', 'enableScrollAnimations', 'enableInteractiveElements'],
      },
      {
        title: 'Appearance',
        description: 'Customize the look and feel',
        fields: ['primaryColor', 'animationSpeed'],
      },
      {
        title: 'Accessibility',
        description: 'Accessibility settings',
        fields: ['reduceMotion'],
      },
    ],
  },
  defaultConfig: {
    enableHoverEffects: true,
    enableFormAnimations: true,
    enableNavAnimations: true,
    enableScrollAnimations: true,
    enableInteractiveElements: true,
    animationSpeed: 'normal',
    primaryColor: '#3b82f6',
    reduceMotion: true,
  },
  docs: {
    setup: '/docs/add-ons/free-component-library/setup',
    api: '/docs/add-ons/free-component-library/api',
    faq: '/docs/add-ons/free-component-library/faq',
    support: '/support',
  },
};

export default FREE_COMPONENT_LIBRARY_ADDON;
