'use client';
import { Button } from "@vayva/ui";

import React, { useState } from 'react';
import { Calendar, Clock, Users, TrendingUp, AlertTriangle } from 'lucide-react';

interface StaffSchedulingProps {
  designCategory?: string;
  industry?: string;
  planTier?: string;
}

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
export function StaffSchedulingOptimization({
  designCategory = 'signature',
  industry = 'food',
  planTier = 'standard'
}: StaffSchedulingProps) {
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week');
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
    totalOrders: Object.values(scheduleRecommendations).reduce((sum, day: any) => sum + day.predictedOrders, 0),
    totalLaborCost: Object.values(scheduleRecommendations).reduce((sum, day: any) => sum + day.laborCost, 0),
    avgLaborCostPercentage: Object.values(scheduleRecommendations).reduce((sum, day: any) => sum + day.laborCostPercentage, 0) / 7,
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Staff Scheduling Optimization</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            AI Powered
          </span>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <Button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'day'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Day
            </Button>
            <Button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'week'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </Button>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-5 w-5 text-blue-600" />
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Predicted Weekly Orders</p>
            <p className="text-2xl font-bold text-blue-900">{weeklyTotals.totalOrders.toLocaleString()}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Total Labor Cost</p>
            <p className="text-2xl font-bold text-gray-900">${weeklyTotals.totalLaborCost.toLocaleString()}</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-sm text-gray-600 mb-1">Avg Labor Cost %</p>
            <p className="text-2xl font-bold text-orange-900">{weeklyTotals.avgLaborCostPercentage.toFixed(1)}%</p>
          </div>
        </div>
      )}

      {/* Daily Schedules */}
      <div className="space-y-4">
        {weekDays.map((day) => {
          const dayData = scheduleRecommendations[day as keyof typeof scheduleRecommendations];
          
          return (
            <div
              key={day}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 capitalize">{day}</h4>
                  <p className="text-sm text-gray-600">{dayData.date}</p>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      dayData.busyLevel === 'very_high' ? 'bg-red-100 text-red-800' :
                      dayData.busyLevel === 'high' ? 'bg-orange-100 text-orange-800' :
                      dayData.busyLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {dayData.busyLevel.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{dayData.predictedOrders} orders</p>
                </div>
              </div>

              {/* Staff Recommendations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {dayData.recommendedStaff.map((staff, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        staff.skill === 'expert' ? 'bg-purple-600' :
                        staff.skill === 'advanced' ? 'bg-blue-600' :
                        staff.skill === 'intermediate' ? 'bg-green-600' :
                        'bg-gray-400'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{staff.role}</p>
                        <p className="text-xs text-gray-500">{staff.shift}</p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{staff.count} × {staff.hours}h</p>
                      <p className="text-xs text-gray-500 capitalize">{staff.skill}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Metrics & Notes */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-gray-600">
                    Labor: <strong className="text-gray-900">${dayData.laborCost}</strong>
                  </span>
                  <span className="text-gray-600">
                    Cost %: <strong className={
                      dayData.laborCostPercentage > 30 ? 'text-red-600' : 'text-green-600'
                    }>{dayData.laborCostPercentage}%</strong>
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-gray-600">
                    Peak: {dayData.peakHours.join(', ')}
                  </span>
                </div>
              </div>

              {/* AI Note */}
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-2">
                <p className="text-xs text-blue-800">
                  <strong>AI Recommendation:</strong> {dayData.notes}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optimization Tips */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <h4 className="font-semibold text-purple-900 mb-2">💡 Optimization Insights</h4>
        <ul className="space-y-1 text-sm text-purple-800">
          <li>• Reduce Tuesday-Wednesday staff by 15% to save $230/week</li>
          <li>• Add weekend prep support to improve dinner service speed</li>
          <li>• Consider split shifts on Friday/Saturday for cost efficiency</li>
          <li>• Cross-train 2 line cooks for expo duties to increase flexibility</li>
        </ul>
      </div>
    </div>
  );
}

