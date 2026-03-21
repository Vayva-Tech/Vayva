'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { AlertTriangle, Package, Clock, CheckCircle } from 'lucide-react';
/**
 * EightySixBoard Component
 *
 * Displays out-of-stock items and inventory alerts
 */
export function EightySixBoard({ designCategory = 'signature', industry = 'food', planTier = 'standard' }) {
    const [showAddModal, setShowAddModal] = useState(false);
    // Mock data - would come from API in real implementation
    const eightySixItems = [
        {
            id: '86_1',
            itemName: 'Lobster Tail',
            reason: 'out_of_stock',
            quantityRemaining: 0,
            estimatedRestock: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
            reportedAt: new Date(),
            status: 'active',
        },
        {
            id: '86_2',
            itemName: 'Sea Bass',
            reason: 'low_stock',
            quantityRemaining: 3,
            estimatedRestock: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
            reportedAt: new Date(),
            status: 'active',
        },
        {
            id: '86_3',
            itemName: 'Avocado',
            reason: 'low_stock',
            quantityRemaining: 12,
            estimatedRestock: new Date(Date.now() + 6 * 60 * 60 * 1000),
            reportedAt: new Date(),
            status: 'active',
        },
    ];
    const getReasonIcon = (reason) => {
        switch (reason) {
            case 'out_of_stock':
                return _jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" });
            case 'low_stock':
                return _jsx(Package, { className: "h-5 w-5 text-yellow-600" });
            case 'quality_issue':
                return _jsx(AlertTriangle, { className: "h-5 w-5 text-orange-600" });
            default:
                return _jsx(Package, { className: "h-5 w-5 text-gray-600" });
        }
    };
    const getReasonColor = (reason) => {
        switch (reason) {
            case 'out_of_stock':
                return 'red';
            case 'low_stock':
                return 'yellow';
            case 'quality_issue':
                return 'orange';
            default:
                return 'gray';
        }
    };
    const formatRestockTime = (date) => {
        const hours = Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60)));
        if (hours <= 0)
            return 'Any minute now';
        if (hours < 24)
            return `In ${hours}h`;
        return `In ${Math.floor(hours / 24)}d ${hours % 24}h`;
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-gray-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "86 Board" })] }), _jsx("button", { onClick: () => setShowAddModal(true), className: "px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors", children: "Add Item" })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-semibold text-gray-900 mb-3 flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), "Currently 86'd (", eightySixItems.filter(i => i.reason === 'out_of_stock').length, ")"] }), _jsxs("div", { className: "space-y-3", children: [eightySixItems
                                        .filter(item => item.reason === 'out_of_stock')
                                        .map(item => (_jsxs("div", { className: "flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg", children: [_jsxs("div", { className: "flex items-start gap-2", children: [getReasonIcon(item.reason), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-red-900", children: item.itemName }), _jsxs("p", { className: "text-xs text-red-700 mt-1", children: ["Expected: ", formatRestockTime(item.estimatedRestock)] })] })] }), _jsx("button", { className: "text-red-600 hover:text-red-800", children: _jsx(CheckCircle, { className: "h-4 w-4" }) })] }, item.id))), eightySixItems.filter(i => i.reason === 'out_of_stock').length === 0 && (_jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "All items in stock \u2705" }))] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-semibold text-gray-900 mb-3 flex items-center gap-2", children: [_jsx(Package, { className: "h-4 w-4 text-yellow-600" }), "Running Low (", eightySixItems.filter(i => i.reason === 'low_stock').length, ")"] }), _jsxs("div", { className: "space-y-3", children: [eightySixItems
                                        .filter(item => item.reason === 'low_stock')
                                        .map(item => (_jsxs("div", { className: "flex items-start justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg", children: [_jsxs("div", { className: "flex items-start gap-2", children: [getReasonIcon(item.reason), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-yellow-900", children: item.itemName }), _jsxs("p", { className: "text-xs text-yellow-700 mt-1", children: [item.quantityRemaining, " left \u2022 Restock: ", formatRestockTime(item.estimatedRestock)] })] })] }), _jsx("button", { className: "text-yellow-600 hover:text-yellow-800", children: _jsx(CheckCircle, { className: "h-4 w-4" }) })] }, item.id))), eightySixItems.filter(i => i.reason === 'low_stock').length === 0 && (_jsx("p", { className: "text-sm text-gray-500 text-center py-4", children: "No low stock alerts \u2705" }))] })] })] }), _jsxs("div", { className: "border border-gray-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-semibold text-gray-900 mb-3 flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-blue-600" }), "Expected Restocks"] }), _jsx("div", { className: "space-y-2", children: eightySixItems.map(item => (_jsxs("div", { className: "flex items-center justify-between p-2 hover:bg-gray-50 rounded", children: [_jsx("span", { className: "text-sm text-gray-700", children: item.itemName }), _jsx("span", { className: "text-xs font-medium text-blue-600", children: formatRestockTime(item.estimatedRestock) })] }, item.id))) })] })] }));
}
