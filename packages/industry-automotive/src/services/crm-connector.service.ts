// @ts-nocheck
/**
 * CRM Connector Service
 * Integrates with CRM systems for customer management and follow-ups
 */

import { z } from 'zod';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: 'lead' | 'prospect' | 'customer' | 'inactive';
  source: string;
  assignedTo: string;
  interests: string[];
  budget?: number;
  notes?: string;
  createdAt: Date;
  lastContact?: Date;
  nextFollowUp?: Date;
}

export interface Lead {
  id: string;
  customerId: string;
  vehicleInterest: string[];
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  score: number; // 0-100
  value: number;
  probability: number; // 0-1
  expectedCloseDate?: Date;
  actualCloseDate?: Date;
  lostReason?: string;
}

export interface Interaction {
  id: string;
  customerId: string;
  type: 'call' | 'email' | 'sms' | 'visit' | 'test-drive' | 'other';
  timestamp: Date;
  notes: string;
  outcome?: string;
  followUpRequired?: boolean;
  followUpDate?: Date;
}

export interface CRMConfig {
  enableLeadScoring?: boolean;
  autoAssignLeads?: boolean;
  defaultFollowUpDays?: number;
  enableEmailIntegration?: boolean;
}

const CustomerSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  status: z.enum(['lead', 'prospect', 'customer', 'inactive']),
  source: z.string(),
  assignedTo: z.string(),
  interests: z.array(z.string()),
  budget: z.number().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  lastContact: z.date().optional(),
  nextFollowUp: z.date().optional(),
});

export class CRMConnectorService {
  private customers: Map<string, Customer>;
  private leads: Map<string, Lead>;
  private interactions: Map<string, Interaction>;
  private config: CRMConfig;

  constructor(config: CRMConfig = {}) {
    this.config = {
      enableLeadScoring: true,
      autoAssignLeads: true,
      defaultFollowUpDays: 3,
      enableEmailIntegration: true,
      ...config,
    };
    this.customers = new Map();
    this.leads = new Map();
    this.interactions = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[CRM_CONNECTOR] Initializing service...');
    console.log('[CRM_CONNECTOR] Service initialized');
  }

  /**
   * Create or update a customer
   */
  async upsertCustomer(customerData: Partial<Customer>): Promise<Customer> {
    const existingCustomer = customerData.id ? this.customers.get(customerData.id) : undefined;
    
    const customer: Customer = {
      ...existingCustomer,
      ...customerData,
      id: customerData.id || `cust_${Date.now()}`,
      createdAt: existingCustomer?.createdAt || new Date(),
    } as Customer;

    CustomerSchema.parse(customer);
    this.customers.set(customer.id, customer);
    return customer;
  }

  /**
   * Get customer by ID
   */
  getCustomer(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  /**
   * Search customers
   */
  searchCustomers(query: string): Customer[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.customers.values()).filter(c =>
      c.firstName.toLowerCase().includes(searchTerm) ||
      c.lastName.toLowerCase().includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm) ||
      c.phone.includes(searchTerm)
    );
  }

  /**
   * Create a lead
   */
  async createLead(leadData: Partial<Lead>): Promise<Lead> {
    const lead: Lead = {
      ...leadData,
      id: leadData.id || `lead_${Date.now()}`,
      score: this.calculateLeadScore(leadData),
      probability: this.estimateProbability(leadData),
    } as Lead;

    this.leads.set(lead.id, lead);
    return lead;
  }

  /**
   * Update lead status
   */
  async updateLeadStatus(id: string, status: Lead['status']): Promise<Lead | null> {
    const lead = this.leads.get(id);
    if (!lead) return null;

    const updated = { ...lead, status };
    
    if (status === 'converted') {
      updated.actualCloseDate = new Date();
      // Update customer status
      const customer = this.customers.get(lead.customerId);
      if (customer) {
        customer.status = 'customer';
        this.customers.set(customer.id, customer);
      }
    } else if (status === 'lost' && !updated.lostReason) {
      updated.lostReason = 'Unknown';
    }

    this.leads.set(id, updated);
    return updated;
  }

  /**
   * Log an interaction
   */
  async logInteraction(interactionData: Partial<Interaction>): Promise<Interaction> {
    const interaction: Interaction = {
      ...interactionData,
      id: interactionData.id || `int_${Date.now()}`,
      timestamp: interactionData.timestamp || new Date(),
    } as Interaction;

    this.interactions.set(interaction.id, interaction);

    // Update customer last contact
    const customer = this.customers.get(interaction.customerId);
    if (customer) {
      customer.lastContact = interaction.timestamp;
      
      if (interaction.followUpRequired && interaction.followUpDate) {
        customer.nextFollowUp = interaction.followUpDate;
      }
      
      this.customers.set(customer.id, customer);
    }

    return interaction;
  }

  /**
   * Get customer interactions
   */
  getCustomerInteractions(customerId: string): Interaction[] {
    return Array.from(this.interactions.values())
      .filter(i => i.customerId === customerId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Get leads requiring follow-up
   */
  getFollowUpTasks(dateRange?: [Date, Date]): { customer: Customer; lead: Lead; lastInteraction?: Interaction }[] {
    const tasks: any[] = [];
    const now = new Date();
    
    Array.from(this.customers.values()).forEach(customer => {
      if (!customer.nextFollowUp) return;
      
      if (dateRange) {
        if (customer.nextFollowUp < dateRange[0] || customer.nextFollowUp > dateRange[1]) return;
      }
      
      const customerLeads = Array.from(this.leads.values()).filter(l => l.customerId === customer.id);
      customerLeads.forEach(lead => {
        const interactions = this.getCustomerInteractions(customer.id);
        tasks.push({
          customer,
          lead,
          lastInteraction: interactions[0],
        });
      });
    });

    return tasks;
  }

  /**
   * Get CRM statistics
   */
  getStatistics(): {
    totalCustomers: number;
    totalLeads: number;
    activeLeads: number;
    conversionRate: number;
    averageLeadScore: number;
    interactionsThisWeek: number;
    upcomingFollowUps: number;
  } {
    const customers = Array.from(this.customers.values());
    const leads = Array.from(this.leads.values());
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const converted = leads.filter(l => l.status === 'converted').length;
    const activeLeads = leads.filter(l => ['new', 'contacted', 'qualified'].includes(l.status)).length;

    return {
      totalCustomers: customers.length,
      totalLeads: leads.length,
      activeLeads,
      conversionRate: leads.length > 0 ? (converted / leads.length) * 100 : 0,
      averageLeadScore: leads.length > 0 
        ? leads.reduce((sum, l) => sum + l.score, 0) / leads.length 
        : 0,
      interactionsThisWeek: Array.from(this.interactions.values())
        .filter(i => i.timestamp >= weekAgo).length,
      upcomingFollowUps: customers.filter(c => 
        c.nextFollowUp && c.nextFollowUp > now
      ).length,
    };
  }

  private calculateLeadScore(leadData: Partial<Lead>): number {
    if (!this.config.enableLeadScoring) return 50;

    let score = 50;
    
    // Adjust based on probability
    if (leadData.probability) {
      score += (leadData.probability - 0.5) * 40;
    }

    // Adjust based on value
    if (leadData.value) {
      if (leadData.value > 50000) score += 10;
      else if (leadData.value > 30000) score += 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private estimateProbability(leadData: Partial<Lead>): number {
    // Simple estimation - in production, use ML model
    if (leadData.status === 'qualified') return 0.7;
    if (leadData.status === 'contacted') return 0.4;
    if (leadData.status === 'converted') return 1.0;
    if (leadData.status === 'lost') return 0.0;
    return 0.2; // new
  }
}
