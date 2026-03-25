'use client';

import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import type { Store } from '@vayva/db';

interface StoreContextType {
  store: Store | null;
  setStore: (store: Store | null) => void;
  isLoading: boolean;
  error: string | null;
}

export const StoreContext = createContext<StoreContextType | undefined>(undefined);

function parseStoredStore(raw: string): Store | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === 'object' &&
      'id' in parsed &&
      typeof (parsed as { id: unknown }).id === 'string'
    ) {
      return parsed as Store;
    }
  } catch {
    /* ignore corrupt localStorage */
  }
  return null;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStore = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const savedStore = localStorage.getItem('currentStore');
        if (savedStore) {
          const parsed = parseStoredStore(savedStore);
          if (parsed) {
            setStore(parsed);
          }
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/current-store');
        if (response.ok) {
          const storeData = (await response.json()) as Store;
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

    void loadStore();
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
