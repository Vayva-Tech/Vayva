/**
 * Nonprofit Donor Management Service
 * Manages donor relationships, contributions, and engagement
 */

import { z } from 'zod';

export interface Donor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalDonated: number;
  donationCount: number;
  lastDonationDate?: Date;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  preferences?: {
    communicationMethod?: 'email' | 'phone' | 'mail';
    causes?: string[];
  };
}

export interface Donation {
  id: string;
  donorId: string;
  amount: number;
  date: Date;
  campaign?: string;
  type: 'one-time' | 'recurring' | 'pledge';
  paymentMethod?: 'card' | 'bank' | 'check' | 'cash';
}

export interface DonorConfig {
  enableRecurring?: boolean;
  enablePledges?: boolean;
  trackCauses?: boolean;
}

const DonorSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  totalDonated: z.number().min(0),
  donationCount: z.number().min(0),
  lastDonationDate: z.date().optional(),
  tier: z.enum(['bronze', 'silver', 'gold', 'platinum']),
  preferences: z.object({
    communicationMethod: z.enum(['email', 'phone', 'mail']).optional(),
    causes: z.array(z.string()).optional(),
  }).optional(),
});

export class DonorManagementService {
  private donors: Map<string, Donor>;
  private donations: Map<string, Donation>;
  private config: DonorConfig;

  constructor(config: DonorConfig = {}) {
    this.config = {
      enableRecurring: true,
      enablePledges: true,
      trackCauses: true,
      ...config,
    };
    this.donors = new Map();
    this.donations = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[DONOR_MGMT] Initializing service...');
    console.log('[DONOR_MGMT] Service initialized');
  }

  addDonor(donorData: Partial<Donor>): Donor {
    const donor: Donor = {
      ...donorData,
      id: donorData.id || `donor_${Date.now()}`,
      totalDonated: 0,
      donationCount: 0,
      tier: 'bronze',
    } as Donor;

    DonorSchema.parse(donor);
    this.donors.set(donor.id, donor);
    return donor;
  }

  recordDonation(donationData: Partial<Donation>): Donation {
    const donation: Donation = {
      ...donationData,
      id: donationData.id || `don_${Date.now()}`,
      date: donationData.date || new Date(),
      type: donationData.type || 'one-time',
    } as Donation;

    this.donations.set(donation.id, donation);

    // Update donor stats
    const donor = this.donors.get(donation.donorId);
    if (donor) {
      donor.totalDonated += donation.amount;
      donor.donationCount += 1;
      donor.lastDonationDate = donation.date;
      
      // Update tier
      if (donor.totalDonated >= 10000) donor.tier = 'platinum';
      else if (donor.totalDonated >= 5000) donor.tier = 'gold';
      else if (donor.totalDonated >= 1000) donor.tier = 'silver';
    }

    return donation;
  }

  getDonor(donorId: string): Donor | undefined {
    return this.donors.get(donorId);
  }

  getDonorHistory(donorId: string): Donation[] {
    return Array.from(this.donations.values()).filter(d => d.donorId === donorId);
  }

  getStatistics(): {
    totalDonors: number;
    totalRevenue: number;
    averageDonation: number;
    recurringDonors: number;
    byTier: Record<string, number>;
  } {
    const allDonations = Array.from(this.donations.values());
    const allDonors = Array.from(this.donors.values());
    
    return {
      totalDonors: allDonors.length,
      totalRevenue: allDonations.reduce((sum, d) => sum + d.amount, 0),
      averageDonation: allDonations.length > 0 
        ? allDonations.reduce((sum, d) => sum + d.amount, 0) / allDonations.length 
        : 0,
      recurringDonors: allDonors.filter(d => d.donationCount > 1).length,
      byTier: {
        bronze: allDonors.filter(d => d.tier === 'bronze').length,
        silver: allDonors.filter(d => d.tier === 'silver').length,
        gold: allDonors.filter(d => d.tier === 'gold').length,
        platinum: allDonors.filter(d => d.tier === 'platinum').length,
      },
    };
  }
}
