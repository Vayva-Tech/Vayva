/**
 * CRM Integration Component
 * Displays CRM dashboard and customer management interface
 */

import React, { useState, useEffect } from 'react';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  status: string;
}

interface Lead {
  id: string;
  customerId: string;
  status: string;
  score: number;
  value: number;
}

interface CRMStats {
  totalCustomers: number;
  totalLeads: number;
  activeLeads: number;
  conversionRate: number;
  averageLeadScore: number;
}

interface CRMIntegrationProps {
  crmService?: any;
  onCustomerSelect?: (customer: Customer) => void;
}

export const CRMIntegration: React.FC<CRMIntegrationProps> = ({
  crmService,
  onCustomerSelect,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<CRMStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // In production, fetch from service
      // const customerData = await crmService.searchCustomers(searchQuery);
      // const leadData = await crmService.getLeads();
      // const statsData = await crmService.getStatistics();
      
      // Mock data for now
      setCustomers([
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', phone: '555-0101', status: 'lead' },
        { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', phone: '555-0102', status: 'customer' },
      ]);
      
      setLeads([
        { id: '1', customerId: '1', status: 'qualified', score: 75, value: 45000 },
        { id: '2', customerId: '2', status: 'new', score: 50, value: 35000 },
      ]);

      setStats({
        totalCustomers: 2,
        totalLeads: 2,
        activeLeads: 1,
        conversionRate: 50,
        averageLeadScore: 62.5,
      });
    } catch (error) {
      console.error('Failed to load CRM data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    // Debounced search in production
  };

  if (loading) {
    return <div className="p-4">Loading CRM...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Customers</h3>
          <p className="text-2xl font-bold">{stats?.totalCustomers || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Leads</h3>
          <p className="text-2xl font-bold">{stats?.totalLeads || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Leads</h3>
          <p className="text-2xl font-bold">{stats?.activeLeads || 0}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Conversion Rate</h3>
          <p className="text-2xl font-bold">{stats?.conversionRate || 0}%</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Customers</h3>
        </div>
        
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customers.map(customer => (
              <tr key={customer.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 whitespace-nowrap">
                  {customer.firstName} {customer.lastName}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">{customer.email}</td>
                <td className="px-4 py-2 whitespace-nowrap">{customer.phone}</td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    customer.status === 'customer' ? 'bg-green-100 text-green-800' :
                    customer.status === 'lead' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {customer.status}
                  </span>
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <button
                    onClick={() => onCustomerSelect?.(customer)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leads Pipeline */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b">
          <h3 className="text-lg font-semibold">Leads Pipeline</h3>
        </div>
        
        <div className="p-4">
          <div className="space-y-3">
            {leads.map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">Lead #{lead.id}</p>
                  <p className="text-sm text-gray-500">Value: ${lead.value.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">Score: {lead.score}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                    lead.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
