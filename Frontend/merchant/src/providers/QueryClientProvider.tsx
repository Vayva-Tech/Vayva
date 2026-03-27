/**
 * React Query Provider for the entire merchant application
 * Wraps the app with QueryClientProvider for centralized data fetching
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { createDashboardQueryClient, DEFAULT_QUERY_CONFIG } from '@/lib/react-query';

interface QueryClientProviderWrapperProps {
  children: React.ReactNode;
}

export function QueryClientProviderWrapper({ children }: QueryClientProviderWrapperProps) {
  // Create a single QueryClient instance per session
  // This prevents data loss during re-renders while avoiding SSR hydration issues
  const [queryClient] = useState(() => createDashboardQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* React DevTools for debugging queries in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
