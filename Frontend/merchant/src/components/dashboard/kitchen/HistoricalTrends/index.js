'use client';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';
/**
 * HistoricalTrends Component
 *
 * Displays historical analytics and trends for kitchen operations
 */
export function HistoricalTrends({ _designCategory = 'signature', _industry = 'food', _planTier = 'standard' }) {
    const [timeRange, setTimeRange] = useState('30d');
    const [metric, setMetric] = useState('ticket-times');
    // Mock historical data - would come from API
    const trendsData = {
        'ticket-times': {
            currentValue: 12.5,
            previousValue: 14.2,
            change: -11.97,
            trend: 'down', // down is good for ticket times
            data: [
                { date: 'Week 1', value: 15.2 },
                { date: 'Week 2', value: 14.8 },
                { date: 'Week 3', value: 13.5 },
                { date: 'Week 4', value: 12.5 },
            ],
            goal: 10,
        },
        accuracy: {
            currentValue: 96.8,
            previousValue: 94.2,
            change: 2.76,
            trend: 'up',
            data: [
                { date: 'Week 1', value: 93.5 },
                { date: 'Week 2', value: 94.8 },
                { date: 'Week 3', value: 95.5 },
                { date: 'Week 4', value: 96.8 },
            ],
            goal: 98,
        },
        efficiency: {
            currentValue: 88.5,
            previousValue: 85.3,
            change: 3.75,
            trend: 'up',
            data: [
                { date: 'Week 1', value: 84.2 },
                { date: 'Week 2', value: 86.5 },
                { date: 'Week 3', value: 87.8 },
                { date: 'Week 4', value: 88.5 },
            ],
            goal: 90,
        },
    };
    const currentData = trendsData[metric];
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "Historical Trends" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("select", { value: metric, onChange: (e) => setMetric(e.target.value), className: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500", children: [_jsx("option", { value: "ticket-times", children: "Ticket Times" }), _jsx("option", { value: "accuracy", children: "Order Accuracy" }), _jsx("option", { value: "efficiency", children: "Station Efficiency" })] }), _jsx("div", { className: "flex bg-gray-100 rounded-lg p-1", children: ['7d', '30d', '90d'].map((range) => (_jsx("button", { onClick: () => setTimeRange(range), className: `px-3 py-1 text-xs font-medium rounded-md transition-colors ${timeRange === range
                                        ? 'bg-white text-gray-900 shadow-sm'
                                        : 'text-gray-600 hover:text-gray-900'}`, children: range }, range))) })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Current Average" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [currentData.currentValue.toFixed(1), metric === 'ticket-times' ? ' min' : '%'] }), _jsxs("div", { className: `flex items-center gap-1 mt-2 ${currentData.trend === 'up' ? 'text-green-600' : 'text-red-600'}`, children: [currentData.trend === 'up' ? (_jsx(TrendingUp, { className: "h-4 w-4" })) : (_jsx(TrendingDown, { className: "h-4 w-4" })), _jsxs("span", { className: "text-sm font-medium", children: [currentData.change > 0 ? '+' : '', currentData.change.toFixed(1), "% vs last period"] })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Previous Average" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [currentData.previousValue.toFixed(1), metric === 'ticket-times' ? ' min' : '%'] }), _jsxs("p", { className: "text-xs text-gray-500 mt-2", children: ["Last ", timeRange] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Goal" }), _jsxs("p", { className: "text-2xl font-bold text-blue-600", children: [currentData.goal, metric === 'ticket-times' ? ' min' : '%'] }), _jsx("p", { className: "text-xs text-gray-500 mt-2", children: "Target" })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsx("h4", { className: "font-semibold text-gray-900 mb-4", children: "Performance Over Time" }), _jsx("div", { className: "space-y-4", children: currentData.data.map((point, index) => {
                            const percentage = (point.value / Math.max(...currentData.data.map(d => d.value))) * 100;
                            const isImproving = index > 0 && point.value < currentData.data[index - 1].value;
                            return (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-700 font-medium", children: point.date }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("span", { className: "text-gray-900 font-semibold", children: [point.value.toFixed(1), metric === 'ticket-times' ? ' min' : '%'] }), index > 0 && (_jsx("span", { className: `text-xs ${isImproving ? 'text-green-600' : 'text-red-600'}`, children: isImproving ? '↓' : '↑' }))] })] }), _jsx("div", { className: "w-full h-3 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full rounded-full transition-all duration-500 ${metric === 'ticket-times'
                                                ? 'bg-gradient-to-r from-blue-400 to-blue-600'
                                                : isImproving
                                                    ? 'bg-gradient-to-r from-green-400 to-green-600'
                                                    : 'bg-gradient-to-r from-yellow-400 to-yellow-600'}`, style: { width: `${percentage}%` } }) })] }, point.date));
                        }) })] }), _jsx("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: _jsxs("div", { className: "flex items-start gap-3", children: [_jsx(Calendar, { className: "h-5 w-5 text-blue-600 mt-0.5" }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-blue-900 mb-1", children: "Performance Insight" }), _jsxs("p", { className: "text-sm text-blue-800", children: [metric === 'ticket-times' && (_jsxs(_Fragment, { children: ["Ticket times have improved by ", currentData.change.toFixed(1), "% over the last ", timeRange, ". At this rate, you'll reach your goal of ", currentData.goal, " minutes in approximately 2 weeks."] })), metric === 'accuracy' && (_jsxs(_Fragment, { children: ["Order accuracy is trending upward! You're ", currentData.goal - currentData.currentValue, "% away from your goal. Consider implementing double-check procedures during rush hours."] })), metric === 'efficiency' && (_jsxs(_Fragment, { children: ["Station efficiency has improved consistently. The kitchen is operating at ", currentData.currentValue, "% capacity, which is excellent for ", timeRange === '7d' ? 'this week' : 'this period', "."] }))] })] })] }) })] }));
}
