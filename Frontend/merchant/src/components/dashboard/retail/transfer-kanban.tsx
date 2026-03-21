'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, ArrowRight, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
}

interface Transfer {
  id: string;
  fromStore: string;
  toStore: string;
  items: TransferItem[];
  status: 'pending' | 'in_transit' | 'completed' | 'cancelled';
  priority: 'normal' | 'urgent';
  createdAt: string;
  notes?: string;
}

interface TransferKanbanProps {
  transfers?: Transfer[];
  className?: string;
}

export function TransferKanban({ transfers = [], className }: TransferKanbanProps) {
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);

  // Group transfers by status
  const columns = {
    pending: transfers.filter(t => t.status === 'pending'),
    in_transit: transfers.filter(t => t.status === 'in_transit'),
    completed: transfers.filter(t => t.status === 'completed'),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === 'urgent') {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
    return null;
  };

  const getColumnIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_transit': return <ArrowRight className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const totalItems = (items: TransferItem[]) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Inter-Store Transfers</CardTitle>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Transfer
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          {/* Pending Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-semibold text-sm">Pending</h3>
              <div className="flex items-center gap-1 text-gray-500">
                {getColumnIcon('pending')}
                <span className="text-xs">{columns.pending.length}</span>
              </div>
            </div>
            
            {columns.pending.map((transfer) => (
              <div
                key={transfer.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedTransfer === transfer.id ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setSelectedTransfer(transfer.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-sm">{transfer.fromStore.split(' - ')[1]}</div>
                  {getPriorityBadge(transfer.priority)}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <ArrowRight className="w-3 h-3" />
                  <span>{transfer.toStore.split(' - ')[1]}</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {totalItems(transfer.items)} items
                </div>
                
                <Badge className={`${getStatusColor(transfer.status)} mt-2 w-full justify-center`}>
                  {transfer.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>

          {/* In Transit Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-semibold text-sm">In Transit</h3>
              <div className="flex items-center gap-1 text-gray-500">
                {getColumnIcon('in_transit')}
                <span className="text-xs">{columns.in_transit.length}</span>
              </div>
            </div>
            
            {columns.in_transit.map((transfer) => (
              <div
                key={transfer.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedTransfer === transfer.id ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setSelectedTransfer(transfer.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-sm">{transfer.fromStore.split(' - ')[1]}</div>
                  {getPriorityBadge(transfer.priority)}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <ArrowRight className="w-3 h-3" />
                  <span>{transfer.toStore.split(' - ')[1]}</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {totalItems(transfer.items)} items
                </div>
                
                <Badge className={`${getStatusColor(transfer.status)} mt-2 w-full justify-center`}>
                  {transfer.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>

          {/* Completed Column */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b">
              <h3 className="font-semibold text-sm">Completed</h3>
              <div className="flex items-center gap-1 text-gray-500">
                {getColumnIcon('completed')}
                <span className="text-xs">{columns.completed.length}</span>
              </div>
            </div>
            
            {columns.completed.slice(0, 3).map((transfer) => (
              <div
                key={transfer.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md opacity-75 ${
                  selectedTransfer === transfer.id ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => setSelectedTransfer(transfer.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="font-medium text-sm">{transfer.fromStore.split(' - ')[1]}</div>
                  {getPriorityBadge(transfer.priority)}
                </div>
                
                <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                  <ArrowRight className="w-3 h-3" />
                  <span>{transfer.toStore.split(' - ')[1]}</span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {totalItems(transfer.items)} items
                </div>
                
                <Badge className={`${getStatusColor(transfer.status)} mt-2 w-full justify-center`}>
                  {transfer.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
