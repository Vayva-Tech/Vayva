'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Filter } from 'lucide-react';
/**
 * StationFilter Component
 *
 * Dropdown filter for selecting kitchen station
 */
export function StationFilter({ stations, selectedStation, onChange, }) {
    return (_jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400", children: _jsx(Filter, { className: "h-4 w-4" }) }), _jsxs("select", { value: selectedStation, onChange: (e) => onChange(e.target.value), className: "pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow", children: [_jsx("option", { value: "all", children: "All Stations" }), stations.map(station => (_jsxs("option", { value: station.id, children: [station.name, " (", station.tickets?.length || 0, ")"] }, station.id)))] })] }));
}
