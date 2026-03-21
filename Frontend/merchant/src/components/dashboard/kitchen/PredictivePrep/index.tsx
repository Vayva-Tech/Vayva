'use client';

import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Calendar, Clock, ChefHat } from 'lucide-react';

interface PredictivePrepProps {
  designCategory?: string;
  industry?: string;
  planTier?: string;
}

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
export function PredictivePrep({
  designCategory = 'signature',
  industry = 'food',
  planTier = 'standard'
}: PredictivePrepProps) {
  const [selectedDate, setSelectedDate] = useState<'today' | 'tomorrow' | 'week'>('today');

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

  return (
    <div className="space-y-4">
      {/* Header with AI Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Predictive Prep Recommendations</h3>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            AI Powered
          </span>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value as any)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="today">Today</option>
            <option value="tomorrow">Tomorrow</option>
            <option value="week">This Week</option>
          </select>
        </div>
      </div>

      {/* Prediction Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">
              {currentPrediction.confidence}% confidence
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">{currentPrediction.date}</p>
          <p className="text-2xl font-bold text-purple-900">
            {currentPrediction.expectedOrders} expected orders
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            <span className={`text-xs font-medium ${
              currentPrediction.busyLevel === 'high' ? 'text-red-600' :
              currentPrediction.busyLevel === 'medium' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {currentPrediction.busyLevel.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Busy Level</p>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-700">
              Peak: {currentPrediction.peakHours.join(', ')}
            </span>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Weather Impact</p>
          <p className="text-sm font-medium text-gray-900 mt-2">
            {currentPrediction.weatherImpact.impact}
          </p>
        </div>
      </div>

      {/* Prep Recommendations */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ChefHat className="h-5 w-5" />
          Recommended Prep Quantities
        </h4>
        
        <div className="space-y-3">
          {currentPrediction.prepRecommendations.map((rec, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  rec.priority === 'high' ? 'bg-red-500' :
                  rec.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-green-500'
                }`} />
                <div>
                  <p className="font-medium text-gray-900">{rec.item}</p>
                  <p className="text-xs text-gray-500">{rec.reason}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Qty:</span>
                <span className="text-lg font-bold text-gray-900">{rec.quantity}</span>
                <span className="text-xs text-gray-500">units</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Events Impact */}
      {currentPrediction.localEvents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Local Events Impact
          </h4>
          
          <div className="space-y-2">
            {currentPrediction.localEvents.map((event, index) => (
              <div key={index} className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <div>
                  <p className="font-medium text-blue-900">{event.name}</p>
                  <p className="text-sm text-blue-700">
                    {event.location} → <span className="font-semibold">{event.impact}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
