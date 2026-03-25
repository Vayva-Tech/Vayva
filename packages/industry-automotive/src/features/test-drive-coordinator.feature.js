/**
 * Test Drive Coordinator Feature
 * Manages test drive scheduling and coordination
 */

export class TestDriveCoordinatorFeature {
  constructor(coordinatorService, config = {}) {
    this.coordinatorService = coordinatorService;
    this.config = {
      enableOnlineBooking: true,
      autoConfirm: false,
      reminderEnabled: true,
      ...config,
    };
  }

  async initialize() {
    await this.coordinatorService.initialize();
  }

  scheduleTestDrive(testDriveData) {
    return this.coordinatorService.scheduleTestDrive(testDriveData);
  }

  getAvailableSlots(_date) {
    // Simple implementation - return some sample time slots
    return [
      { time: '09:00', available: true },
      { time: '10:00', available: true },
      { time: '11:00', available: true },
      { time: '14:00', available: true },
      { time: '15:00', available: true },
      { time: '16:00', available: true },
    ];
  }

  updateTestDriveStatus(id, status) {
    return this.coordinatorService.updateTestDrive(id, { status });
  }

  submitTestDriveFeedback(id, feedback) {
    return this.coordinatorService.completeTestDrive(id, feedback);
  }

  getTestDrives(filters = {}) {
    return this.coordinatorService.getTestDrives(filters);
  }

  cancelTestDrive(id) {
    return this.coordinatorService.cancelTestDrive(id, 'User cancelled');
  }

  getTestDriveStats() {
    const testDrives = this.coordinatorService.getTestDrives({});
    return {
      total: testDrives.length,
      scheduled: testDrives.filter(td => td.status === 'scheduled').length,
      completed: testDrives.filter(td => td.status === 'completed').length,
      cancelled: testDrives.filter(td => td.status === 'cancelled').length,
    };
  }
}