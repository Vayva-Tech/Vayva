/**
 * Event Vendor Feature
 * High-level API for vendor management
 */

import { EventVendorService, Vendor, VendorCommunication } from '../services/event-vendor.service';

export class EventVendorFeature {
  constructor(private service: EventVendorService) {}

  async getVendors(eventId: string): Promise<Vendor[]> {
    return this.service.getVendorsForEvent(eventId);
  }

  async addVendor(vendorData: Partial<Vendor>): Promise<Vendor> {
    return this.service.createVendor(vendorData);
  }

  async updateVendor(vendorId: string, updates: Partial<Vendor>): Promise<boolean> {
    return this.service.updateVendor(vendorId, updates);
  }

  async signContract(vendorId: string): Promise<boolean> {
    return this.service.signContract(vendorId);
  }

  async recordPayment(vendorId: string, amount: number): Promise<boolean> {
    return this.service.recordPayment(vendorId, amount);
  }

  async getPendingContracts(eventId: string): Promise<Vendor[]> {
    return this.service.getPendingContracts(eventId);
  }

  async getUpcomingPayments(daysAhead?: number): Promise<Vendor[]> {
    return this.service.getUpcomingPayments(daysAhead);
  }

  async addCommunication(commData: Partial<VendorCommunication>): Promise<VendorCommunication> {
    return this.service.addCommunication(commData);
  }

  async getFollowUps(): Promise<VendorCommunication[]> {
    return this.service.getFollowUpCommunications();
  }

  async getStats(): Promise<{
    totalVendors: number;
    signedContracts: number;
    pendingContracts: number;
    totalBudget: number;
    totalDeposits: number;
    totalBalance: number;
    upcomingPayments: number;
  }> {
    return this.service.getStatistics();
  }
}
