/**
 * ACCESSIBILITY ISSUES TRACKER
 * 
 * Manage accessibility complaints, track WCAG 2.1 AA progress
 * Monitor response times and resolution rates
 */

'use client';

import { useState } from 'react';
import { Plus, AlertCircle, CheckCircle, Clock, TrendingUp, Download } from 'lucide-react';

// Mock data - replace with API calls
const initialIssues = [
  {
    id: 'ACC-001',
    title: 'Product images missing alt text',
    category: 'Images & Media',
    severity: 'medium', // low, medium, high, critical
    status: 'in-progress', // reported, triaged, in-progress, resolved, wont-fix
    reportedBy: 'JONAPWD member',
    reportedDate: '2026-03-10',
    assignedTo: 'Frontend Team',
    targetDate: '2026-06-30',
    wcagCriteria: '1.1.1 Non-text Content (Level A)',
    description: 'Thousands of product images uploaded by merchants lack alternative text, making them inaccessible to screen reader users.',
    workarounds: 'AI auto-generation using GPT-4 Vision API batch processing',
    updates: [
      { date: '2026-03-10', author: 'Support', comment: 'Issue reported via accessibility@vayva.ng' },
      { date: '2026-03-12', author: 'Engineering', comment: 'Prioritized for Q2 2026 roadmap' },
    ],
  },
  {
    id: 'ACC-002',
    title: 'Color contrast below 4.5:1 ratio',
    category: 'Color Contrast',
    severity: 'medium',
    status: 'reported',
    reportedBy: 'Screen reader user',
    reportedDate: '2026-03-12',
    assignedTo: 'Design Team',
    targetDate: '2026-04-30',
    wcagCriteria: '1.4.3 Contrast (Minimum) (Level AA)',
    description: 'Secondary text (#9CA3AF) on white backgrounds fails WCAG AA contrast requirements.',
    workarounds: 'Users can enable browser high contrast mode',
    updates: [
      { date: '2026-03-12', author: 'Support', comment: 'Initial report received' },
    ],
  },
  {
    id: 'ACC-003',
    title: 'Keyboard trap in complex dropdown menus',
    category: 'Keyboard Navigation',
    severity: 'high',
    status: 'triaged',
    reportedBy: 'Motor impairment user',
    reportedDate: '2026-03-08',
    assignedTo: 'Frontend Team',
    targetDate: '2026-05-31',
    wcagCriteria: '2.1.2 No Keyboard Trap (Level A)',
    description: 'Legacy dropdown menus require mouse interaction to escape, trapping keyboard-only users.',
    workarounds: 'Use search instead of navigation menus',
    updates: [
      { date: '2026-03-08', author: 'Support', comment: 'Reported via phone call' },
      { date: '2026-03-09', author: 'Engineering', comment: 'Confirmed reproducible - marked as high priority' },
    ],
  },
  {
    id: 'ACC-004',
    title: 'Form error messages not associated with fields',
    category: 'Forms & Inputs',
    severity: 'medium',
    status: 'resolved',
    reportedBy: 'Accessibility auditor',
    reportedDate: '2026-02-15',
    assignedTo: 'Frontend Team',
    targetDate: '2026-03-31',
    resolvedDate: '2026-03-15',
    wcagCriteria: '3.3.1 Error Identification (Level A)',
    description: 'Error messages are visually shown but not programmatically linked to form fields via aria-describedby.',
    workarounds: 'None available',
    updates: [
      { date: '2026-02-15', author: 'Auditor', comment: 'Found during third-party audit' },
      { date: '2026-03-01', author: 'Engineering', comment: 'Fix deployed to staging' },
      { date: '2026-03-15', author: 'QA', comment: 'Verified fix in production - marking resolved' },
    ],
  },
];

export default function AccessibilityIssuesTracker() {
  const [issues] = useState(initialIssues);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const statuses = ['all', 'reported', 'triaged', 'in-progress', 'resolved', 'wont-fix'];
  
  const filteredIssues = filterStatus === 'all' 
    ? issues 
    : issues.filter(i => i.status === filterStatus);

  const stats = {
    total: issues.length,
    open: issues.filter(i => ['reported', 'triaged', 'in-progress'].includes(i.status)).length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    overdue: issues.filter(i => new Date(i.targetDate) < new Date() && i.status !== 'resolved').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Accessibility Issues</h1>
          <p className="mt-2 text-sm text-gray-600">
            Track WCAG 2.1 AA conformance progress
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Log Issue
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Total Issues</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Open</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">{stats.open}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Resolved</p>
          <p className="mt-2 text-3xl font-bold text-green-600">{stats.resolved}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <p className="text-sm font-medium text-gray-600">Overdue</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Compliance Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">WCAG 2.1 AA Conformance Progress</h2>
          </div>
          <span className="text-sm font-medium text-blue-700">Target: December 31, 2026</span>
        </div>
        
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-700">Overall Progress</span>
            <span className="font-medium text-blue-700">67% complete</span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full" style={{ width: '67%' }} />
          </div>
        </div>
        
        <p className="text-sm text-gray-700 mt-4">
          <strong className="text-gray-900">Next Milestone:</strong> Fix all high-severity issues by May 31, 2026
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-4">
          <Clock className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4">
        {filteredIssues.map((issue) => (
          <div 
            key={issue.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 flex-1">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                  issue.severity === 'critical' ? 'bg-red-600' :
                  issue.severity === 'high' ? 'bg-orange-600' :
                  issue.severity === 'medium' ? 'bg-yellow-600' :
                  'bg-green-600'
                }`} />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{issue.title}</h3>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      issue.status === 'resolved' 
                        ? 'bg-green-100 text-green-800'
                        : issue.status === 'in-progress'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {issue.status.replace('-', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium text-gray-700">Category:</span> {issue.category}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Severity:</span> {issue.severity}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">WCAG:</span> {issue.wcagCriteria}
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Assigned:</span> {issue.assignedTo}
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">{issue.description}</p>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Reported by <strong className="text-gray-900">{issue.reportedBy}</strong> on {issue.reportedDate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">
                        Target: <strong className="text-gray-900">{issue.targetDate}</strong>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="text-blue-600 hover:text-blue-900 font-medium text-sm">
                View Details →
              </button>
            </div>
            
            {/* Recent Updates */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Recent Updates</p>
              <div className="space-y-2">
                {issue.updates.slice(-2).map((update, idx) => (
                  <div key={idx} className="text-sm text-gray-600 pl-4 border-l-2 border-gray-300">
                    <span className="font-medium text-gray-700">{update.date}</span> - {update.comment}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Issue Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Log Accessibility Issue</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Title *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the accessibility barrier"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Images & Media</option>
                      <option>Color Contrast</option>
                      <option>Keyboard Navigation</option>
                      <option>Forms & Inputs</option>
                      <option>Dynamic Content</option>
                      <option>Mobile Accessibility</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Severity *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Low - Minor inconvenience</option>
                      <option value="medium">Medium - Significant barrier</option>
                      <option value="high">High - Prevents task completion</option>
                      <option value="critical">Critical - Legal/compliance risk</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WCAG 2.1 Criteria
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 1.1.1 Non-text Content (Level A)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detailed Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe the accessibility issue, steps to reproduce, and impact on users"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reported By
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Name or organization"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign To *
                    </label>
                    <select
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Frontend Team</option>
                      <option>Design Team</option>
                      <option>Mobile Team</option>
                      <option>Infrastructure Team</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Resolution Date *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Workaround Available
                    </label>
                    <select
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option>Yes - Users can work around this</option>
                      <option>No - Complete blocker</option>
                      <option>Unknown - Needs investigation</option>
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
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Issue
                  </button>
                </div>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>⏱️ SLA Reminder:</strong> Initial response must be sent within 5 business days. 
                    High/critical severity issues require escalation to engineering lead.
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
