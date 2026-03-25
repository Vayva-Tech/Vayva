'use client';

import React, { useState } from 'react';
import { Card, CardContent, cn, Button } from "@vayva/ui";
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  currentDate?: Date;
  availabilityData?: Record<string, 'booked' | 'available' | 'maintenance'>;
}

const CalendarView: React.FC<CalendarViewProps> = ({ 
  currentDate = new Date(),
  availabilityData = {}
}) => {
  const [currentMonth, setCurrentMonth] = useState(currentDate);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusClass = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    const status = availabilityData[dateKey];
    
    switch (status) {
      case 'booked':
        return 'bg-blue-200';
      case 'maintenance':
        return 'bg-yellow-200';
      default:
        return 'bg-white border';
    }
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Add cells for each day of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
    days.push(date);
  }

  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Calendar className="w-5 h-5 mr-2" />
        CALENDAR VIEW
      </h2>
      <Card className="glass-effect border-0 shadow-lg">
        <CardContent className="p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button 
              onClick={() => navigateMonth('prev')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h3 className="text-lg font-semibold">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Button 
              onClick={() => navigateMonth('next')}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="bg-gray-50 rounded-lg p-4">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-600 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => (
                <div 
                  key={index}
                  className={cn(
                    "h-12 flex items-center justify-center text-sm rounded relative",
                    date ? getStatusClass(date) : "bg-transparent",
                    date && date.toDateString() === new Date().toDateString() 
                      ? "ring-2 ring-blue-500" 
                      : ""
                  )}
                >
                  {date && (
                    <>
                      <span>{date.getDate()}</span>
                      {Math.random() > 0.7 && (
                        <div className="absolute bottom-1 w-1 h-1 bg-red-500 rounded-full"></div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 mr-1 rounded"></div>
                <span>Booked</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-300 mr-1 rounded"></div>
                <span>Available</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-300 mr-1 rounded"></div>
                <span>Maintenance</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                Date Selection
              </Button>
              <Button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                Seasonal Pricing
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default CalendarView;