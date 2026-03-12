/**
 * Wellness Components
 * UI components for wellness/spa industry
 */

import type { FC } from 'react';
import { useState } from 'react';

// Treatment Room Scheduler
interface TreatmentRoomSchedulerProps {
  rooms?: Array<{
    id: string;
    name: string;
    type: string;
    capacity: number;
    amenities: string[];
  }>;
  bookings?: Array<{
    id: string;
    roomId: string;
    startTime: Date;
    endTime: Date;
    clientName: string;
    treatment: string;
  }>;
  onBookRoom?: (booking: any) => void;
}

export const TreatmentRoomScheduler: FC<TreatmentRoomSchedulerProps> = ({
  rooms = [],
  bookings = [],
  onBookRoom
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div className="treatment-room-scheduler">
      <h2>Treatment Room Schedule</h2>
      <div className="date-selector">
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
        />
      </div>
      
      <div className="rooms-grid">
        {rooms.map(room => (
          <div key={room.id} className="room-card">
            <h3>{room.name}</h3>
            <p className="room-type">{room.type}</p>
            <div className="room-bookings">
              {bookings
                .filter(b => b.roomId === room.id && 
                  new Date(b.startTime).toDateString() === selectedDate.toDateString())
                .map(booking => (
                  <div key={booking.id} className="booking-slot">
                    <span className="time">
                      {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                      {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                    <span className="client">{booking.clientName}</span>
                    <span className="treatment">{booking.treatment}</span>
                  </div>
                ))}
            </div>
            <button 
              className="book-btn"
              onClick={() => onBookRoom?.({ roomId: room.id })}
            >
              Book Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Practitioner Availability Calendar
interface PractitionerAvailabilityProps {
  practitioners?: Array<{
    id: string;
    name: string;
    specialty: string;
    availability: {
      [key: string]: string[]; // e.g., { monday: ['09:00-17:00'] }
    };
  }>;
  onAvailabilityChange?: (practitionerId: string, availability: any) => void;
}

export const PractitionerAvailability: FC<PractitionerAvailabilityProps> = ({
  practitioners = [],
  onAvailabilityChange
}) => {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="practitioner-availability">
      <h2>Practitioner Availability</h2>
      <div className="practitioners-list">
        {practitioners.map(practitioner => (
          <div key={practitioner.id} className="practitioner-card">
            <h3>{practitioner.name}</h3>
            <p className="specialty">{practitioner.specialty}</p>
            
            <div className="weekly-schedule">
              {daysOfWeek.map(day => (
                <div key={day} className="day-schedule">
                  <label className="day-label">
                    {day.charAt(0).toUpperCase() + day.slice(1)}:
                  </label>
                  <select
                    value={practitioner.availability[day]?.[0] || 'unavailable'}
                    onChange={(e) => {
                      // Handle availability change
                    }}
                  >
                    <option value="unavailable">Unavailable</option>
                    <option value="09:00-17:00">9:00 AM - 5:00 PM</option>
                    <option value="10:00-18:00">10:00 AM - 6:00 PM</option>
                    <option value="12:00-20:00">12:00 PM - 8:00 PM</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Client Treatment History
interface ClientTreatmentHistoryProps {
  clientId?: string;
  treatments?: Array<{
    id: string;
    date: Date;
    service: string;
    practitioner: string;
    duration: number;
    price: number;
    notes?: string;
    rating?: number;
  }>;
}

export const ClientTreatmentHistory: FC<ClientTreatmentHistoryProps> = ({
  clientId,
  treatments = []
}) => {
  const totalSpent = treatments.reduce((sum, t) => sum + t.price, 0);
  const averageRating = treatments.length > 0
    ? treatments.reduce((sum, t) => sum + (t.rating || 0), 0) / treatments.length
    : 0;

  return (
    <div className="client-treatment-history">
      <h2>Client Treatment History</h2>
      {clientId && <p className="client-id">Client: {clientId}</p>}
      
      <div className="history-summary">
        <div className="summary-card">
          <h3>Total Treatments</h3>
          <p className="metric">{treatments.length}</p>
        </div>
        <div className="summary-card">
          <h3>Total Spent</h3>
          <p className="metric">${totalSpent.toFixed(2)}</p>
        </div>
        <div className="summary-card">
          <h3>Average Rating</h3>
          <p className="metric">{averageRating.toFixed(1)} ⭐</p>
        </div>
      </div>

      <table className="treatments-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Service</th>
            <th>Practitioner</th>
            <th>Duration</th>
            <th>Price</th>
            <th>Rating</th>
          </tr>
        </thead>
        <tbody>
          {treatments.map(treatment => (
            <tr key={treatment.id}>
              <td>{new Date(treatment.date).toLocaleDateString()}</td>
              <td>{treatment.service}</td>
              <td>{treatment.practitioner}</td>
              <td>{treatment.duration} min</td>
              <td>${treatment.price.toFixed(2)}</td>
              <td>{treatment.rating ? '⭐'.repeat(treatment.rating) : 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Service Menu Builder
interface ServiceMenuBuilderProps {
  services?: Array<{
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    category: string;
    isActive: boolean;
  }>;
  onAddService?: (service: any) => void;
  onUpdateService?: (id: string, updates: any) => void;
}

export const ServiceMenuBuilder: FC<ServiceMenuBuilderProps> = ({
  services = [],
  onAddService,
  onUpdateService
}) => {
  const categories = Array.from(new Set(services.map(s => s.category)));

  return (
    <div className="service-menu-builder">
      <h2>Service Menu Builder</h2>
      <button className="add-service-btn" onClick={() => onAddService?.({})}>
        + Add Service
      </button>
      
      <div className="menu-categories">
        {categories.map(category => (
          <div key={category} className="category-section">
            <h3>{category}</h3>
            <div className="services-list">
              {services
                .filter(s => s.category === category)
                .map(service => (
                  <div key={service.id} className={`service-item ${!service.isActive ? 'inactive' : ''}`}>
                    <div className="service-info">
                      <h4>{service.name}</h4>
                      <p className="description">{service.description}</p>
                      <div className="service-meta">
                        <span className="duration">{service.duration} min</span>
                        <span className="price">${service.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="service-actions">
                      <button onClick={() => onUpdateService?.(service.id, { isActive: !service.isActive })}>
                        {service.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button>Edit</button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Wellness Dashboard Summary
interface WellnessDashboardSummaryProps {
  stats?: {
    todayBookings: number;
    activeClients: number;
    availableRooms: number;
    availablePractitioners: number;
    revenueToday: number;
    packagesSold: number;
  };
}

export const WellnessDashboardSummary: FC<WellnessDashboardSummaryProps> = ({
  stats = {
    todayBookings: 0,
    activeClients: 0,
    availableRooms: 0,
    availablePractitioners: 0,
    revenueToday: 0,
    packagesSold: 0
  }
}) => {
  return (
    <div className="wellness-dashboard-summary">
      <h2>Today's Overview</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Bookings</h3>
          <p className="stat-value">{stats.todayBookings}</p>
        </div>
        <div className="stat-card">
          <h3>Active Clients</h3>
          <p className="stat-value">{stats.activeClients}</p>
        </div>
        <div className="stat-card">
          <h3>Available Rooms</h3>
          <p className="stat-value">{stats.availableRooms}</p>
        </div>
        <div className="stat-card">
          <h3>Available Staff</h3>
          <p className="stat-value">{stats.availablePractitioners}</p>
        </div>
        <div className="stat-card highlight">
          <h3>Revenue Today</h3>
          <p className="stat-value">${stats.revenueToday.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Packages Sold</h3>
          <p className="stat-value">{stats.packagesSold}</p>
        </div>
      </div>
    </div>
  );
};

// Appointment Booking Form
interface AppointmentBookingFormProps {
  services?: Array<{ id: string; name: string; duration: number; price: number }>;
  practitioners?: Array<{ id: string; name: string; specialty: string }>;
  onBook?: (appointment: any) => void;
}

export const AppointmentBookingForm: FC<AppointmentBookingFormProps> = ({
  services = [],
  practitioners = [],
  onBook
}) => {
  const [formData, setFormData] = useState({
    serviceId: '',
    practitionerId: '',
    date: '',
    time: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook?.(formData);
  };

  return (
    <form className="appointment-booking-form" onSubmit={handleSubmit}>
      <h2>Book Appointment</h2>
      
      <div className="form-group">
        <label>Select Service</label>
        <select
          value={formData.serviceId}
          onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
          required
        >
          <option value="">Choose a service...</option>
          {services.map(service => (
            <option key={service.id} value={service.id}>
              {service.name} - ${service.price} ({service.duration} min)
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Select Practitioner</label>
        <select
          value={formData.practitionerId}
          onChange={(e) => setFormData({ ...formData, practitionerId: e.target.value })}
        >
          <option value="">Any available...</option>
          {practitioners.map(practitioner => (
            <option key={practitioner.id} value={practitioner.id}>
              {practitioner.name} - {practitioner.specialty}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Time</label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Your Name</label>
        <input
          type="text"
          value={formData.clientName}
          onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={formData.clientEmail}
          onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Phone</label>
        <input
          type="tel"
          value={formData.clientPhone}
          onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
          required
        />
      </div>

      <div className="form-group">
        <label>Notes/Special Requests</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
        />
      </div>

      <button type="submit" className="submit-btn">Book Appointment</button>
    </form>
  );
};

export const WELLNESS_COMPONENTS = {
  TreatmentRoomScheduler,
  PractitionerAvailability,
  ClientTreatmentHistory,
  ServiceMenuBuilder,
  WellnessDashboardSummary,
  AppointmentBookingForm,
};
