/**
 * Test Drive Coordinator Service
 * Manages test drive scheduling, customer assignments, and route planning
 */

export class TestDriveCoordinatorService {
  constructor() {
    this.testDrives = [];
    this.schedules = [];
  }

  async initialize() {
    // Initialize service
    console.log('[TEST_DRIVE_COORDINATOR_SERVICE] Initialized');
  }

  async scheduleTestDrive(testDrive) {
    this.testDrives.push(testDrive);
    return testDrive;
  }

  async getTestDrives(filters = {}) {
    return this.testDrives.filter(td => {
      if (filters.customerId && td.customerId !== filters.customerId) return false;
      if (filters.vehicleId && td.vehicleId !== filters.vehicleId) return false;
      if (filters.status && td.status !== filters.status) return false;
      if (filters.date && td.scheduledDate.toDateString() !== filters.date.toDateString()) return false;
      return true;
    });
  }

  async getTestDriveById(id) {
    return this.testDrives.find(td => td.id === id);
  }

  async updateTestDrive(id, updates) {
    const index = this.testDrives.findIndex(td => td.id === id);
    if (index !== -1) {
      this.testDrives[index] = { ...this.testDrives[index], ...updates };
      return this.testDrives[index];
    }
    return null;
  }

  async cancelTestDrive(id, reason) {
    const testDrive = await this.getTestDriveById(id);
    if (testDrive) {
      testDrive.status = 'cancelled';
      testDrive.cancellationReason = reason;
      return testDrive;
    }
    return null;
  }

  async completeTestDrive(id, feedback) {
    const testDrive = await this.getTestDriveById(id);
    if (testDrive) {
      testDrive.status = 'completed';
      testDrive.feedback = feedback;
      return testDrive;
    }
    return null;
  }
}