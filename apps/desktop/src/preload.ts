import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getAppPath: (name: string) => ipcRenderer.invoke('get-app-path', name),
  
  // External links
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  
  // File dialogs
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  saveFile: (options: any) => ipcRenderer.invoke('save-file', options),
  openFile: (options: any) => ipcRenderer.invoke('open-file', options),
  
  // Database operations
  dbInit: () => ipcRenderer.invoke('db-init'),
  dbExecute: (query: string, params?: any[]) => ipcRenderer.invoke('db-execute', query, params),
  dbQuery: (query: string, params?: any[]) => ipcRenderer.invoke('db-query', query, params),
  
  // Event listeners
  onExportData: (callback: (filePath: string) => void) => {
    ipcRenderer.on('export-data', (_event, filePath) => callback(filePath));
  },
  
  // Platform info
  platform: process.platform,
  isDesktop: true,
});

// Type definitions for the exposed API
export interface ElectronAPI {
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
}
