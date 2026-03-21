'use client';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { logger } from "@vayva/shared";
/**
 * useWebSocket - Custom hook for WebSocket connections with automatic reconnection
 */
export function useWebSocket({ url, onMessage, onOpen, onClose, onError, reconnect = true, reconnectInterval = 3000, maxReconnectAttempts = 5 }) {
    const [isConnected, setIsConnected] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttemptsRef = useRef(0);
    const connect = () => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }
        try {
            const ws = new WebSocket(url);
            wsRef.current = ws;
            ws.onopen = () => {
                setIsConnected(true);
                setRetryCount(0);
                reconnectAttemptsRef.current = 0;
                onOpen?.();
                logger.info('WebSocket connected');
            };
            ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    onMessage?.(message);
                }
                catch (error) {
                    logger.error('Error parsing WebSocket message:', error);
                }
            };
            ws.onclose = () => {
                setIsConnected(false);
                onClose?.();
                logger.info('WebSocket disconnected');
                // Attempt reconnection
                if (reconnect && reconnectAttemptsRef.current < maxReconnectAttempts) {
                    reconnectAttemptsRef.current++;
                    reconnectTimeoutRef.current = setTimeout(() => {
                        setRetryCount(prev => prev + 1);
                        connect();
                    }, reconnectInterval);
                }
                else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                    toast.error('Failed to establish WebSocket connection after multiple attempts');
                }
            };
            ws.onerror = (error) => {
                logger.error('WebSocket error:', error);
                onError?.(error);
            };
        }
        catch (error) {
            logger.error('Failed to create WebSocket connection:', error);
            onError?.(error);
        }
    };
    const disconnect = () => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setIsConnected(false);
        setRetryCount(0);
        reconnectAttemptsRef.current = 0;
    };
    const sendMessage = (message) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
        }
        else {
            logger.warn('WebSocket is not connected. Message not sent.');
        }
    };
    useEffect(() => {
        connect();
        return () => {
            disconnect();
        };
    }, [url]);
    return {
        isConnected,
        retryCount,
        sendMessage,
        disconnect
    };
}
