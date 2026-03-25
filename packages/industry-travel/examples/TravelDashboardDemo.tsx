'use client';
import { Button } from "@vayva/ui";

import React, { useState } from 'react';
import { TravelDashboard } from '@vayva/industry-travel';
import { Button } from '@vayva/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@vayva/ui/card';

const TravelDashboardDemo = () => {
  const [currentTheme, setCurrentTheme] = useState<
    'ocean-breeze' | 'tropical-sunset' | 'mountain-retreat' | 'urban-chic' | 'coastal-luxury'
  >('ocean-breeze');
  
  const [isFullscreen, setIsFullscreen] = useState(false);

  const themes = [
    { id: 'ocean-breeze', name: 'Ocean Breeze', color: '#4A90E2' },
    { id: 'tropical-sunset', name: 'Tropical Sunset', color: '#FF6B35' },
    { id: 'mountain-retreat', name: 'Mountain Retreat', color: '#059669' },
    { id: 'urban-chic', name: 'Urban Chic', color: '#6366F1' },
    { id: 'coastal-luxury', name: 'Coastal Luxury', color: '#0891B2' }
  ];

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className={isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}>
      {!isFullscreen && (
        <div className="p-6 bg-gray-50">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Travel Dashboard Demo</CardTitle>
              <p className="text-gray-600">
                Experience the Premium Glass Travel & Tourism Dashboard with multiple theme options
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Theme Selector */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Select Theme</h3>
                  <div className="flex flex-wrap gap-3">
                    {themes.map((theme) => (
                      <Button
                        key={theme.id}
                        onClick={() => setCurrentTheme(theme.id as any)}
                        className={`px-4 py-2 rounded-lg border-2 transition-all ${
                          currentTheme === theme.id
                            ? 'border-gray-800 ring-2 ring-gray-300'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{ backgroundColor: theme.color }}
                      >
                        <span className="font-medium text-white drop-shadow">
                          {theme.name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex flex-wrap gap-3">
                  <Button onClick={toggleFullscreen} variant="default">
                    {isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
                  </Button>
                  
                  <Button variant="outline">
                    Export Report
                  </Button>
                  
                  <Button variant="outline">
                    Share Dashboard
                  </Button>
                </div>

                {/* Features Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Dashboard Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Real-time occupancy tracking</li>
                      <li>• Interactive property maps</li>
                      <li>• Revenue analytics & forecasting</li>
                      <li>• Guest demographics insights</li>
                      <li>• Booking management calendar</li>
                      <li>• Housekeeping status overview</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Design Highlights</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Premium glass morphism effects</li>
                      <li>• 5 customizable theme presets</li>
                      <li>• Fully responsive layout</li>
                      <li>• Industry-appropriate iconography</li>
                      <li>• Smooth animations & transitions</li>
                      <li>• Accessible color contrast</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dashboard */}
      <div className={isFullscreen ? 'h-full' : 'min-h-screen'}>
        <TravelDashboard 
          theme={currentTheme}
          className={isFullscreen ? 'h-full' : ''}
        />
      </div>

      {isFullscreen && (
        <div className="fixed top-4 right-4 z-50">
          <Button onClick={toggleFullscreen} variant="secondary">
            Exit Fullscreen
          </Button>
        </div>
      )}
    </div>
  );
};

export default TravelDashboardDemo;
