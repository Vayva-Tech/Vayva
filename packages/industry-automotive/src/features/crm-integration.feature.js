/**
 * CRM Integration Feature
 * Manages customer relationships and lead tracking
 */

export class CRMIntegrationFeature {
  constructor(crmService, config = {}) {
    this.crmService = crmService;
    this.config = {
      enableLeadScoring: true,
      enableAutoFollowUp: true,
      syncInterval: 300000, // 5 minutes
      ...config,
    };
  }

  async initialize() {
    await this.crmService.initialize();
  }

  manageCustomer(customerData) {
    if (customerData.id) {
      return this.crmService.updateCustomer(customerData.id, customerData);
    } else {
      return this.crmService.createCustomer(customerData);
    }
  }

  getCustomer(id) {
    return this.crmService.getCustomerById(id);
  }

  searchCustomers(query) {
    const customers = this.crmService.getCustomers({});
    return customers.filter(c => 
      c.firstName.toLowerCase().includes(query.toLowerCase()) ||
      c.lastName.toLowerCase().includes(query.toLowerCase()) ||
      c.email.toLowerCase().includes(query.toLowerCase())
    );
  }

  createLead(leadData) {
    return this.crmService.createLead(leadData);
  }

  updateLeadStatus(id, status) {
    return this.crmService.updateLead(id, { status });
  }

  logInteraction(interactionData) {
    return this.crmService.logInteraction(interactionData);
  }

  getFollowUpTasks(_dateRange) {
    const interactions = this.crmService.getInteractions({});
    // Filter for follow-up tasks
    return interactions.filter(i => i.type === 'follow_up');
  }

  getCRMStats() {
    const customers = this.crmService.getCustomers({});
    const leads = this.crmService.getLeads({});
    const interactions = this.crmService.getInteractions({});
    
    return {
      totalCustomers: customers.length,
      totalLeads: leads.length,
      totalInteractions: interactions.length,
      newLeadsThisMonth: leads.filter(l => l.status === 'new').length,
      convertedLeads: leads.filter(l => l.status === 'converted').length,
    };
  }
}