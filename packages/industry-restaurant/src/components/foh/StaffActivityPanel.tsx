'use client';

import React, { useState, useEffect } from 'react';
import { RestaurantDashboardService } from '../../services';
import { Card, CardContent, CardHeader, Badge, Button } from "@vayva/ui";
import { CardTitle } from '../restaurant-ui';
import { 
  Users,
  Clock,
  TrendingUp,
  Award,
  Coffee,
  Utensils
} from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'break' | 'off' | 'training';
  shiftStart: Date;
  hoursWorked: number;
  tipsEarned: number;
  tablesServed: number;
  satisfactionScore: number;
}

interface StaffActivityPanelProps {
  dashboardService: RestaurantDashboardService;
}

export function StaffActivityPanel({ dashboardService }: StaffActivityPanelProps) {
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      try {
        // Mock data - in real implementation, this would come from the service
        const mockStaff: StaffMember[] = [
          {
            id: '1',
            name: 'Alex Chen',
            role: 'Server',
            status: 'active',
            shiftStart: new Date(Date.now() - 28800000), // 8 hours ago
            hoursWorked: 8,
            tipsEarned: 125.50,
            tablesServed: 12,
            satisfactionScore: 4.8
          },
          {
            id: '2',
            name: 'Maria Rodriguez',
            role: 'Chef',
            status: 'active',
            shiftStart: new Date(Date.now() - 21600000), // 6 hours ago
            hoursWorked: 6,
            tipsEarned: 0,
            tablesServed: 0,
            satisfactionScore: 0
          },
          {
            id: '3',
            name: 'James Wilson',
            role: 'Host',
            status: 'break',
            shiftStart: new Date(Date.now() - 14400000), // 4 hours ago
            hoursWorked: 4,
            tipsEarned: 45.25,
            tablesServed: 28,
            satisfactionScore: 4.9
          },
          {
            id: '4',
            name: 'Sarah Kim',
            role: 'Bartender',
            status: 'active',
            shiftStart: new Date(Date.now() - 32400000), // 9 hours ago
            hoursWorked: 9,
            tipsEarned: 187.75,
            tablesServed: 0,
            satisfactionScore: 0
          },
          {
            id: '5',
            name: 'David Thompson',
            role: 'Manager',
            status: 'active',
            shiftStart: new Date(Date.now() - 36000000), // 10 hours ago
            hoursWorked: 10,
            tipsEarned: 0,
            tablesServed: 0,
            satisfactionScore: 0
          }
        ];
        
        setStaffMembers(mockStaff);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch staff data:', error);
        setLoading(false);
      }
    };

    fetchStaffData();
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchStaffData, 30000);
    return () => clearInterval(interval);
  }, [dashboardService]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'break':
        return 'bg-yellow-100 text-yellow-800';
      case 'off':
        return 'bg-gray-100 text-gray-800';
      case 'training':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Users className="h-4 w-4" />;
      case 'break':
        return <Coffee className="h-4 w-4" />;
      case 'off':
        return <Clock className="h-4 w-4" />;
      case 'training':
        return <Award className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const formatHours = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const activeStaff = staffMembers.filter(staff => staff.status === 'active').length;
  const staffOnBreak = staffMembers.filter(staff => staff.status === 'break').length;

  if (loading) {
    return (
      <Card className="bg-white rounded-2xl border border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Users className="h-5 w-5" />
            Staff Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-orange-50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white rounded-2xl border border-orange-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Users className="h-5 w-5" />
          Staff Activity
          <Badge variant="outline" className="ml-auto bg-orange-100 text-orange-700">
            {activeStaff} active
          </Badge>
        </CardTitle>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-700">{activeStaff}</div>
            <div className="text-xs text-green-600">Active</div>
          </div>
          <div className="text-center p-2 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-700">{staffOnBreak}</div>
            <div className="text-xs text-yellow-600">On Break</div>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-700">
              {staffMembers.reduce((sum, staff) => sum + staff.hoursWorked, 0)}
            </div>
            <div className="text-xs text-blue-600">Total Hours</div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          {staffMembers.map(staff => (
            <div 
              key={staff.id}
              className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl border border-orange-100 hover:bg-orange-100 transition-colors"
            >
              {/* Avatar/Initials */}
              <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-semibold">
                {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </div>
              
              {/* Staff Info */}
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-orange-900 truncate">
                    {staff.name}
                  </h3>
                  <Badge className={getStatusColor(staff.status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(staff.status)}
                      {staff.status}
                    </div>
                  </Badge>
                </div>
                
                <p className="text-sm text-orange-600 mb-1">
                  {staff.role}
                </p>
                
                <div className="flex items-center gap-3 text-xs text-orange-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatHours(staff.hoursWorked * 60)}
                  </div>
                  
                  {(staff.role === 'Server' || staff.role === 'Host') && staff.tablesServed > 0 && (
                    <div className="flex items-center gap-1">
                      <Utensils className="h-3 w-3" />
                      {staff.tablesServed} tables
                    </div>
                  )}
                  
                  {staff.tipsEarned > 0 && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      ${staff.tipsEarned.toFixed(2)}
                    </div>
                  )}
                  
                  {staff.satisfactionScore > 0 && (
                    <div className="flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      {staff.satisfactionScore}/5
                    </div>
                  )}
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex flex-col gap-1">
                <Button className="px-2 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600 transition-colors">
                  Message
                </Button>
                {staff.status === 'active' && (
                  <Button className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors">
                    Break
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Staff Summary */}
        <div className="mt-4 pt-4 border-t border-orange-200">
          <h4 className="font-medium text-orange-800 mb-2">Team Performance</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-green-50 p-2 rounded-lg">
              <div className="text-green-700 font-semibold">
                ${(staffMembers.reduce((sum, staff) => sum + staff.tipsEarned, 0)).toFixed(2)}
              </div>
              <div className="text-green-600 text-xs">Total Tips</div>
            </div>
            <div className="bg-blue-50 p-2 rounded-lg">
              <div className="text-blue-700 font-semibold">
                {staffMembers.reduce((sum, staff) => sum + staff.tablesServed, 0)}
              </div>
              <div className="text-blue-600 text-xs">Tables Served</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}