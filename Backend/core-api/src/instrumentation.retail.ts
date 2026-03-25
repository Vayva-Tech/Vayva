/**
 * Instrumentation file for retail realtime features
 * 
 * Add this to your app's instrumentation.ts to initialize
 * WebSocket server and Prisma hooks on server startup
 */

import { setupRetailRealtime as _setupRetailRealtime } from './lib/retail-setup';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Wait for the server to be ready
    setTimeout(() => {
      try {
        // Note: In Next.js App Router, we need to get the HTTP server
        // This is typically done in a custom server setup
        // For Vercel deployment, use their real-time features instead
        
        if (process.env.ENABLE_RETAIL_REALTIME === 'true') {
          console.warn('[Instrumentation] Retail realtime initialization requested');
          // The actual server initialization happens in the custom server
          // or through the /api/retail/realtime endpoint
        }
      } catch (error) {
        console.error('[Instrumentation] Failed to initialize retail realtime:', error);
      }
    }, 1000);
  }
}
