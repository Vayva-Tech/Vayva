/**
 * Test utilities for React Query hooks
 * Provides mock wrappers and test helpers
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Creates a test QueryClient with optimized settings for testing
 */
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for faster tests
        staleTime: Infinity, // Never go stale during tests
        gcTime: Infinity, // Don't garbage collect during tests
      },
    },
  });
}

/**
 * Wrapper component for testing hooks with React Query
 */
export function QueryClientWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = createTestQueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
