'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Building2, 
  RefreshCcw, 
  CheckCircle, 
  AlertCircle,
  ArrowRightLeft,
  FileText,
  DollarSign,
  Clock,
  Settings,
  LogOut,
  Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

interface InvoiceSync {
  id: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  status: 'pending' | 'synced' | 'failed';
  platform: 'quickbooks' | 'xero';
  platformId?: string;
  lastSynced?: Date;
  error?: string;
}

export default function InvoicingIntegration() {
  const [activeTab, setActiveTab] = useState('connections');
  
  // Connection states
  const [quickbooksConnected, setQuickbooksConnected] = useState(false);
  const [xeroConnected, setXeroConnected] = useState(false);
  
  // Sync settings
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [syncFrequency, setSyncFrequency] = useState('daily');
  const [syncInvoices, setSyncInvoices] = useState(true);
  const [syncExpenses, setSyncExpenses] = useState(false);
  const [syncClients, setSyncClients] = useState(true);

  // Mock synced invoices
  const syncedInvoices: InvoiceSync[] = [
    { id: '1', invoiceNumber: 'INV-001', clientName: 'Acme Corp', amount: 5000, status: 'synced', platform: 'quickbooks', platformId: 'QB-123', lastSynced: new Date('2024-03-10') },
    { id: '2', invoiceNumber: 'INV-002', clientName: 'TechStart', amount: 3500, status: 'synced', platform: 'quickbooks', platformId: 'QB-124', lastSynced: new Date('2024-03-09') },
    { id: '3', invoiceNumber: 'INV-003', clientName: 'GlobalRetail', amount: 7200, status: 'pending', platform: 'quickbooks' },
    { id: '4', invoiceNumber: 'INV-004', clientName: 'LocalShop', amount: 2800, status: 'failed', platform: 'xero', error: 'Client not found in Xero' },
  ];

  const handleConnectQuickBooks = () => {
    // In production: OAuth flow with QuickBooks
    setTimeout(() => {
      setQuickbooksConnected(true);
      toast.success('QuickBooks connected successfully');
    }, 1000);
  };

  const handleConnectXero = () => {
    // In production: OAuth flow with Xero
    setTimeout(() => {
      setXeroConnected(true);
      toast.success('Xero connected successfully');
    }, 1000);
  };

  const handleDisconnect = (platform: 'quickbooks' | 'xero') => {
    if (platform === 'quickbooks') {
      setQuickbooksConnected(false);
    } else {
      setXeroConnected(false);
    }
    toast.success(`${platform === 'quickbooks' ? 'QuickBooks' : 'Xero'} disconnected`);
  };

  const handleSyncNow = () => {
    toast.info('Syncing with accounting platform...');
    setTimeout(() => {
      toast.success('Sync completed successfully');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="h-8 w-8 text-primary" />
            Invoicing Integration
          </h1>
          <p className="text-muted-foreground mt-1">
            Connect to QuickBooks or Xero for seamless invoicing
          </p>
        </div>
        <Button onClick={handleSyncNow} disabled={!quickbooksConnected && !xeroConnected}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Sync Now
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={activeTab === 'connections' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('connections')}
        >
          Connections
        </Button>
        <Button
          variant={activeTab === 'settings' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('settings')}
        >
          Sync Settings
        </Button>
        <Button
          variant={activeTab === 'invoices' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('invoices')}
        >
          Synced Invoices
        </Button>
      </div>

      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* QuickBooks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    QuickBooks Online
                  </CardTitle>
                  <CardDescription>
                    Integrate with QuickBooks for invoicing
                  </CardDescription>
                </div>
                {quickbooksConnected && (
                  <Badge className="bg-green-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Invoices</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Clients</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Payments</span>
                </div>
              </div>

              {quickbooksConnected ? (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDisconnect('quickbooks')}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={handleConnectQuickBooks}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect QuickBooks
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Xero */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Xero
                  </CardTitle>
                  <CardDescription>
                    Integrate with Xero for invoicing
                  </CardDescription>
                </div>
                {xeroConnected && (
                  <Badge className="bg-blue-500">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Invoices</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Clients</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span>Bills</span>
                </div>
              </div>

              {xeroConnected ? (
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDisconnect('xero')}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
              ) : (
                <Button className="w-full" onClick={handleConnectXero}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Connect Xero
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <Card>
          <CardHeader>
            <CardTitle>Sync Settings</CardTitle>
            <CardDescription>
              Configure how data syncs between Vayva and your accounting platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync data at scheduled intervals
                  </p>
                </div>
                <Switch
                  checked={autoSyncEnabled}
                  onCheckedChange={setAutoSyncEnabled}
                />
              </div>

              {autoSyncEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="frequency">Sync Frequency</Label>
                  <select
                    id="frequency"
                    value={syncFrequency}
                    onChange={(e) => setSyncFrequency(e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="hourly">Every Hour</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              )}

              <div className="border-t pt-4 space-y-4">
                <Label>Data to Sync</Label>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Invoices</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync invoices and payments
                    </p>
                  </div>
                  <Switch
                    checked={syncInvoices}
                    onCheckedChange={setSyncInvoices}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Expenses</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync expenses and bills
                    </p>
                  </div>
                  <Switch
                    checked={syncExpenses}
                    onCheckedChange={setSyncExpenses}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Clients</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync client information
                    </p>
                  </div>
                  <Switch
                    checked={syncClients}
                    onCheckedChange={setSyncClients}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline">Test Connection</Button>
                <Button onClick={() => toast.success('Settings saved')}>
                  Save Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'invoices' && (
        <Card>
          <CardHeader>
            <CardTitle>Synced Invoices</CardTitle>
            <CardDescription>
              Track invoices synced to accounting platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Invoice</th>
                    <th className="text-left p-3">Client</th>
                    <th className="text-right p-3">Amount</th>
                    <th className="text-left p-3">Platform</th>
                    <th className="text-left p-3">Status</th>
                    <th className="text-left p-3">Last Synced</th>
                  </tr>
                </thead>
                <tbody>
                  {syncedInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b hover:bg-accent/50">
                      <td className="p-3 font-medium">{invoice.invoiceNumber}</td>
                      <td className="p-3">{invoice.clientName}</td>
                      <td className="text-right p-3 font-semibold">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="p-3">
                        <Badge variant={invoice.platform === 'quickbooks' ? 'default' : 'secondary'}>
                          {invoice.platform === 'quickbooks' ? 'QuickBooks' : 'Xero'}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {invoice.status === 'synced' && (
                          <Badge variant="secondary" className="gap-1 bg-green-500">
                            <CheckCircle className="h-3 w-3" />
                            Synced
                          </Badge>
                        )}
                        {invoice.status === 'pending' && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            Pending
                          </Badge>
                        )}
                        {invoice.status === 'failed' && (
                          <Badge variant="destructive" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Failed
                          </Badge>
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {invoice.lastSynced ? (
                          invoice.lastSynced.toLocaleDateString()
                        ) : (
                          '-'
                        )}
                        {invoice.error && (
                          <p className="text-xs text-red-500 mt-1">{invoice.error}</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {syncedInvoices.length} invoices
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ArrowRightLeft className="h-4 w-4 mr-2" />
                  Force Sync
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
