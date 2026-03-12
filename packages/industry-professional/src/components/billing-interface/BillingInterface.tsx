'use client';

import React from 'react';

export interface BillingInterfaceProps {
  businessId: string;
  matterId?: string;
  onCreateInvoice?: (data: any) => Promise<void>;
}

export function BillingInterface({ businessId, matterId, onCreateInvoice }: BillingInterfaceProps) {
  const invoices = [
    { id: 'INV-2024-001', matter: 'Smith v. Johnson Corp', amount: 12500, status: 'pending', dueDate: '2024-02-15' },
    { id: 'INV-2024-002', matter: 'TechStart Inc', amount: 8400, status: 'sent', dueDate: '2024-02-01' },
    { id: 'INV-2024-003', matter: 'Williams Estate', amount: 5550, status: 'paid', dueDate: '2024-01-15' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="billing-interface max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Invoices</h2>
        <button
          onClick={() => onCreateInvoice?.({})}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700"
        >
          + New Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Total Outstanding</p>
          <p className="text-2xl font-bold text-gray-900">$20,900</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Pending Invoices</p>
          <p className="text-2xl font-bold text-yellow-600">2</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-gray-600 mb-1">Collected This Month</p>
          <p className="text-2xl font-bold text-green-600">$45,200</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice #</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Matter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="px-6 py-4 text-sm font-medium text-blue-600">{invoice.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{invoice.matter}</td>
                <td className="px-6 py-4 text-sm font-medium">${invoice.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{invoice.dueDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
