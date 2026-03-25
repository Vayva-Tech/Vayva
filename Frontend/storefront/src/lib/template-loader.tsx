/**
 * Dynamic Template Loader
 * 
 * Loads templates based on tenant configuration
 * Supports templates from @vayva/templates package
 */

import React from 'react';
import dynamic from 'next/dynamic';
import { StoreShell } from '@/components/StoreShell';

// Template component type
export type TemplateComponent = React.ComponentType<{
  store: any;
  products: any[];
  loading?: boolean;
}>;

// Template registry - maps template IDs to dynamic imports
// NOTE: Only templates that actually exist in @vayva/templates are registered
const TEMPLATE_REGISTRY: Record<string, () => Promise<{ default: TemplateComponent }>> = {
  // Standard templates (local)
  standard: () => import('@/templates/StandardTemplate'),
  base: () => import('@/templates/BaseTemplate'),
  
  // E-commerce templates - using @vayva/templates
  'aa-fashion': () => import('@vayva/templates').then(m => ({ default: m.AAFashionHome })),
  'gizmo-tech': () => import('@vayva/templates').then(m => ({ default: m.GizmoTechHome })),
  'bloome-home': () => import('@vayva/templates').then(m => ({ default: m.BloomeHomeLayout })),
  
  // Food & Restaurant
  chopnow: () => import('@vayva/templates').then(m => ({ default: m.ChopnowLayout })),
  
  // Digital & SaaS
  'file-vault': () => import('@vayva/templates').then(m => ({ default: m.FileVaultLayout })),
  ticketly: () => import('@vayva/templates').then(m => ({ default: m.TicketlyLayout })),
  
  // Education
  eduflow: () => import('@vayva/templates').then(m => ({ default: m.EduflowLayout })),
  
  // B2B & Industrial
  bulktrade: () => import('@vayva/templates').then(m => ({ default: m.BulkTradeLayout })),
  markethub: () => import('@vayva/templates').then(m => ({ default: m.MarketHubLayout })),
  
  // Real Estate
  homelist: () => import('@vayva/templates').then(m => ({ default: m.HomeListLayout })),
  
  // Nonprofit
  giveflow: () => import('@vayva/templates').then(m => ({ default: m.GiveFlowLayout })),
  
  // Specialty
  'one-product': () => import('@vayva/templates').then(m => ({ default: m.OneProductLayout })),
  bookly: () => import('@vayva/templates').then(m => ({ default: m.BooklyLayout })),
  
  // Automotive
  automotive: () => import('@vayva/templates').then(m => ({ default: m.AutoDealerHome })),
  
  // Travel
  travel: () => import('@vayva/templates').then(m => ({ default: m.StaycationHome })),
  
  // Blog
  blog: () => import('@vayva/templates').then(m => ({ default: m.EditorialHome })),
};

// Default fallback template
const DefaultTemplate: TemplateComponent = ({ store, products: _products }) => (
  <StoreShell>
    <div className="max-w-7xl mx-auto px-4 py-20">
      <h1 className="text-4xl font-bold mb-4">{store?.name || 'Welcome'}</h1>
      <p className="text-gray-600">{store?.tagline || 'Your store is loading...'}</p>
    </div>
  </StoreShell>
);

/**
 * Get template component by ID
 */
export function getTemplateComponent(templateId: string): React.ComponentType<{
  store: any;
  products: any[];
  loading?: boolean;
}> {
  const loader = TEMPLATE_REGISTRY[templateId];
  
  if (!loader) {
    console.warn(`Template "${templateId}" not found, using default`);
    return DefaultTemplate;
  }
  
  return dynamic(loader, {
    loading: () => (
      <StoreShell>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </StoreShell>
    ),
    ssr: true,
  });
}

/**
 * Check if template exists
 */
export function templateExists(templateId: string): boolean {
  return templateId in TEMPLATE_REGISTRY;
}

/**
 * Get all available template IDs
 */
export function getAvailableTemplates(): string[] {
  return Object.keys(TEMPLATE_REGISTRY);
}
