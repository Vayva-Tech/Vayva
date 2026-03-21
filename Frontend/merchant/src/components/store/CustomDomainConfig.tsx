'use client';

import React, { useState } from 'react';
import { Button, Input, Card, CardHeader, CardContent, Badge } from '@vayva/ui';
import { Globe, Lock, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface DomainConfig {
  domain: string;
  status: 'pending' | 'active' | 'failed' | 'verifying';
  dnsVerified: boolean;
  sslStatus: 'pending' | 'active' | 'expiring' | 'expired';
  isPrimary: boolean;
}

interface CustomDomainConfigProps {
  storeId: string;
  currentSubdomain: string;
  customDomains?: DomainConfig[];
  onAddDomain?: (domain: string) => Promise<void>;
  onSetPrimary?: (domain: string) => Promise<void>;
  onRemoveDomain?: (domain: string) => Promise<void>;
}

/**
 * Custom Domain Configuration Component
 * Allows merchants to configure their own domains
 */
export function CustomDomainConfig({
  storeId,
  currentSubdomain,
  customDomains = [],
  onAddDomain,
  onSetPrimary,
  onRemoveDomain,
}: CustomDomainConfigProps) {
  const [newDomain, setNewDomain] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultDomain = `${currentSubdomain}.vayva.ng`;

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    
    // Basic validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
    if (!domainRegex.test(newDomain)) {
      setError('Please enter a valid domain (e.g., www.yourstore.com)');
      return;
    }

    setIsAdding(true);
    setError(null);
    
    try {
      await onAddDomain?.(newDomain);
      setNewDomain('');
    } catch (err) {
      setError('Failed to add domain. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'verifying':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'warning' | 'error' | 'outline'> = {
      active: 'default',
      pending: 'warning',
      verifying: 'warning',
      failed: 'error',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Default Domain */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Default Domain
          </h3>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div>
              <p className="font-medium">{defaultDomain}</p>
              <p className="text-sm text-gray-500">
                Your store is always accessible at this address
              </p>
            </div>
            <Badge>Active</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Add Custom Domain */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <ExternalLink className="w-5 h-5" />
            Add Custom Domain
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="www.yourstore.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddDomain} 
                disabled={isAdding || !newDomain.trim()}
              >
                {isAdding ? 'Adding...' : 'Add Domain'}
              </Button>
            </div>
            
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            
            <div className="text-sm text-gray-500 space-y-1">
              <p>After adding your domain, you'll need to:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Add a CNAME record pointing to <code>cname.vayva.ng</code></li>
                <li>Wait for DNS propagation (usually 5-60 minutes)</li>
                <li>We'll automatically verify and issue SSL certificate</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Domains List */}
      {customDomains.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Your Custom Domains
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {customDomains.map((domain) => (
                <div
                  key={domain.domain}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(domain.status)}
                    <div>
                      <p className="font-medium">{domain.domain}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(domain.status)}
                        {domain.sslStatus === 'active' && (
                          <Badge variant="outline" className="text-green-600">
                            SSL Active
                          </Badge>
                        )}
                        {domain.isPrimary && (
                          <Badge variant="info">Primary</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!domain.isPrimary && domain.status === 'active' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onSetPrimary?.(domain.domain)}
                      >
                        Set as Primary
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveDomain?.(domain.domain)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Domain Masking Info */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Domain Masking</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            When visitors access your store through a custom domain, they'll see your 
            custom domain in the browser address bar (e.g., www.yourstore.com) instead 
            of your Vayva subdomain. This is automatic for all custom domains.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
