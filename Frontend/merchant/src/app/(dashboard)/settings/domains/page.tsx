'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Globe, 
  Shield, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Activity
} from 'lucide-react';
import { apiJson } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Domain {
  id: string;
  domainName: string;
  customDomain: string | null;
  status: string;
  verifiedAt: Date | null;
  ssl?: {
    status: string;
    expiresAt: Date;
    daysUntilExpiry: number | null;
    provider?: string;
  } | null;
  health?: {
    status: string;
    lastCheck: Date | null;
  };
}

export default function DomainsDashboard() {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch domains
  const { data: domainsData, isLoading, error } = useQuery({
    queryKey: ['domains'],
    queryFn: async () => {
      const response = await apiJson('/api/platform/domains');
      return response.domains || [];
    },
  });

  // Add domain mutation
  const addDomainMutation = useMutation({
    mutationFn: async (domainData: { domainName: string; customDomain?: string }) => {
      const response = await apiJson('/api/platform/domains', {
        method: 'POST',
        body: domainData,
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain added successfully');
      setShowAddModal(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to add domain');
    },
  });

  // Verify domain mutation
  const verifyDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const response = await apiJson(`/api/platform/domains/${domainId}/verify`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain verified successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to verify domain');
    },
  });

  // Provision SSL mutation
  const provisionSSLMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const response = await apiJson(`/api/platform/domains/${domainId}/ssl`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('SSL certificate provisioned');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to provision SSL');
    },
  });

  // Renew SSL mutation
  const renewSSLMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const response = await apiJson(`/api/platform/domains/${domainId}/ssl/renew`, {
        method: 'POST',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('SSL certificate renewed');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to renew SSL');
    },
  });

  // Delete domain mutation
  const deleteDomainMutation = useMutation({
    mutationFn: async (domainId: string) => {
      const response = await apiJson(`/api/platform/domains/${domainId}`, {
        method: 'DELETE',
      });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['domains'] });
      toast.success('Domain deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete domain');
    },
  });

  const handleAddDomain = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addDomainMutation.mutate({
      domainName: formData.get('domainName') as string,
      customDomain: formData.get('customDomain') as string || undefined,
    });
  };

  const getSSLStatusBadge = (domain: Domain) => {
    if (!domain.ssl) {
      return <Badge variant="secondary">No SSL</Badge>;
    }

    const daysLeft = domain.ssl.daysUntilExpiry;
    
    if (daysLeft !== null && daysLeft <= 0) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    if (daysLeft !== null && daysLeft <= 30) {
      return (
        <Badge variant="warning" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Expires in {daysLeft}d
        </Badge>
      );
    }

    return (
      <Badge variant="success" className="flex items-center gap-1">
        <Shield className="w-3 h-3" />
        Active
      </Badge>
    );
  };

  const getHealthStatusBadge = (domain: Domain) => {
    if (!domain.health) {
      return <Badge variant="secondary">Unknown</Badge>;
    }

    return domain.health.status === 'healthy' ? (
      <Badge variant="success" className="flex items-center gap-1">
        <Activity className="w-3 h-3" />
        Healthy
      </Badge>
    ) : (
      <Badge variant="destructive" className="flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />
        Unhealthy
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800">Error Loading Domains</CardTitle>
          <CardDescription className="text-red-600">
            {(error as Error).message || 'Failed to load domains'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const domains: Domain[] = domainsData || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Domain Management</h1>
          <p className="text-gray-500 mt-1">Manage custom domains and SSL certificates</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Domain
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Domains</CardTitle>
            <Globe className="w-4 h-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domains.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Verified</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {domains.filter(d => d.status === 'verified').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">SSL Active</CardTitle>
            <Shield className="w-4 h-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {domains.filter(d => d.ssl?.status === 'active').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Healthy</CardTitle>
            <Activity className="w-4 h-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {domains.filter(d => d.health?.status === 'healthy').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Domains List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Domains</CardTitle>
          <CardDescription>
            Manage your custom domains and SSL certificates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {domains.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No domains added yet</p>
              <Button variant="link" onClick={() => setShowAddModal(true)}>
                Add your first domain
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {domains.map((domain) => (
                <div
                  key={domain.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Globe className="w-6 h-6 text-blue-600" />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{domain.domainName}</h3>
                          {domain.customDomain && (
                            <Badge variant="outline">Custom</Badge>
                          )}
                          {domain.status === 'verified' && (
                            <Badge variant="success" className="flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="text-gray-500">
                            Status: <span className="font-medium">{domain.status}</span>
                          </span>
                          
                          {domain.verifiedAt && (
                            <span className="text-gray-500">
                              Verified: <span className="font-medium">{new Date(domain.verifiedAt).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-sm">SSL:</span>
                            {getSSLStatusBadge(domain)}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-gray-600 text-sm">Health:</span>
                            {getHealthStatusBadge(domain)}
                          </div>

                          {domain.ssl?.expiresAt && (
                            <span className="text-gray-500 text-sm">
                              Expires: <span className="font-medium">{new Date(domain.ssl.expiresAt).toLocaleDateString()}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {domain.status !== 'verified' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => verifyDomainMutation.mutate(domain.id)}
                          disabled={verifyDomainMutation.isPending}
                        >
                          Verify
                        </Button>
                      )}

                      {domain.status === 'verified' && !domain.ssl && (
                        <Button
                          size="sm"
                          onClick={() => provisionSSLMutation.mutate(domain.id)}
                          disabled={provisionSSLMutation.isPending}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Enable SSL
                        </Button>
                      )}

                      {domain.ssl && domain.ssl.daysUntilExpiry !== null && domain.ssl.daysUntilExpiry <= 30 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => renewSSLMutation.mutate(domain.id)}
                          disabled={renewSSLMutation.isPending}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Renew SSL
                        </Button>
                      )}

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(`https://${domain.domainName}`, '_blank')}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this domain?')) {
                            deleteDomainMutation.mutate(domain.id);
                          }
                        }}
                        disabled={deleteDomainMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Domain Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Add Domain</CardTitle>
              <CardDescription>
                Add a custom domain to your store
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleAddDomain}>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Domain Name
                  </label>
                  <input
                    type="text"
                    name="domainName"
                    required
                    placeholder="example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Domain (optional)
                  </label>
                  <input
                    type="text"
                    name="customDomain"
                    placeholder="www.example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={addDomainMutation.isPending}>
                    {addDomainMutation.isPending ? 'Adding...' : 'Add Domain'}
                  </Button>
                </div>
              </CardContent>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
