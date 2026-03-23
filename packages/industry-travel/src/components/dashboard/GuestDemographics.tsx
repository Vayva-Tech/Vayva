// @ts-nocheck
'use client';

import React from 'react';
import { Card, CardContent } from '@vayva/ui';
import { Users, Globe, MapPin } from 'lucide-react';

interface GuestDemographicsProps {
  data: {
    byCountry: Array<{ country: string; percentage: number; flag: string }>;
    repeatGuestRate: number;
    totalGuests: number;
  };
}

const GuestDemographics: React.FC<GuestDemographicsProps> = ({ data }) => {
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Users className="w-5 h-5 mr-2" />
        GUEST DEMOGRAPHICS
      </h2>
      <Card className="glass-effect border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="h-64">
            <div className="mb-6">
              <h3 className="font-medium text-gray-800 mb-3 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                Guest Origin Map
              </h3>
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-32 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  {/* Simplified world map representation */}
                  <div className="absolute top-4 left-8 w-6 h-8 bg-green-400 rounded"></div>
                  <div className="absolute top-6 right-12 w-4 h-6 bg-blue-400 rounded"></div>
                  <div className="absolute bottom-8 left-16 w-5 h-7 bg-yellow-400 rounded"></div>
                  <div className="absolute top-10 left-1/3 w-3 h-5 bg-red-400 rounded"></div>
                  <div className="absolute bottom-6 right-20 w-4 h-6 bg-purple-400 rounded"></div>
                </div>
                <Globe className="w-12 h-12 text-gray-600" />
              </div>
              
              {/* Heat zones indicator */}
              <div className="flex justify-center mt-3 space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-1"></div>
                  <span>High Traffic</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-1"></div>
                  <span>Medium</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-1"></div>
                  <span>Low</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Top Countries</h3>
              <div className="space-y-3">
                {data.byCountry.map((country, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-lg mr-2">{country.flag}</span>
                      <span className="font-medium">{country.country}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="font-semibold mr-2">{country.percentage}%</span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${country.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-purple-700">{data.totalGuests}</p>
                    <p className="text-xs text-purple-600">Total Guests</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <MapPin className="w-6 h-6 text-green-600 mx-auto mb-1" />
                    <p className="text-lg font-bold text-green-700">{data.repeatGuestRate}%</p>
                    <p className="text-xs text-green-600">Repeat Rate</p>
                  </div>
                </div>
                
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Guest Type Distribution</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Business Travelers</span>
                      <span className="font-medium">38%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Leisure Travelers</span>
                      <span className="font-medium">52%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Groups/Families</span>
                      <span className="font-medium">10%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default GuestDemographics;