// @ts-nocheck
/**
 * Test Drive Coordinator Service
 * Manages test drive scheduling, customer assignments, and route planning
 */

import { z } from 'zod';

export interface TestDrive {
  id: string;
  customerId: string;
  vehicleId: string;
  salespersonId: string;
  scheduledDate: Date;
  duration: number; // minutes
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  route: string;
  notes?: string;
  feedback?: TestDriveFeedback;
  createdAt: Date;
}

export interface TestDriveFeedback {
  rating: number; // 1-5
  comfortRating: number; // 1-5
  performanceRating: number; // 1-5
  featuresRating: number; // 1-5
  comments?: string;
  wouldRecommend: boolean;
}

export interface TestDriveSchedule {
  date: Date;
  slots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: Date;
  endTime: Date;
  available: boolean;
  bookedBy?: string;
}

export interface TestDriveConfig {
  defaultDuration?: number;
  bufferTime?: number; // minutes between drives
  maxPerDay?: number;
  enableOnlineBooking?: boolean;
}

const TestDriveSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  vehicleId: z.string(),
  salespersonId: z.string(),
  scheduledDate: z.date(),
  duration: z.number(),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled', 'no-show']),
  route: z.string(),
  notes: z.string().optional(),
  feedback: z.object({
    rating: z.number().min(1).max(5),
    comfortRating: z.number().min(1).max(5),
    performanceRating: z.number().min(1).max(5),
    featuresRating: z.number().min(1).max(5),
    comments: z.string().optional(),
    wouldRecommend: z.boolean(),
  }).optional(),
  createdAt: z.date(),
});

export class TestDriveCoordinatorService {
  private testDrives: Map<string, TestDrive>;
  private schedule: Map<string, TestDriveSchedule>; // date -> schedule
  private config: TestDriveConfig;

  constructor(config: TestDriveConfig = {}) {
    this.config = {
      defaultDuration: 30,
      bufferTime: 15,
      maxPerDay: 20,
      enableOnlineBooking: true,
      ...config,
    };
    this.testDrives = new Map();
    this.schedule = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[TEST_DRIVE] Initializing coordinator...');
    // Initialize schedule for next 30 days
    this.generateSchedule(30);
    console.log('[TEST_DRIVE] Coordinator initialized');
  }

  /**
   * Schedule a test drive
   */
  async scheduleTestDrive(testDriveData: Partial<TestDrive>): Promise<TestDrive> {
    const testDrive = TestDriveSchema.parse({
      ...testDriveData,
      id: testDriveData.id || `td_${Date.now()}`,
      status: 'scheduled',
      createdAt: new Date(),
    });

    // Check availability
    const dateKey = this.getDateKey(testDrive.scheduledDate);
    const daySchedule = this.schedule.get(dateKey);
    
    if (!daySchedule) {
      throw new Error('No schedule available for selected date');
    }

    // Find available slot
    const slot = this.findAvailableSlot(daySchedule, testDrive.duration);
    if (!slot) {
      throw new Error('No available time slots for selected date');
    }

    this.testDrives.set(testDrive.id, testDrive);
    return testDrive;
  }

  /**
   * Get all test drives with optional filtering
   */
  getTestDrives(filters?: {
    status?: string;
    vehicleId?: string;
    customerId?: string;
    dateRange?: [Date, Date];
  }): TestDrive[] {
    let drives = Array.from(this.testDrives.values());

    if (filters) {
      if (filters.status) {
        drives = drives.filter(d => d.status === filters.status);
      }
      if (filters.vehicleId) {
        drives = drives.filter(d => d.vehicleId === filters.vehicleId);
      }
      if (filters.customerId) {
        drives = drives.filter(d => d.customerId === filters.customerId);
      }
      if (filters.dateRange) {
        drives = drives.filter(
          d => d.scheduledDate >= filters.dateRange![0] && d.scheduledDate <= filters.dateRange![1]
        );
      }
    }

    return drives.sort((a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime());
  }

  /**
   * Update test drive status
   */
  async updateStatus(id: string, status: TestDrive['status']): Promise<TestDrive | null> {
    const testDrive = this.testDrives.get(id);
    if (!testDrive) return null;

    const updated = { ...testDrive, status };
    this.testDrives.set(id, updated);
    return updated;
  }

  /**
   * Submit test drive feedback
   */
  async submitFeedback(id: string, feedback: TestDriveFeedback): Promise<TestDrive | null> {
    const testDrive = this.testDrives.get(id);
    if (!testDrive) return null;

    const updated = { ...testDrive, feedback };
    this.testDrives.set(id, updated);
    return updated;
  }

  /**
   * Get available time slots for a date
   */
  getAvailableSlots(date: Date): TimeSlot[] {
    const dateKey = this.getDateKey(date);
    const daySchedule = this.schedule.get(dateKey);
    
    if (!daySchedule) {
      return [];
    }

    return daySchedule.slots.filter(slot => slot.available);
  }

  /**
   * Cancel a test drive
   */
  async cancelTestDrive(id: string): Promise<TestDrive | null> {
    return this.updateStatus(id, 'cancelled');
  }

  /**
   * Get test drive statistics
   */
  getStatistics(): {
    total: number;
    scheduled: number;
    completed: number;
    cancelled: number;
    noShow: number;
    averageRating: number;
    conversionRate: number;
  } {
    const drives = Array.from(this.testDrives.values());
    const completed = drives.filter(d => d.status === 'completed');
    const rated = completed.filter(d => d.feedback);
    
    return {
      total: drives.length,
      scheduled: drives.filter(d => d.status === 'scheduled').length,
      completed: completed.length,
      cancelled: drives.filter(d => d.status === 'cancelled').length,
      noShow: drives.filter(d => d.status === 'no-show').length,
      averageRating: rated.length > 0 
        ? rated.reduce((sum, d) => sum + (d.feedback?.rating || 0), 0) / rated.length 
        : 0,
      conversionRate: drives.length > 0 
        ? (completed.length / drives.length) * 100 
        : 0,
    };
  }

  private generateSchedule(days: number): void {
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateKey = this.getDateKey(date);
      
      const slots: TimeSlot[] = [];
      const startHour = 9; // 9 AM
      const endHour = 18; // 6 PM
      
      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setMinutes(slotEnd.getMinutes() + this.config.defaultDuration! + this.config.bufferTime!);
        
        slots.push({
          id: `${dateKey}_${hour}`,
          startTime: slotStart,
          endTime: slotEnd,
          available: true,
        });
      }
      
      this.schedule.set(dateKey, { date, slots });
    }
  }

  private findAvailableSlot(schedule: TestDriveSchedule, duration: number): TimeSlot | null {
    return schedule.slots.find(slot => slot.available) || null;
  }

  private getDateKey(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
