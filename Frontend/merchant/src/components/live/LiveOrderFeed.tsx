// @ts-nocheck
/**
 * Live Order Feed Component
 * Displays real-time order notifications with "new" highlighting
 */

'use client';

import React, { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ShoppingBag, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLiveOrders , OrderEventData } from '@vayva/realtime';
import { cn } from '@/lib/utils';

interface LiveOrderFeedProps {
    storeId: string;
    maxItems?: number;
    className?: string;
}

interface OrderNotificationProps {
    order: OrderEventData;
    isNew: boolean;
    receivedAt: number;
}

function OrderNotification({ order, isNew, receivedAt }: OrderNotificationProps) {
    const statusIcon = useMemo(() => {
        switch (order.status) {
            case 'PAID':
            case 'COMPLETED':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'CANCELLED':
                return <XCircle className="h-4 w-4 text-red-500" />;
            case 'PENDING':
            default:
                return <Clock className="h-4 w-4 text-yellow-500" />;
        }
    }, [order.status]);

    return (
        <div
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-all duration-500',
                isNew
                    ? 'bg-green-500/10 border-green-500/30 shadow-sm animate-in slide-in-from-right-4'
                    : 'bg-white border-gray-100 hover:bg-green-50'
            )}
        >
            <div className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                isNew ? 'bg-green-500/20' : 'bg-gray-100'
            )}>
                <ShoppingBag className="h-5 w-5 text-green-500" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                        Order #{order.orderNumber}
                    </span>
                    {statusIcon}
                    {isNew && (
                        <span className="text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                            NEW
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">
                        ₦{order.total.toLocaleString()}
                    </span>
                    <span>•</span>
                    <span>{order.itemCount} item{order.itemCount !== 1 ? 's' : ''}</span>
                </div>

                {order.customerName && (
                    <p className="text-xs text-gray-500 truncate">
                        {order.customerName}
                    </p>
                )}

                <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(receivedAt, { addSuffix: true })}
                </p>
            </div>
        </div>
    );
}

export function LiveOrderFeed({ storeId, maxItems = 10, className }: LiveOrderFeedProps) {
    const { orders, newOrderIds, isConnected, error } = useLiveOrders(storeId);

    const displayOrders = useMemo(() => {
        return orders.slice(0, maxItems).map((order) => ({
            ...order,
            receivedAt: Date.now(),
        }));
    }, [orders, maxItems]);

    if (error) {
        return (
            <div className={cn('p-4 text-center', className)}>
                <p className="text-sm text-red-500">
                    Failed to connect to live feed
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-3', className)}>
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Live Orders
                </h3>
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'h-2 w-2 rounded-full',
                            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
                        )}
                    />
                    <span className="text-xs text-gray-500">
                        {isConnected ? 'Live' : 'Disconnected'}
                    </span>
                </div>
            </div>

            {displayOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <ShoppingBag className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No orders yet</p>
                    <p className="text-xs">New orders will appear here in real-time</p>
                </div>
            ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                    {displayOrders.map((order) => (
                        <OrderNotification
                            key={order.orderId}
                            order={order}
                            isNew={newOrderIds.has(order.orderId)}
                            receivedAt={order.receivedAt}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
