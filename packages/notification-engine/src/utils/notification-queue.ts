import type { NotificationMessage } from '../services/notification-dispatcher.service';

export type QueueType = 'immediate' | 'scheduled' | 'batch';

interface QueuedMessage {
  message: NotificationMessage;
  queueType: QueueType;
  queuedAt: Date;
  processAfter?: Date;
  batchWindowMinutes?: number;
}

export class NotificationQueue {
  private queue: QueuedMessage[] = [];
  private processing: boolean = false;

  async enqueue(
    message: NotificationMessage, 
    queueType: QueueType = 'immediate',
    batchWindowMinutes?: number
  ): Promise<void> {
    const queuedMessage: QueuedMessage = {
      message,
      queueType,
      queuedAt: new Date(),
      batchWindowMinutes
    };

    if (queueType === 'scheduled' && message.scheduledFor) {
      queuedMessage.processAfter = message.scheduledFor;
    } else if (queueType === 'batch' && batchWindowMinutes) {
      queuedMessage.processAfter = new Date(Date.now() + (batchWindowMinutes * 60000));
    }

    this.queue.push(queuedMessage);
    console.info(`[NotificationQueue] Message ${message.id} queued (${queueType})`);
    
    // Start processing if not already running
    if (!this.processing) {
      this.startProcessing();
    }
  }

  private async startProcessing(): Promise<void> {
    if (this.processing) return;
    
    this.processing = true;
    
    while (this.queue.length > 0) {
      const now = new Date();
      const readyMessages = this.queue.filter(qm => 
        !qm.processAfter || qm.processAfter <= now
      );

      // Process ready messages
      for (const queuedMessage of readyMessages) {
        await this.processMessage(queuedMessage);
        this.removeFromQueue(queuedMessage.message.id!);
      }

      // Wait before next check
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    this.processing = false;
  }

  private async processMessage(queuedMessage: QueuedMessage): Promise<void> {
    // In a real implementation, this would:
    // 1. Dequeue the message
    // 2. Send it through the dispatcher
    // 3. Handle retries and failures
    // 4. Update delivery status
    
    console.info(`[NotificationQueue] Processing message: ${queuedMessage.message.id}`);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  private removeFromQueue(messageId: string): void {
    this.queue = this.queue.filter(qm => qm.message.id !== messageId);
  }

  getStats() {
    const stats = {
      total: this.queue.length,
      immediate: this.queue.filter(q => q.queueType === 'immediate').length,
      scheduled: this.queue.filter(q => q.queueType === 'scheduled').length,
      batch: this.queue.filter(q => q.queueType === 'batch').length,
      processing: this.processing
    };
    
    return stats;
  }

  getQueue() {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
  }

  pause(): void {
    this.processing = false;
  }

  resume(): void {
    if (this.queue.length > 0) {
      this.startProcessing();
    }
  }
}