/**
 * Transfer Approval Service
 * Manages inter-store transfer workflows and approvals
 */

export interface TransferRequest {
  id: string;
  fromStoreId: string;
  toStoreId: string;
  productId: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedAt: Date;
  approvedAt?: Date;
}

export class TransferApprovalService {
  private transfers: Map<string, TransferRequest>;

  constructor() {
    this.transfers = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[TRANSFER_APPROVAL] Initialized');
  }

  createTransfer(transfer: Omit<TransferRequest, 'id' | 'requestedAt'>): TransferRequest {
    const newTransfer: TransferRequest = {
      ...transfer,
      id: `transfer_${Date.now()}`,
      requestedAt: new Date(),
    };
    
    this.transfers.set(newTransfer.id, newTransfer);
    return newTransfer;
  }

  approveTransfer(transferId: string): boolean {
    const transfer = this.transfers.get(transferId);
    if (transfer) {
      this.transfers.set(transferId, {
        ...transfer,
        status: 'approved',
        approvedAt: new Date(),
      });
      return true;
    }
    return false;
  }

  getTransfers(status?: TransferRequest['status']): TransferRequest[] {
    const all = Array.from(this.transfers.values());
    if (!status) return all;
    return all.filter(t => t.status === status);
  }

  async dispose(): Promise<void> {
    this.transfers.clear();
  }
}
