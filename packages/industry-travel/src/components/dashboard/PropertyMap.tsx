'use client';

import React from 'react';
import { Card, CardContent, Button } from "@vayva/ui";
import { MapPin, Globe } from 'lucide-react';

interface PropertyMapProps {
  properties: Array<{
    id: string;
    name: string;
    lat: number;
    lng: number;
    status: 'full' | 'limited' | 'available' | 'event';
    type: string;
  }>;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ properties }) => {
  // Status colors
  const statusColors = {
    full: 'bg-red-500',
    limited: 'bg-yellow-500',
    available: 'bg-green-500',
    event: 'bg-blue-500'
  };

  const statusCounts = {
    full: properties.filter(p => p.status === 'full').length,
    limited: properties.filter(p => p.status === 'limited').length,
    available: properties.filter(p => p.status === 'available').length,
    event: properties.filter(p => p.status === 'event').length
  };

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <MapPin className="w-5 h-5 mr-2" />
        PROPERTY OCCUPANCY MAP
      </h2>
      <Card className="glass-effect border-0 shadow-lg h-96">
        <CardContent className="p-6">
          <div className="bg-gray-200 rounded-lg h-full flex items-center justify-center">
            <div className="text-center">
              <Globe className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Interactive Map with Pins</p>
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${statusColors.full} rounded-full mr-2`}></div>
                  Full ({statusCounts.full})
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${statusColors.limited} rounded-full mr-2`}></div>
                  Limited ({statusCounts.limited})
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${statusColors.available} rounded-full mr-2`}></div>
                  Available ({statusCounts.available})
                </div>
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${statusColors.event} rounded-full mr-2`}></div>
                  Event ({statusCounts.event})
                </div>
              </div>
              <div className="mt-6">
                <div className="flex flex-wrap gap-2">
                  <Button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    All
                  </Button>
                  <Button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    Villas
                  </Button>
                  <Button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    Apartments
                  </Button>
                  <Button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    Studios
                  </Button>
                  <Button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                    Shared Rooms
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default PropertyMap;