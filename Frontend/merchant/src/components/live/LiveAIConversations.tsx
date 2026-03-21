// @ts-nocheck
/**
 * Live AI Conversations Monitor
 * Displays real-time AI conversation activity and sales
 */

'use client';

import React, { useMemo } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Bot, MessageSquare, TrendingUp, Users, Zap } from 'lucide-react';
import { useLiveConversations } from '@vayva/realtime';
import { cn } from '@/lib/utils';

interface LiveAIConversationsProps {
    storeId: string;
    className?: string;
}

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

function MetricCard({ title, value, trend, icon, color }: MetricCardProps) {
    const colorClasses = {
        blue: 'bg-blue-500/10 text-blue-600 border-blue-200',
        green: 'bg-green-500/10 text-green-600 border-green-200',
        purple: 'bg-purple-500/10 text-purple-600 border-purple-200',
        orange: 'bg-orange-500/10 text-orange-600 border-orange-200',
    };

    return (
        <div className={cn(
            'p-4 rounded-lg border',
            colorClasses[color]
        )}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-medium opacity-80">{title}</p>
                    <p className="text-2xl font-bold mt-1">{value}</p>
                    {trend !== undefined && (
                        <p className={cn(
                            'text-xs mt-1',
                            trend >= 0 ? 'text-green-600' : 'text-red-600'
                        )}>
                            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
                        </p>
                    )}
                </div>
                <div className="p-2 rounded-md bg-white/50">
                    {icon}
                </div>
            </div>
        </div>
    );
}

interface ConversationItemProps {
    conversation: {
        conversationId: string;
        customerPhone: string;
        intent?: string;
        saleValue?: number;
        responseTimeMs?: number;
    };
    index: number;
}

function ConversationItem({ conversation, index }: ConversationItemProps) {
    return (
        <div
            className={cn(
                'flex items-center gap-3 p-3 rounded-lg border transition-all',
                'hover:bg-green-50 animate-in slide-in-from-bottom-2'
            )}
            style={{ animationDelay: `${index * 50}ms` }}
        >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/10">
                <Bot className="h-4 w-4 text-green-500" />
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">
                        {conversation.customerPhone}
                    </span>
                    {conversation.saleValue && conversation.saleValue > 0 && (
                        <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            ₦{conversation.saleValue.toLocaleString()}
                        </span>
                    )}
                </div>

                {conversation.intent && (
                    <p className="text-xs text-gray-500 truncate">
                        Intent: {conversation.intent}
                    </p>
                )}

                {conversation.responseTimeMs && (
                    <p className="text-xs text-gray-500">
                        Response time: {(conversation.responseTimeMs / 1000).toFixed(1)}s
                    </p>
                )}
            </div>
        </div>
    );
}

export function LiveAIConversations({ storeId, className }: LiveAIConversationsProps) {
    const { conversations, activeCount, totalSales, isConnected, error } = useLiveConversations(storeId);

    const stats = useMemo(() => {
        const totalConversations = conversations.length;
        const salesCount = conversations.filter(c => c.saleValue && c.saleValue > 0).length;
        const conversionRate = totalConversations > 0
            ? (salesCount / totalConversations) * 100
            : 0;

        return {
            totalConversations,
            salesCount,
            conversionRate,
        };
    }, [conversations]);

    if (error) {
        return (
            <div className={cn('p-4 text-center', className)}>
                <p className="text-sm text-red-500">
                    Failed to connect to AI monitoring
                </p>
            </div>
        );
    }

    return (
        <div className={cn('space-y-4', className)}>
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    AI Conversations
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

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                <MetricCard
                    title="Active"
                    value={activeCount}
                    icon={<Users className="h-4 w-4" />}
                    color="blue"
                />
                <MetricCard
                    title="AI Sales"
                    value={`₦${totalSales.toLocaleString()}`}
                    icon={<TrendingUp className="h-4 w-4" />}
                    color="green"
                />
                <MetricCard
                    title="Total Chats"
                    value={stats.totalConversations}
                    icon={<MessageSquare className="h-4 w-4" />}
                    color="purple"
                />
                <MetricCard
                    title="Conversion"
                    value={`${stats.conversionRate.toFixed(1)}%`}
                    icon={<Zap className="h-4 w-4" />}
                    color="orange"
                />
            </div>

            {/* Recent Conversations */}
            <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">
                    Recent Conversations
                </h4>

                {conversations.length === 0 ? (
                    <div className="text-center py-6 text-gray-500 border rounded-lg">
                        <Bot className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No AI conversations yet</p>
                        <p className="text-xs">Conversations will appear here in real-time</p>
                    </div>
                ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {conversations.slice(0, 10).map((conversation, index) => (
                            <ConversationItem
                                key={conversation.conversationId}
                                conversation={conversation}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
