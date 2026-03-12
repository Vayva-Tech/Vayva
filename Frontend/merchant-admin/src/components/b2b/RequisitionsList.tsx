'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';
import { Requisition, RequisitionStatus, RequisitionUrgency, RequisitionItem } from '@/types/phase4-industry';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, FileText, Calendar, User, AlertTriangle, Check, X } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { CreateRequisitionDialog } from './CreateRequisitionDialog';

const urgencyColors: Record<RequisitionUrgency, string> = {
  low: 'bg-green-500',
  normal: 'bg-blue-500',
  high: 'bg-yellow-500',
  urgent: 'bg-red-500',
};

const statusColors: Record<RequisitionStatus, string> = {
  pending: 'bg-yellow-500',
  approved: 'bg-green-500',
  rejected: 'bg-red-500',
  ordered: 'bg-blue-500',
  cancelled: 'bg-gray-500',
};

export function RequisitionsList() {
  const [requisitions, setRequisitions] = useState<Requisition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequisitionStatus | 'all'>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<RequisitionUrgency | 'all'>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  useEffect(() => {
    fetchRequisitions();
  }, []);

  const fetchRequisitions = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (urgencyFilter !== 'all') params.append('urgency', urgencyFilter);

      const response = await fetch(`/api/b2b/requisitions?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRequisitions(data.requisitions || []);
      }
    } catch (error) {
      logger.error('[RequisitionsList] Failed to fetch:', { error });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequisitions();
  }, [statusFilter, urgencyFilter]);

  const filteredRequisitions = requisitions.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.requesterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.customerId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleAction = async (id: string, action: 'approve' | 'reject' | 'order') => {
    try {
      const response = await fetch(`/api/b2b/requisitions/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        fetchRequisitions();
      }
    } catch (error) {
      logger.error(`[RequisitionsList] Failed to ${action}:`, { error });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading requisitions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Purchase Requisitions</h1>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Requisition
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search by requester, customer..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value: string) => setStatusFilter(value as RequisitionStatus | 'all')}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={urgencyFilter} onValueChange={(value: string) => setUrgencyFilter(value as RequisitionUrgency | 'all')}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Urgency</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {filteredRequisitions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No requisitions found</p>
            </CardContent>
          </Card>
        ) : (
          filteredRequisitions.map((req) => (
            <Card key={req.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{req.id.slice(0, 8)}...</h3>
                      <Badge className={urgencyColors[req.urgency]}>{req.urgency}</Badge>
                      <Badge className={statusColors[req.status]}>{req.status}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      {req.requesterName}
                      <span className="mx-2">|</span>
                      <span>Customer: {req.customerId}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      Needed by: {req.neededBy ? formatDate(req.neededBy) : "Not specified"}
                    </div>
                  </div>
                </div>

                {req.items.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <div className="space-y-1">
                      {req.items.map((item: RequisitionItem) => (
                        <div key={item.id} className="text-sm text-gray-600">
                          {item.productId} - Qty: {item.quantity}
                          {item.notes && <span className="text-gray-400 ml-2">({item.notes})</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {req.notes && (
                  <div className="mt-3 text-sm text-gray-500">
                    <span className="font-medium">Notes:</span> {req.notes}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  {req.status === 'pending' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleAction(req.id, 'approve')}
                      >
                        <Check className="mr-1 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction(req.id, 'reject')}
                      >
                        <X className="mr-1 h-4 w-4" />
                        Reject
                      </Button>
                    </>
                  )}
                  {req.status === 'approved' && (
                    <Button
                      size="sm"
                      onClick={() => handleAction(req.id, 'order')}
                    >
                      <Check className="mr-1 h-4 w-4" />
                      Mark Ordered
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <CreateRequisitionDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => {
          setIsCreateDialogOpen(false);
          fetchRequisitions();
        }}
      />
    </div>
  );
}
