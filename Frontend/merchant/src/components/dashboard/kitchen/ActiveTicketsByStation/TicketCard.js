'use client';
import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { TimerDisplay } from '../shared/TimerDisplay';
import { StatusBadge } from '../shared/StatusBadge';
import { CheckCircle, AlertTriangle } from 'lucide-react';
/**
 * TicketCard Component
 *
 * Displays individual kitchen ticket with timer and actions
 */
export function TicketCard({ ticket, variant = 'default', showUrgencyIndicator = false, onBump, onComplete, onVoid, }) {
    const isUrgent = ticket.priority === 'urgent' || ticket.status === 'overdue';
    const isCompact = variant === 'compact';
    return (_jsxs("div", { className: `
        bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow
        ${isUrgent ? 'border-red-300 bg-red-50' : 'border-gray-200'}
        ${showUrgencyIndicator ? 'animate-pulse' : ''}
      `, children: [_jsxs("div", { className: `flex items-start justify-between ${isCompact ? 'p-3' : 'p-4'} border-b`, children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("h4", { className: "font-bold text-lg", children: ["#", ticket.ticketNumber] }), _jsx(StatusBadge, { status: ticket.status })] }), _jsxs("p", { className: "text-sm text-gray-500 mt-1", children: [ticket.type, " \u2022 Table ", ticket.tableNumber || 'N/A'] })] }), _jsx(TimerDisplay, { startTime: new Date(ticket.createdAt), targetTime: new Date(ticket.targetTime), size: isCompact ? 'small' : 'medium' })] }), _jsx("div", { className: `${isCompact ? 'p-3' : 'p-4'}`, children: _jsx("ul", { className: "space-y-2", children: ticket.items.map((item, _index) => (_jsxs("li", { className: "flex items-start gap-2", children: [_jsxs("span", { className: "font-semibold text-gray-700 min-w-[24px]", children: [item.quantity, "x"] }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-gray-900", children: item.name }), item.modifiers && item.modifiers.length > 0 && (_jsx("p", { className: "text-xs text-gray-500 mt-0.5", children: item.modifiers.map(m => m.value).join(', ') })), item.specialInstructions && (_jsxs("p", { className: "text-xs text-red-600 font-medium mt-1 flex items-center gap-1", children: [_jsx(AlertTriangle, { className: "h-3 w-3" }), item.specialInstructions] }))] }), item.status === 'completed' && (_jsx(CheckCircle, { className: "h-5 w-5 text-green-500 flex-shrink-0" }))] }, item.id))) }) }), !isCompact && (_jsxs("div", { className: "flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 border-t rounded-b-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("button", { onClick: () => onBump?.(ticket.id), className: "px-3 py-1.5 text-sm font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors", children: "Bump" }), _jsx("button", { onClick: () => onComplete?.(ticket.id), className: "px-3 py-1.5 text-sm font-medium bg-green-600 text-white rounded hover:bg-green-700 transition-colors", children: "Complete" })] }), _jsx("button", { onClick: () => onVoid?.(ticket.id, 'Other'), className: "px-3 py-1.5 text-sm font-medium text-red-600 border border-red-200 rounded hover:bg-red-50 transition-colors", children: "Void" })] }))] }));
}
