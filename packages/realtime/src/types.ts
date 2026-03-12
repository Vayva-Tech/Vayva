/**
 * Real-time Event Types for Live Dashboard
 */

export enum DashboardEventType {
    // Order Events
    ORDER_CREATED = 'order:created',
    ORDER_PAID = 'order:paid',
    ORDER_FULFILLED = 'order:fulfilled',
    ORDER_CANCELLED = 'order:cancelled',

    // Payment Events
    PAYMENT_RECEIVED = 'payment:received',
    PAYMENT_FAILED = 'payment:failed',
    REFUND_PROCESSED = 'refund:processed',

    // Conversation Events
    CONVERSATION_STARTED = 'conversation:started',
    CONVERSATION_ENDED = 'conversation:ended',
    MESSAGE_RECEIVED = 'message:received',
    MESSAGE_SENT = 'message:sent',

    // AI Events
    AI_CONVERSATION_STARTED = 'ai:conversation_started',
    AI_CONVERSATION_COMPLETED = 'ai:conversation_completed',
    AI_SALE_MADE = 'ai:sale_made',

    // Inventory Events
    INVENTORY_LOW_STOCK = 'inventory:low_stock',
    INVENTORY_OUT_OF_STOCK = 'inventory:out_of_stock',

    // System Events
    METRICS_UPDATE = 'metrics:update',
    HEALTH_CHECK = 'health:check',
}

export interface DashboardEvent {
    type: DashboardEventType;
    storeId: string;
    timestamp: number;
    data: Record<string, unknown>;
}

export interface OrderEventData {
    orderId: string;
    orderNumber: number;
    total: number;
    customerName?: string;
    customerPhone?: string;
    status: string;
    itemCount: number;
}

export interface PaymentEventData {
    paymentId: string;
    orderId: string;
    amount: number;
    method: string;
    status: string;
}

export interface ConversationEventData {
    conversationId: string;
    contactId: string;
    contactName?: string;
    contactPhone?: string;
    messageCount?: number;
    aiHandled?: boolean;
}

export interface AIConversationEventData {
    conversationId: string;
    customerPhone: string;
    intent?: string;
    productsRecommended?: string[];
    saleValue?: number;
    responseTimeMs?: number;
}

export interface MetricsUpdateData {
    period: 'realtime' | 'hour' | 'day';
    metrics: {
        orders?: number;
        revenue?: number;
        conversations?: number;
        aiConversations?: number;
        conversionRate?: number;
        averageOrderValue?: number;
    };
}

export interface LiveMetrics {
    orders: {
        total: number;
        lastHour: number;
        trend: number; // percentage change
    };
    revenue: {
        total: number;
        lastHour: number;
        trend: number;
    };
    conversations: {
        active: number;
        total: number;
        aiHandled: number;
    };
    customers: {
        active: number;
        new: number;
    };
}

export interface WebSocketMessage {
    action: 'subscribe' | 'unsubscribe' | 'ping' | 'ack';
    channel?: string;
    storeId?: string;
    events?: DashboardEventType[];
    timestamp?: number;
}

export interface SubscriptionRequest {
    storeId: string;
    events: DashboardEventType[];
}
