/**
 * SUBPROCESSOR ADMIN DASHBOARD
 * 
 * Manage subprocessors list - add, edit, remove
 * GDPR Article 28 compliance management
 */

'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Send, Download, Filter } from 'lucide-react';

// Mock data - replace with API calls to your backend
const initialSubprocessors = [
  {
    id: '1',
    name: 'Paystack Technologies Limited',
    category: 'Payment Processing',
    purpose: 'Payment card processing, bank transfers, wallet transactions',
    dataProcessed: 'Card numbers (encrypted), bank account details, transaction amounts, customer names',
    location: 'Nigeria (primary), United Kingdom (backup processing)',
    safeguards: 'PCI DSS Level 1 certified, NDPR compliant, ISO 27001 certified',
    website: 'https://paystack.com/terms/',
    dpaStatus: 'Signed with SCCs',
    dateAdded: '2024-01-15',
    lastReviewed: '2026-03-01',
    status: 'active',
  },
  {
    id: '2',
    name: 'Amazon Web Services (AWS)',
    category: 'Cloud Infrastructure',
    purpose: 'Cloud hosting, database storage, file storage, backup',
    dataProcessed: 'All platform data (user accounts, products, orders, analytics)',
    location: 'AWS regions: af-south-1 Cape Town (primary), eu-west-1 Ireland (fallback)',
    safeguards: 'SOC 2 Type II, ISO 27001, ISO 27017, ISO 27018, GDPR-compliant DPA',
    website: 'https://aws.amazon.com/compliance/',
    dpaStatus: 'AWS Data Processing Addendum accepted',
    dateAdded: '2024-01-15',
    lastReviewed: '2026-03-01',
    status: 'active',
  },
  {
    id: '3',
    name: 'Google Ireland Limited (Google Analytics)',
    category: 'Analytics & Monitoring',
    purpose: 'Website usage analytics, user behavior tracking, conversion measurement',
    dataProcessed: 'IP addresses (anonymized), device information, page views, session duration',
    location: 'EU servers (with Google US access under Data Privacy Framework)',
    safeguards: 'IP anonymization enabled, data retention 26 months, GDPR-compliant config',
    website: 'https://policies.google.com/privacy',
    dpaStatus: 'Google Data Processing Terms accepted',
    dateAdded: '2024-01-15',
    lastReviewed: '2026-03-01',
    status: 'active',
  },
];

export default function SubprocessorsAdmin() {
  const [subprocessors] = useState(initialSubprocessors);
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = ['all', 'Payment Processing', 'Cloud Infrastructure', 'Analytics & Monitoring', 'Marketing & Communications'];

  const filteredSubprocessors = filterCategory === 'all' 
    ? subprocessors 
    : subprocessors.filter(s => s.category === filterCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Subprocessors</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage third-party data processors - GDPR Article 28 compliance
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Subprocessor
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Subprocessors</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{subprocessors.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Active</p>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {subprocessors.filter(s => s.status === 'active').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Pending Review</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {subprocessors.filter(s => s.lastReviewed < '2026-01-01').length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Categories</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{categories.length - 1}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter by category:</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name / Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Purpose
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                DPA Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Reviewed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubprocessors.map((subprocessor) => (
              <tr key={subprocessor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{subprocessor.name}</div>
                  <div className="text-sm text-gray-500">{subprocessor.category}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate" title={subprocessor.purpose}>
                    {subprocessor.purpose}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{subprocessor.location.split('(')[0]}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    subprocessor.dpaStatus.includes('Signed') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {subprocessor.dpaStatus}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(subprocessor.lastReviewed).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-3">
                    <button className="text-blue-600 hover:text-blue-900 flex items-center gap-1">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900 flex items-center gap-1">
                      <Trash2 className="w-4 h-4" />
                      Remove
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Add New Subprocessor</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Paystack Technologies Limited"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {categories.filter(c => c !== 'all').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Purpose of Processing *
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe what data processing this subprocessor performs"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categories of Personal Data Processed *
                  </label>
                  <textarea
                    required
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Card numbers, bank account details, email addresses"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Geographic Location *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Nigeria, EU, United States"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Security Safeguards *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., SOC 2 Type II, ISO 27001, PCI DSS Level 1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Website / Privacy Policy
                    </label>
                    <input
                      type="url"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      DPA Status *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Signed with SCCs</option>
                      <option>Signed with IDTA</option>
                      <option>Adequacy Decision</option>
                      <option>Pending Signature</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Save & Notify Merchants
                  </button>
                </div>

                <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ GDPR Requirement:</strong> Adding this subprocessor will trigger a 30-day notice 
                    to all active merchants. They have the right to object before you begin processing data.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
