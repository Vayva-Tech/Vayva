'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';
import { Activity, Clock, AlertTriangle } from 'lucide-react';
/**
 * StationWorkload Component
 *
 * Visualizes workload distribution across kitchen stations
 */
export function StationWorkload({ _designCategory = 'signature', _industry = 'food', _planTier = 'standard' }) {
    const { stations } = useRealTimeKDS();
    const getWorkloadLevel = (queueLength, maxCapacity = 10) => {
        const percentage = (queueLength / maxCapacity) * 100;
        if (percentage > 80)
            return { level: 'high', color: 'red' };
        if (percentage > 50)
            return { level: 'medium', color: 'yellow' };
        return { level: 'low', color: 'green' };
    };
    const getStatusBadge = (station) => {
        const workload = getWorkloadLevel(station.queueLength || 0);
        if (!station.isActive) {
            return { text: 'Offline', color: 'gray' };
        }
        if (workload.level === 'high') {
            return { text: 'Overwhelmed', color: 'red' };
        }
        if (workload.level === 'medium') {
            return { text: 'Busy', color: 'yellow' };
        }
        return { text: 'Clear', color: 'green' };
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "Station Workload" })] }), _jsxs("span", { className: "text-sm text-gray-500", children: [stations.filter(s => s.isActive).length, " active stations"] })] }), _jsx("div", { className: "space-y-3", children: stations.map((station) => {
                    const status = getStatusBadge(station);
                    const workload = getWorkloadLevel(station.queueLength || 0);
                    return (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900", children: station.name }), _jsxs("p", { className: "text-sm text-gray-500 capitalize", children: [station.type, " Station"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-800`, children: status.text }), !station.isActive && (_jsx(AlertTriangle, { className: "h-4 w-4 text-gray-400" }))] })] }), _jsxs("div", { className: "mt-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm mb-1", children: [_jsxs("span", { className: "text-gray-600", children: [station.queueLength || 0, " items in queue"] }), _jsxs("span", { className: "text-gray-500", children: ["Backlog: ~", station.avgCookTime || 12, " min"] })] }), _jsx("div", { className: "w-full h-3 bg-gray-100 rounded-full overflow-hidden", children: _jsx("div", { className: `h-full bg-gradient-to-r from-${workload.color}-400 to-${workload.color}-600 transition-all duration-500`, style: { width: `${Math.min((station.queueLength || 0) / 10 * 100, 100)}%` } }) })] }), _jsxs("div", { className: "mt-3 flex items-center gap-4 text-xs text-gray-500", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-3 w-3" }), _jsxs("span", { children: ["Avg: ", (station.avgCookTime || 0).toFixed(1), " min"] })] }), _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Activity, { className: "h-3 w-3" }), _jsxs("span", { children: ["Efficiency: ", station.efficiency || 100, "%"] })] })] })] }, station.id));
                }) }), stations.length === 0 && (_jsxs("div", { className: "text-center py-12", children: [_jsx(Activity, { className: "h-12 w-12 mx-auto text-gray-300 mb-3" }), _jsx("p", { className: "text-gray-500 font-medium", children: "No stations configured" }), _jsx("p", { className: "text-sm text-gray-400 mt-1", children: "Set up your kitchen stations to begin tracking" })] }))] }));
}
