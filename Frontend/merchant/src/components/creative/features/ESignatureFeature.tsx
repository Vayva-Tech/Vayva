'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Signature, 
  Send, 
  CheckCircle, 
  Clock, 
  FileText, 
  Download,
  Eye,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface Contract {
  id: string;
  title: string;
  clientName: string;
  value: number;
  status: 'draft' | 'sent' | 'viewed' | 'signed' | 'expired';
  sentDate?: string;
  signedDate?: string;
  expiresDate?: string;
}

export default function ESignatureFeature() {
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: '1',
      title: 'Website Design Agreement',
      clientName: 'Acme Corp',
      value: 25000,
      status: 'signed',
      sentDate: '2024-03-01',
      signedDate: '2024-03-03',
    },
    {
      id: '2',
      title: 'Brand Identity Contract',
      clientName: 'TechStart Inc',
      value: 15000,
      status: 'viewed',
      sentDate: '2024-03-08',
      expiresDate: '2024-03-22',
    },
    {
      id: '3',
      title: 'Marketing Campaign SOW',
      clientName: 'GlobalRetail',
      value: 18000,
      status: 'sent',
      sentDate: '2024-03-10',
      expiresDate: '2024-03-24',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [eSignEnabled, setESignEnabled] = useState(true);
  const [autoReminders, setAutoReminders] = useState(true);
  const [defaultExpiryDays, setDefaultExpiryDays] = useState(14);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      sent: 'bg-blue-500',
      viewed: 'bg-orange-500',
      signed: 'bg-green-500',
      expired: 'bg-red-500',
    };
    return colors[status];
  };

  const handleSendContract = (id: string) => {
    setContracts(contracts.map(c => 
      c.id === id ? { ...c, status: 'sent', sentDate: new Date().toISOString() } : c
    ));
    toast.success('Contract sent for signature');
  };

  const handleDeleteContract = (id: string) => {
    setContracts(contracts.filter(c => c.id !== id));
    toast.success('Contract deleted');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">E-Signature & Contracts</h1>
          <p className="text-gray-500 mt-1">
            Manage contracts and collect electronic signatures
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <FileText className="h-4 w-4 mr-2" />
          Create Contract
        </Button>
      </div>

      {/* Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>E-Signature Settings</CardTitle>
          <CardDescription>
            Configure your e-signature preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>E-Signature Integration</Label>
              <p className="text-sm text-gray-500">
                Enable electronic signature collection
              </p>
            </div>
            <Switch
              checked={eSignEnabled}
              onCheckedChange={setESignEnabled}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Automatic Reminders</Label>
              <p className="text-sm text-gray-500">
                Send reminder emails for pending signatures
              </p>
            </div>
            <Switch
              checked={autoReminders}
              onCheckedChange={setAutoReminders}
            />
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="expiryDays">Default Expiry (days)</Label>
            <Input
              id="expiryDays"
              type="number"
              value={defaultExpiryDays}
              onChange={(e) => setDefaultExpiryDays(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="grid gap-4">
        {contracts.map((contract) => (
          <Card key={contract.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CardTitle>{contract.title}</CardTitle>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    Client: {contract.clientName} • Value: ${contract.value.toLocaleString()}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                  {contract.status === 'draft' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => handleSendContract(contract.id)}
                    >
                      <Send className="h-4 w-4" />
                      Send
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteContract(contract.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {contract.sentDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>Sent: {new Date(contract.sentDate).toLocaleDateString()}</span>
                  </div>
                )}
                {contract.signedDate && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Signed: {new Date(contract.signedDate).toLocaleDateString()}</span>
                  </div>
                )}
                {contract.expiresDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span>Expires: {new Date(contract.expiresDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{contracts.length}</p>
              <p className="text-sm text-gray-500">Total Contracts</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-500">
                {contracts.filter(c => c.status === 'signed').length}
              </p>
              <p className="text-sm text-gray-500">Signed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-500">
                {contracts.filter(c => c.status === 'viewed').length}
              </p>
              <p className="text-sm text-gray-500">Pending</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                ${contracts.filter(c => c.status === 'signed').reduce((sum, c) => sum + c.value, 0).toLocaleString()}
              </p>
              <p className="text-sm text-gray-500">Signed Value</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
