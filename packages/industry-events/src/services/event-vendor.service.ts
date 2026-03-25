/**
 * Event Vendor Service
 * Manages vendor relationships, contracts, and coordination
 */

import { z } from 'zod';

export interface Vendor {
  id: string;
  eventId: string;
  name: string;
  type: 'catering' | 'photography' | 'music' | 'florist' | 'decoration' | 'venue' | 'transportation' | 'other';
  contactName: string;
  email: string;
  phone: string;
  contractSigned: boolean;
  contractValue: number;
  depositPaid: number;
  balanceDue: number;
  paymentDueDate?: Date;
  arrivalTime?: Date;
  setupLocation?: string;
  notes?: string;
}

export interface VendorCommunication {
  id: string;
  vendorId: string;
  type: 'email' | 'call' | 'text' | 'meeting';
  subject: string;
  notes: string;
  timestamp: Date;
  followUpRequired: boolean;
  followUpDate?: Date;
}

export interface VendorConfig {
  enableReminders?: boolean;
  trackPayments?: boolean;
}

const VendorSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  type: z.enum(['catering', 'photography', 'music', 'florist', 'decoration', 'venue', 'transportation', 'other']),
  contactName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  contractSigned: z.boolean(),
  contractValue: z.number(),
  depositPaid: z.number(),
  balanceDue: z.number(),
  paymentDueDate: z.date().optional(),
  arrivalTime: z.date().optional(),
  setupLocation: z.string().optional(),
  notes: z.string().optional(),
});

export class EventVendorService {
  private vendors: Map<string, Vendor>;
  private communications: Map<string, VendorCommunication>;
  private config: VendorConfig;

  constructor(config: VendorConfig = {}) {
    this.config = {
      enableReminders: true,
      trackPayments: true,
      ...config,
    };
    this.vendors = new Map();
    this.communications = new Map();
  }

  async initialize(): Promise<void> {
    console.warn('[EVENT_VENDOR] Initializing service...');
    this.initializeSampleData();
    console.warn('[EVENT_VENDOR] Service initialized');
  }

  private initializeSampleData(): void {
    const sampleVendors: Vendor[] = [
      {
        id: 'v1',
        eventId: 'event1',
        name: 'Gourmet Delights Catering',
        type: 'catering',
        contactName: 'Maria Garcia',
        email: 'maria@gourmetdelights.com',
        phone: '+1-555-0101',
        contractSigned: true,
        contractValue: 5000,
        depositPaid: 2500,
        balanceDue: 2500,
        paymentDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() - 3 * 60 * 60 * 1000),
        setupLocation: 'Kitchen & Serving Area',
      },
      {
        id: 'v2',
        eventId: 'event1',
        name: 'Capture Moments Photography',
        type: 'photography',
        contactName: 'David Chen',
        email: 'david@capturemoments.com',
        phone: '+1-555-0102',
        contractSigned: true,
        contractValue: 2000,
        depositPaid: 800,
        balanceDue: 1200,
        paymentDueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now()),
      },
      {
        id: 'v3',
        eventId: 'event1',
        name: 'DJ Beats Entertainment',
        type: 'music',
        contactName: 'Alex Johnson',
        email: 'alex@djbeats.com',
        phone: '+1-555-0103',
        contractSigned: false,
        contractValue: 1500,
        depositPaid: 0,
        balanceDue: 1500,
        paymentDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        arrivalTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
        setupLocation: 'Main Stage',
      },
    ];

    const sampleComms: VendorCommunication[] = [
      {
        id: 'comm1',
        vendorId: 'v1',
        type: 'email',
        subject: 'Final Menu Confirmation',
        notes: 'Confirmed chicken, fish, and vegetarian options for 150 guests',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        followUpRequired: false,
      },
      {
        id: 'comm2',
        vendorId: 'v3',
        type: 'call',
        subject: 'Contract Discussion',
        notes: 'Needs to review contract terms, will send revised version',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    ];

    sampleVendors.forEach(vendor => this.vendors.set(vendor.id, vendor));
    sampleComms.forEach(comm => this.communications.set(comm.id, comm));
  }

  createVendor(vendorData: Partial<Vendor>): Vendor {
    const vendor: Vendor = {
      ...vendorData,
      id: vendorData.id || `v_${Date.now()}`,
      contractSigned: vendorData.contractSigned || false,
      depositPaid: vendorData.depositPaid || 0,
      balanceDue: vendorData.balanceDue || 0,
    } as Vendor;

    VendorSchema.parse(vendor);
    this.vendors.set(vendor.id, vendor);
    return vendor;
  }

  updateVendor(vendorId: string, updates: Partial<Vendor>): boolean {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) return false;
    
    Object.assign(vendor, updates);
    return true;
  }

  signContract(vendorId: string): boolean {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) return false;
    
    vendor.contractSigned = true;
    return true;
  }

  recordPayment(vendorId: string, amount: number): boolean {
    const vendor = this.vendors.get(vendorId);
    if (!vendor) return false;
    
    vendor.depositPaid += amount;
    vendor.balanceDue -= amount;
    return true;
  }

  addCommunication(communicationData: Partial<VendorCommunication>): VendorCommunication {
    const communication: VendorCommunication = {
      ...communicationData,
      id: communicationData.id || `comm_${Date.now()}`,
      followUpRequired: communicationData.followUpRequired || false,
    } as VendorCommunication;

    this.communications.set(communication.id, communication);
    return communication;
  }

  getVendorsForEvent(eventId: string): Vendor[] {
    return Array.from(this.vendors.values()).filter(v => v.eventId === eventId);
  }

  getVendorsByType(eventId: string, type: Vendor['type']): Vendor[] {
    return this.getVendorsForEvent(eventId).filter(v => v.type === type);
  }

  getPendingContracts(eventId: string): Vendor[] {
    return this.getVendorsForEvent(eventId).filter(v => !v.contractSigned);
  }

  getUpcomingPayments(daysAhead: number = 7): Vendor[] {
    const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return Array.from(this.vendors.values()).filter(v => 
      v.paymentDueDate && v.paymentDueDate <= cutoff && v.balanceDue > 0
    );
  }

  getFollowUpCommunications(): VendorCommunication[] {
    return Array.from(this.communications.values()).filter(c => 
      c.followUpRequired && (!c.followUpDate || c.followUpDate >= new Date())
    );
  }

  getStatistics(): {
    totalVendors: number;
    signedContracts: number;
    pendingContracts: number;
    totalBudget: number;
    totalDeposits: number;
    totalBalance: number;
    upcomingPayments: number;
  } {
    const allVendors = Array.from(this.vendors.values());
    const signed = allVendors.filter(v => v.contractSigned);
    const pending = allVendors.filter(v => !v.contractSigned);
    const upcoming = this.getUpcomingPayments();

    return {
      totalVendors: allVendors.length,
      signedContracts: signed.length,
      pendingContracts: pending.length,
      totalBudget: allVendors.reduce((sum, v) => sum + v.contractValue, 0),
      totalDeposits: allVendors.reduce((sum, v) => sum + v.depositPaid, 0),
      totalBalance: allVendors.reduce((sum, v) => sum + v.balanceDue, 0),
      upcomingPayments: upcoming.length,
    };
  }
}
