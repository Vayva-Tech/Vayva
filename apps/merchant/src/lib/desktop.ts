'use client';

import { useEffect, useState } from 'react';

// Type definitions for Electron API
declare global {
  interface Window {
    electronAPI?: {
      getAppVersion: () => Promise<string>;
      getAppPath: (name: string) => Promise<string>;
      openExternal: (url: string) => Promise<void>;
      selectDirectory: () => Promise<{ canceled: boolean; filePaths: string[] }>;
      saveFile: (options: any) => Promise<{ canceled: boolean; filePath?: string }>;
      openFile: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
      dbInit: () => Promise<{ success: boolean; error?: string }>;
      dbExecute: (query: string, params?: any[]) => Promise<any>;
      dbQuery: (query: string, params?: any[]) => Promise<any>;
      onExportData: (callback: (filePath: string) => void) => void;
      platform: string;
      isDesktop: boolean;
    };
  }
}

interface DesktopInfo {
  isDesktop: boolean;
  platform: string;
  version: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useDesktop(): DesktopInfo {
  const [info, setInfo] = useState<DesktopInfo>({
    isDesktop: false,
    platform: '',
    version: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function checkDesktop() {
      try {
        if (typeof window !== 'undefined' && window.electronAPI) {
          const version = await window.electronAPI.getAppVersion();
          setInfo({
            isDesktop: window.electronAPI.isDesktop || false,
            platform: window.electronAPI.platform || '',
            version,
            isLoading: false,
            error: null,
          });

          // Initialize database
          await window.electronAPI.dbInit();
        } else {
          setInfo({
            isDesktop: false,
            platform: '',
            version: null,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        console.error('Error checking desktop environment:', error);
        setInfo({
          isDesktop: false,
          platform: '',
          version: null,
          isLoading: false,
          error: (error as Error).message,
        });
      }
    }

    checkDesktop();
  }, []);

  return info;
}

// Helper functions for desktop features
export const desktopUtils = {
  // Check if running in desktop app
  isDesktop: (): boolean => {
    return typeof window !== 'undefined' && !!window.electronAPI;
  },

  // Open external URL
  openExternal: async (url: string): Promise<void> => {
    if (window.electronAPI) {
      await window.electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  },

  // Select directory
  selectDirectory: async (): Promise<string | null> => {
    if (!window.electronAPI) return null;
    
    const result = await window.electronAPI.selectDirectory();
    return result.canceled ? null : result.filePaths[0];
  },

  // Save file
  saveFile: async (options: {
    title?: string;
    defaultPath?: string;
    filters?: Array<{ name: string; extensions: string[] }>;
  }): Promise<string | null> => {
    if (!window.electronAPI) return null;
    
    const result = await window.electronAPI.saveFile(options);
    return result.canceled ? null : result.filePath || null;
  },

  // Export data to file
  exportData: async (data: any, filename: string): Promise<boolean> => {
    if (!window.electronAPI) return false;

    try {
      const result = await window.electronAPI.saveFile({
        title: 'Export Data',
        defaultPath: filename,
        filters: [{ name: 'JSON', extensions: ['json'] }],
      });

      if (!result.canceled && result.filePath) {
        // In a real implementation, we'd write the file here
        // For now, we'll use the IPC event
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error exporting data:', error);
      return false;
    }
  },

  // Database operations
  db: {
    execute: async (query: string, params?: any[]): Promise<any> => {
      if (!window.electronAPI) {
        throw new Error('Database not available in web environment');
      }
      return await window.electronAPI.dbExecute(query, params);
    },

    query: async (query: string, params?: any[]): Promise<any[]> => {
      if (!window.electronAPI) {
        throw new Error('Database not available in web environment');
      }
      return await window.electronAPI.dbQuery(query, params);
    },
  },

  // Get platform name
  getPlatform: (): string => {
    if (!window.electronAPI) return 'web';
    return window.electronAPI.platform;
  },

  // Is Windows?
  isWindows: (): boolean => {
    return desktopUtils.getPlatform() === 'win32';
  },

  // Is Mac?
  isMac: (): boolean => {
    return desktopUtils.getPlatform() === 'darwin';
  },
};

export default useDesktop;
