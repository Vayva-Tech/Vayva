/**
 * Retail Realtime Setup
 * 
 * Initialize WebSocket server and Prisma middleware hooks
 * for real-time retail dashboard updates
 */

import { Server } from 'http';
import { initializeRetailWebSocketServer } from '../websockets/retail-dashboard';
import { setupRetailRealtimeHooks } from '../lib/retail-realtime';

let isInitialized = false;

/**
 * Initialize retail realtime features
 * Call this once when your Next.js app starts
 */
export function setupRetailRealtime(server: Server) {
  if (isInitialized) {
    console.log('[Retail Realtime] Already initialized');
    return;
  }

  try {
    // Initialize WebSocket server
    const wss = initializeRetailWebSocketServer(server);

    // Setup Prisma middleware hooks
    setupRetailRealtimeHooks();

    isInitialized = true;

    console.log('[Retail Realtime] ✅ Fully initialized');
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('[Retail Realtime] Shutting down...');
      wss.shutdown();
    });

    process.on('SIGINT', () => {
      console.log('[Retail Realtime] Shutting down...');
      wss.shutdown();
    });

  } catch (error) {
    console.error('[Retail Realtime] Initialization failed:', error);
    throw error;
  }
}

/**
 * Get initialization status
 */
export function isRetailRealtimeInitialized(): boolean {
  return isInitialized;
}
