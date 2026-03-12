/**
 * Live Dashboard Service
 * Manages WebSocket connections and Redis pub/sub for real-time updates
 */

import type { Redis } from 'ioredis';
import type { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { getRedis } from '@vayva/redis';
import {
    DashboardEvent,
    DashboardEventType,
    LiveMetrics,
    WebSocketMessage,
    SubscriptionRequest,
} from './types';

interface ClientConnection {
    ws: WebSocket;
    storeId?: string;
    subscribedEvents: Set<DashboardEventType>;
    connectedAt: Date;
    lastPing: Date;
}

export class LiveDashboard {
    private wss?: WebSocketServer;
    private clients: Map<string, ClientConnection> = new Map();
    private redisPublisher?: Redis;
    private redisSubscriber?: Redis;
    private heartbeatInterval?: NodeJS.Timeout;

    // Channel patterns for Redis pub/sub
    private readonly CHANNEL_PREFIX = 'vayva:live';

    async initialize(server: HTTPServer): Promise<void> {
        // Initialize WebSocket server
        this.wss = new WebSocketServer({
            server,
            path: '/api/v1/live',
            perMessageDeflate: false,
        });

        // Initialize Redis connections
        this.redisPublisher = await getRedis();
        this.redisSubscriber = (await getRedis()).duplicate();

        // Set up WebSocket handlers
        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });

        // Subscribe to Redis channels
        await this.setupRedisSubscription();

        // Start heartbeat
        this.startHeartbeat();

        console.log('✅ Live Dashboard WebSocket server initialized');
    }

    private handleConnection(ws: WebSocket, req: any): void {
        const clientId = this.generateClientId();
        const client: ClientConnection = {
            ws,
            subscribedEvents: new Set(),
            connectedAt: new Date(),
            lastPing: new Date(),
        };

        this.clients.set(clientId, client);

        console.log(`🔌 Client connected: ${clientId}, total clients: ${this.clients.size}`);

        // Send initial connection acknowledgment
        this.sendToClient(ws, {
            action: 'ack',
            timestamp: Date.now(),
        });

        ws.on('message', (data) => {
            try {
                const message: WebSocketMessage = JSON.parse(data.toString());
                this.handleMessage(clientId, message);
            } catch (error) {
                console.error('Invalid WebSocket message:', error);
                this.sendToClient(ws, {
                    action: 'ack',
                    error: 'Invalid message format',
                });
            }
        });

        ws.on('close', () => {
            this.handleDisconnect(clientId);
        });

        ws.on('error', (error) => {
            console.error(`WebSocket error for client ${clientId}:`, error);
            this.handleDisconnect(clientId);
        });
    }

    private handleMessage(clientId: string, message: WebSocketMessage): void {
        const client = this.clients.get(clientId);
        if (!client) return;

        switch (message.action) {
            case 'subscribe':
                if (message.storeId && message.events) {
                    client.storeId = message.storeId;
                    message.events.forEach((event) => {
                        client.subscribedEvents.add(event);
                    });

                    // Subscribe to Redis channel for this store
                    this.subscribeToStoreChannel(message.storeId);

                    // Send initial metrics
                    this.sendInitialMetrics(client);

                    console.log(`📡 Client ${clientId} subscribed to ${message.events.length} events for store ${message.storeId}`);
                }
                break;

            case 'unsubscribe':
                if (message.events) {
                    message.events.forEach((event) => {
                        client.subscribedEvents.delete(event);
                    });
                }
                break;

            case 'ping':
                client.lastPing = new Date();
                this.sendToClient(client.ws, {
                    action: 'ack',
                    timestamp: Date.now(),
                });
                break;
        }
    }

    private handleDisconnect(clientId: string): void {
        const client = this.clients.get(clientId);
        if (client) {
            client.ws.terminate();
            this.clients.delete(clientId);
            console.log(`🔌 Client disconnected: ${clientId}, remaining: ${this.clients.size}`);
        }
    }

    private async setupRedisSubscription(): Promise<void> {
        if (!this.redisSubscriber) return;

        // Subscribe to all store channels pattern
        await this.redisSubscriber.psubscribe(`${this.CHANNEL_PREFIX}:*`);

        this.redisSubscriber.on('pmessage', (pattern, channel, message) => {
            try {
                const event: DashboardEvent = JSON.parse(message);
                this.broadcastToSubscribers(event);
            } catch (error) {
                console.error('Error parsing Redis message:', error);
            }
        });
    }

    private subscribeToStoreChannel(storeId: string): void {
        // Redis psubscribe already handles all channels with pattern
        // This method can be used for additional per-store setup if needed
    }

    private broadcastToSubscribers(event: DashboardEvent): void {
        const relevantClients: WebSocket[] = [];

        this.clients.forEach((client) => {
            if (
                client.storeId === event.storeId &&
                client.subscribedEvents.has(event.type) &&
                client.ws.readyState === WebSocket.OPEN
            ) {
                relevantClients.push(client.ws);
            }
        });

        if (relevantClients.length === 0) return;

        const message = JSON.stringify({
            type: 'event',
            timestamp: Date.now(),
            data: event,
        });

        relevantClients.forEach((ws) => {
            try {
                ws.send(message);
            } catch (error) {
                console.error('Error sending WebSocket message:', error);
            }
        });
    }

    private async sendInitialMetrics(client: ClientConnection): Promise<void> {
        if (!client.storeId) return;

        // Fetch current metrics from database or cache
        const metrics = await this.getCurrentMetrics(client.storeId);

        this.sendToClient(client.ws, {
            type: 'initial',
            timestamp: Date.now(),
            data: metrics,
        });
    }

    private async getCurrentMetrics(storeId: string): Promise<LiveMetrics> {
        // This would typically fetch from Redis cache or database
        // For now, return default structure
        return {
            orders: { total: 0, lastHour: 0, trend: 0 },
            revenue: { total: 0, lastHour: 0, trend: 0 },
            conversations: { active: 0, total: 0, aiHandled: 0 },
            customers: { active: 0, new: 0 },
        };
    }

    private sendToClient(ws: WebSocket, data: unknown): void {
        if (ws.readyState === WebSocket.OPEN) {
            try {
                ws.send(JSON.stringify(data));
            } catch (error) {
                console.error('Error sending to client:', error);
            }
        }
    }

    private startHeartbeat(): void {
        this.heartbeatInterval = setInterval(() => {
            const now = new Date();
            const staleThreshold = 60000; // 60 seconds

            this.clients.forEach((client, clientId) => {
                // Check for stale connections
                if (now.getTime() - client.lastPing.getTime() > staleThreshold) {
                    console.log(`💔 Stale connection detected: ${clientId}`);
                    this.handleDisconnect(clientId);
                    return;
                }

                // Send ping
                this.sendToClient(client.ws, {
                    action: 'ping',
                    timestamp: now.getTime(),
                });
            });
        }, 30000); // Every 30 seconds
    }

    private generateClientId(): string {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Publish an event to be broadcast to connected clients
     */
    async publishEvent(event: DashboardEvent): Promise<void> {
        if (!this.redisPublisher) {
            console.warn('Redis publisher not initialized');
            return;
        }

        const channel = `${this.CHANNEL_PREFIX}:${event.storeId}`;
        const message = JSON.stringify(event);

        await this.redisPublisher.publish(channel, message);
    }

    /**
     * Publish order created event
     */
    async publishOrderCreated(storeId: string, orderData: {
        orderId: string;
        orderNumber: number;
        total: number;
        customerName?: string;
        customerPhone?: string;
        itemCount: number;
    }): Promise<void> {
        await this.publishEvent({
            type: DashboardEventType.ORDER_CREATED,
            storeId,
            timestamp: Date.now(),
            data: orderData,
        });
    }

    /**
     * Publish payment received event
     */
    async publishPaymentReceived(storeId: string, paymentData: {
        paymentId: string;
        orderId: string;
        amount: number;
        method: string;
    }): Promise<void> {
        await this.publishEvent({
            type: DashboardEventType.PAYMENT_RECEIVED,
            storeId,
            timestamp: Date.now(),
            data: paymentData,
        });
    }

    /**
     * Publish AI conversation event
     */
    async publishAIConversation(storeId: string, conversationData: {
        conversationId: string;
        customerPhone: string;
        intent?: string;
        saleValue?: number;
        responseTimeMs?: number;
    }): Promise<void> {
        await this.publishEvent({
            type: DashboardEventType.AI_CONVERSATION_COMPLETED,
            storeId,
            timestamp: Date.now(),
            data: conversationData,
        });
    }

    /**
     * Get connection statistics
     */
    getStats(): { totalClients: number; clientsByStore: Record<string, number> } {
        const clientsByStore: Record<string, number> = {};

        this.clients.forEach((client) => {
            if (client.storeId) {
                clientsByStore[client.storeId] = (clientsByStore[client.storeId] || 0) + 1;
            }
        });

        return {
            totalClients: this.clients.size,
            clientsByStore,
        };
    }

    /**
     * Graceful shutdown
     */
    async shutdown(): Promise<void> {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        // Close all client connections
        this.clients.forEach((client) => {
            client.ws.close(1000, 'Server shutting down');
        });
        this.clients.clear();

        // Close WebSocket server
        if (this.wss) {
            this.wss.close();
        }

        // Close Redis connections
        if (this.redisSubscriber) {
            await this.redisSubscriber.quit();
        }

        console.log('✅ Live Dashboard shut down gracefully');
    }
}

// Singleton instance
let liveDashboardInstance: LiveDashboard | null = null;

export function getLiveDashboard(): LiveDashboard {
    if (!liveDashboardInstance) {
        liveDashboardInstance = new LiveDashboard();
    }
    return liveDashboardInstance;
}
