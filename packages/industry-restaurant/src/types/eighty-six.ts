/**
 * 86 Manager types
 * Sold-out item management across channels
 */

export type EightySixReason = 'sold_out' | 'ingredient_unavailable' | 'kitchen_issue' | 'equipment_down' | 'staff_shortage';
export type EightySixChannel = 'pos' | 'online' | 'delivery' | 'kds' | 'kiosk' | 'third_party';

export interface EightySixConfig {
  auto86: boolean;
  thresholdQuantity: number;
  thresholdPercentage: number;
  channelSync: EightySixChannel[];
  staffNotification: boolean;
  notificationChannels: ('push' | 'sms' | 'email' | 'in_app')[];
  autoRestockEstimate: boolean;
  restockLeadTimeMinutes: number;
}

export interface EightySixItem {
  id: string;
  menuItemId: string;
  name: string;
  reason: EightySixReason;
  reasonDetails?: string;
  eightySixedAt: Date;
  eightySixedBy: string;
  estimatedRestock?: Date;
  restockedAt?: Date;
  restockedBy?: string;
  affectedItems: string[]; // Other menu items affected by same ingredient shortage
  channelsDisabled: EightySixChannel[];
  isActive: boolean;
}

export interface EightySixEvent {
  id: string;
  itemId: string;
  type: 'eighty_sixed' | 'restocked' | 'extended';
  timestamp: Date;
  userId: string;
  userName: string;
  details?: string;
}

export interface EightySixStats {
  active86s: number;
  today86s: number;
  week86s: number;
  most86dItems: Array<{
    menuItemId: string;
    name: string;
    count: number;
  }>;
  avgRestockTimeMinutes: number;
}

export interface Auto86Rule {
  id: string;
  ingredientId: string;
  ingredientName: string;
  thresholdQuantity: number;
  affectedMenuItems: string[];
  enabled: boolean;
  channelsToDisable: EightySixChannel[];
}

export interface EightySixNotification {
  id: string;
  itemId: string;
  type: 'new_86' | 'restocked' | 'low_inventory_warning';
  message: string;
  channels: ('push' | 'sms' | 'email' | 'in_app')[];
  sent: boolean;
  sentAt?: Date;
  recipients: string[];
}
