"use client";

import { createContext, useContext, ReactNode } from "react";
import { TenantConfig } from "@/types/template";

interface WebStudioContextType {
  tenant: TenantConfig | null;
  isEditMode: boolean;
  updateTheme: (theme: Partial<TenantConfig["colors"]>) => void;
  updateNavigation: (nav: any) => void;
}

const WebStudioContext = createContext<WebStudioContextType | undefined>(undefined);

export function WebStudioProvider({ 
  children, 
  tenant,
  isEditMode = false 
}: { 
  children: ReactNode; 
  tenant?: TenantConfig;
  isEditMode?: boolean;
}) {
  const updateTheme = (theme: Partial<TenantConfig["colors"]>) => {
    if (!isEditMode) return;
    // Theme update logic here
    console.log("Updating theme:", theme);
  };

  const updateNavigation = (nav: any) => {
    if (!isEditMode) return;
    console.log("Updating navigation:", nav);
  };

  return (
    <WebStudioContext.Provider value={{ 
      tenant: tenant || null, 
      isEditMode, 
      updateTheme, 
      updateNavigation 
    }}>
      {children}
    </WebStudioContext.Provider>
  );
}

export function useWebStudio() {
  const context = useContext(WebStudioContext);
  if (context === undefined) {
    // Return default values for non-webstudio contexts
    return { 
      tenant: null, 
      isEditMode: false, 
      updateTheme: () => {}, 
      updateNavigation: () => {} 
    };
  }
  return context;
}
