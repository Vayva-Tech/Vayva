'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText, DollarSign, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ChangeOrder {
  id: string;
  projectName: string;
  description: string;
  additionalCost: number;
  additionalDays: number;
  status: 'draft' | 'pending' | 'approved' | 'rejected';
  createdDate: string;
  clientResponse?: string;
}

export default function ChangeOrderFeature() {
  const [changeOrders, setChangeOrders] = useState<ChangeOrder[]>([
    {
      id: '1',
      projectName: 'Website Redesign',
      description: 'Add e-commerce functionality with 10 products',
      additionalCost: 8000,
      additionalDays: 14,
      status: 'approved',
      createdDate: '2024-03-01',
      clientResponse: 'Approved - this is exactly what we need!',
    },
    {
      id: '2',
      projectName: 'Brand Identity',
      description: 'Additional logo variations for social media',
      additionalCost: 2000,
      additionalDays: 5,
      status: 'pending',
      createdDate: '2024-03-08',
    },
    {
      id: '3',
      projectName: 'Marketing Campaign',
      description: 'Video production for social media ads',
      additionalCost: 5000,
      additionalDays: 10,
      status: 'draft',
      createdDate: '2024-03-10',
    },
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: 'bg-gray-500',
      pending: 'bg-blue-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500',
    };
    return colors[status];
  };

  const handleApprove = (id: string) => {
    setChangeOrders(changeOrders.map(co => 
      co.id === id ? { ...co, status: 'approved', clientResponse: 'Approved via dashboard' } : co
    ));
    toast.success('Change order approved');
  };

  const handleReject = (id: string) => {
    setChangeOrders(changeOrders.map(co => 
      co.id === id ? { ...co, status: 'rejected', clientResponse: 'Rejected' } : co
    ));
    toast.success('Change order rejected');
  };

  const totalPendingValue = changeOrders
    .filter(co => co.status === 'pending')
    .reduce((sum, co) => sum + co.additionalCost, 0);

  const totalApprovedValue = changeOrders
    .filter(co => co.status === 'approved')
    .reduce((sum, co) => sum + co.additionalCost, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Change Orders</h1>
          <p className="text-gray-500 mt-1">
            Manage scope changes and additional work requests
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Change Order
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-500" />
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${totalPendingValue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">
              {changeOrders.filter(co => co.status === 'pending').length} orders awaiting response
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <DollarSign className="h-4 w-4 text-green-500" />
              Approved This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">${totalApprovedValue.toLocaleString()}</p>
            <p className="text-sm text-gray-500">
              {changeOrders.filter(co => co.status === 'approved').length} approved orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Scope Creep Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-amber-500">
              {Math.round((totalApprovedValue / 50000) * 100)}%
            </p>
            <p className="text-sm text-gray-500">
              of original project budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Change Orders List */}
      <div className="grid gap-4">
        {changeOrders.map((co) => (
          <Card key={co.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle>{co.projectName}</CardTitle>
                    <Badge className={getStatusColor(co.status)}>
                      {co.status}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {co.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      +${co.additionalCost.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      +{co.additionalDays} days
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {co.status === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(co.id)}
                        >
                          Reject
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleApprove(co.id)}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                      </>
                    )}
                    {co.status === 'draft' && (
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Created</p>
                  <p className="font-medium">{new Date(co.createdDate).toLocaleDateString()}</p>
                </div>
                {co.clientResponse && (
                  <div>
                    <p className="text-gray-500">Client Response</p>
                    <p className="font-medium italic">{co.clientResponse}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Modal Placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Create Change Order</CardTitle>
              <CardDescription>
                Document scope changes and additional costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Input id="project" placeholder="Select project..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description of Changes</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the additional work..."
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost">Additional Cost ($)</Label>
                  <Input id="cost" type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="days">Additional Days</Label>
                  <Input id="days" type="number" placeholder="0" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success('Change order created');
                  setShowCreateModal(false);
                }}>
                  Create Change Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
