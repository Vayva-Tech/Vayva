'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Brain, AlertTriangle, TrendingDown, Clock, Package } from 'lucide-react';
/**
 * Smart86Predictions Component
 *
 * AI-powered predictions for items likely to run out:
 * - Current inventory levels
 * - Consumption rate analysis
 * - Delivery schedule integration
 * - Historical depletion patterns
 */
export function Smart86Predictions({ designCategory = 'signature', industry = 'food', planTier = 'standard' }) {
    const [timeHorizon, setTimeHorizon] = useState('8h');
    // Mock AI predictions - would integrate with inventory ML service
    const predictions = [
        {
            id: 'pred_1',
            itemId: 'item_salmon',
            itemName: 'Fresh Salmon Fillet',
            currentStock: 8,
            unit: 'lbs',
            predictedDepletionTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
            confidence: 94,
            consumptionRate: 1.6, // lbs per hour
            nextDelivery: new Date(Date.now() + 30 * 60 * 60 * 1000), // 30 hours
            menuItems: ['Grilled Salmon', 'Salmon Teriyaki', 'Fish & Chips'],
            urgency: 'critical',
            recommendation: 'Order immediately or reduce portion sizes',
        },
        {
            id: 'pred_2',
            itemId: 'item_avocado',
            itemName: 'Hass Avocados',
            currentStock: 24,
            unit: 'units',
            predictedDepletionTime: new Date(Date.now() + 7 * 60 * 60 * 1000), // 7 hours
            confidence: 88,
            consumptionRate: 3.4, // units per hour
            nextDelivery: new Date(Date.now() + 18 * 60 * 60 * 1000), // 18 hours
            menuItems: ['Avocado Toast', 'Caesar Salad', 'Burger Deluxe'],
            urgency: 'high',
            recommendation: 'Place order today, consider 86\'ing by dinner',
        },
        {
            id: 'pred_3',
            itemId: 'item_ribeye',
            itemName: 'Ribeye Steaks (12oz)',
            currentStock: 18,
            unit: 'portions',
            predictedDepletionTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours
            confidence: 82,
            consumptionRate: 1.5, // portions per hour
            nextDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            menuItems: ['Ribeye Steak', 'Surf & Turf'],
            urgency: 'medium',
            recommendation: 'Monitor closely during dinner rush',
        },
        {
            id: 'pred_4',
            itemId: 'item_burrata',
            itemName: 'Burrata Cheese',
            currentStock: 6,
            unit: 'balls',
            predictedDepletionTime: new Date(Date.now() + 9 * 60 * 60 * 1000),
            confidence: 76,
            consumptionRate: 0.67, // balls per hour
            nextDelivery: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
            menuItems: ['Caprese Salad', 'Burrata Appetizer'],
            urgency: 'medium',
            recommendation: 'Consider limiting to lunch service only',
        },
    ];
    const getUrgencyColor = (urgency) => {
        switch (urgency) {
            case 'critical': return 'text-red-600 bg-red-50 border-red-200';
            case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
            default: return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };
    const formatTimeUntil = (date) => {
        const hours = Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60)));
        if (hours <= 0)
            return '< 1 hour';
        if (hours < 24)
            return `~${hours}h`;
        return `~${Math.floor(hours / 24)}d ${hours % 24}h`;
    };
    const filteredPredictions = predictions.filter(pred => {
        const hoursUntilDepletion = (pred.predictedDepletionTime.getTime() - Date.now()) / (1000 * 60 * 60);
        switch (timeHorizon) {
            case '4h': return hoursUntilDepletion <= 4;
            case '8h': return hoursUntilDepletion <= 8;
            case '24h': return hoursUntilDepletion <= 24;
            default: return true;
        }
    });
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5 text-purple-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "Smart 86 Predictions" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full", children: "AI Powered" }), _jsxs("select", { value: timeHorizon, onChange: (e) => setTimeHorizon(e.target.value), className: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500", children: [_jsx("option", { value: "4h", children: "Next 4 Hours" }), _jsx("option", { value: "8h", children: "Next 8 Hours" }), _jsx("option", { value: "24h", children: "Next 24 Hours" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" }), _jsx("span", { className: "text-sm font-medium text-red-900", children: "Critical Risk" })] }), _jsx("p", { className: "text-2xl font-bold text-red-900", children: predictions.filter(p => p.urgency === 'critical').length }), _jsx("p", { className: "text-xs text-red-700 mt-1", children: "Items likely to deplete soon" })] }), _jsxs("div", { className: "bg-orange-50 border border-orange-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Clock, { className: "h-5 w-5 text-orange-600" }), _jsx("span", { className: "text-sm font-medium text-orange-900", children: "High Risk" })] }), _jsx("p", { className: "text-2xl font-bold text-orange-900", children: predictions.filter(p => p.urgency === 'high').length }), _jsx("p", { className: "text-xs text-orange-700 mt-1", children: "Monitor closely" })] }), _jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Package, { className: "h-5 w-5 text-blue-600" }), _jsx("span", { className: "text-sm font-medium text-blue-900", children: "Menu Impact" })] }), _jsx("p", { className: "text-2xl font-bold text-blue-900", children: new Set(predictions.flatMap(p => p.menuItems)).size }), _jsx("p", { className: "text-xs text-blue-700 mt-1", children: "Menu items at risk" })] })] }), _jsxs("div", { className: "space-y-3", children: [filteredPredictions.map((prediction) => (_jsxs("div", { className: `border rounded-lg p-4 ${getUrgencyColor(prediction.urgency)}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { className: "flex items-start gap-3", children: [_jsx("div", { className: "mt-1", children: _jsx(TrendingDown, { className: `h-5 w-5 ${prediction.urgency === 'critical' ? 'text-red-600' :
                                                        prediction.urgency === 'high' ? 'text-orange-600' :
                                                            'text-yellow-600'}` }) }), _jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900", children: prediction.itemName }), _jsxs("div", { className: "flex items-center gap-3 mt-1 text-sm", children: [_jsxs("span", { children: ["Current: ", _jsxs("strong", { children: [prediction.currentStock, " ", prediction.unit] })] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Rate: ", prediction.consumptionRate.toFixed(2), " ", prediction.unit, "/hr"] }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Confidence: ", _jsxs("strong", { children: [prediction.confidence, "%"] })] })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-xs text-gray-600 mb-1", children: "Depletion in:" }), _jsx("p", { className: "text-xl font-bold", children: formatTimeUntil(prediction.predictedDepletionTime) })] })] }), _jsxs("div", { className: "mb-3", children: [_jsx("p", { className: "text-xs text-gray-600 mb-1", children: "Menu items affected:" }), _jsx("div", { className: "flex flex-wrap gap-2", children: prediction.menuItems.map((item, index) => (_jsx("span", { className: "px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-700", children: item }, index))) })] }), _jsxs("div", { className: "bg-white/50 border border-gray-200 rounded-lg p-3", children: [_jsx("p", { className: "text-xs text-gray-600 mb-1", children: "AI Recommendation:" }), _jsx("p", { className: "text-sm font-medium text-gray-900", children: prediction.recommendation })] }), _jsxs("div", { className: "flex items-center gap-2 mt-3", children: [_jsx("button", { className: "px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors", children: "Add to 86 Board" }), _jsx("button", { className: "px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50 transition-colors", children: "Adjust Prediction" }), _jsx("button", { className: "px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors", children: "Order More" })] })] }, prediction.id))), filteredPredictions.length === 0 && (_jsxs("div", { className: "text-center py-12 bg-green-50 border border-green-200 rounded-lg", children: [_jsx(Package, { className: "h-12 w-12 mx-auto text-green-600 mb-3" }), _jsx("p", { className: "text-green-900 font-semibold", children: "All Stock Levels Healthy!" }), _jsxs("p", { className: "text-sm text-green-700 mt-1", children: ["No items predicted to run out in the next ", timeHorizon] })] }))] })] }));
}
