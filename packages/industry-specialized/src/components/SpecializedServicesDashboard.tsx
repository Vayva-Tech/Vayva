// @ts-nocheck
/**
 * Specialized Services Dashboard Component
 */

import React from 'react';
import { ServiceAppointment, ServiceProvider } from '../services/specialized-service-management.service';

export interface SpecializedServicesDashboardProps {
  appointments: ServiceAppointment[];
  providers: ServiceProvider[];
  onCreateAppointment?: (appointment: Partial<ServiceAppointment>) => void;
  onUpdateStatus?: (appointmentId: string, status: ServiceAppointment['status']) => void;
}

export const SpecializedServicesDashboard: React.FC<SpecializedServicesDashboardProps> = ({
  appointments,
  providers,
  onCreateAppointment,
  onUpdateStatus,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">👔 Specialized Services</h2>
      <p className="text-gray-600 mb-6">Manage professional service appointments</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Appts</div>
          <div className="text-2xl font-bold text-blue-600">{appointments.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Upcoming</div>
          <div className="text-2xl font-bold text-green-600">{appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).length}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Completion</div>
          <div className="text-xl font-bold text-purple-600">
            {appointments.length > 0 ? Math.round((appointments.filter(a => a.status === 'completed').length / appointments.length) * 100) : 0}%
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Avg Rating</div>
          <div className="text-xl font-bold text-yellow-600">⭐ {providers.reduce((sum, p) => sum + p.rating, 0) / providers.length.toFixed(1)}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 mb-3">Upcoming Appointments</h3>
          {appointments.filter(a => ['scheduled', 'confirmed'].includes(a.status)).slice(0, 5).map(appointment => (
            <div key={appointment.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-900">{appointment.serviceType}</div>
                  <div className="text-xs text-gray-500">
                    📅 {new Date(appointment.scheduledDate).toLocaleDateString()} • ⏰ {appointment.duration} min
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">${appointment.amount.toLocaleString()}</div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    appointment.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {appointment.status}
                  </span>
                </div>
              </div>
              {appointment.notes && (
                <div className="mt-2 text-xs text-gray-600 italic">"{appointment.notes}"</div>
              )}
            </div>
          ))}
        </div>

        {/* Available Providers */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 mb-3">Service Providers</h3>
          {providers.map(provider => (
            <div key={provider.id} className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors bg-gray-50">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium text-gray-900">{provider.name}</div>
                  <div className="text-xs text-gray-500">{provider.specialty}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-yellow-600">⭐ {provider.rating}</div>
                  <div className={`text-xs px-2 py-1 rounded ${provider.availability ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {provider.availability ? 'Available' : 'Busy'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
