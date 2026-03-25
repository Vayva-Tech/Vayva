'use client';
import { Button } from "@vayva/ui";

/**
 * Booking Add-On Components
 * 
 * Provides appointment/service booking functionality including:
 * - BookingCalendar: Date and time slot selection
 * - ServiceSelector: Service/package selection
 * - BookingForm: Customer details collection
 * - BookingSummary: Review before confirmation
 * - BookingConfirmation: Success state display
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  Check,
  ChevronLeft,
  ChevronRight,
  Phone,
  Mail,
  CreditCard,
  Star,
  Clock3,
  Users,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, getDay, subMonths, addMonths } from 'date-fns';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // minutes
  price: number;
  category: string;
  image?: string;
  maxParticipants?: number;
}

export interface TimeSlot {
  id: string;
  time: string; // HH:mm format
  available: boolean;
}

export interface BookingData {
  serviceId: string;
  date: Date;
  time: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    notes?: string;
  };
  participants?: number;
}

// ============================================================================
// BOOKING CALENDAR
// ============================================================================

interface BookingCalendarProps {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabledDates?: Date[];
  availableDates?: Date[];
  className?: string;
}

export function BookingCalendar({
  selectedDate,
  onSelect,
  minDate = new Date(),
  maxDate = addDays(new Date(), 90),
  disabledDates = [],
  availableDates,
  className
}: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startDay = getDay(monthStart);

  const isDisabled = (date: Date) => {
    if (date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (date > maxDate) return true;
    if (disabledDates.some(d => isSameDay(d, date))) return true;
    if (availableDates && !availableDates.some(d => isSameDay(d, date))) return true;
    return false;
  };

  return (
    <div className={cn('bg-card rounded-xl border p-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          disabled={isSameMonth(currentMonth, new Date())}
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <h3 className="font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <Button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before start of month */}
        {Array.from({ length: startDay }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map(day => {
          const disabled = isDisabled(day);
          const selected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <Button
              key={day.toISOString()}
              onClick={() => !disabled && onSelect(day)}
              disabled={disabled}
              className={cn(
                'aspect-square rounded-lg text-sm font-medium transition-colors',
                selected
                  ? 'bg-primary text-primary-foreground'
                  : isTodayDate
                  ? 'bg-primary/10 text-primary'
                  : disabled
                  ? 'text-muted-foreground/30 cursor-not-allowed'
                  : 'hover:bg-accent'
              )}
            >
              {format(day, 'd')}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// TIME SLOT SELECTOR
// ============================================================================

interface TimeSlotSelectorProps {
  slots: TimeSlot[];
  selected: string | null;
  onSelect: (slotId: string) => void;
  className?: string;
}

interface TimeSlotGroupProps {
  title: string;
  icon: React.ElementType;
  groupSlots: TimeSlot[];
  selected: string | null;
  onSelect: (slotId: string) => void;
}

function TimeSlotGroup({ title, icon: Icon, groupSlots, selected, onSelect }: TimeSlotGroupProps) {
  if (groupSlots.length === 0) return null;
  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
        <Icon className="w-4 h-4" />
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">
        {groupSlots.map(slot => (
          <Button
            key={slot.id}
            onClick={() => slot.available && onSelect(slot.id)}
            disabled={!slot.available}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selected === slot.id
                ? 'bg-primary text-primary-foreground'
                : !slot.available
                ? 'bg-muted text-muted-foreground/50 cursor-not-allowed'
                : 'border hover:bg-accent'
            )}
          >
            {slot.time}
          </Button>
        ))}
      </div>
    </div>
  );
}

export function TimeSlotSelector({ slots, selected, onSelect, className }: TimeSlotSelectorProps) {
  const morning = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour < 12;
  });
  const afternoon = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour >= 12 && hour < 17;
  });
  const evening = slots.filter(s => {
    const hour = parseInt(s.time.split(':')[0]);
    return hour >= 17;
  });

  if (slots.length === 0) {
    return (
      <div className={cn('text-center py-8 bg-muted/50 rounded-xl', className)}>
        <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">No available time slots for this date</p>
        <p className="text-sm text-muted-foreground mt-1">Please select another date</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <TimeSlotGroup title="Morning" icon={Clock} groupSlots={morning} selected={selected} onSelect={onSelect} />
      <TimeSlotGroup title="Afternoon" icon={Clock} groupSlots={afternoon} selected={selected} onSelect={onSelect} />
      <TimeSlotGroup title="Evening" icon={Clock} groupSlots={evening} selected={selected} onSelect={onSelect} />
    </div>
  );
}

// ============================================================================
// SERVICE SELECTOR
// ============================================================================

interface ServiceSelectorProps {
  services: Service[];
  selected: string | null;
  onSelect: (serviceId: string) => void;
  className?: string;
}

export function ServiceSelector({ services, selected, onSelect, className }: ServiceSelectorProps) {
  const categories = [...new Set(services.map(s => s.category))];

  return (
    <div className={cn('space-y-6', className)}>
      {categories.map(category => (
        <div key={category}>
          <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
            {category}
          </h4>
          <div className="space-y-2">
            {services
              .filter(s => s.category === category)
              .map(service => (
                <label
                  key={service.id}
                  className={cn(
                    'flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-colors',
                    selected === service.id
                      ? 'border-primary bg-primary/5'
                      : 'hover:bg-accent'
                  )}
                >
                  <input
                    type="radio"
                    name="service"
                    value={service.id}
                    checked={selected === service.id}
                    onChange={() => onSelect(service.id)}
                    className="mt-1"
                  />
                  
                  {service.image && (
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {service.description}
                        </p>
                      </div>
                      <p className="font-semibold">₦{service.price.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock3 className="w-4 h-4" />
                        {service.duration} min
                      </span>
                      {service.maxParticipants && service.maxParticipants > 1 && (
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Up to {service.maxParticipants}
                        </span>
                      )}
                    </div>
                  </div>
                </label>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// BOOKING FORM
// ============================================================================

interface BookingFormProps {
  service: Service;
  onSubmit: (data: BookingData['customer']) => void;
  initialData?: Partial<BookingData['customer']>;
  className?: string;
}

export function BookingForm({ service: _service, onSubmit, initialData, className }: BookingFormProps) {
  const [formData, setFormData] = useState<BookingData['customer']>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    notes: initialData?.notes || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const inputClass = (field: string) => cn(
    'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-colors',
    errors[field] ? 'border-destructive' : 'border-input'
  );

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name *</label>
          <input
            type="text"
            value={formData.firstName}
            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
            className={inputClass('firstName')}
            placeholder="John"
          />
          {errors.firstName && <p className="text-sm text-destructive mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name *</label>
          <input
            type="text"
            value={formData.lastName}
            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
            className={inputClass('lastName')}
            placeholder="Doe"
          />
          {errors.lastName && <p className="text-sm text-destructive mt-1">{errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className={inputClass('email')}
          placeholder="john@example.com"
        />
        {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone *</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className={inputClass('phone')}
          placeholder="+234 801 234 5678"
        />
        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Special Requests (optional)</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
          placeholder="Any special requirements or preferences..."
        />
      </div>

      <Button
        type="submit"
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Continue to Payment
      </Button>
    </form>
  );
}

// ============================================================================
// BOOKING SUMMARY
// ============================================================================

interface BookingSummaryProps {
  service: Service;
  date: Date;
  time: string;
  customer: BookingData['customer'];
  className?: string;
}

export function BookingSummary({ service, date, time, customer, className }: BookingSummaryProps) {
  return (
    <div className={cn('bg-card rounded-xl border p-6 space-y-6', className)}>
      <h3 className="font-semibold">Booking Summary</h3>

      {/* Service */}
      <div className="flex gap-4">
        {service.image && (
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
            <img src={service.image} alt={service.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1">
          <p className="font-medium">{service.name}</p>
          <p className="text-sm text-muted-foreground">{service.duration} minutes</p>
        </div>
        <p className="font-semibold">₦{service.price.toLocaleString()}</p>
      </div>

      {/* Date & Time */}
      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{format(date, 'EEEE, MMMM d, yyyy')}</span>
        </div>
        <span className="text-muted-foreground">|</span>
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span className="font-medium">{time}</span>
        </div>
      </div>

      {/* Customer */}
      <div className="space-y-2 text-sm">
        <p className="flex items-center gap-2">
          <User className="w-4 h-4 text-muted-foreground" />
          {customer.firstName} {customer.lastName}
        </p>
        <p className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-muted-foreground" />
          {customer.email}
        </p>
        <p className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-muted-foreground" />
          {customer.phone}
        </p>
      </div>

      {customer.notes && (
        <div className="pt-4 border-t">
          <p className="text-sm font-medium mb-1">Special Requests:</p>
          <p className="text-sm text-muted-foreground">{customer.notes}</p>
        </div>
      )}

      {/* Total */}
      <div className="pt-4 border-t">
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>₦{service.price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// BOOKING CONFIRMATION
// ============================================================================

interface BookingConfirmationProps {
  bookingId: string;
  service: Service;
  date: Date;
  time: string;
  onAddToCalendar?: () => void;
  onShare?: () => void;
  className?: string;
}

export function BookingConfirmation({
  bookingId,
  service,
  date,
  time,
  onAddToCalendar,
  onShare: _onShare,
  className
}: BookingConfirmationProps) {
  return (
    <div className={cn('text-center py-8', className)}>
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-10 h-10 text-green-600" />
      </div>

      <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
      <p className="text-muted-foreground mb-6">
        Your appointment has been scheduled successfully.
      </p>

      <div className="bg-card rounded-xl border p-6 max-w-md mx-auto mb-6">
        <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
        <p className="text-2xl font-mono font-semibold tracking-wider">{bookingId}</p>
      </div>

      <div className="bg-muted/50 rounded-xl p-6 max-w-md mx-auto mb-6 text-left">
        <h3 className="font-semibold mb-4">Appointment Details</h3>
        <div className="space-y-3">
          <p className="flex items-center gap-2">
            <Star className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">{service.name}</span>
          </p>
          <p className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            {format(date, 'EEEE, MMMM d, yyyy')}
          </p>
          <p className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            {time}
          </p>
          <p className="flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-muted-foreground" />
            {service.duration} minutes
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button
          onClick={onAddToCalendar}
          className="px-6 py-3 border rounded-lg font-medium hover:bg-accent transition-colors flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          Add to Calendar
        </Button>
        <a
          href="/"
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Return Home
        </a>
      </div>

      <p className="text-sm text-muted-foreground mt-6">
        A confirmation email has been sent to your inbox.
      </p>
    </div>
  );
}

// ============================================================================
// BOOKING STEPPER (Complete Booking Flow)
// ============================================================================

interface BookingStepperProps {
  services: Service[];
  onComplete: (bookingData: BookingData, bookingId: string) => void;
  className?: string;
}

type BookingStep = 'service' | 'datetime' | 'details' | 'payment' | 'confirmation';

export function BookingStepper({ services, onComplete, className }: BookingStepperProps) {
  const [step, setStep] = useState<BookingStep>('service');
  const [bookingData, setBookingData] = useState<Partial<BookingData>>({});
  const [bookingId, setBookingId] = useState<string>('');

  const steps: { id: BookingStep; label: string }[] = [
    { id: 'service', label: 'Service' },
    { id: 'datetime', label: 'Date & Time' },
    { id: 'details', label: 'Details' },
    { id: 'payment', label: 'Payment' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);
  const selectedService = services.find(s => s.id === bookingData.serviceId);

  const handleServiceSelect = (serviceId: string) => {
    setBookingData(prev => ({ ...prev, serviceId }));
    setStep('datetime');
  };

  const handleDateTimeSelect = (date: Date, time: string) => {
    setBookingData(prev => ({ ...prev, date, time }));
    setStep('details');
  };

  const handleDetailsSubmit = (customer: BookingData['customer']) => {
    setBookingData(prev => ({ ...prev, customer }));
    setStep('payment');
  };

  const handlePaymentComplete = () => {
    // Simulate booking creation
    const newBookingId = `BK${Date.now().toString(36).toUpperCase()}`;
    setBookingId(newBookingId);
    setStep('confirmation');
    onComplete(bookingData as BookingData, newBookingId);
  };

  // Mock time slots for demo
  const mockSlots: TimeSlot[] = [
    { id: '1', time: '09:00', available: true },
    { id: '2', time: '10:00', available: true },
    { id: '3', time: '11:00', available: false },
    { id: '4', time: '14:00', available: true },
    { id: '5', time: '15:00', available: true },
    { id: '6', time: '16:00', available: true },
  ];

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Progress */}
      {step !== 'confirmation' && (
        <div className="flex items-center justify-center mb-8">
          {steps.map((s, index) => (
            <React.Fragment key={s.id}>
              <div className="flex items-center">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                  index < currentStepIndex ? 'bg-green-500 text-white' :
                  index === currentStepIndex ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                )}>
                  {index < currentStepIndex ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={cn(
                  'ml-2 text-sm hidden sm:block',
                  index <= currentStepIndex ? 'text-foreground font-medium' : 'text-muted-foreground'
                )}>
                  {s.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'w-8 h-px mx-2',
                  index < currentStepIndex ? 'bg-green-500' : 'bg-muted'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {step === 'service' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-center">Select a Service</h2>
              <ServiceSelector
                services={services}
                selected={bookingData.serviceId || null}
                onSelect={handleServiceSelect}
              />
            </div>
          )}

          {step === 'datetime' && selectedService && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Date</h2>
                <BookingCalendar
                  selectedDate={bookingData.date || null}
                  onSelect={(_date) => {
                    // In real implementation, fetch available slots for this date
                  }}
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Select Time</h2>
                <TimeSlotSelector
                  slots={mockSlots}
                  selected={bookingData.time || null}
                  onSelect={(time) => {
                    if (bookingData.date) {
                      handleDateTimeSelect(bookingData.date, time);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {step === 'details' && selectedService && (
            <div className="max-w-md mx-auto">
              <h2 className="text-xl font-semibold mb-6">Your Details</h2>
              <BookingForm
                service={selectedService}
                onSubmit={handleDetailsSubmit}
              />
            </div>
          )}

          {step === 'payment' && selectedService && bookingData.date && bookingData.time && bookingData.customer && (
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-6">Payment</h2>
                <div className="bg-card rounded-xl border p-6">
                  <p className="text-center text-muted-foreground mb-4">
                    Payment integration would go here
                  </p>
                  <Button
                    onClick={handlePaymentComplete}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <CreditCard className="w-5 h-5" />
                    Complete Payment
                  </Button>
                </div>
              </div>
              <BookingSummary
                service={selectedService}
                date={bookingData.date}
                time={bookingData.time}
                customer={bookingData.customer}
              />
            </div>
          )}

          {step === 'confirmation' && selectedService && bookingData.date && bookingData.time && (
            <BookingConfirmation
              bookingId={bookingId}
              service={selectedService}
              date={bookingData.date}
              time={bookingData.time}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

