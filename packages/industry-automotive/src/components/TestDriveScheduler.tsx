/**
 * TestDriveScheduler Component
 * 
 * Interactive calendar/scheduler for booking and managing test drives.
 * Shows availability, manages bookings, and tracks customer information.
 */

import { useState, useEffect } from 'react';
import { BaseWidget } from '@vayva/industry-core';
import type { WidgetDefinition } from '@vayva/industry-core';
import type { TestDrive, Vehicle } from '../types';

export interface TimeSlot {
  time: string;
  available: boolean;
  booked?: TestDrive;
}

export interface DaySchedule {
  date: Date;
  slots: TimeSlot[];
}

export interface TestDriveSchedulerWidgetProps {
  widget: WidgetDefinition;
  data?: any;
  isLoading?: boolean;
  error?: Error;
  onRefresh?: () => void;
  vehicles: Vehicle[];
  testDrives: TestDrive[];
  workingHours?: { start: number; end: number }; // 24h format, e.g., {9, 18}
  slotDuration?: number; // minutes, default 30
  onBookTestDrive?: (booking: Omit<TestDrive, 'id' | 'createdAt'>) => Promise<void>;
  onCancelTestDrive?: (testDriveId: string) => Promise<void>;
  showPastAppointments?: boolean;
}

function generateTimeSlots(
  startDate: Date,
  workingHours: { start: number; end: number },
  slotDuration: number,
  existingTestDrives: TestDrive[]
): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const startTime = new Date(startDate);
  startTime.setHours(workingHours.start, 0, 0, 0);

  const endTime = new Date(startDate);
  endTime.setHours(workingHours.end, 0, 0, 0);

  while (startTime < endTime) {
    const timeString = startTime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Check if there's a booking at this time
    const existingBooking = existingTestDrives.find((td) => {
      const bookingStart = new Date(td.scheduledAt);
      return (
        bookingStart.getHours() === startTime.getHours() &&
        bookingStart.getMinutes() === startTime.getMinutes() &&
        td.status !== 'cancelled'
      );
    });

    slots.push({
      time: timeString,
      available: !existingBooking,
      booked: existingBooking,
    });

    startTime.setMinutes(startTime.getMinutes() + slotDuration);
  }

  return slots;
}

/**
 * TestDriveSchedulerWidget Component
 */
export function TestDriveSchedulerWidget({
  widget,
  isLoading,
  error,
  vehicles = [],
  testDrives = [],
  workingHours = { start: 9, end: 18 },
  slotDuration = 30,
  onBookTestDrive,
  onCancelTestDrive,
  showPastAppointments = false,
}: TestDriveSchedulerWidgetProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  // Generate time slots for selected date
  const timeSlots = generateTimeSlots(
    selectedDate,
    workingHours,
    slotDuration,
    testDrives.filter((td) => {
      const tdDate = new Date(td.scheduledAt);
      return (
        tdDate.getDate() === selectedDate.getDate() &&
        tdDate.getMonth() === selectedDate.getMonth() &&
        tdDate.getFullYear() === selectedDate.getFullYear()
      );
    })
  );

  const upcomingTestDrives = testDrives
    .filter((td) => new Date(td.scheduledAt) >= new Date())
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  const handleBookSlot = async (slot: TimeSlot) => {
    if (!slot.available || !onBookTestDrive || !selectedVehicle) return;

    setIsBooking(true);
    try {
      await onBookTestDrive({
        tenantId: '', // Will be filled by backend
        vehicleId: selectedVehicle,
        customerId: '', // Will be generated
        customerName,
        customerEmail,
        customerPhone,
        scheduledAt: new Date(`${selectedDate.toDateString()} ${slot.time}`),
        duration: slotDuration,
        status: 'scheduled',
        followUpScheduled: false,
      });

      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setSelectedVehicle('');
    } finally {
      setIsBooking(false);
    }
  };

  const handleCancel = async (testDriveId: string) => {
    if (!onCancelTestDrive) return;
    await onCancelTestDrive(testDriveId);
  };

  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId);
    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown';
  };

  // Generate next 7 days for quick selection
  const nextDays = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <BaseWidget
      widget={widget}
      isLoading={isLoading}
      error={error}
      className="test-drive-scheduler-widget"
    >
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">Today</p>
            <p className="text-xl font-bold text-gray-900">
              {timeSlots.filter((s) => s.booked).length}
            </p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">This Week</p>
            <p className="text-xl font-bold text-gray-900">
              {upcomingTestDrives.filter(
                (td) => new Date(td.scheduledAt) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
              ).length}
            </p>
          </div>
          <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
            <p className="text-xs text-gray-600 uppercase">Available Slots</p>
            <p className="text-xl font-bold text-gray-900">
              {timeSlots.filter((s) => s.available).length}
            </p>
          </div>
        </div>

        {/* Date Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Date</h3>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {nextDays.map((date) => {
              const isSelected =
                date.getDate() === selectedDate.getDate() &&
                date.getMonth() === selectedDate.getMonth();

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-shrink-0 px-4 py-3 rounded-xl border-2 transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="text-xs text-gray-600 uppercase">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {date.getDate()}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Booking Form */}
        <div className="p-4 bg-gray-50 rounded-xl space-y-3">
          <h3 className="font-semibold text-gray-900">Book a Test Drive</h3>

          <select
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Vehicle</option>
            {vehicles
              .filter((v) => v.status === 'available')
              .map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </option>
              ))}
          </select>

          <input
            type="text"
            placeholder="Your Name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="email"
            placeholder="Email Address"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <input
            type="tel"
            placeholder="Phone Number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Time Slots */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Available Time Slots - {selectedDate.toLocaleDateString()}
          </h3>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {timeSlots.map((slot, index) => (
              <button
                key={index}
                onClick={() => handleBookSlot(slot)}
                disabled={!slot.available || isBooking}
                className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                  slot.booked
                    ? 'bg-red-100 text-red-700 cursor-not-allowed line-through'
                    : slot.available
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 hover:scale-105'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Appointments */}
        {showPastAppointments && upcomingTestDrives.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Upcoming Test Drives
            </h3>

            <div className="space-y-2">
              {upcomingTestDrives.map((td) => (
                <div
                  key={td.id}
                  className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200"
                >
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getVehicleName(td.vehicleId)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {td.customerName} •{' '}
                      {new Date(td.scheduledAt).toLocaleString()}
                    </p>
                  </div>

                  {onCancelTestDrive && td.status === 'scheduled' && (
                    <button
                      onClick={() => handleCancel(td.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </BaseWidget>
  );
}

TestDriveSchedulerWidget.displayName = 'TestDriveSchedulerWidget';

export default TestDriveSchedulerWidget;
