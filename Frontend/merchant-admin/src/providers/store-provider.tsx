'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { Store } from '@vayva/db';

interface StoreContextType {
  store: Store | null;
  setStore: (store: Store | null) => void;
  isLoading: boolean;
  error: string | null;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load store data from localStorage or API
    const loadStore = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Try to get store from localStorage first
        const savedStore = localStorage.getItem('currentStore');
        if (savedStore) {
          setStore(JSON.parse(savedStore));
          setIsLoading(false);
          return;
        }

        // Fallback to API call
        const response = await fetch('/api/current-store');
        if (response.ok) {
          const storeData = await response.json();
          setStore(storeData);
          localStorage.setItem('currentStore', JSON.stringify(storeData));
        } else {
          throw new Error('Failed to load store data');
        }
      } catch (err) {
        console.error('Error loading store:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    loadStore();
  }, []);

  const value = {
    store,
    setStore: (newStore: Store | null) => {
      setStore(newStore);
      if (newStore) {
        localStorage.setItem('currentStore', JSON.stringify(newStore));
      } else {
        localStorage.removeItem('currentStore');
      }
    },
    isLoading,
    error
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

// Mock store data for development
export const MOCK_STORE: Store = {
  id: 'mock-store-1',
  name: 'Demo Store',
  slug: 'demo-store',
  ownerId: 'user-1',
  plan: 'PRO',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  settings: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
  theme: 'default',
  currency: 'NGN',
  timezone: 'Africa/Lagos',
  locale: 'en',
  status: 'ACTIVE'
};