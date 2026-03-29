/**
 * Automotive Dashboard - Bookings & Events Archetype
 * 
 * For: Auto Repair Shops, Car Dealerships, Service Centers, Garages
 * 
 * Features:
 * - Service appointment scheduling
 * - Vehicle diagnostics tracking (PRO)
 * - Parts inventory management
 * - Customer vehicle history
 * - Mechanic workload balancing
 */

'use client';

import { UnifiedDashboard } from '../dashboard-v2/UnifiedDashboard';
import { FeatureGate } from '../features/FeatureGate';
import { MetricsModule, MetricCard } from './modules/MetricsModule';
import { TasksModule } from './modules/TasksModule';
import { ChartsModule, DonutChart } from './modules/ChartsModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { Wrench, Calendar, TrendingUp, Users, AlertTriangle, CheckCircle } from 'lucide-react';

export function AutomotiveDashboard() {
  const { isVisible: showDiagnostics, isHiddenByPlan: diagLocked } = useModuleVisibility(
    'diagnostics',
    { industry: 'automotive', planTier: 'PRO', enabledFeatures: [] }
  );

  // Sample data
  const weeklyRevenue = [
    { day: 'Mon', value: 450000 },
    { day: 'Tue', value: 520000 },
    { day: 'Wed', value: 380000 },
    { day: 'Thu', value: 610000 },
    { day: 'Fri', value: 720000 },
    { day: 'Sat', value: 580000 },
  ];

  const serviceMix = [
    { label: 'Oil Change', value: 30, color: '#3b82f6' },
    { label: 'Brake Service', value: 25, color: '#10b981' },
    { label: 'Engine Repair', value: 20, color: '#ef4444' },
    { label: 'Tire Service', value: 15, color: '#f59e0b' },
    { label: 'AC/Diagnostic', value: 10, color: '#8b5cf6' },
  ];

  return (
    <UnifiedDashboard industry="automotive" planTier="PRO" designCategory="bookings">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Weekly Revenue"
          value="₦3.26M"
          change={15}
          trend="up"
          icon={<TrendingUp size={16} className="text-emerald-600" />}
        />
        
        <MetricCard
          label="Jobs This Week"
          value="89"
          change={12}
          trend="up"
          icon={<Wrench size={16} className="text-blue-600" />}
        />
        
        <MetricCard
          label="Avg Job Value"
          value="₦36,629"
          change={8}
          trend="up"
          icon={<Users size={16} className="text-purple-600" />}
        />
        
        <MetricCard
          label="Customer Retention"
          value="78%"
          change={5}
          trend="up"
          icon={<CheckCircle size={16} className="text-orange-600" />}
        />
      </div>

      {/* Diagnostics Section */}
      <FeatureGate minPlan="PRO">
        {showDiagnostics && (
          <div className="mb-6">
            <DiagnosticsSection />
          </div>
        )}
        {diagLocked && (
          <div className="mb-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🔧 Unlock Vehicle Diagnostics
            </h3>
            <p className="text-gray-600 mb-4">
              Get OBD-II integration, diagnostic code reading, and automated service recommendations with PRO plan
            </p>
            <a
              href="/dashboard/billing"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Upgrade to PRO →
            </a>
          </div>
        )}
      </FeatureGate>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Service Bay Status */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Service Bay Status</h3>
          <div className="space-y-3">
            <BayStatusCard
              bay="Bay 1 - General Service"
              status="occupied"
              vehicle="2018 Toyota Camry"
              mechanic="Chidi"
              job="Oil Change & Filter"
              eta="45 mins"
            />
            <BayStatusCard
              bay="Bay 2 - Engine Specialist"
              status="occupied"
              vehicle="2020 Honda Accord"
              mechanic="Bola"
              job="Brake Pad Replacement"
              eta="2 hours"
            />
            <BayStatusCard
              bay="Bay 3 - Tire & Alignment"
              status="available"
              vehicle={null}
              mechanic="Emeka"
              job={null}
              eta={null}
            />
            <BayStatusCard
              bay="Bay 4 - AC & Electrical"
              status="busy"
              vehicle="2019 Nissan Altima"
              mechanic="Tunde"
              job="AC Compressor Repair"
              eta="4 hours"
            />
          </div>
        </div>

        {/* Service Mix */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Services by Category</h3>
          <DonutChart data={serviceMix} size={200} />
          <div className="mt-4 space-y-2">
            {serviceMix.map(service => (
              <div key={service.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: service.color }}
                  />
                  <span className="text-gray-700">{service.label}</span>
                </div>
                <span className="font-medium text-gray-900">{service.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Today's Appointments
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Schedule Appointment
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Vehicle</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Bay</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '9:00 AM', customer: 'Mr. Adeleke', vehicle: '2019 Toyota RAV4', service: 'Full Service', bay: 'Bay 1', status: 'in-progress' },
                { time: '10:30 AM', customer: 'Mrs. Okonkwo', vehicle: '2021 Honda CR-V', service: 'Oil Change', bay: 'Bay 2', status: 'waiting' },
                { time: '12:00 PM', customer: 'Mr. Ibrahim', vehicle: '2018 Nissan Sentra', service: 'Brake Inspection', bay: 'Bay 3', status: 'confirmed' },
                { time: '2:00 PM', customer: 'Dr. Adebayo', vehicle: '2020 Mercedes C300', service: 'AC Repair', bay: 'Bay 4', status: 'confirmed' },
                { time: '3:30 PM', customer: 'Chief Okafor', vehicle: '2017 Lexus RX350', service: 'Tire Rotation', bay: 'Bay 1', status: 'confirmed' },
              ].map((apt, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{apt.time}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{apt.customer}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{apt.vehicle}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{apt.service}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{apt.bay}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={apt.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parts Inventory Alerts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <AlertTriangle size={20} className="text-red-600" />
            Parts Inventory Alerts
          </h3>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
            Order Parts
          </button>
        </div>
        
        <div className="space-y-3">
          <PartsAlert
            part="Mobil 1 5W-30 Motor Oil"
            currentStock={8)
            minStock={20}
            status="critical"
            unit="bottles"
          />
          <PartsAlert
            part="Brake Pads (Toyota Camry)"
            currentStock={15}
            minStock={25}
            status="low"
            unit="sets"
          />
          <PartsAlert
            part="Air Filters (Universal)"
            currentStock={22}
            minStock={30}
            status="low"
            unit="pieces"
          />
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Revenue Trend</h3>
        <div className="h-64">
          <div className="flex items-end justify-between h-full gap-2">
            {weeklyRevenue.map(day => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                  style={{ height: `${(day.value / 750000) * 100}%` }}
                />
                <span className="text-xs text-gray-600">{day.day}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UnifiedDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function DiagnosticsSection() {
  const vehicles = [
    { vin: '1HGBH41JXMN109186', model: '2019 Toyota Camry', codes: ['P0420'], issues: 1, mechanic: 'Chidi' },
    { vin: '2HGFC2F59MH123456', model: '2021 Honda Civic', codes: ['P0300', 'P0301'], issues: 2, mechanic: 'Bola' },
    { vin: '5NPE34AF4KH123789', model: '2020 Hyundai Elantra', codes: [], issues: 0, mechanic: 'Emeka' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active Diagnostics</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
          Run Diagnostic Scan
        </button>
      </div>
      
      <div className="space-y-3">
        {vehicles.map((vehicle, idx) => (
          <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-gray-900">{vehicle.model}</p>
                <p className="text-xs text-gray-500 mt-0.5">VIN: {vehicle.vin}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  vehicle.issues === 0 ? 'bg-green-100 text-green-800' :
                  vehicle.issues <= 2 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {vehicle.issues === 0 ? 'No Issues' : `${vehicle.issues} Issue${vehicle.issues > 1 ? 's' : ''}`}
                </span>
                <span className="text-xs text-gray-600">Mechanic: {vehicle.mechanic}</span>
              </div>
            </div>
            
            {vehicle.codes.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Diagnostic Codes:</p>
                <div className="flex gap-2">
                  {vehicle.codes.map((code, i) => (
                    <span key={i} className="text-xs font-mono bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-200">
                      {code}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface BayStatusCardProps {
  bay: string;
  status: 'available' | 'occupied' | 'busy';
  vehicle: string | null;
  mechanic: string;
  job: string | null;
  eta: string | null;
}

function BayStatusCard({ bay, status, vehicle, mechanic, job, eta }: BayStatusCardProps) {
  const statusColors = {
    available: 'bg-green-50 border-green-200',
    occupied: 'bg-blue-50 border-blue-200',
    busy: 'bg-orange-50 border-orange-200',
  };

  const statusBadges = {
    available: 'bg-green-100 text-green-800',
    occupied: 'bg-blue-100 text-blue-800',
    busy: 'bg-orange-100 text-orange-800',
  };

  return (
    <div className={`p-4 rounded-lg border ${statusColors[status]}`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">{bay}</h4>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusBadges[status]}`}>
          {status.toUpperCase()}
        </span>
      </div>
      
      {status !== 'available' && vehicle && (
        <>
          <p className="text-sm text-gray-700 mb-1">{vehicle}</p>
          <p className="text-xs text-gray-600 mb-1">Job: {job}</p>
          <div className="flex items-center justify-between mt-2 text-xs">
            <span className="text-gray-600">Mechanic: {mechanic}</span>
            <span className="text-gray-600">ETA: {eta}</span>
          </div>
        </>
      )}
      
      {status === 'available' && (
        <p className="text-sm text-gray-600">Ready for next job</p>
      )}
    </div>
  );
}

interface StatusBadgeProps {
  status: 'confirmed' | 'waiting' | 'in-progress' | 'completed' | 'cancelled';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    confirmed: 'bg-blue-100 text-blue-800',
    waiting: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[status]}`}>
      {status.replace('-', ' ').toUpperCase()}
    </span>
  );
}

interface PartsAlertProps {
  part: string;
  currentStock: number;
  minStock: number;
  status: 'critical' | 'low';
  unit: string;
}

function PartsAlert({ part, currentStock, minStock, status, unit }: PartsAlertProps) {
  const percentage = Math.round((currentStock / minStock) * 100);
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{part}</p>
        <p className="text-sm text-gray-600 mt-0.5">
          Current: <span className="font-semibold">{currentStock} {unit}</span> • 
          Min: <span className="font-semibold">{minStock} {unit}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{percentage}%</p>
          <p className="text-xs text-gray-600">of minimum</p>
        </div>
        <button className="text-sm text-emerald-700 hover:text-emerald-900 font-medium">
          Reorder →
        </button>
      </div>
    </div>
  );
}
