import React, { createContext, useContext, useState, ReactNode } from 'react';

interface StoreContextType {
  storeId: string | null;
  storeName: string | null;
  setStore: (storeId: string, storeName: string) => void;
  clearStore: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [storeId, setStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState<string | null>(null);

  const setStore = (id: string, name: string) => {
    setStoreId(id);
    setStoreName(name);
  };

  const clearStore = () => {
    setStoreId(null);
    setStoreName(null);
  };

  return (
    <StoreContext.Provider value={{ storeId, storeName, setStore, clearStore }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
}

export default StoreContext;
