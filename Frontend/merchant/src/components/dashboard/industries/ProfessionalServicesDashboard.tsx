/**
 * Professional Services Dashboard - Bookings & Events Archetype
 * 
 * For: Consultants, Lawyers, Accountants, Agencies, Freelancers
 * 
 * Features:
 * - Client project tracking
 * - Billable hours monitoring
 * - Invoice management
 * - Pipeline/deals tracker
 */

'use client';

import { UnifiedDashboard } from '../dashboard-v2/UnifiedDashboard';
import { FeatureGate } from '../features/FeatureGate';
import { MetricsModule, MetricCard } from './modules/MetricsModule';
import { TasksModule } from './modules/TasksModule';
import { ChartsModule, DonutChart } from './modules/ChartsModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { Briefcase, Clock, DollarSign, Users, FileText, TrendingUp } from 'lucide-react';

export function ProfessionalServicesDashboard() {
  const { isVisible: showAdvancedAnalytics } = useModuleVisibility(
    'advanced-analytics',
    { industry: 'professional-services', planTier: 'PRO', enabledFeatures: [] }
  );

  // Sample data
  const revenueData = [
    { date: 'Mon', value: 180000 },
    { date: 'Tue', value: 245000 },
    { date: 'Wed', value: 195000 },
    { date: 'Thu', value: 310000 },
    { date: 'Fri', value: 275000 },
  ];

  const serviceBreakdown = [
    { label: 'Consulting', value: 45, color: '#3b82f6' },
    { label: 'Legal Advisory', value: 30, color: '#10b981' },
    { label: 'Tax Services', value: 15, color: '#f59e0b' },
    { label: 'Other', value: 10, color: '#6b7280' },
  ];

  return (
    <UnifiedDashboard industry="professional-services" planTier="PRO" designCategory="bookings">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Monthly Revenue"
          value="₦1.2M"
          change={18}
          trend="up"
          icon={<DollarSign size={16} className="text-emerald-600" />}
        />
        
        <MetricCard
          label="Active Projects"
          value="24"
          change={4}
          trend="up"
          icon={<Briefcase size={16} className="text-blue-600" />}
        />
        
        <MetricCard
          label="Billable Hours"
          value="156h"
          change={12}
          trend="up"
          icon={<Clock size={16} className="text-purple-600" />}
        />
        
        <MetricCard
          label="Active Clients"
          value="18"
          change={2}
          trend="up"
          icon={<Users size={16} className="text-orange-600" />}
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Active Projects */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Projects</h3>
          <div className="space-y-4">
            <ProjectRow
              client="Acme Corporation"
              project="Legal Restructuring"
              progress={75}
              deadline="Mar 30"
              status="on-track"
            />
            <ProjectRow
              client="TechStart Ltd"
              project="Tax Compliance Audit"
              progress={45}
              deadline="Apr 15"
              status="at-risk"
            />
            <ProjectRow
              client="Global Ventures"
              project="Merger Advisory"
              progress={90}
              deadline="Mar 25"
              status="on-track"
            />
            <ProjectRow
              client="Sunrise Industries"
              project="IP Registration"
              progress={30}
              deadline="Apr 30"
              status="delayed"
            />
          </div>
        </div>

        {/* Service Mix */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Service</h3>
          <DonutChart data={serviceBreakdown} size={200} />
          <div className="mt-4 space-y-2">
            {serviceBreakdown.map(service => (
              <div key={service.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: service.color }}
                  />
                  <span className="text-gray-700">{service.label}</span>
                </div>
                <span className="font-medium text-gray-900">{service.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Time Tracking Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-blue-600" />
            Billable Hours This Week
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Log Time
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Client</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Project</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Hours</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Rate</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
              </tr>
            </thead>
            <tbody>
              {[
                { date: 'Mar 24', client: 'Acme Corp', project: 'Legal Restructuring', hours: 4.5, rate: '₦25,000', amount: '₦112,500' },
                { date: 'Mar 24', client: 'TechStart', project: 'Tax Audit', hours: 3.0, rate: '₦20,000', amount: '₦60,000' },
                { date: 'Mar 23', client: 'Global Ventures', project: 'Merger Advisory', hours: 6.0, rate: '₦30,000', amount: '₦180,000' },
                { date: 'Mar 23', client: 'Sunrise Industries', project: 'IP Registration', hours: 2.5, rate: '₦18,000', amount: '₦45,000' },
                { date: 'Mar 22', client: 'Acme Corp', project: 'Contract Review', hours: 3.5, rate: '₦25,000', amount: '₦87,500' },
              ].map((entry, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-900">{entry.date}</td>
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{entry.client}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{entry.project}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{entry.hours}h</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{entry.rate}/h</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{entry.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoices Section */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={20} className="text-emerald-600" />
            Recent Invoices
          </h3>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
            Create Invoice
          </button>
        </div>
        
        <div className="space-y-3">
          <InvoiceRow
            number="INV-2026-045"
            client="Acme Corporation"
            amount="₦450,000"
            dueDate="Apr 10, 2026"
            status="pending"
          />
          <InvoiceRow
            number="INV-2026-044"
            client="TechStart Ltd"
            amount="₦280,000"
            dueDate="Apr 5, 2026"
            status="sent"
          />
          <InvoiceRow
            number="INV-2026-043"
            client="Global Ventures"
            amount="₦1,200,000"
            dueDate="Mar 28, 2026"
            status="paid"
          />
        </div>
      </div>

      {/* Pipeline/Deals */}
      <FeatureGate minPlan="PRO_PLUS">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-600" />
              Sales Pipeline
            </h3>
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              PRO+ Feature
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PipelineColumn
              stage="Lead"
              count={12}
              value="₦2.4M"
              deals={[
                { name: 'Omega Industries', value: '₦800K' },
                { name: 'Prime Properties', value: '₦600K' },
                { name: 'Stellar Tech', value: '₦1M' },
              ]}
            />
            <PipelineColumn
              stage="Proposal Sent"
              count={5}
              value="₦3.8M"
              deals={[
                { name: 'Apex Manufacturing', value: '₦1.5M' },
                { name: 'Zenith Services', value: '₦2.3M' },
              ]}
            />
            <PipelineColumn
              stage="Negotiation"
              count={3}
              value="₦5.2M"
              deals={[
                { name: 'Titan Enterprises', value: '₦3M' },
                { name: 'Crown Holdings', value: '₦2.2M' },
              ]}
            />
          </div>
        </div>
      </FeatureGate>
    </UnifiedDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

interface ProjectRowProps {
  client: string;
  project: string;
  progress: number;
  deadline: string;
  status: 'on-track' | 'at-risk' | 'delayed';
}

function ProjectRow({ client, project, progress, deadline, status }: ProjectRowProps) {
  const statusColors = {
    'on-track': 'bg-green-100 text-green-800',
    'at-risk': 'bg-yellow-100 text-yellow-800',
    'delayed': 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-gray-900">{client}</p>
          <p className="text-sm text-gray-600 mt-0.5">{project}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status]}`}>
          {status.replace('-', ' ').toUpperCase()}
        </span>
      </div>
      
      <div className="mt-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-900">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              status === 'delayed' ? 'bg-red-500' :
              status === 'at-risk' ? 'bg-yellow-500' :
              'bg-green-500'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Deadline: {deadline}</p>
      </div>
    </div>
  );
}

interface InvoiceRowProps {
  number: string;
  client: string;
  amount: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'sent' | 'overdue';
}

function InvoiceRow({ number, client, amount, dueDate, status }: InvoiceRowProps) {
  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    sent: 'bg-blue-100 text-blue-800',
    overdue: 'bg-red-100 text-red-800',
  };

  return (
    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{number}</p>
        <p className="text-sm text-gray-600 mt-0.5">{client}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900">{amount}</p>
        <div className="flex items-center gap-2 mt-1 justify-end">
          <span className="text-xs text-gray-500">Due: {dueDate}</span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status]}`}>
            {status}
          </span>
        </div>
      </div>
    </div>
  );
}

interface PipelineColumnProps {
  stage: string;
  count: number;
  value: string;
  deals: Array<{ name: string; value: string }>;
}

function PipelineColumn({ stage, count, value, deals }: PipelineColumnProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="mb-3">
        <h4 className="font-semibold text-gray-900">{stage}</h4>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-600">{count} deals</span>
          <span className="text-xs font-semibold text-blue-700">{value}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        {deals.map((deal, idx) => (
          <div key={idx} className="bg-white p-2 rounded border border-gray-200">
            <p className="text-sm font-medium text-gray-900">{deal.name}</p>
            <p className="text-xs text-gray-600 mt-0.5">{deal.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
