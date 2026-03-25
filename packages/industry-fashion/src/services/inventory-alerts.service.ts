/**
 * Inventory Alerts Service
 * Monitors inventory levels and triggers alerts for low stock, overstock, and replenishment needs
 */

export interface InventoryAlertConfig {
  lowStockThreshold?: number;
  overstockThreshold?: number;
  enableAutoDetection?: boolean;
  pollingInterval?: number;
}

export interface InventoryAlert {
  id: string;
  productId: string;
  productName: string;
  alertType: 'low-stock' | 'overstock' | 'out-of-stock' | 'reorder-point';
  currentLevel: number;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestedAction?: string;
  createdAt: Date;
}

export class InventoryAlertService {
  private config: InventoryAlertConfig;
  private alerts: Map<string, InventoryAlert>;
  private pollingTimer?: NodeJS.Timeout;

  constructor(config: InventoryAlertConfig = {}) {
    this.config = {
      lowStockThreshold: 10,
      overstockThreshold: 100,
      enableAutoDetection: true,
      pollingInterval: 300000, // 5 minutes
      ...config,
    };
    this.alerts = new Map();
  }

  async initialize(): Promise<void> {
    if (this.config.enableAutoDetection) {
      this.startPolling();
    }
  }

  private startPolling(): void {
    const poll = async () => {
      await this.detectAlerts();
      this.pollingTimer = setTimeout(poll, this.config.pollingInterval!);
    };
    
    poll();
  }

  private async detectAlerts(): Promise<void> {
    // Production: Integrate with @vayva/inventory package or warehouse management system
    // Would query real-time stock levels from inventory service
    console.log('[INVENTORY_ALERTS] Inventory detection would connect to inventory management system');
  }

  createAlert(alert: Omit<InventoryAlert, 'id' | 'createdAt'>): InventoryAlert {
    const inventoryAlert: InventoryAlert = {
      ...alert,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    this.alerts.set(inventoryAlert.id, inventoryAlert);
    return inventoryAlert;
  }

  getAlerts(severity?: InventoryAlert['severity']): InventoryAlert[] {
    const allAlerts = Array.from(this.alerts.values());
    
    if (!severity) {
      return allAlerts;
    }

    return allAlerts.filter(alert => alert.severity === severity);
  }

  getAlertById(id: string): InventoryAlert | undefined {
    return this.alerts.get(id);
  }

  dismissAlert(id: string): boolean {
    return this.alerts.delete(id);
  }

  clearAllAlerts(): void {
    this.alerts.clear();
  }

  stopPolling(): void {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = undefined;
    }
  }

  async dispose(): Promise<void> {
    this.stopPolling();
    this.clearAllAlerts();
  }
}
