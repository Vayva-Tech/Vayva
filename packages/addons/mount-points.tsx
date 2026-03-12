/**
 * Vayva Add-On Mount Points
 * 
 * React components that serve as injection points for add-on features.
 * Templates include these mount points in their layouts, and add-ons
 * register components to render within them.
 */

import React, { Suspense } from 'react';
import type { MountPointId } from './types';

// ============================================================================
// MOUNT POINT REGISTRY
// ============================================================================

interface MountPointRegistration {
  component: React.ComponentType<any>;
  priority: number;
  addOnId: string;
  conditions?: {
    pageTypes?: string[];
    authState?: 'logged-in' | 'logged-out' | 'any';
    featureFlag?: string;
  };
}

const mountPointRegistry: Record<MountPointId, MountPointRegistration[]> = {
  'header-right': [],
  'header-nav': [],
  'header-left': [],
  'product-card': [],
  'product-detail': [],
  'product-grid-actions': [],
  'category-sidebar': [],
  'category-header': [],
  'page-sidebar': [],
  'page-footer': [],
  'footer-widgets': [],
  'floating-button': [],
  'checkout-summary': [],
  'checkout-header': [],
  'post-content': [],
  'post-sidebar': [],
  'hero-section': [],
  'below-fold': [],
  'dashboard-sidebar': [],
  'dashboard-home-widgets': [],
  'dashboard-analytics': [],
};

// ============================================================================
// REGISTRATION API
// ============================================================================

/**
 * Register a component to render at a mount point
 */
export function registerComponentAtMountPoint(
  mountPoint: MountPointId,
  addOnId: string,
  component: React.ComponentType<any>,
  priority: number = 10,
  conditions?: MountPointRegistration['conditions']
): void {
  if (!mountPointRegistry[mountPoint]) {
    console.warn(`[Addons] Unknown mount point: ${mountPoint}`);
    return;
  }

  // Check if already registered
  const existing = mountPointRegistry[mountPoint].find(
    r => r.addOnId === addOnId && r.component === component
  );
  
  if (existing) {
    console.warn(`[Addons] Component already registered at ${mountPoint} for ${addOnId}`);
    return;
  }

  mountPointRegistry[mountPoint].push({
    component,
    priority,
    addOnId,
    conditions,
  });

  // Sort by priority (lower = higher position)
  mountPointRegistry[mountPoint].sort((a, b) => a.priority - b.priority);

  console.log(`[Addons] Registered ${addOnId} component at ${mountPoint} (priority: ${priority})`);
}

/**
 * Unregister all components for an add-on
 */
export function unregisterAddOn(addOnId: string): void {
  Object.keys(mountPointRegistry).forEach((mountPoint) => {
    mountPointRegistry[mountPoint as MountPointId] = mountPointRegistry[mountPoint as MountPointId].filter(
      r => r.addOnId !== addOnId
    );
  });
  console.log(`[Addons] Unregistered all components for ${addOnId}`);
}

/**
 * Check if conditions are met for a component to render
 */
function checkConditions(
  conditions: MountPointRegistration['conditions'],
  context: {
    pageType: string;
    isLoggedIn: boolean;
    featureFlags: Record<string, boolean>;
  }
): boolean {
  if (!conditions) return true;

  // Check page type
  if (conditions.pageTypes && !conditions.pageTypes.includes(context.pageType)) {
    return false;
  }

  // Check auth state
  if (conditions.authState) {
    if (conditions.authState === 'logged-in' && !context.isLoggedIn) return false;
    if (conditions.authState === 'logged-out' && context.isLoggedIn) return false;
  }

  // Check feature flag
  if (conditions.featureFlag && !context.featureFlags[conditions.featureFlag]) {
    return false;
  }

  return true;
}

// ============================================================================
// CONTEXT
// ============================================================================

interface MountPointContextValue {
  pageType: string;
  isLoggedIn: boolean;
  featureFlags: Record<string, boolean>;
  storeId: string;
}

const MountPointContext = React.createContext<MountPointContextValue>({
  pageType: 'home',
  isLoggedIn: false,
  featureFlags: {},
  storeId: '',
});

export const MountPointProvider = MountPointContext.Provider;

export function useMountPointContext(): MountPointContextValue {
  return React.useContext(MountPointContext);
}

// ============================================================================
// MOUNT POINT COMPONENTS
// ============================================================================

interface MountPointProps {
  id: MountPointId;
  className?: string;
  style?: React.CSSProperties;
  fallback?: React.ReactNode;
  maxComponents?: number;
  emptyComponent?: React.ReactNode;
}

/**
 * Generic Mount Point component that renders all registered add-on components
 */
export function MountPoint({
  id,
  className,
  style,
  fallback = null,
  maxComponents,
  emptyComponent = null,
}: MountPointProps): React.ReactElement {
  const context = useMountPointContext();
  const registrations = mountPointRegistry[id] || [];
  
  // Filter by conditions
  const visibleRegistrations = registrations.filter(r => 
    checkConditions(r.conditions, context)
  );

  // Apply max components limit
  const limitedRegistrations = maxComponents 
    ? visibleRegistrations.slice(0, maxComponents)
    : visibleRegistrations;

  if (limitedRegistrations.length === 0) {
    return <>{emptyComponent}</>;
  }

  return (
    <div className={className} style={style} data-mount-point={id}>
      <Suspense fallback={fallback}>
        {limitedRegistrations.map((registration, index) => {
          const Component = registration.component;
          return (
            <div 
              key={`${registration.addOnId}-${index}`}
              data-addon={registration.addOnId}
              data-priority={registration.priority}
            >
              <Component />
            </div>
          );
        })}
      </Suspense>
    </div>
  );
}

// ============================================================================
// CONVENIENCE MOUNT POINT COMPONENTS
// ============================================================================

export function HeaderRight(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="header-right" {...props} maxComponents={3} />;
}

export function HeaderNav(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="header-nav" {...props} />;
}

export function HeaderLeft(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="header-left" {...props} />;
}

export function ProductCardActions(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="product-card" {...props} maxComponents={2} />;
}

export function ProductDetailSections(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="product-detail" {...props} />;
}

export function CategorySidebar(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="category-sidebar" {...props} maxComponents={4} />;
}

export function PageSidebar(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="page-sidebar" {...props} maxComponents={4} />;
}

export function FooterWidgets(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="footer-widgets" {...props} maxComponents={4} />;
}

export function FloatingButtons(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="floating-button" {...props} maxComponents={2} />;
}

export function CheckoutSummary(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="checkout-summary" {...props} />;
}

export function DashboardWidgets(props: Omit<MountPointProps, 'id'>): React.ReactElement {
  return <MountPoint id="dashboard-home-widgets" {...props} maxComponents={6} />;
}

// ============================================================================
// HOOKS FOR ADD-ON COMPONENTS
// ============================================================================

interface UseAddOnComponentProps {
  addOnId: string;
  mountPoint: MountPointId;
  component: React.ComponentType<any>;
  priority?: number;
  conditions?: MountPointRegistration['conditions'];
}

/**
 * Hook for add-ons to register their components
 */
export function useRegisterAddOnComponent({
  addOnId,
  mountPoint,
  component,
  priority = 10,
  conditions,
}: UseAddOnComponentProps): void {
  React.useEffect(() => {
    registerComponentAtMountPoint(mountPoint, addOnId, component, priority, conditions);
    
    return () => {
      // Cleanup handled by unregisterAddOn when add-on is disabled
    };
  }, [addOnId, mountPoint, component, priority, conditions]);
}

// ============================================================================
// DEBUG UTILITIES
// ============================================================================

export function getMountPointDebugInfo(): Record<MountPointId, { count: number; addOns: string[] }> {
  const info = {} as Record<MountPointId, { count: number; addOns: string[] }>;
  
  Object.keys(mountPointRegistry).forEach((mountPoint) => {
    const registrations = mountPointRegistry[mountPoint as MountPointId];
    info[mountPoint as MountPointId] = {
      count: registrations.length,
      addOns: [...new Set(registrations.map(r => r.addOnId))],
    };
  });
  
  return info;
}

export function logMountPointDebugInfo(): void {
  const info = getMountPointDebugInfo();
  console.group('[Addons] Mount Point Debug Info');
  Object.entries(info).forEach(([mountPoint, data]) => {
    if (data.count > 0) {
      console.log(`${mountPoint}: ${data.count} component(s) from [${data.addOns.join(', ')}]`);
    }
  });
  console.groupEnd();
}

// ============================================================================
// TEMPLATE CAPABILITIES
// ============================================================================

interface TemplateCapabilities {
  templateId: string;
  supportedMountPoints: MountPointId[];
  maxComponentsPerMountPoint: Partial<Record<MountPointId, number>>;
}

const templateCapabilities: Record<string, TemplateCapabilities> = {};

export function registerTemplateCapabilities(capabilities: TemplateCapabilities): void {
  templateCapabilities[capabilities.templateId] = capabilities;
}

export function getTemplateCapabilities(templateId: string): TemplateCapabilities | undefined {
  return templateCapabilities[templateId];
}

export function isMountPointSupported(templateId: string, mountPoint: MountPointId): boolean {
  const capabilities = templateCapabilities[templateId];
  if (!capabilities) return true; // Default to allowing all
  return capabilities.supportedMountPoints.includes(mountPoint);
}

// ============================================================================
// EXPORTS
// ============================================================================

export { mountPointRegistry };
export type { MountPointRegistration, MountPointContextValue, TemplateCapabilities };
