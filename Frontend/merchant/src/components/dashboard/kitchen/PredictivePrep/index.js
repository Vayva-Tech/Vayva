'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Calendar, Clock, ChefHat } from 'lucide-react';
/**
 * PredictivePrep Component
 *
 * AI-powered prep recommendations based on:
 * - Historical sales data
 * - Weather forecasts
 * - Local events
 * - Day of week patterns
 * - Seasonal trends
 */
export function PredictivePrep({ designCategory = 'signature', industry = 'food', planTier = 'standard' }) {
    const [selectedDate, setSelectedDate] = useState('today');
    // Mock AI predictions - would integrate with ML service
    const predictions = {
        today: {
            date: new Date().toLocaleDateString(),
            confidence: 92,
            busyLevel: 'high',
            expectedOrders: 180,
            peakHours: ['12:00-14:00', '19:00-21:00'],
            prepRecommendations: [
                { item: 'Grilled Chicken', quantity: 45, priority: 'high', reason: '+35% vs average' },
                { item: 'Caesar Salad', quantity: 30, priority: 'high', reason: 'Lunch rush expected' },
                { item: 'French Fries', quantity: 60, priority: 'medium', reason: 'Standard prep' },
                { item: 'Salmon Fillets', quantity: 25, priority: 'medium', reason: 'Dinner service' },
                { item: 'Beef Patties', quantity: 40, priority: 'low', reason: 'Backup stock' },
            ],
            weatherImpact: {
                condition: 'rainy',
                impact: 'Delivery orders +25%, Dine-in -15%',
            },
            localEvents: [
                { name: 'Business Conference', location: 'Convention Center', impact: '+40 lunch orders' },
            ],
        },
        tomorrow: {
            date: new Date(Date.now() + 86400000).toLocaleDateString(),
            confidence: 87,
            busyLevel: 'medium',
            expectedOrders: 145,
            peakHours: ['12:00-13:30', '18:30-20:30'],
            prepRecommendations: [
                { item: 'Grilled Chicken', quantity: 35, priority: 'medium', reason: 'Normal Tuesday' },
                { item: 'Caesar Salad', quantity: 25, priority: 'medium', reason: 'Standard prep' },
                { item: 'French Fries', quantity: 50, priority: 'low', reason: 'Standard prep' },
            ],
            weatherImpact: {
                condition: 'sunny',
                impact: 'Patio seating open, Dine-in +10%',
            },
            localEvents: [],
        },
        week: {
            date: 'Next 7 Days',
            confidence: 78,
            busyLevel: 'variable',
            expectedOrders: 1100,
            peakHours: ['Fri-Sat 19:00-22:00'],
            prepRecommendations: [
                { item: 'Weekend Special Items', quantity: 80, priority: 'high', reason: 'Weekend rush' },
                { item: 'Premium Steaks', quantity: 50, priority: 'high', reason: 'Friday/Saturday demand' },
            ],
            weatherImpact: {
                condition: 'mixed',
                impact: 'Weekend sunny, weekdays rainy',
            },
            localEvents: [
                { name: 'Food Festival', location: 'Downtown', impact: '+60% foot traffic Sat-Sun' },
                { name: 'Sports Finals', location: 'City Stadium', impact: '+30% takeout orders' },
            ],
        },
    };
    const currentPrediction = predictions[selectedDate];
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Brain, { className: "h-5 w-5 text-purple-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "Predictive Prep Recommendations" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full", children: "AI Powered" }), _jsxs("select", { value: selectedDate, onChange: (e) => setSelectedDate(e.target.value), className: "px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500", children: [_jsx("option", { value: "today", children: "Today" }), _jsx("option", { value: "tomorrow", children: "Tomorrow" }), _jsx("option", { value: "week", children: "This Week" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Calendar, { className: "h-5 w-5 text-purple-600" }), _jsxs("span", { className: "text-xs text-purple-600 font-medium", children: [currentPrediction.confidence, "% confidence"] })] }), _jsx("p", { className: "text-sm text-gray-600 mb-1", children: currentPrediction.date }), _jsxs("p", { className: "text-2xl font-bold text-purple-900", children: [currentPrediction.expectedOrders, " expected orders"] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(TrendingUp, { className: "h-5 w-5 text-blue-600" }), _jsx("span", { className: `text-xs font-medium ${currentPrediction.busyLevel === 'high' ? 'text-red-600' :
                                            currentPrediction.busyLevel === 'medium' ? 'text-yellow-600' :
                                                'text-green-600'}`, children: currentPrediction.busyLevel.toUpperCase() })] }), _jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Busy Level" }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx(Clock, { className: "h-4 w-4 text-gray-500" }), _jsxs("span", { className: "text-sm text-gray-700", children: ["Peak: ", currentPrediction.peakHours.join(', ')] })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsx(AlertTriangle, { className: "h-5 w-5 text-orange-600" }) }), _jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Weather Impact" }), _jsx("p", { className: "text-sm font-medium text-gray-900 mt-2", children: currentPrediction.weatherImpact.impact })] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-6", children: [_jsxs("h4", { className: "font-semibold text-gray-900 mb-4 flex items-center gap-2", children: [_jsx(ChefHat, { className: "h-5 w-5" }), "Recommended Prep Quantities"] }), _jsx("div", { className: "space-y-3", children: currentPrediction.prepRecommendations.map((rec, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${rec.priority === 'high' ? 'bg-red-500' :
                                                rec.priority === 'medium' ? 'bg-yellow-500' :
                                                    'bg-green-500'}` }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-gray-900", children: rec.item }), _jsx("p", { className: "text-xs text-gray-500", children: rec.reason })] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("span", { className: "text-sm text-gray-600", children: "Qty:" }), _jsx("span", { className: "text-lg font-bold text-gray-900", children: rec.quantity }), _jsx("span", { className: "text-xs text-gray-500", children: "units" })] })] }, index))) })] }), currentPrediction.localEvents.length > 0 && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-4", children: [_jsxs("h4", { className: "font-semibold text-blue-900 mb-3 flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), "Local Events Impact"] }), _jsx("div", { className: "space-y-2", children: currentPrediction.localEvents.map((event, index) => (_jsxs("div", { className: "flex items-start gap-2", children: [_jsx("span", { className: "text-blue-600 mt-1", children: "\u2022" }), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-blue-900", children: event.name }), _jsxs("p", { className: "text-sm text-blue-700", children: [event.location, " \u2192 ", _jsx("span", { className: "font-semibold", children: event.impact })] })] })] }, index))) })] }))] }));
}
