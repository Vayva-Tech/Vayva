'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { TicketCard } from './TicketCard';
import { StationFilter } from './StationFilter';
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';
import { ChefHat, AlertTriangle } from 'lucide-react';
/**
 * ActiveTicketsByStation Component
 *
 * Displays all active kitchen tickets organized by station
 * with real-time updates and timer tracking
 */
export function ActiveTicketsByStation({ _designCategory = 'signature', _industry = 'food', _planTier = 'standard' }) {
    const { tickets, stations, isLoading, error } = useRealTimeKDS();
    const [selectedStation, setSelectedStation] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    // Filter tickets by selected station
    const filteredTickets = selectedStation === 'all'
        ? tickets
        : tickets.filter(ticket => ticket.stationId === selectedStation);
    // Group tickets by urgency
    const urgentTickets = filteredTickets.filter(t => t.priority === 'urgent' || t.status === 'overdue');
    const normalTickets = filteredTickets.filter(t => t.priority !== 'urgent' && t.status !== 'overdue');
    if (isLoading) {
        return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Active Tickets" }), _jsx("div", { className: "animate-pulse h-8 w-32 bg-gray-200 rounded" })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "h-48 bg-gray-100 rounded-lg animate-pulse" }, i))) })] }));
    }
    if (error) {
        return (_jsxs("div", { className: "p-4 bg-red-50 border border-red-200 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2 text-red-800", children: [_jsx(AlertTriangle, { className: "h-5 w-5" }), _jsx("p", { className: "font-medium", children: "Failed to load tickets" })] }), _jsx("p", { className: "text-sm text-red-600 mt-2", children: error.message })] }));
    }
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex flex-col sm:flex-row sm:items-center justify-between gap-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ChefHat, { className: "h-5 w-5 text-gray-600" }), _jsxs("h3", { className: "text-lg font-semibold", children: ["Active Tickets (", filteredTickets.length, ")"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StationFilter, { stations: stations, selectedStation: selectedStation, onChange: setSelectedStation }), _jsx("button", { onClick: () => setViewMode(viewMode === 'grid' ? 'list' : 'grid'), className: "px-3 py-1.5 text-sm border rounded hover:bg-gray-50 transition-colors", children: viewMode === 'grid' ? 'List View' : 'Grid View' })] })] }), urgentTickets.length > 0 && (_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center gap-2 text-red-600", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsx("span", { className: "text-sm font-semibold", children: "Requires Immediate Attention" })] }), _jsx("div", { className: viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-2', children: urgentTickets.map(ticket => (_jsx(TicketCard, { ticket: ticket, variant: "compact", showUrgencyIndicator: true }, ticket.id))) })] })), normalTickets.length > 0 && (_jsx("div", { className: viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-2', children: normalTickets.map(ticket => (_jsx(TicketCard, { ticket: ticket, variant: viewMode === 'list' ? 'compact' : 'default' }, ticket.id))) })), filteredTickets.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(ChefHat, { className: "h-12 w-12 mx-auto text-gray-300 mb-3" }), _jsx("p", { className: "text-gray-500 font-medium", children: "No active tickets" }), _jsx("p", { className: "text-sm text-gray-400 mt-1", children: selectedStation !== 'all'
                            ? 'Select a different station or wait for new orders'
                            : 'All caught up!' })] }))] }));
}
