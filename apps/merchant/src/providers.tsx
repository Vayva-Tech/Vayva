'use client';

import React, { useEffect, useState } from 'react';
import { NotificationProvider } from './context/notification.context';
import { initializeSettingsManager, SettingsManager } from '@vayva/settings';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [settingsInitialized, setSettingsInitialized] = useState(false);

  useEffect(() => {
    async function initSettings() {
      try {
        const manager = new SettingsManager();
        // Initialize settings manager (will connect to DB in production)
        initializeSettingsManager(manager);
        setSettingsInitialized(true);
      } catch (error) {
        console.error('[SETTINGS] Failed to initialize:', error);
        setSettingsInitialized(true); // Continue anyway
      }
    }

    initSettings();
  }, []);

  if (!settingsInitialized) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <NotificationProvider>
      {children}
    </NotificationProvider>
  );
}