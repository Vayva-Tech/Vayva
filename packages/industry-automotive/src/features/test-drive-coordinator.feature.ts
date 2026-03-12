/**
 * Test Drive Coordinator Feature
 * Manages test drive scheduling and coordination
 */

import { 
  TestDriveCoordinatorService, 
  type TestDrive, 
  type TestDriveFeedback,
  type TimeSlot 
} from '../services/test-drive-coordinator.service.js';

export interface TestDriveCoordinatorConfig {
  enableOnlineBooking?: boolean;
  autoConfirm?: boolean;
  reminderEnabled?: boolean;
}

export class TestDriveCoordinatorFeature {
  private coordinatorService: TestDriveCoordinatorService;
  private config: TestDriveCoordinatorConfig;

  constructor(
    coordinatorService: TestDriveCoordinatorService,
    config: TestDriveCoordinatorConfig = {}
  ) {
    this.coordinatorService = coordinatorService;
    this.config = {
      enableOnlineBooking: true,
      autoConfirm: false,
      reminderEnabled: true,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    await this.coordinatorService.initialize();
  }

  /**
   * Schedule a test drive
   */
  scheduleTestDrive(testDriveData: Partial<TestDrive>): Promise<TestDrive> {
    return this.coordinatorService.scheduleTestDrive(testDriveData);
  }

  /**
   * Get available time slots
   */
  getAvailableSlots(date: Date): TimeSlot[] {
    return this.coordinatorService.getAvailableSlots(date);
  }

  /**
   * Update test drive status
   */
  updateTestDriveStatus(id: string, status: TestDrive['status']): Promise<TestDrive | null> {
    return this.coordinatorService.updateStatus(id, status);
  }

  /**
   * Submit feedback
   */
  submitTestDriveFeedback(id: string, feedback: TestDriveFeedback): Promise<TestDrive | null> {
    return this.coordinatorService.submitFeedback(id, feedback);
  }

  /**
   * Get all test drives
   */
  getTestDrives(filters?: any): TestDrive[] {
    return this.coordinatorService.getTestDrives(filters);
  }

  /**
   * Cancel a test drive
   */
  cancelTestDrive(id: string): Promise<TestDrive | null> {
    return this.coordinatorService.cancelTestDrive(id);
  }

  /**
   * Get test drive statistics
   */
  getTestDriveStats() {
    return this.coordinatorService.getStatistics();
  }
}
