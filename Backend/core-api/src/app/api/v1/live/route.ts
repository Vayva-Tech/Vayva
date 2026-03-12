/**
 * Live Dashboard WebSocket API Route
 * Initializes and manages WebSocket connections for real-time dashboard updates
 */

import { NextRequest } from 'next/server';
import { getLiveDashboard } from '@vayva/realtime';

// Mark this route as dynamic since it uses WebSockets
export const dynamic = 'force-dynamic';

/**
 * WebSocket upgrade handler
 * Next.js App Router doesn't natively support WebSocket upgrades,
 * so this is a placeholder that documents the expected behavior.
 * 
 * In production, WebSocket handling should be done through:
 * 1. A custom server (server.ts/server.js)
 * 2. A separate WebSocket service
 * 3. Using Next.js with a custom server configuration
 */
export async function GET(req: NextRequest) {
    // Check if this is a WebSocket upgrade request
    const upgrade = req.headers.get('upgrade');
    
    if (upgrade === 'websocket') {
        // In a custom server setup, you would handle the upgrade here
        // For now, return instructions on how to set up WebSockets
        return new Response(
            JSON.stringify({
                error: 'WebSocket upgrade not supported directly',
                message: 'WebSocket connections should be established through the dedicated WebSocket server',
                documentation: 'See packages/realtime/README.md for setup instructions',
            }),
            {
                status: 426,
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );
    }

    // Return connection info
    const liveDashboard = getLiveDashboard();
    const stats = liveDashboard.getStats();

    return new Response(
        JSON.stringify({
            status: 'ok',
            websocketEndpoint: '/api/v1/live',
            protocol: 'wss',
            stats,
            features: [
                'real-time-orders',
                'real-time-payments',
                'ai-conversation-monitoring',
                'live-metrics',
            ],
        }),
        {
            status: 200,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
}

/**
 * Health check endpoint for live dashboard
 */
export async function HEAD() {
    return new Response(null, { status: 200 });
}
