/**
 * Nonprofit Industry Dashboard
 */

export const NONPROFIT_DASHBOARD_CONFIG = {
  industry: 'nonprofit',
  title: 'Nonprofit Dashboard',
  subtitle: 'Fundraising & Donor Management',
  primaryObjectLabel: 'Donation',
  defaultTimeHorizon: 'last_30_days',
  sections: ['overview', 'fundraising', 'donors', 'grants'],
  widgets: [
    {
      id: 'total-raised',
      type: 'kpi-card',
      title: 'Total Raised',
      industry: 'nonprofit',
      dataSource: { type: 'analytics', query: 'donations.total' },
      refreshInterval: 300,
    },
    {
      id: 'active-donors',
      type: 'kpi-card',
      title: 'Active Donors',
      industry: 'nonprofit',
      dataSource: { type: 'analytics', query: 'donors.active' },
      refreshInterval: 300,
    },
    {
      id: 'campaign-progress',
      type: 'kpi-card',
      title: 'Campaign Progress',
      industry: 'nonprofit',
      dataSource: { type: 'analytics', query: 'campaigns.progress' },
      refreshInterval: 300,
    },
    {
      id: 'grant-funding',
      type: 'kpi-card',
      title: 'Grant Funding',
      industry: 'nonprofit',
      dataSource: { type: 'analytics', query: 'grants.funded' },
      refreshInterval: 300,
    }
  ],
  layouts: [
    {
      id: 'default',
      name: 'Default Layout',
      breakpoints: {
        lg: [
          { i: 'total-raised', x: 0, y: 0, w: 3, h: 3 },
          { i: 'active-donors', x: 3, y: 0, w: 3, h: 3 },
          { i: 'campaign-progress', x: 6, y: 0, w: 3, h: 3 },
          { i: 'grant-funding', x: 9, y: 0, w: 3, h: 3 }
        ]
      }
    }
  ],
  kpiCards: [
    { id: 'total-raised', label: 'Total Raised', format: 'currency' },
    { id: 'active-donors', label: 'Active Donors', format: 'number' },
    { id: 'campaign-progress', label: 'Campaign Progress', format: 'percent' },
    { id: 'grant-funding', label: 'Grant Funding', format: 'currency' }
  ],
  alertRules: [
    {
      id: 'low-donation-rate',
      condition: 'donations.rate < 1000',
      threshold: 1000,
      action: 'notify_fundraising_team'
    }
  ],
  actions: [
    { id: 'create-campaign', label: 'Create Campaign', icon: 'plus', action: 'open_campaign_modal' },
    { id: 'manage-donors', label: 'Manage Donors', icon: 'users', action: 'open_donor_manager' }
  ],
  failureModes: ['network_error', 'data_unavailable']
};