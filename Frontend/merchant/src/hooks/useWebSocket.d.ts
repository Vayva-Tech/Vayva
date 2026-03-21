interface WebSocketMessage {
    type: string;
    payload: unknown;
    timestamp: string;
}
interface UseWebSocketOptions {
    url: string;
    onMessage?: (message: WebSocketMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    reconnect?: boolean;
    reconnectInterval?: number;
    maxReconnectAttempts?: number;
}
/**
 * useWebSocket - Custom hook for WebSocket connections with automatic reconnection
 */
export declare function useWebSocket({ url, onMessage, onOpen, onClose, onError, reconnect, reconnectInterval, maxReconnectAttempts }: UseWebSocketOptions): {
    isConnected: boolean;
    retryCount: number;
    sendMessage: (message: WebSocketMessage) => void;
    disconnect: () => void;
};
export {};
