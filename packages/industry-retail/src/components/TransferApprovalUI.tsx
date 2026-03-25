'use client';

import React, { useState } from 'react';
import { Card, Button } from "@vayva/ui";

interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
  sku: string;
}

interface TransferRequest {
  id: string;
  fromStore: string;
  fromStoreId: string;
  toStore: string;
  toStoreId: string;
  items: TransferItem[];
  totalItems: number;
  status: 'requested' | 'approved' | 'in-transit' | 'completed' | 'cancelled';
  createdAt: string;
  eta?: string;
  notes?: string;
  priority: 'normal' | 'urgent';
}

export interface TransferApprovalUIProps {
  transfers?: TransferRequest[];
  currentStoreId?: string;
  onApprove?: (transferId: string) => void;
  onReject?: (transferId: string, reason?: string) => void;
  onUpdateStatus?: (transferId: string, status: string) => void;
}

export const TransferApprovalUI: React.FC<TransferApprovalUIProps> = ({
  transfers = [],
  currentStoreId,
  onApprove,
  onReject,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'in-transit' | 'all'>('pending');
  const [selectedTransfer, setSelectedTransfer] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'in-transit': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'completed': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30';
      case 'cancelled': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'requested': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const filteredTransfers = transfers.filter(t => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return t.status === 'requested';
    return t.status === activeTab;
  });

  const pendingCount = transfers.filter(t => t.status === 'requested').length;
  const urgentCount = transfers.filter(t => t.status === 'requested' && t.priority === 'urgent').length;

  const handleApprove = (transferId: string) => {
    onApprove?.(transferId);
    setSelectedTransfer(null);
  };

  const handleReject = () => {
    if (selectedTransfer) {
      onReject?.(selectedTransfer, rejectionReason);
      setRejectionReason('');
      setShowRejectModal(false);
      setSelectedTransfer(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Transfer Approval Center</h2>
          <p className="text-sm text-white/60 mt-1">Manage inter-store inventory transfers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
            <span className="text-yellow-400 font-bold">{pendingCount}</span>
            <span className="text-yellow-400/80 text-sm ml-2">Pending</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30">
            <span className="text-red-400 font-bold">{urgentCount}</span>
            <span className="text-red-400/80 text-sm ml-2">Urgent</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2">
        <Button
          variant={activeTab === 'pending' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('pending')}
        >
          Pending {pendingCount > 0 && `(${pendingCount})`}
        </Button>
        <Button
          variant={activeTab === 'approved' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('approved')}
        >
          Approved
        </Button>
        <Button
          variant={activeTab === 'in-transit' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('in-transit')}
        >
          In Transit
        </Button>
        <Button
          variant={activeTab === 'all' ? 'primary' : 'ghost'}
          onClick={() => setActiveTab('all')}
        >
          All Transfers
        </Button>
      </div>

      {/* Transfers List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTransfers.map((transfer) => (
          <Card
            key={transfer.id}
            className={`border-white/10 bg-white/5 backdrop-blur-md p-6 cursor-pointer transition-all hover:scale-[1.02] ${
              selectedTransfer === transfer.id ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setSelectedTransfer(transfer.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-white">{transfer.id}</h3>
                  <span className={`px-2 py-1 rounded text-xs border capitalize ${getStatusColor(transfer.status)}`}>
                    {transfer.status}
                  </span>
                  {transfer.priority === 'urgent' && (
                    <span className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400 border border-red-500/30">
                      URGENT
                    </span>
                  )}
                </div>
                <div className="text-sm text-white/60">
                  Created: {new Date(transfer.createdAt).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Route */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded bg-white/5">
              <div className="flex-1">
                <div className="text-xs text-white/40 mb-1">From</div>
                <div className="font-medium text-white">{transfer.fromStore}</div>
              </div>
              <svg className="w-6 h-6 text-white/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <div className="flex-1 text-right">
                <div className="text-xs text-white/40 mb-1">To</div>
                <div className="font-medium text-white">{transfer.toStore}</div>
              </div>
            </div>

            {/* Items Summary */}
            <div className="mb-4">
              <div className="text-sm text-white/60 mb-2">Items ({transfer.totalItems})</div>
              <div className="space-y-1">
                {transfer.items.slice(0, 3).map((item, index) => (
                  <div key={index} className="text-sm text-white/80 flex justify-between">
                    <span>{item.productName}</span>
                    <span className="text-white/60">x{item.quantity}</span>
                  </div>
                ))}
                {transfer.items.length > 3 && (
                  <div className="text-xs text-white/40">+{transfer.items.length - 3} more items</div>
                )}
              </div>
            </div>

            {/* ETA */}
            {transfer.eta && (
              <div className="text-xs text-white/60 mb-4">
                ETA: {new Date(transfer.eta).toLocaleString()}
              </div>
            )}

            {/* Actions */}
            {transfer.status === 'requested' && (
              <div className="flex gap-2 pt-4 border-t border-white/10">
                <Button
                  variant="primary"
                  className="flex-1"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    handleApprove(transfer.id);
                  }}
                >
                  Approve Transfer
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    setSelectedTransfer(transfer.id);
                    setShowRejectModal(true);
                  }}
                >
                  Reject
                </Button>
              </div>
            )}

            {/* Status Update for In-Transit */}
            {transfer.status === 'in-transit' && (
              <div className="pt-4 border-t border-white/10">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    onUpdateStatus?.(transfer.id, 'completed');
                  }}
                >
                  Mark as Completed
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Rejection Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <Card className="border-white/10 bg-white/5 backdrop-blur-md p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">Reject Transfer</h3>
            <p className="text-sm text-white/60 mb-4">Please provide a reason for rejection:</p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full h-32 bg-white/10 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-2 mt-4">
              <Button variant="ghost" className="flex-1" onClick={() => setShowRejectModal(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleReject}>
                Confirm Rejection
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {filteredTransfers.length === 0 && (
        <Card className="border-white/10 bg-white/5 backdrop-blur-md p-12 text-center">
          <svg className="w-16 h-16 text-white/20 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="text-lg font-semibold text-white mb-2">No Transfers Found</h3>
          <p className="text-sm text-white/60">
            {activeTab === 'pending' 
              ? 'No pending transfer requests'
              : `No ${activeTab} transfers`}
          </p>
        </Card>
      )}
    </div>
  );
};
