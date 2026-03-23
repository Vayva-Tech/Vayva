// @ts-nocheck
// ============================================================================
// Calendar Widget
// ============================================================================
// For scheduling-based industries (Services, Education, Events)
// ============================================================================

import React from "react";
// TEMPORARY: Commenting out UI component imports for Phase 6 cleanup
/*
import { Card, CardContent, CardHeader } from "@vayva/ui/components/card";
import { cn } from "@vayva/ui/lib/utils";
*/

// Temporary mock components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => 
  <div className={className}>{children}</div>;
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => 
  <div className={className}>{children}</div>;
const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => 
  <div className={className}>{children}</div>;

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

export interface CalendarBooking {
  id: string;
  title: string;
  customerName?: string;
  startTime: Date;
  endTime: Date;
  status: "confirmed" | "pending" | "cancelled";
  color?: string;
}

export interface CalendarWidgetProps {
  bookings: CalendarBooking[];
  view?: "day" | "week" | "month";
  selectedDate?: Date;
  className?: string;
  designCategory?: "signature" | "glass" | "bold" | "dark" | "natural";
}

export function CalendarWidget({
  bookings,
  view = "day",
  selectedDate = new Date(),
  className,
  designCategory = "signature",
}: CalendarWidgetProps) {
  // Group bookings by hour for day view
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  const getBookingsForHour = (hour: number) => {
    return bookings.filter((booking) => {
      const bookingHour = booking.startTime.getHours();
      return bookingHour === hour;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-gray-400";
      default:
        return "bg-blue-500";
    }
  };

  const getGradientClass = () => {
    switch (designCategory) {
      case "signature":
        return "from-blue-50 to-white";
      case "glass":
        return "from-pink-100/50 to-purple-100/50 backdrop-blur";
      case "bold":
        return "from-orange-50 to-yellow-50";
      case "dark":
        return "from-gray-800 to-gray-900";
      case "natural":
        return "from-green-50 to-emerald-50";
      default:
        return "from-gray-50 to-white";
    }
  };

  return (
    <Card className={cn("bg-gradient-to-br", getGradientClass(), className)}>
      <CardHeader>
        <h3 className="text-lg font-semibold">
          {selectedDate.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h3>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {hours.map((hour) => {
            const hourBookings = getBookingsForHour(hour);
            const timeLabel = `${hour.toString().padStart(2, "0")}:00`;

            return (
              <div key={hour} className="flex gap-4">
                <div className="w-16 text-sm text-muted-foreground">
                  {timeLabel}
                </div>
                <div className="flex-1 space-y-2">
                  {hourBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={cn(
                        "p-3 rounded-lg border-l-4 shadow-sm",
                        getStatusColor(booking.status),
                        "text-white"
                      )}
                    >
                      <div className="font-medium">{booking.title}</div>
                      {booking.customerName && (
                        <div className="text-sm opacity-90">
                          {booking.customerName}
                        </div>
                      )}
                      <div className="text-xs opacity-75 mt-1">
                        {booking.startTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {booking.endTime.toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                  {hourBookings.length === 0 && (
                    <div className="h-12 border border-dashed rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                      Available
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
