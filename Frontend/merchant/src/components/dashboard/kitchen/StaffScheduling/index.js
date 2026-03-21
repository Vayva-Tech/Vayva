'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Calendar, Clock, Users, TrendingUp, AlertTriangle } from 'lucide-react';
/**
 * StaffSchedulingOptimization Component
 *
 * AI-powered staff scheduling recommendations based on:
 * - Historical traffic patterns
 * - Predicted order volume
 * - Staff skill levels
 * - Labor cost optimization
 * - Compliance with labor laws
 */
export function StaffSchedulingOptimization({ _designCategory = 'signature', _industry = 'food', _planTier = 'standard' }) {
    const [viewMode, setViewMode] = useState('week');
    const [selectedDate, setSelectedDate] = useState(new Date());
    // Mock AI recommendations - would integrate with ML service
    const scheduleRecommendations = {
        monday: {
            date: 'Next Monday',
            predictedOrders: 145,
            busyLevel: 'medium',
            recommendedStaff: [
                { role: 'Head Chef', count: 1, hours: 8, skill: 'expert', shift: 'All day' },
                { role: 'Sous Chef', count: 1, hours: 8, skill: 'advanced', shift: 'All day' },
                { role: 'Line Cook', count: 2, hours: 6, skill: 'intermediate', shift: 'Lunch + Dinner' },
                { role: 'Prep Cook', count: 1, hours: 4, skill: 'basic', shift: 'Morning prep' },
                { role: 'Dishwasher', count: 1, hours: 8, skill: 'entry', shift: 'All day' },
            ],
            laborCost: 1280,
            laborCostPercentage: 28.5,
            peakHours: ['12:00-13:30', '18:30-20:30'],
            notes: 'Standard Monday - maintain baseline staffing',
        },
        tuesday: {
            date: 'Next Tuesday',
            predictedOrders: 138,
            busyLevel: 'low',
            recommendedStaff: [
                { role: 'Head Chef', count: 1, hours: 8, skill: 'expert', shift: 'All day' },
                { role: 'Line Cook', count: 2, hours: 6, skill: 'intermediate', shift: 'Lunch + Dinner' },
                { role: 'Prep Cook', count: 1, hours: 4, skill: 'basic', shift: 'Morning' },
                { role: 'Dishwasher', count: 1, hours: 6, skill: 'entry', shift: 'Peak hours' },
            ],
            laborCost: 1050,
            laborCostPercentage: 26.2,
            peakHours: ['12:00-13:00', '19:00-20:00'],
            notes: 'Slow day - reduce evening staff by 1',
        },
        wednesday: {
            date: 'Next Wednesday',
            predictedOrders: 165,
            busyLevel: 'medium',
            recommendedStaff: [
                { role: 'Head Chef', count: 1, hours: 8, skill: 'expert', shift: 'All day' },
                { role: 'Sous Chef', count: 1, hours: 8, skill: 'advanced', shift: 'All day' },
                { role: 'Line Cook', count: 3, hours: 8, skill: 'intermediate', shift: 'Full day' },
                { role: 'Prep Cook', count: 1, hours: 6, skill: 'basic', shift: 'Extended prep' },
                { role: 'Dishwasher', count: 1, hours: 8, skill: 'entry', shift: 'All day' },
            ],
            laborCost: 1420,
            laborCostPercentage: 29.1,
            peakHours: ['12:00-14:00', '18:00-21:00'],
            notes: 'Mid-week rush expected - add extra line cook',
        },
        thursday: {
            date: 'Next Thursday',
            predictedOrders: 178,
            busyLevel: 'high',
            recommendedStaff: [
                { role: 'Head Chef', count: 1, hours: 8, skill: 'expert', shift: 'All day' },
                { role: 'Sous Chef', count: 1, hours: 8, skill: 'advanced', shift: 'All day' },
                { role: 'Line Cook', count: 3, hours: 8, skill: 'intermediate', shift: 'Full day' },
                { role: 'Prep Cook', count: 2, hours: 6, skill: 'basic', shift: 'Double prep' },
                { role: 'Expo', count: 1, hours: 6, skill: 'advanced', shift: 'Dinner rush' },
                { role: 'Dishwasher', count: 2, hours: 8, skill: 'entry', shift: 'Split shifts' },
            ],
            laborCost: 1680,
            laborCostPercentage: 30.5,
            peakHours: ['12:00-14:00', '18:30-21:30'],
            notes: 'Thursday surge - full team required',
        },
        friday: {
            date: 'Next Friday',
            predictedOrders: 245,
            busyLevel: 'very_high',
            recommendedStaff: [
                { role: 'Head Chef', count: 1, hours: 8, skill: 'expert', shift: 'All day' },
                { role: 'Sous Chef', count: 2, hours: 8, skill: 'advanced', shift: 'Split coverage' },
                { role: 'Line Cook', count: 4, hours: 8, skill: 'intermediate', shift: 'Full day' },
                { role: 'Prep Cook', count: 2, hours: 8, skill: 'basic', shift: 'Heavy prep' },
                { role: 'Expo', count: 1, hours: 8, skill: 'advanced', shift: 'All day' },
                { role: 'Dishwasher', count: 2, hours: 8, skill: 'entry', shift: 'All day' },
            ],
            laborCost: 2150,
            laborCostPercentage: 31.2,
            peakHours: ['12:00-14:00', '18:00-22:00'],
            notes: 'Friday night rush - maximum staffing',
        },
        saturday: {
            date: 'Next Saturday',
            predictedOrders: 268,
            busyLevel: 'very_high',
            recommendedStaff: [
                { role: 'Head Chef', count: 1, hours: 8, skill: 'expert', shift: 'All day' },
                { role: 'Sous Chef', count: 2, hours: 8, skill: 'advanced', shift: 'Split coverage' },
                { role: 'Line Cook', count: 5, hours: 8, skill: 'intermediate', shift: 'Full day' },
                { role: 'Prep Cook', count: 2, hours: 8, skill: 'basic', shift: 'Heavy prep' },
                { role: 'Expo', count: 1, hours: 8, skill: 'advanced', shift: 'All day' },
                { role: 'Dishwasher', count: 3, hours: 8, skill: 'entry', shift: 'Triple coverage' },
            ],
            laborCost: 2380,
            laborCostPercentage: 32.1,
            peakHours: ['11:30-14:30', '17:30-22:30'],
            notes: 'Busiest day - all hands on deck',
        },
        sunday: {
            date: 'Next Sunday',
            predictedOrders: 198,
            busyLevel: 'high',
            recommendedStaff: [
                { role: 'Head Chef', count: 1, hours: 8, skill: 'expert', shift: 'All day' },
                { role: 'Sous Chef', count: 1, hours: 8, skill: 'advanced', shift: 'All day' },
                { role: 'Line Cook', count: 3, hours: 8, skill: 'intermediate', shift: 'Full day' },
                { role: 'Prep Cook', count: 1, hours: 6, skill: 'basic', shift: 'Brunch prep' },
                { role: 'Expo', count: 1, hours: 6, skill: 'advanced', shift: 'Brunch rush' },
                { role: 'Dishwasher', count: 2, hours: 8, skill: 'entry', shift: 'All day' },
            ],
            laborCost: 1820,
            laborCostPercentage: 30.8,
            peakHours: ['11:00-14:00', '17:00-20:00'],
            notes: 'Sunday brunch + dinner - moderate staffing',
        },
    };
    const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const weeklyTotals = {
        totalOrders: Object.values(scheduleRecommendations).reduce((sum, day) => sum + day.predictedOrders, 0),
        totalLaborCost: Object.values(scheduleRecommendations).reduce((sum, day) => sum + day.laborCost, 0),
        avgLaborCostPercentage: Object.values(scheduleRecommendations).reduce((sum, day) => sum + day.laborCostPercentage, 0) / 7,
    };
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5 text-blue-600" }), _jsx("h3", { className: "text-lg font-semibold", children: "Staff Scheduling Optimization" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full", children: "AI Powered" }), _jsxs("div", { className: "flex bg-gray-100 rounded-lg p-1", children: [_jsx("button", { onClick: () => setViewMode('day'), className: `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'day'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'}`, children: "Day" }), _jsx("button", { onClick: () => setViewMode('week'), className: `px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${viewMode === 'week'
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-600 hover:text-gray-900'}`, children: "Week" })] })] })] }), viewMode === 'week' && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-4", children: [_jsxs("div", { className: "bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx(Users, { className: "h-5 w-5 text-blue-600" }), _jsx(TrendingUp, { className: "h-4 w-4 text-green-600" })] }), _jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Predicted Weekly Orders" }), _jsx("p", { className: "text-2xl font-bold text-blue-900", children: weeklyTotals.totalOrders.toLocaleString() })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsx(Clock, { className: "h-5 w-5 text-green-600" }) }), _jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Total Labor Cost" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: ["$", weeklyTotals.totalLaborCost.toLocaleString()] })] }), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("div", { className: "flex items-center justify-between mb-2", children: _jsx(AlertTriangle, { className: "h-5 w-5 text-orange-600" }) }), _jsx("p", { className: "text-sm text-gray-600 mb-1", children: "Avg Labor Cost %" }), _jsxs("p", { className: "text-2xl font-bold text-orange-900", children: [weeklyTotals.avgLaborCostPercentage.toFixed(1), "%"] })] })] })), _jsx("div", { className: "space-y-4", children: weekDays.map((day) => {
                    const dayData = scheduleRecommendations[day];
                    return (_jsxs("div", { className: "border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white", children: [_jsxs("div", { className: "flex items-start justify-between mb-3", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-semibold text-gray-900 capitalize", children: day }), _jsx("p", { className: "text-sm text-gray-600", children: dayData.date })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "flex items-center gap-2", children: _jsx("span", { className: `px-2 py-1 rounded-full text-xs font-medium ${dayData.busyLevel === 'very_high' ? 'bg-red-100 text-red-800' :
                                                        dayData.busyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                                                            dayData.busyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'}`, children: dayData.busyLevel.replace('_', ' ').toUpperCase() }) }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [dayData.predictedOrders, " orders"] })] })] }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-3 mb-3", children: dayData.recommendedStaff.map((staff, index) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: `w-2 h-2 rounded-full ${staff.skill === 'expert' ? 'bg-purple-600' :
                                                        staff.skill === 'advanced' ? 'bg-blue-600' :
                                                            staff.skill === 'intermediate' ? 'bg-green-600' :
                                                                'bg-gray-400'}` }), _jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: staff.role }), _jsx("p", { className: "text-xs text-gray-500", children: staff.shift })] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "text-sm font-semibold text-gray-900", children: [staff.count, " \u00D7 ", staff.hours, "h"] }), _jsx("p", { className: "text-xs text-gray-500 capitalize", children: staff.skill })] })] }, index))) }), _jsxs("div", { className: "flex items-center justify-between pt-3 border-t border-gray-200", children: [_jsxs("div", { className: "flex items-center gap-4 text-sm", children: [_jsxs("span", { className: "text-gray-600", children: ["Labor: ", _jsxs("strong", { className: "text-gray-900", children: ["$", dayData.laborCost] })] }), _jsxs("span", { className: "text-gray-600", children: ["Cost %: ", _jsxs("strong", { className: dayData.laborCostPercentage > 30 ? 'text-red-600' : 'text-green-600', children: [dayData.laborCostPercentage, "%"] })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4 text-gray-400" }), _jsxs("span", { className: "text-xs text-gray-600", children: ["Peak: ", dayData.peakHours.join(', ')] })] })] }), _jsx("div", { className: "mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2", children: _jsxs("p", { className: "text-xs text-blue-800", children: [_jsx("strong", { children: "AI Recommendation:" }), " ", dayData.notes] }) })] }, day));
                }) }), _jsxs("div", { className: "bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4", children: [_jsx("h4", { className: "font-semibold text-purple-900 mb-2", children: "\uD83D\uDCA1 Optimization Insights" }), _jsxs("ul", { className: "space-y-1 text-sm text-purple-800", children: [_jsx("li", { children: "\u2022 Reduce Tuesday-Wednesday staff by 15% to save $230/week" }), _jsx("li", { children: "\u2022 Add weekend prep support to improve dinner service speed" }), _jsx("li", { children: "\u2022 Consider split shifts on Friday/Saturday for cost efficiency" }), _jsx("li", { children: "\u2022 Cross-train 2 line cooks for expo duties to increase flexibility" })] })] })] }));
}
