/**
 * @vayva/realtime - Real-time Dashboard Infrastructure
 * 
 * Provides WebSocket-based live updates for merchant dashboards
 * and Redis pub/sub for event distribution across server instances.
 */

// Core types
export {
    DashboardEventType,
    type DashboardEvent,
    type OrderEventData,
    type PaymentEventData,
    type ConversationEventData,
    type AIConversationEventData,
    type MetricsUpdateData,
    type LiveMetrics,
    type WebSocketMessage,
    type SubscriptionRequest,
} from './types';

// Live Dashboard service
export {
    LiveDashboard,
    getLiveDashboard,
} from './live-dashboard';

// React hooks
export {
    useLiveDashboard,
    useLiveOrders,
    useLivePayments,
    useLiveConversations,
    useLiveMetrics,
} from './hooks';
