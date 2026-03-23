// @ts-nocheck
/**
 * Specialized Service Feature
 */

import { SpecializedServiceManagement, ServiceAppointment, ServiceProvider, SpecializedConfig } from '../services/specialized-service-management.service';

export class SpecializedServiceFeature {
  constructor(private service: SpecializedServiceManagement) {}

  async createAppointment(appointmentData: Partial<ServiceAppointment>): Promise<ServiceAppointment> {
    return this.service.createAppointment(appointmentData);
  }

  async updateStatus(appointmentId: string, status: ServiceAppointment['status']): Promise<boolean> {
    return this.service.updateStatus(appointmentId, status);
  }

  async getUpcomingAppointments(daysAhead?: number): Promise<ServiceAppointment[]> {
    return this.service.getUpcomingAppointments(daysAhead);
  }

  async getAvailableProviders(specialty?: string): Promise<ServiceProvider[]> {
    return this.service.getAvailableProviders(specialty);
  }

  async getStatistics() {
    return this.service.getStatistics();
  }
}
