/**
 * Healthcare Dashboard Widget Components
 */

import React from 'react';

interface TodayStatsProps {
  stats: {
    totalAppointments: number;
    checkedIn: number;
    waiting: number;
    withProvider: number;
    completed: number;
    noShows: number;
  };
}

export function TodayStats({ stats }: TodayStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <StatCard label="Total Appointments" value={stats.totalAppointments} color="blue" />
      <StatCard label="Checked In" value={stats.checkedIn} color="green" />
      <StatCard label="Waiting" value={stats.waiting} color="yellow" />
      <StatCard label="With Provider" value={stats.withProvider} color="purple" />
      <StatCard label="Completed" value={stats.completed} color="emerald" />
      <StatCard label="No Shows" value={stats.noShows} color="red" />
    </div>
  );
}

function StatCard({ label, value, color }: any) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    yellow: 'bg-yellow-50 text-yellow-700',
    purple: 'bg-purple-50 text-purple-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    red: 'bg-red-50 text-red-700',
  };

  return (
    <div className={`rounded-xl shadow-lg p-6 ${colors[color]}`}>
      <p className="text-sm font-medium opacity-80">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

interface AppointmentScheduleProps {
  appointments: Array<{
    id: string;
    patientName: string;
    provider: string;
    time: string;
    type: string;
    status: string;
  }>;
}

export function AppointmentSchedule({ appointments }: AppointmentScheduleProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Today's Appointments</h3>
      <div className="space-y-3">
        {appointments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No appointments scheduled</p>
        ) : (
          appointments.map((apt) => (
            <div key={apt.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">{apt.patientName}</p>
                <p className="text-sm text-gray-600">{apt.time} - {apt.type}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                apt.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                apt.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {apt.status}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface PatientQueueProps {
  queue: Array<{
    id: string;
    patientName: string;
    checkInTime: string;
    waitTime: number;
    assignedRoom?: string;
    priority: string;
  }>;
}

export function PatientQueue({ queue }: PatientQueueProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Patient Queue</h3>
      <div className="space-y-3">
        {queue.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No patients waiting</p>
        ) : (
          queue.map((patient) => (
            <div key={patient.id} className="p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <p className="font-medium">{patient.patientName}</p>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  patient.priority === 'EMERGENCY' ? 'bg-red-100 text-red-700' :
                  patient.priority === 'URGENT' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {patient.priority}
                </span>
              </div>
              <p className="text-sm text-gray-600">Waited: {patient.waitTime} min</p>
              {patient.assignedRoom && (
                <p className="text-sm text-gray-600">Room: {patient.assignedRoom}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface CriticalAlertsProps {
  alerts: Array<{
    id: string;
    type: string;
    message: string;
    patientName: string;
    severity: string;
    timestamp: string;
  }>;
}

export function CriticalAlerts({ alerts }: CriticalAlertsProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Critical Alerts</h3>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No critical alerts</p>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-4 border-l-4 rounded ${
                alert.severity === 'HIGH' ? 'bg-red-50 border-red-500' :
                alert.severity === 'MEDIUM' ? 'bg-orange-50 border-orange-500' :
                'bg-yellow-50 border-yellow-500'
              }`}
            >
              <p className="font-medium">{alert.message}</p>
              <p className="text-sm text-gray-600 mt-1">{alert.patientName}</p>
              <p className="text-xs text-gray-500 mt-2">{new Date(alert.timestamp).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

interface BillingOverviewProps {
  billing: {
    dailyRevenue: number;
    pendingClaims: number;
    deniedClaims: number;
    outstandingBalance: number;
  };
}

export function BillingOverview({ billing }: BillingOverviewProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Billing Overview</h3>
      <div className="grid grid-cols-2 gap-4">
        <MetricCard label="Daily Revenue" value={`$${billing.dailyRevenue.toLocaleString()}`} trend="+12%" positive />
        <MetricCard label="Pending Claims" value={billing.pendingClaims.toString()} />
        <MetricCard label="Denied Claims" value={billing.deniedClaims.toString()} trend="-5%" positive={false} />
        <MetricCard label="Outstanding" value={`$${billing.outstandingBalance.toLocaleString()}`} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, trend, positive }: any) {
  return (
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
      {trend && (
        <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {trend}
        </p>
      )}
    </div>
  );
}

interface TaskListProps {
  tasks: Array<{
    id: string;
    title: string;
    assignee: string;
    dueDate: string;
    priority: string;
    completed: boolean;
  }>;
}

export function TaskList({ tasks }: TaskListProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Tasks & Follow-ups</h3>
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No pending tasks</p>
        ) : (
          tasks.map((task) => (
            <div 
              key={task.id} 
              className={`flex items-center justify-between p-3 border rounded-lg ${
                task.completed ? 'opacity-50 bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={task.completed}
                  readOnly
                  className="h-5 w-5 rounded"
                />
                <div className="flex-1">
                  <p className={`font-medium ${task.completed ? 'line-through' : ''}`}>{task.title}</p>
                  <p className="text-sm text-gray-600">{task.assignee} • Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                task.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                task.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                'bg-gray-100 text-gray-700'
              }`}>
                {task.priority}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
