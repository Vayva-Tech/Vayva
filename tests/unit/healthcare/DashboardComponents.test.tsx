/**
 * Healthcare Dashboard Components Unit Tests
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { 
  TodayStats, 
  AppointmentSchedule, 
  PatientQueue, 
  CriticalAlerts, 
  BillingOverview, 
  TaskList 
} from '../src/app/(dashboard)/dashboard/healthcare-services/components/Widgets';

describe('Healthcare Dashboard Components', () => {
  describe('TodayStats', () => {
    const mockStats = {
      totalAppointments: 45,
      checkedIn: 32,
      waiting: 8,
      withProvider: 12,
      completed: 20,
      noShows: 3,
    };

    it('renders all stat cards', () => {
      render(<TodayStats stats={mockStats} />);
      
      expect(screen.getByText('Total Appointments')).toBeInTheDocument();
      expect(screen.getByText('Checked In')).toBeInTheDocument();
      expect(screen.getByText('Waiting')).toBeInTheDocument();
      expect(screen.getByText('With Provider')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('No Shows')).toBeInTheDocument();
    });

    it('displays correct values for each stat', () => {
      render(<TodayStats stats={mockStats} />);
      
      expect(screen.getByText('45')).toBeInTheDocument();
      expect(screen.getByText('32')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('applies correct color coding for different stats', () => {
      const { container } = render(<TodayStats stats={mockStats} />);
      
      const statCards = container.querySelectorAll('[class*="bg-"]');
      expect(statCards.length).toBeGreaterThan(0);
    });
  });

  describe('AppointmentSchedule', () => {
    const mockAppointments = [
      { id: '1', patientName: 'John Doe', provider: 'Dr. Smith', time: '09:00 AM', type: 'CHECKUP', status: 'COMPLETED' },
      { id: '2', patientName: 'Jane Wilson', provider: 'Dr. Johnson', time: '10:30 AM', type: 'FOLLOW_UP', status: 'IN_PROGRESS' },
      { id: '3', patientName: 'Bob Brown', provider: 'Dr. Smith', time: '11:00 AM', type: 'CONSULTATION', status: 'SCHEDULED' },
    ];

    it('renders appointment list correctly', () => {
      render(<AppointmentSchedule appointments={mockAppointments} />);
      
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Wilson")).toBeInTheDocument();
      expect(screen.getByText("Bob Brown")).toBeInTheDocument();
    });

    it('displays appointment times and types', () => {
      render(<AppointmentSchedule appointments={mockAppointments} />);
      
      expect(screen.getByText('09:00 AM - CHECKUP')).toBeInTheDocument();
      expect(screen.getByText('10:30 AM - FOLLOW_UP')).toBeInTheDocument();
    });

    it('shows status badges for each appointment', () => {
      render(<AppointmentSchedule appointments={mockAppointments} />);
      
      expect(screen.getByText('COMPLETED')).toBeInTheDocument();
      expect(screen.getByText('IN_PROGRESS')).toBeInTheDocument();
      expect(screen.getByText('SCHEDULED')).toBeInTheDocument();
    });

    it('shows message when no appointments', () => {
      render(<AppointmentSchedule appointments={[]} />);
      
      expect(screen.getByText('No appointments scheduled')).toBeInTheDocument();
    });
  });

  describe('PatientQueue', () => {
    const mockQueue = [
      { id: '1', patientName: 'Alice Cooper', checkInTime: '08:30 AM', waitTime: 45, assignedRoom: 'Room 101', priority: 'ROUTINE' },
      { id: '2', patientName: 'Charlie Davis', checkInTime: '08:45 AM', waitTime: 30, priority: 'URGENT' },
      { id: '3', patientName: 'Eve Foster', checkInTime: '09:00 AM', waitTime: 15, priority: 'EMERGENCY' },
    ];

    it('renders patient queue with wait times', () => {
      render(<PatientQueue queue={mockQueue} />);
      
      expect(screen.getByText('Alice Cooper')).toBeInTheDocument();
      expect(screen.getByText('Waited: 45 min')).toBeInTheDocument();
    });

    it('displays room assignments when available', () => {
      render(<PatientQueue queue={mockQueue} />);
      
      expect(screen.getByText('Room: 101')).toBeInTheDocument();
    });

    it('shows priority badges', () => {
      render(<PatientQueue queue={mockQueue} />);
      
      expect(screen.getByText('ROUTINE')).toBeInTheDocument();
      expect(screen.getByText('URGENT')).toBeInTheDocument();
      expect(screen.getByText('EMERGENCY')).toBeInTheDocument();
    });

    it('shows message when queue is empty', () => {
      render(<PatientQueue queue={[]} />);
      
      expect(screen.getByText('No patients waiting')).toBeInTheDocument();
    });
  });

  describe('CriticalAlerts', () => {
    const mockAlerts = [
      { id: '1', type: 'ALLERGY', message: 'Penicillin allergy detected', patientName: 'John Doe', severity: 'HIGH', timestamp: new Date().toISOString() },
      { id: '2', type: 'LAB_RESULT', message: 'Critical lab result: Blood glucose 400', patientName: 'Jane Smith', severity: 'MEDIUM', timestamp: new Date().toISOString() },
      { id: '3', type: 'FOLLOW_UP', message: 'Follow-up required within 48 hours', patientName: 'Bob Wilson', severity: 'LOW', timestamp: new Date().toISOString() },
    ];

    it('renders critical alerts with messages', () => {
      render(<CriticalAlerts alerts={mockAlerts} />);
      
      expect(screen.getByText('Penicillin allergy detected')).toBeInTheDocument();
      expect(screen.getByText('Critical lab result: Blood glucose 400')).toBeInTheDocument();
    });

    it('displays patient names', () => {
      render(<CriticalAlerts alerts={mockAlerts} />);
      
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('applies severity-based styling', () => {
      const { container } = render(<CriticalAlerts alerts={mockAlerts} />);
      
      const alertElements = container.querySelectorAll('[class*="border-"]');
      expect(alertElements.length).toBe(3);
    });

    it('shows message when no alerts', () => {
      render(<CriticalAlerts alerts={[]} />);
      
      expect(screen.getByText('No critical alerts')).toBeInTheDocument();
    });
  });

  describe('BillingOverview', () => {
    const mockBilling = {
      dailyRevenue: 15420,
      pendingClaims: 23,
      deniedClaims: 5,
      outstandingBalance: 8750,
    };

    it('renders billing metrics', () => {
      render(<BillingOverview billing={mockBilling} />);
      
      expect(screen.getByText('$15,420')).toBeInTheDocument();
      expect(screen.getByText('23')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('$8,750')).toBeInTheDocument();
    });

    it('displays labels for each metric', () => {
      render(<BillingOverview billing={mockBilling} />);
      
      expect(screen.getByText('Daily Revenue')).toBeInTheDocument();
      expect(screen.getByText('Pending Claims')).toBeInTheDocument();
      expect(screen.getByText('Denied Claims')).toBeInTheDocument();
      expect(screen.getByText('Outstanding')).toBeInTheDocument();
    });

    it('shows trend indicators', () => {
      render(<BillingOverview billing={mockBilling} />);
      
      expect(screen.getByText('+12%')).toBeInTheDocument();
      expect(screen.getByText('-5%')).toBeInTheDocument();
    });
  });

  describe('TaskList', () => {
    const mockTasks = [
      { id: '1', title: 'Call patient about lab results', assignee: 'Nurse Johnson', dueDate: new Date().toISOString(), priority: 'HIGH', completed: false },
      { id: '2', title: 'Review prescription refill request', assignee: 'Dr. Smith', dueDate: new Date().toISOString(), priority: 'MEDIUM', completed: false },
      { id: '3', title: 'Submit insurance claim #12345', assignee: 'Billing Team', dueDate: new Date().toISOString(), priority: 'LOW', completed: true },
    ];

    it('renders task list with titles', () => {
      render(<TaskList tasks={mockTasks} />);
      
      expect(screen.getByText('Call patient about lab results')).toBeInTheDocument();
      expect(screen.getByText('Review prescription refill request')).toBeInTheDocument();
    });

    it('displays assignee and due date', () => {
      render(<TaskList tasks={mockTasks} />);
      
      expect(screen.getByText('Nurse Johnson')).toBeInTheDocument();
      expect(screen.getByText('Dr. Smith')).toBeInTheDocument();
    });

    it('shows priority badges', () => {
      render(<TaskList tasks={mockTasks} />);
      
      expect(screen.getByText('HIGH')).toBeInTheDocument();
      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      expect(screen.getByText('LOW')).toBeInTheDocument();
    });

    it('indicates completed tasks', () => {
      render(<TaskList tasks={mockTasks} />);
      
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(3);
    });

    it('shows message when no tasks', () => {
      render(<TaskList tasks={[]} />);
      
      expect(screen.getByText('No pending tasks')).toBeInTheDocument();
    });
  });

  describe('Component integration', () => {
    const fullDashboardData = {
      stats: {
        totalAppointments: 45,
        checkedIn: 32,
        waiting: 8,
        withProvider: 12,
        completed: 20,
        noShows: 3,
      },
      appointments: [
        { id: '1', patientName: 'Test Patient', provider: 'Dr. Test', time: '09:00 AM', type: 'CHECKUP', status: 'COMPLETED' },
      ],
      queue: [
        { id: '1', patientName: 'Queue Patient', checkInTime: '08:30 AM', waitTime: 45, priority: 'ROUTINE' },
      ],
      alerts: [
        { id: '1', type: 'ALLERGY', message: 'Test alert', patientName: 'Allergy Patient', severity: 'HIGH', timestamp: new Date().toISOString() },
      ],
      billing: {
        dailyRevenue: 15000,
        pendingClaims: 20,
        deniedClaims: 3,
        outstandingBalance: 5000,
      },
      tasks: [
        { id: '1', title: 'Test task', assignee: 'Test User', dueDate: new Date().toISOString(), priority: 'HIGH', completed: false },
      ],
    };

    it('renders all components together without errors', () => {
      const { container } = render(
        <div>
          <TodayStats stats={fullDashboardData.stats} />
          <AppointmentSchedule appointments={fullDashboardData.appointments} />
          <PatientQueue queue={fullDashboardData.queue} />
          <CriticalAlerts alerts={fullDashboardData.alerts} />
          <BillingOverview billing={fullDashboardData.billing} />
          <TaskList tasks={fullDashboardData.tasks} />
        </div>
      );

      // Verify all components rendered
      expect(container.querySelectorAll('[class*="rounded-xl"]').length).toBeGreaterThan(0);
    });
  });
});
