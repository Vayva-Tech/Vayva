/**
 * Legal Industry Dashboard
 * Case management, document handling, and legal practice analytics
 */
"use client";

import { Button } from "@vayva/ui";
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Scales,
  FileText,
  Calendar,
  Users,
  Building,
  Clock,
  CurrencyDollar,
  CheckCircle,
  Warning,
  Eye,
  Funnel,
  MagnifyingGlass,
  Plus,
  DotsThree,
  TrendUp,
  ChartBar,
  ChartPie,
  Pulse
} from '@phosphor-icons/react';
import useSWR from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface LegalCase {
  id: string;
  caseNumber: string;
  title: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  opposingParty?: string;
  caseType: 'civil' | 'criminal' | 'corporate' | 'family' | 'immigration' | 'intellectual-property';
  status: 'open' | 'in-progress' | 'closed' | 'settled' | 'dismissed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  court?: string;
  judge?: string;
  startDate: string;
  endDate?: string;
  nextHearing?: string;
  billing: {
    hourlyRate: number;
    hoursWorked: number;
    billedAmount: number;
    paidAmount: number;
    outstandingBalance: number;
  };
  documents: number;
  notes: number;
  lastUpdated: string;
}

interface LegalDocument {
  id: string;
  title: string;
  type: 'contract' | 'brief' | 'motion' | 'discovery' | 'correspondence' | 'pleading';
  caseId: string;
  fileSize: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'draft' | 'review' | 'final' | 'filed';
  version: number;
  tags: string[];
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  cases: number;
  totalBilled: number;
  lastContact: string;
  status: 'active' | 'inactive' | 'prospect';
}

interface LegalMetrics {
  totalCases: number;
  activeCases: number;
  closedCases: number;
  totalClients: number;
  revenue: number;
  outstandingPayments: number;
  avgCaseValue: number;
  caseSuccessRate: number;
  upcomingDeadlines: number;
}

// Helper functions used across sub-components
function getStatusColor(status: string) {
  switch (status) {
    case 'open': return 'bg-blue-100 text-blue-800';
    case 'in-progress': return 'bg-yellow-100 text-yellow-800';
    case 'closed': return 'bg-green-100 text-green-800';
    case 'settled': return 'bg-purple-100 text-purple-800';
    case 'dismissed': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

function getPriorityColor(priority: string) {
  switch (priority) {
    case 'urgent': return 'bg-red-100 text-red-800';
    case 'high': return 'bg-orange-100 text-orange-800';
    case 'medium': return 'bg-yellow-100 text-yellow-800';
    case 'low': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

// Main Legal Dashboard Component
export default function LegalDashboard() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [activeTab, setActiveTab] = useState<'cases' | 'clients' | 'documents' | 'billing' | 'analytics'>('cases');
  const [selectedCase, setSelectedCase] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch legal metrics
  const { data: metrics, isLoading: metricsLoading } = useSWR<LegalMetrics | null>(
    '/api/legal/metrics',
    async (url: string) => {
      try {
        const response = await apiJson<LegalMetrics>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch legal metrics:', error);
        toast.error('Failed to load legal dashboard data');
        return null;
      }
    }
  );

  // Fetch cases
  const { data: cases, isLoading: casesLoading } = useSWR<LegalCase[]>(
    '/api/legal/cases',
    async (url: string) => {
      try {
        const response = await apiJson<{ cases: LegalCase[] }>(url);
        return response.cases || [];
      } catch (error) {
        console.error('Failed to fetch cases:', error);
        return [];
      }
    }
  );

  // Fetch clients
  const { data: clients, isLoading: clientsLoading } = useSWR<Client[]>(
    '/api/legal/clients',
    async (url: string) => {
      try {
        const response = await apiJson<{ clients: Client[] }>(url);
        return response.clients || [];
      } catch (error) {
        console.error('Failed to fetch clients:', error);
        return [];
      }
    }
  );

  // Filter cases based on search
  const filteredCases = cases?.filter(caseItem => 
    caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    caseItem.client.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const tabs = [
    { id: 'cases', label: 'Cases', icon: <Scales className="h-4 w-4" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="h-4 w-4" /> },
    { id: 'documents', label: 'Documents', icon: <FileText className="h-4 w-4" /> },
    { id: 'billing', label: 'Billing', icon: <CurrencyDollar className="h-4 w-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <ChartBar className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <GradientHeader
          title="Legal Practice Management"
          subtitle="Manage cases, track billing, and monitor practice performance"
          industry={store?.industrySlug || 'default'}
          icon={<Scales className="h-8 w-8" />}
        />
        <a
          href="https://vayva.com/legal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white text-sm font-medium transition-colors"
        >
          <Eye size={16} />
          View Legal Services
        </a>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Overview Cards */}
      {!metricsLoading && metrics && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Cases</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {metrics.activeCases}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Scales className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  ${(metrics.revenue / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <CurrencyDollar className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Outstanding</p>
                <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                  ${(metrics.outstandingPayments / 1000).toFixed(1)}K
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}15` }}>
                <Warning className="h-6 w-6" style={{ color: colors.accent }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Success Rate</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {metrics.caseSuccessRate}%
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <CheckCircle className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
        <input
          type="text"
          placeholder="Search cases, clients, or case numbers..."
          className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Tab Content */}
      {activeTab === 'cases' && (
        <CasesView 
          cases={filteredCases}
          loading={casesLoading}
          selectedCase={selectedCase}
          onSelectCase={setSelectedCase}
        />
      )}
      
      {activeTab === 'clients' && (
        <ClientsView 
          clients={clients || []}
          loading={clientsLoading}
        />
      )}
      
      {activeTab === 'documents' && (
        <DocumentsView />
      )}
      
      {activeTab === 'billing' && (
        <BillingView metrics={metrics ?? null} />
      )}
      
      {activeTab === 'analytics' && (
        <AnalyticsView metrics={metrics ?? null} loading={metricsLoading} />
      )}
    </div>
  );
}

// Cases View Component
function CasesView({ cases, loading, selectedCase, onSelectCase }: any) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {cases.map((caseItem: LegalCase, index: number) => (
        <motion.div
          key={caseItem.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard 
            industry={store?.industrySlug || 'default'}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedCase === caseItem.id ? 'ring-2 ring-green-500' : ''
            }`}
            onClick={() => onSelectCase(caseItem.id)}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{caseItem.caseNumber}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(caseItem.priority)}`}>
                    {caseItem.priority}
                  </span>
                </div>
                <p className="text-gray-500 text-sm">{caseItem.title}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(caseItem.status)}`}>
                {caseItem.status}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-gray-500" />
                <span>{caseItem.client.name}</span>
              </div>
              {caseItem.opposingParty && (
                <div className="flex items-center gap-2 text-sm">
                  <Building className="h-4 w-4 text-gray-500" />
                  <span>vs {caseItem.opposingParty}</span>
                </div>
              )}
              {caseItem.nextHearing && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>Next: {new Date(caseItem.nextHearing).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  {caseItem.documents} docs
                </span>
                <span className="flex items-center gap-1">
                  <CurrencyDollar className="h-4 w-4" />
                  ${(caseItem.billing.outstandingBalance / 1000).toFixed(1)}K owed
                </span>
              </div>
              <DotsThree className="h-4 w-4 text-gray-500" />
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Clients View Component
function ClientsView({ clients, loading }: { clients: Client[]; loading: boolean }) {
  const { store } = useStore();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'prospect': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((client: Client, index: number) => (
        <motion.div
          key={client.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold">{client.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(client.status)}`}>
                {client.status}
              </span>
            </div>
            
            {client.company && (
              <p className="text-sm text-gray-500 mb-2">{client.company}</p>
            )}
            
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Email:</span>
                <span>{client.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Phone:</span>
                <span>{client.phone}</span>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-100">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Cases:</span>
                <span className="font-medium">{client.cases}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Billed:</span>
                <span className="font-medium">${(client.totalBilled / 1000).toFixed(1)}K</span>
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      ))}
    </div>
  );
}

// Documents View Component
function DocumentsView() {
  const { store } = useStore();
  const [docTypeFilter, setDocTypeFilter] = useState<string>('all');

  const documentTypes = [
    { id: 'all', label: 'All Documents' },
    { id: 'contract', label: 'Contracts' },
    { id: 'brief', label: 'Briefs' },
    { id: 'motion', label: 'Motions' },
    { id: 'discovery', label: 'Discovery' }
  ];

  return (
    <div className="space-y-6">
      {/* Document Type Filter */}
      <div className="flex gap-2">
        {documentTypes.map(type => (
          <Button
            key={type.id}
            onClick={() => setDocTypeFilter(type.id)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              docTypeFilter === type.id
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {type.label}
          </Button>
        ))}
      </div>

      <ThemedCard industry={store?.industrySlug || 'default'}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold">Recent Documents</h3>
          <Button className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity">
            <Plus className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
        
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => (
            <div key={i} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="font-medium">Contract Draft #{i}</p>
                  <p className="text-sm text-gray-500">Case #2024-{100+i} • Uploaded 2 days ago</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Draft</span>
                <DotsThree className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );
}

// Billing View Component
function BillingView({ metrics }: { metrics: LegalMetrics | null }) {
  const { store } = useStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-6">Recent Invoices</h3>
          <div className="space-y-4">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div>
                  <p className="font-medium">Invoice #{2024000 + i}</p>
                  <p className="text-sm text-gray-500">Client: Johnson & Associates</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">$2,500.00</p>
                  <p className="text-sm text-gray-500">Due in 15 days</p>
                </div>
              </div>
            ))}
          </div>
        </ThemedCard>
      </div>
      
      <div className="space-y-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Payment Status</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Collected</span>
                <span>${metrics ? (metrics.revenue / 1000).toFixed(1) : '0'}K</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: metrics ? `${(metrics.revenue / (metrics.revenue + metrics.outstandingPayments)) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Outstanding</span>
                <span>${metrics ? (metrics.outstandingPayments / 1000).toFixed(1) : '0'}K</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-orange-500 h-2 rounded-full" 
                  style={{ width: metrics ? `${(metrics.outstandingPayments / (metrics.revenue + metrics.outstandingPayments)) * 100}%` : '0%' }}
                />
              </div>
            </div>
          </div>
        </ThemedCard>
        
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
              Create Invoice
            </Button>
            <Button className="w-full px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Send Payment Reminder
            </Button>
            <Button className="w-full px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Generate Reports
            </Button>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}

// Analytics View Component
function AnalyticsView({ metrics, loading }: { metrics: LegalMetrics | null; loading: boolean }) {
  const { store } = useStore();

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="h-96 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div>
          <div className="space-y-6">
            {[1,2,3].map(i => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Analytics Chart */}
      <div className="lg:col-span-2">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-6">Practice Performance</h3>
          <div className="h-80 bg-gradient-to-br from-muted/20 to-muted/5 rounded-xl border border-gray-100 flex items-center justify-center">
            <div className="text-center">
              <ChartBar className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <p className="font-medium">Revenue & Case Trends</p>
              <p className="text-sm text-gray-500 mt-1">
                Total Revenue: ${(metrics.revenue / 1000).toFixed(1)}K | Success Rate: {metrics.caseSuccessRate}%
              </p>
            </div>
          </div>
        </ThemedCard>
      </div>

      {/* Metrics Sidebar */}
      <div className="space-y-6">
        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Case Distribution</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-500">Open Cases</span>
              <span className="font-bold">{metrics.activeCases}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Closed Cases</span>
              <span className="font-bold text-green-600">{metrics.closedCases}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Avg Case Value</span>
              <span className="font-bold">${(metrics.avgCaseValue / 1000).toFixed(1)}K</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Upcoming Deadlines</span>
              <span className="font-bold text-orange-600">{metrics.upcomingDeadlines}</span>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Financial Health</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Collection Rate</span>
                <span>{metrics.revenue > 0 ? ((metrics.revenue / (metrics.revenue + metrics.outstandingPayments)) * 100).toFixed(1) : '0'}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: metrics.revenue > 0 ? `${(metrics.revenue / (metrics.revenue + metrics.outstandingPayments)) * 100}%` : '0%' }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Client Growth</span>
                <span>+12%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: '65%' }}
                />
              </div>
            </div>
          </div>
        </ThemedCard>

        <ThemedCard industry={store?.industrySlug || 'default'}>
          <h3 className="font-semibold mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button className="w-full px-3 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
              New Case
            </Button>
            <Button className="w-full px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Add Client
            </Button>
            <Button className="w-full px-3 py-2 border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors text-sm">
              Generate Report
            </Button>
          </div>
        </ThemedCard>
      </div>
    </div>
  );
}