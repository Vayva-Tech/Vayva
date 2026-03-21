'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vayva/ui/components/ui/card';
import { Button } from '@vayva/ui/components/ui/button';
import { Badge } from '@vayva/ui/components/ui/badge';
import { Calendar } from '@vayva/ui/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@vayva/ui/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vayva/ui/components/ui/select';
import { MapPin, Clock, Check, AlertCircle, Truck } from 'lucide-react';
import { format } from 'date-fns';

interface DeliverySlot {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  maxCapacity: number;
  bookedCount: number;
  isAvailable: boolean;
  zipCodes: string[];
}

interface DeliverySlotPickerProps {
  storeId: string;
  customerZipCode: string;
  selectedSlotId?: string;
  onSlotSelect?: (slotId: string) => void;
}

export function DeliverySlotPicker({
  storeId,
  customerZipCode,
  selectedSlotId,
  onSlotSelect,
}: DeliverySlotPickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availableSlots, setAvailableSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate);
    }
  }, [selectedDate, customerZipCode]);

  const fetchAvailableSlots = async (date: Date) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/meal-kit/delivery-slots?storeId=${storeId}&date=${date.toISOString()}&zipCode=${customerZipCode}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data);
      }
    } catch (error) {
      console.error('Failed to fetch delivery slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBookSlot = (slotId: string) => {
    if (onSlotSelect) {
      onSlotSelect(slotId);
    }
  };

  const getAvailabilityStatus = (slot: DeliverySlot) => {
    const remaining = slot.maxCapacity - slot.bookedCount;
    
    if (!slot.isAvailable) return { text: 'Full', color: 'destructive' };
    if (remaining <= 2) return { text: `${remaining} left`, color: 'destructive' };
    if (remaining <= 5) return { text: `${remaining} left`, color: 'warning' };
    return { text: 'Available', color: 'default' };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Choose Delivery Slot
            </CardTitle>
            <CardDescription>
              Select a convenient date and time for delivery
            </CardDescription>
          </div>
          <Badge variant="outline" className="flex items-center gap-2">
            <MapPin className="h-3 w-3" />
            {customerZipCode}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Calendar */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Select Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Calendar className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Available Time Slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Available Time Slots</Label>
            {loading && (
              <span className="text-xs text-muted-foreground">Loading...</span>
            )}
          </div>

          {availableSlots.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-lg">
              <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No delivery slots available for this date in your area
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try selecting a different date
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {availableSlots.map(slot => {
                const status = getAvailabilityStatus(slot);
                const isSelected = selectedSlotId === slot.id;

                return (
                  <Card
                    key={slot.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      isSelected ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                    } ${!slot.isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => slot.isAvailable && handleBookSlot(slot.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        {isSelected && (
                          <Check className="h-5 w-5 text-emerald-600" />
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge 
                          variant={status.color as any}
                          className="text-xs"
                        >
                          {status.text}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {slot.bookedCount}/{slot.maxCapacity} booked
                        </span>
                      </div>

                      {!slot.isAvailable && (
                        <p className="text-xs text-destructive mt-2">
                          This slot is fully booked
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Delivery Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-900 mb-1">Delivery Information</p>
              <ul className="text-blue-800 space-y-1 text-xs">
                <li>• Free delivery on orders above ₦10,000</li>
                <li>• Standard delivery fee: ₦1,500</li>
                <li>• You'll receive SMS notification on delivery day</li>
                <li>• Contactless delivery available upon request</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Add Label component import
const Label = ({ className, ...props }: any) => (
  <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`} {...props} />
);
