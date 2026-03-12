'use client';

/**
 * Storefront Add-on Integration
 * 
 * Provides components and hooks for:
 * - MountPoint: Dynamic component mounting at template locations
 * - AddOnProvider: Context for add-on state management
 * - useAddOn: Hook for accessing add-on functionality
 * - AddOnLoader: Async loading of add-on components
 * - MountPointRegistry: Registration system for mount locations
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback,
  useMemo,
  Suspense,
  lazy,
  ComponentType
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ErrorBoundary as ErrorIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MountedComponent {
  id: string;
  addOnId: string;
  componentName: string;
  priority: number;
  props?: Record<string, any>;
  config?: Record<string, any>;
}

export interface MountPointDefinition {
  id: string;
  name: string;
  description?: string;
  defaultComponents?: MountedComponent[];
  allowMultiple?: boolean;
  required?: boolean;
}

export interface AddOnInstance {
  id: string;
  addOnId: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  config: Record<string, any>;
  enabledFeatures: string[];
  customCSS?: string;
  customJS?: string;
  components: Record<string, ComponentType<any>>;
}

export interface AddOnContextValue {
  addOns: AddOnInstance[];
  mountPoints: Map<string, MountedComponent[]>;
  isLoading: boolean;
  error: Error | null;
  getAddOn: (addOnId: string) => AddOnInstance | undefined;
  getComponent: (addOnId: string, componentName: string) => ComponentType<any> | undefined;
  refreshAddOns: () => Promise<void>;
}

// ============================================================================
// ADD-ON CONTEXT
// ============================================================================

const AddOnContext = createContext<AddOnContextValue | null>(null);

export function useAddOns() {
  const context = useContext(AddOnContext);
  if (!context) {
    throw new Error('useAddOns must be used within an AddOnProvider');
  }
  return context;
}

export function useAddOn(addOnId: string) {
  const { getAddOn } = useAddOns();
  return getAddOn(addOnId);
}

// ============================================================================
// ADD-ON PROVIDER
// ============================================================================

interface AddOnProviderProps {
  storeId: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AddOnProvider({ storeId, children, fallback }: AddOnProviderProps) {
  const [addOns, setAddOns] = useState<AddOnInstance[]>([]);
  const [mountPoints] = useState(() => new Map<string, MountedComponent[]>());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadAddOns = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch active add-ons for this store
      const response = await fetch(`/api/storefront/addons?storeId=${storeId}`);
      
      if (!response.ok) {
        throw new Error('Failed to load add-ons');
      }

      const data = await response.json();
      
      // Load components dynamically
      const loadedAddOns = await Promise.all(
        data.addOns.map(async (addOn: any) => {
          try {
            const components = await loadAddOnComponents(addOn.addOnId, addOn.installedVersion);
            return {
              ...addOn,
              components,
            };
          } catch (err) {
            console.error(`Failed to load components for add-on ${addOn.addOnId}:`, err);
            return {
              ...addOn,
              components: {},
              status: 'ERROR',
            };
          }
        })
      );

      setAddOns(loadedAddOns);

      // Register mount points
      loadedAddOns.forEach((addOn: AddOnInstance) => {
        if (addOn.status === 'ACTIVE' && addOn.config?.mountPoints) {
          addOn.config.mountPoints.forEach((mp: MountedComponent) => {
            const existing = mountPoints.get(mp.id) || [];
            mountPoints.set(mp.id, [...existing, { ...mp, addOnId: addOn.addOnId }]);
          });
        }
      });

    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [storeId, mountPoints]);

  useEffect(() => {
    loadAddOns();
  }, [loadAddOns]);

  // Apply custom CSS/JS
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.id = 'vayva-addons-styles';
    
    const css = addOns
      .filter(a => a.status === 'ACTIVE' && a.customCSS)
      .map(a => `/* ${a.name} */\n${a.customCSS}`)
      .join('\n\n');
    
    if (css) {
      styleElement.textContent = css;
      document.head.appendChild(styleElement);
    }

    // Execute custom JS
    addOns
      .filter(a => a.status === 'ACTIVE' && a.customJS)
      .forEach(a => {
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('addOnId', 'config', a.customJS!);
          fn(a.addOnId, a.config);
        } catch (err) {
          console.error(`Error executing custom JS for add-on ${a.addOnId}:`, err);
        }
      });

    return () => {
      const existing = document.getElementById('vayva-addons-styles');
      if (existing) {
        existing.remove();
      }
    };
  }, [addOns]);

  const getAddOn = useCallback((addOnId: string) => {
    return addOns.find(a => a.addOnId === addOnId);
  }, [addOns]);

  const getComponent = useCallback((addOnId: string, componentName: string) => {
    const addOn = getAddOn(addOnId);
    return addOn?.components[componentName];
  }, [getAddOn]);

  const value = useMemo(() => ({
    addOns,
    mountPoints,
    isLoading,
    error,
    getAddOn,
    getComponent,
    refreshAddOns: loadAddOns,
  }), [addOns, mountPoints, isLoading, error, getAddOn, getComponent, loadAddOns]);

  if (isLoading && fallback) {
    return <>{fallback}</>;
  }

  return (
    <AddOnContext.Provider value={value}>
      {children}
    </AddOnContext.Provider>
  );
}

// ============================================================================
// DYNAMIC COMPONENT LOADER
// ============================================================================

async function loadAddOnComponents(addOnId: string, version: string): Promise<Record<string, ComponentType<any>>> {
  // In production, this would load from a CDN or the add-on package
  // For now, we'll use dynamic imports from the local add-ons package
  
  const componentMap: Record<string, () => Promise<any>> = {
    'shopping-cart': () => import('../shopping-cart'),
    'checkout-flow': () => import('../checkout-flow'),
    'product-pages': () => import('../product-pages'),
    'wishlist': () => import('../wishlist'),
    'reviews': () => import('../reviews'),
    'booking': () => import('../booking'),
    'newsletter': () => import('../newsletter'),
  };

  const loader = componentMap[addOnId];
  
  if (!loader) {
    console.warn(`No component loader found for add-on: ${addOnId}`);
    return {};
  }

  try {
    const module = await loader();
    return module;
  } catch (err) {
    console.error(`Failed to load add-on ${addOnId}:`, err);
    return {};
  }
}

// ============================================================================
// MOUNT POINT COMPONENT
// ============================================================================

interface MountPointProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
  wrapper?: 'div' | 'section' | 'aside' | 'header' | 'footer';
  fallback?: React.ReactNode;
}

export function MountPoint({ 
  id, 
  children, 
  className,
  wrapper: Wrapper = 'div',
  fallback 
}: MountPointProps) {
  const { mountPoints, isLoading, getComponent } = useAddOns();
  const [mountedComponents, setMountedComponents] = useState<MountedComponent[]>([]);

  useEffect(() => {
    const components = mountPoints.get(id) || [];
    // Sort by priority (higher first)
    const sorted = [...components].sort((a, b) => (b.priority || 0) - (a.priority || 0));
    setMountedComponents(sorted);
  }, [mountPoints, id]);

  if (isLoading && fallback) {
    return <Wrapper className={className}>{fallback}</Wrapper>;
  }

  if (mountedComponents.length === 0 && !children) {
    return null;
  }

  return (
    <Wrapper className={className} data-mount-point={id}>
      <AnimatePresence mode="popLayout">
        {mountedComponents.map((component) => (
          <MountedComponentWrapper
            key={`${component.addOnId}-${component.componentName}`}
            component={component}
            getComponent={getComponent}
          />
        ))}
      </AnimatePresence>
      {children}
    </Wrapper>
  );
}

// ============================================================================
// MOUNTED COMPONENT WRAPPER
// ============================================================================

interface MountedComponentWrapperProps {
  component: MountedComponent;
  getComponent: (addOnId: string, componentName: string) => ComponentType<any> | undefined;
}

function MountedComponentWrapper({ component, getComponent }: MountedComponentWrapperProps) {
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    try {
      const Comp = getComponent(component.addOnId, component.componentName);
      if (Comp) {
        setComponent(() => Comp);
      } else {
        setError(new Error(`Component ${component.componentName} not found`));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
    }
  }, [component, getComponent]);

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
        <div className="flex items-center gap-2 text-destructive text-sm">
          <ErrorIcon className="w-4 h-4" />
          <span>Failed to load component</span>
        </div>
      </div>
    );
  }

  if (!Component) {
    return (
      <div className="p-4 animate-pulse">
        <div className="h-8 bg-muted rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mount-point-component"
      data-addon-id={component.addOnId}
      data-component={component.componentName}
    >
      <Suspense fallback={<ComponentSkeleton />}>
        <Component {...component.props} />
      </Suspense>
    </motion.div>
  );
}

function ComponentSkeleton() {
  return (
    <div className="p-4 space-y-3">
      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
      <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      <div className="h-20 bg-muted rounded animate-pulse" />
    </div>
  );
}

// ============================================================================
// ADD-ON LOADER (Async Component Loading)
// ============================================================================

interface AddOnLoaderProps {
  addOnId: string;
  componentName: string;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  className?: string;
}

export function AddOnLoader({
  addOnId,
  componentName,
  props = {},
  fallback,
  errorFallback,
  className
}: AddOnLoaderProps) {
  const { getComponent } = useAddOns();
  const [Component, setComponent] = useState<ComponentType<any> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const Comp = getComponent(addOnId, componentName);
        
        if (mounted) {
          if (Comp) {
            setComponent(() => Comp);
          } else {
            setError(new Error(`Component ${componentName} not found in add-on ${addOnId}`));
          }
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load'));
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [addOnId, componentName, getComponent]);

  if (isLoading) {
    return (
      <div className={className}>
        {fallback || <ComponentSkeleton />}
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        {errorFallback || (
          <div className="p-4 text-sm text-destructive">
            Failed to load component
          </div>
        )}
      </div>
    );
  }

  if (!Component) {
    return null;
  }

  return (
    <div className={className}>
      <Suspense fallback={fallback || <ComponentSkeleton />}>
        <Component {...props} />
      </Suspense>
    </div>
  );
}

// ============================================================================
// MOUNT POINT REGISTRY (Static Definition)
// ============================================================================

export const DEFAULT_MOUNT_POINTS: MountPointDefinition[] = [
  {
    id: 'product-page.header',
    name: 'Product Page Header',
    description: 'Above the product title',
    allowMultiple: false,
  },
  {
    id: 'product-page.sidebar',
    name: 'Product Sidebar',
    description: 'Product information sidebar',
    allowMultiple: true,
  },
  {
    id: 'product-page.gallery',
    name: 'Product Gallery',
    description: 'Product image gallery area',
    allowMultiple: false,
  },
  {
    id: 'product-page.description',
    name: 'Product Description',
    description: 'Below product description',
    allowMultiple: true,
  },
  {
    id: 'product-page.reviews',
    name: 'Product Reviews',
    description: 'Product reviews section',
    allowMultiple: false,
  },
  {
    id: 'product-page.footer',
    name: 'Product Page Footer',
    description: 'Bottom of product page',
    allowMultiple: true,
  },
  {
    id: 'cart.drawer',
    name: 'Shopping Cart Drawer',
    description: 'Shopping cart drawer content',
    allowMultiple: true,
  },
  {
    id: 'cart.empty',
    name: 'Empty Cart',
    description: 'When cart is empty',
    allowMultiple: false,
  },
  {
    id: 'checkout.header',
    name: 'Checkout Header',
    description: 'Top of checkout page',
    allowMultiple: false,
  },
  {
    id: 'checkout.sidebar',
    name: 'Checkout Sidebar',
    description: 'Checkout sidebar/order summary',
    allowMultiple: true,
  },
  {
    id: 'checkout.footer',
    name: 'Checkout Footer',
    description: 'Bottom of checkout page',
    allowMultiple: true,
  },
  {
    id: 'store.header',
    name: 'Store Header',
    description: 'Site-wide header',
    allowMultiple: true,
  },
  {
    id: 'store.footer',
    name: 'Store Footer',
    description: 'Site-wide footer',
    allowMultiple: true,
  },
  {
    id: 'store.sidebar',
    name: 'Store Sidebar',
    description: 'Global sidebar',
    allowMultiple: true,
  },
  {
    id: 'homepage.hero',
    name: 'Homepage Hero',
    description: 'Homepage hero section',
    allowMultiple: false,
  },
  {
    id: 'homepage.content',
    name: 'Homepage Content',
    description: 'Main homepage content area',
    allowMultiple: true,
  },
  {
    id: 'collection.header',
    name: 'Collection Header',
    description: 'Above collection products',
    allowMultiple: false,
  },
  {
    id: 'collection.filter',
    name: 'Collection Filter',
    description: 'Collection filter sidebar',
    allowMultiple: true,
  },
  {
    id: 'collection.product-card',
    name: 'Product Card',
    description: 'Inside each product card',
    allowMultiple: true,
  },
  {
    id: 'collection.empty',
    name: 'Empty Collection',
    description: 'When collection has no products',
    allowMultiple: false,
  },
];

// ============================================================================
// ERROR BOUNDARY
// ============================================================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AddOnErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Add-on error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 bg-destructive/10 rounded-lg">
            <div className="flex items-center gap-2 text-destructive">
              <ErrorIcon className="w-5 h-5" />
              <span className="font-medium">Something went wrong</span>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
