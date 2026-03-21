/**
 * Grocery Settings Page
 * Configure grocery-specific settings
 */

'use client';

import React, { useState } from 'react';
import { Save, AlertTriangle, Truck, Tag, Users, Clock } from 'lucide-react';

export default function GrocerySettingsPage() {
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState({
    // Department Configuration
    departments: ['Produce', 'Meat', 'Dairy', 'Grocery', 'Beverage', 'Frozen', 'Bakery'],
    
    // Inventory Settings
    lowStockThreshold: 10,
    criticalStockThreshold: 5,
    enableExpiryTracking: true,
    expiryAlertDays: 7,
    
    // Delivery Settings
    enableDelivery: true,
    deliveryRadius: 5, // miles
    deliveryFee: 4.99,
    minimumOrderForDelivery: 35,
    
    // Pickup Settings
    enablePickup: true,
    pickupTimeSlots: ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
    
    // Loyalty Program
    enableLoyaltyProgram: true,
    pointsPerDollar: 1,
    redemptionRate: 100, // points per $1 reward
    
    // Pricing
    enableCompetitorPricing: true,
    autoPriceMatching: false,
    marginFloor: 15, // minimum margin percentage
    
    // Waste Management
    enableWasteTracking: true,
    donationPartnership: true,
    automaticMarkdown: true,
    markdownSchedule: {
      '3-days': 25, // 25% off when 3 days to expiry
      '2-days': 40,
      '1-day': 60,
    },
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Would save to backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Grocery Settings</h1>
            <p className="text-sm text-gray-600">Configure your grocery store operations</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        {/* Department Configuration */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Configuration</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Active Departments</label>
              <div className="flex flex-wrap gap-2">
                {settings.departments.map((dept) => (
                  <span
                    key={dept}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
                  >
                    {dept}
                  </span>
                ))}
              </div>
              <button className="mt-2 text-sm text-green-600 hover:text-green-700">
                + Add Department
              </button>
            </div>
          </div>
        </div>

        {/* Inventory Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Inventory & Stock Alerts</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
              <input
                type="number"
                value={settings.lowStockThreshold}
                onChange={(e) => setSettings({ ...settings, lowStockThreshold: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Critical Stock Threshold</label>
              <input
                type="number"
                value={settings.criticalStockThreshold}
                onChange={(e) => setSettings({ ...settings, criticalStockThreshold: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableExpiryTracking}
                onChange={(e) => setSettings({ ...settings, enableExpiryTracking: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable Expiry Tracking</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Alert Days Before</label>
              <input
                type="number"
                value={settings.expiryAlertDays}
                onChange={(e) => setSettings({ ...settings, expiryAlertDays: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Delivery Settings */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <Truck className="w-5 h-5 text-blue-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Delivery Configuration</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableDelivery}
                onChange={(e) => setSettings({ ...settings, enableDelivery: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable Delivery</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Radius (miles)</label>
              <input
                type="number"
                value={settings.deliveryRadius}
                onChange={(e) => setSettings({ ...settings, deliveryRadius: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee ($)</label>
              <input
                type="number"
                step="0.01"
                value={settings.deliveryFee}
                onChange={(e) => setSettings({ ...settings, deliveryFee: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order for Delivery ($)</label>
              <input
                type="number"
                step="0.01"
                value={settings.minimumOrderForDelivery}
                onChange={(e) => setSettings({ ...settings, minimumOrderForDelivery: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Loyalty Program */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <Users className="w-5 h-5 text-purple-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Loyalty Program</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableLoyaltyProgram}
                onChange={(e) => setSettings({ ...settings, enableLoyaltyProgram: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable Loyalty Program</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Points per Dollar Spent</label>
              <input
                type="number"
                value={settings.pointsPerDollar}
                onChange={(e) => setSettings({ ...settings, pointsPerDollar: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Points per $1 Reward</label>
              <input
                type="number"
                value={settings.redemptionRate}
                onChange={(e) => setSettings({ ...settings, redemptionRate: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Pricing Strategy */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <Tag className="w-5 h-5 text-green-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Pricing Strategy</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableCompetitorPricing}
                onChange={(e) => setSettings({ ...settings, enableCompetitorPricing: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-700">Monitor Competitor Pricing</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoPriceMatching}
                onChange={(e) => setSettings({ ...settings, autoPriceMatching: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-700">Automatic Price Matching</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Margin Floor (%)</label>
              <input
                type="number"
                value={settings.marginFloor}
                onChange={(e) => setSettings({ ...settings, marginFloor: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
        </div>

        {/* Waste Management */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Waste Management</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.enableWasteTracking}
                onChange={(e) => setSettings({ ...settings, enableWasteTracking: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-700">Enable Waste Tracking</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.donationPartnership}
                onChange={(e) => setSettings({ ...settings, donationPartnership: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-700">Donation Partnership Enabled</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.automaticMarkdown}
                onChange={(e) => setSettings({ ...settings, automaticMarkdown: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <label className="ml-2 text-sm text-gray-700">Automatic Markdown</label>
            </div>
          </div>
          
          {settings.automaticMarkdown && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Automatic Markdown Schedule</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">3 Days to Expiry (%)</label>
                  <input
                    type="number"
                    value={settings.markdownSchedule['3-days']}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">2 Days to Expiry (%)</label>
                  <input
                    type="number"
                    value={settings.markdownSchedule['2-days']}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">1 Day to Expiry (%)</label>
                  <input
                    type="number"
                    value={settings.markdownSchedule['1-day']}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
