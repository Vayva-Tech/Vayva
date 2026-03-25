/**
 * Wholesale Industry Dashboard Configuration
 * Complete dashboard layout and widget configuration for wholesale distribution
 */

import { ThemePreset } from '../types';

// Theme Presets
export const WHOLESALE_THEMES: Record<string, ThemePreset> = {
  'corporate-blue': {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    background: '#EFF6FF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '8px',
    shadow: '0 4px 24px rgba(59, 130, 246, 0.15)',
  },
  
  'industrial-gray': {
    id: 'industrial-gray',
    name: 'Industrial Gray',
    primary: '#6B7280',
    secondary: '#374151',
    accent: '#F59E0B',
    background: '#F9FAFB',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '8px',
    shadow: '0 4px 24px rgba(107, 114, 128, 0.15)',
  },
  
  'growth-green': {
    id: 'growth-green',
    name: 'Growth Green',
    primary: '#10B981',
    secondary: '#059669',
    accent: '#F59E0B',
    background: '#ECFDF5',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '8px',
    shadow: '0 4px 24px rgba(16, 185, 129, 0.15)',
  },
  
  'premium-purple': {
    id: 'premium-purple',
    name: 'Premium Purple',
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#F59E0B',
    background: '#F5F3FF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '8px',
    shadow: '0 4px 24px rgba(139, 92, 246, 0.15)',
  },
  
  'ocean-teal': {
    id: 'ocean-teal',
    name: 'Ocean Teal',
    primary: '#14B8A6',
    secondary: '#0D9488',
    accent: '#F59E0B',
    background: '#ECFEFF',
    success: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    textPrimary: '#1E293B',
    textSecondary: '#64748B',
    cardBg: 'rgba(255, 255, 255, 0.98)',
    borderRadius: '8px',
    shadow: '0 4px 24px rgba(20, 184, 166, 0.15)',
  },
};

// Default theme
export const DEFAULT_THEME = 'corporate-blue';

// Dashboard Configuration
export const WHOLESALE_DASHBOARD_CONFIG = {
  industry: 'wholesale',
  designCategory: 'signature',
  title: 'VAYVA WHOLESALE',
  subtitle: 'Distribution & Supply Chain Management',
  
  // Navigation items
  navigation: [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'orders', label: 'Orders', icon: 'package' },
    { id: 'inventory', label: 'Inventory', icon: 'archive' },
    { id: 'customers', label: 'Customers', icon: 'users' },
    { id: 'suppliers', label: 'Suppliers', icon: 'truck' },
    { id: 'warehouse', label: 'Warehouse', icon: 'warehouse' },
    { id: 'finance', label: 'Finance', icon: 'dollar-sign' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ],
  
  // Sections configuration
  sections: [
    {
      id: 'business-overview',
      title: 'BUSINESS OVERVIEW',
      type: 'kpi-row',
      widgets: [
        { id: 'orders-today', label: 'Orders Today', format: 'number' },
        { id: 'revenue-mtd', label: 'Revenue MTD', format: 'currency' },
        { id: 'avg-order-value', label: 'Avg Order Value', format: 'currency' },
      ],
    },
    
    {
      id: 'order-pipeline',
      title: 'ORDER PIPELINE',
      type: 'grid-2-col',
      widgets: [
        { 
          id: 'order-status-breakdown', 
          title: 'Order Status Breakdown',
          type: 'status-cards',
        },
        { 
          id: 'sales-by-category', 
          title: 'Sales by Category',
          type: 'category-chart',
        },
      ],
    },
    
    {
      id: 'inventory-health',
      title: 'INVENTORY HEALTH',
      type: 'grid-2-col',
      widgets: [
        { 
          id: 'stock-level-summary', 
          title: 'Stock Level Summary',
          type: 'inventory-cards',
        },
        { 
          id: 'customer-insights', 
          title: 'Customer Insights',
          type: 'customer-metrics',
        },
      ],
    },
    
    {
      id: 'purchase-orders',
      title: 'PURCHASE ORDERS',
      type: 'grid-2-col',
      widgets: [
        { 
          id: 'open-pos', 
          title: 'Open POs',
          type: 'po-summary',
        },
        { 
          id: 'reorder-forecast', 
          title: 'Reorder Forecast',
          type: 'reorder-suggestions',
        },
      ],
    },
    
    {
      id: 'financials',
      title: 'FINANCIALS',
      type: 'grid-2-col',
      widgets: [
        { 
          id: 'accounts-receivable', 
          title: 'Accounts Receivable',
          type: 'ar-summary',
        },
        { 
          id: 'warehouse-performance', 
          title: 'Warehouse Performance',
          type: 'warehouse-metrics',
        },
      ],
    },
    
    {
      id: 'pipeline-forecast',
      title: 'PIPELINE & FORECAST',
      type: 'grid-2-col',
      widgets: [
        { 
          id: 'quote-pipeline', 
          title: 'Quote Pipeline',
          type: 'quote-summary',
        },
        { 
          id: 'action-required', 
          title: 'ACTION REQUIRED',
          type: 'task-list',
        },
      ],
    },
  ],
  
  // Alert rules
  alertRules: [
    {
      id: 'low-stock-alert',
      condition: 'lowStock > 0',
      severity: 'warning',
      message: 'Low stock items require attention',
    },
    {
      id: 'out-of-stock-alert',
      condition: 'outOfStock > 0',
      severity: 'danger',
      message: 'Out of stock items need immediate reorder',
    },
    {
      id: 'past-due-ar',
      condition: 'sixtyPlusDays > 0',
      severity: 'danger',
      message: 'Past due accounts receivable require collection action',
    },
    {
      id: 'shipping-delay',
      condition: 'onTimeShipRate < 90',
      severity: 'warning',
      message: 'Shipping performance below target',
    },
  ],
  
  // Suggested actions
  suggestedActions: [
    {
      id: 'review-low-stock',
      title: 'Review Low Stock Items',
      description: '89 items are below minimum stock levels',
      priority: 'high',
      action: 'navigate-to-inventory',
    },
    {
      id: 'approve-pos',
      title: 'Approve Purchase Orders',
      description: '8 purchase orders pending approval',
      priority: 'high',
      action: 'navigate-to-po-approval',
    },
    {
      id: 'follow-up-customers',
      title: 'Follow Up with Customers',
      description: '5 customers with past due payments',
      priority: 'high',
      action: 'navigate-to-ar',
    },
    {
      id: 'review-quotes',
      title: 'Review Quote Requests',
      description: '12 new quote requests to process',
      priority: 'medium',
      action: 'navigate-to-quotes',
    },
  ],
};

// Helper functions
export function getTheme(themeId: string = DEFAULT_THEME): ThemePreset {
  return WHOLESALE_THEMES[themeId] || WHOLESALE_THEMES[DEFAULT_THEME];
}

export function getAllThemes(): ThemePreset[] {
  return Object.values(WHOLESALE_THEMES);
}

export function getDefaultTheme(): ThemePreset {
  return WHOLESALE_THEMES[DEFAULT_THEME];
}
