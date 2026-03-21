'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';
import { TrendingUp, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
/**
 * KitchenStatus Component
 *
 * Displays key kitchen metrics and status overview
 */
export function KitchenStatus({ designCategory = 'signature', industry = 'food', planTier = 'standard' }) {
    const { tickets } = useRealTimeKDS();
    // Calculate metrics
    const activeTickets = tickets.filter(t => t.status === 'cooking' || t.status === 'fresh').length;
    const readyTickets = tickets.filter(t => t.status === 'ready').length;
    const urgentTickets = tickets.filter(t => t.priority === 'urgent' || t.status === 'overdue').length;
    // Calculate average cook time
    const avgCookTime = tickets.length > 0
        ? Math.round(tickets.reduce((acc, t) => acc + t.timerSeconds, 0) / tickets.length / 60)
        : 0;
    const stats = [
        {
            label: 'Active Tickets',
            value: activeTickets,
            icon: Clock,
            color: 'blue',
            trend: '+8 vs last hour',
            trendDirection: 'neutral',
        },
        {
            label: 'Avg Cook Time',
            value: `${avgCookTime}:${(Math.random() * 60).toFixed(0).padStart(2, '0')}`,
            icon: TrendingUp,
            color: 'green',
            trend: '-1:23 improvement',
            trendDirection: 'up',
        },
        {
            label: 'Urgent Orders',
            value: urgentTickets,
            icon: AlertTriangle,
            color: urgentTickets > 0 ? 'red' : 'green',
            trend: urgentTickets > 0 ? 'Needs attention' : 'All clear',
            trendDirection: urgentTickets > 0 ? 'down' : 'up',
        },
        {
            label: 'Ready for Pickup',
            value: readyTickets,
            icon: CheckCircle,
            color: 'green',
            trend: `${readyTickets} orders`,
            trendDirection: 'up',
        },
    ];
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: stats.map((stat) => {
            const Icon = stat.icon;
            return (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: `p-2 rounded-lg bg-${stat.color}-100`, children: _jsx(Icon, { className: `h-5 w-5 text-${stat.color}-600` }) }), stat.trendDirection === 'up' && (_jsx(TrendingUp, { className: "h-4 w-4 text-green-600" })), stat.trendDirection === 'down' && (_jsx(TrendingUp, { className: "h-4 w-4 text-red-600 rotate-180" }))] }), _jsxs("div", { className: "space-y-1", children: [_jsx("p", { className: "text-2xl font-bold text-gray-900", children: stat.value }), _jsx("p", { className: "text-sm text-gray-600 font-medium", children: stat.label }), _jsx("p", { className: `text-xs ${stat.trendDirection === 'up'
                                    ? 'text-green-600'
                                    : stat.trendDirection === 'down'
                                        ? 'text-red-600'
                                        : 'text-gray-500'}`, children: stat.trend })] })] }, stat.label));
        }) }));
}
