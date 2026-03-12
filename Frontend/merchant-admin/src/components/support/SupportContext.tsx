"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { SupportDrawer } from "./SupportDrawer";

interface SupportContextType {
  openSupport: (context?: { type?: string; id?: string }) => void;
  closeSupport: () => void;
}

const SupportContext = createContext<SupportContextType | undefined>(undefined);

export const SupportProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<
    { type?: string; id?: string } | undefined
  >(undefined);

  const openSupport = (ctx?: { type?: string; id?: string }) => {
    setContext(ctx);
    setIsOpen(true);
  };

  const closeSupport = () => {
    setIsOpen(false);
    setContext(undefined);
  };

  return (
    <SupportContext.Provider value={{ openSupport, closeSupport }}>
      {children}
      <SupportDrawer
        isOpen={isOpen}
        onClose={closeSupport}
        initialContext={context}
      />
    </SupportContext.Provider>
  );
};

export const useSupport = () => {
  const context = useContext(SupportContext);
  if (!context) {
    throw new Error("useSupport must be used within a SupportProvider");
  }
  return context;
};
