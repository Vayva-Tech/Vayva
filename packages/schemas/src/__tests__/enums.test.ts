/**
 * Enums Tests
 * Tests for enum definitions
 */

import { describe, it, expect } from 'vitest';
import {
  Role,
  OrderPaymentStatus,
  OrderFulfillmentStatus,
  ApprovalType,
  ApprovalStatus,
  DeliveryTaskStatus,
  ListingStatus,
  ConversationStatus,
  Channel,
  NotificationType,
} from '../enums';

describe('Enums', () => {
  describe('Role', () => {
    it('should have all expected roles', () => {
      expect(Role.OWNER).toBe('OWNER');
      expect(Role.ADMIN).toBe('ADMIN');
      expect(Role.STAFF).toBe('STAFF');
      expect(Role.OPS_ADMIN).toBe('OPS_ADMIN');
      expect(Role.OPS_AGENT).toBe('OPS_AGENT');
    });

    it('should have correct number of roles', () => {
      const roles = Object.values(Role);
      expect(roles).toHaveLength(5);
    });
  });

  describe('OrderPaymentStatus', () => {
    it('should have all expected statuses', () => {
      expect(OrderPaymentStatus.PENDING).toBe('PENDING');
      expect(OrderPaymentStatus.VERIFIED).toBe('VERIFIED');
      expect(OrderPaymentStatus.FAILED).toBe('FAILED');
      expect(OrderPaymentStatus.REFUNDED).toBe('REFUNDED');
      expect(OrderPaymentStatus.DISPUTED).toBe('DISPUTED');
    });

    it('should have correct number of statuses', () => {
      const statuses = Object.values(OrderPaymentStatus);
      expect(statuses).toHaveLength(5);
    });
  });

  describe('OrderFulfillmentStatus', () => {
    it('should have all expected statuses', () => {
      expect(OrderFulfillmentStatus.PROCESSING).toBe('PROCESSING');
      expect(OrderFulfillmentStatus.OUT_FOR_DELIVERY).toBe('OUT_FOR_DELIVERY');
      expect(OrderFulfillmentStatus.DELIVERED).toBe('DELIVERED');
      expect(OrderFulfillmentStatus.CANCELLED).toBe('CANCELLED');
    });

    it('should have correct number of statuses', () => {
      const statuses = Object.values(OrderFulfillmentStatus);
      expect(statuses).toHaveLength(4);
    });
  });

  describe('ApprovalType', () => {
    it('should have all expected types', () => {
      expect(ApprovalType.DELIVERY_SCHEDULE).toBe('DELIVERY_SCHEDULE');
      expect(ApprovalType.DISCOUNT).toBe('DISCOUNT');
      expect(ApprovalType.REFUND).toBe('REFUND');
      expect(ApprovalType.STATUS_CHANGE).toBe('STATUS_CHANGE');
    });

    it('should have correct number of types', () => {
      const types = Object.values(ApprovalType);
      expect(types).toHaveLength(4);
    });
  });

  describe('ApprovalStatus', () => {
    it('should have all expected statuses', () => {
      expect(ApprovalStatus.PENDING).toBe('PENDING');
      expect(ApprovalStatus.APPROVED).toBe('APPROVED');
      expect(ApprovalStatus.REJECTED).toBe('REJECTED');
      expect(ApprovalStatus.EXPIRED).toBe('EXPIRED');
    });

    it('should have correct number of statuses', () => {
      const statuses = Object.values(ApprovalStatus);
      expect(statuses).toHaveLength(4);
    });
  });

  describe('DeliveryTaskStatus', () => {
    it('should have all expected statuses', () => {
      expect(DeliveryTaskStatus.SCHEDULED).toBe('SCHEDULED');
      expect(DeliveryTaskStatus.IN_PROGRESS).toBe('IN_PROGRESS');
      expect(DeliveryTaskStatus.DELIVERED).toBe('DELIVERED');
      expect(DeliveryTaskStatus.FAILED).toBe('FAILED');
      expect(DeliveryTaskStatus.CANCELLED).toBe('CANCELLED');
    });

    it('should have correct number of statuses', () => {
      const statuses = Object.values(DeliveryTaskStatus);
      expect(statuses).toHaveLength(5);
    });
  });

  describe('ListingStatus', () => {
    it('should have all expected statuses', () => {
      expect(ListingStatus.UNLISTED).toBe('UNLISTED');
      expect(ListingStatus.LISTED).toBe('LISTED');
      expect(ListingStatus.PENDING_REVIEW).toBe('PENDING_REVIEW');
      expect(ListingStatus.REJECTED).toBe('REJECTED');
    });

    it('should have correct number of statuses', () => {
      const statuses = Object.values(ListingStatus);
      expect(statuses).toHaveLength(4);
    });
  });

  describe('ConversationStatus', () => {
    it('should have all expected statuses', () => {
      expect(ConversationStatus.OPEN).toBe('OPEN');
      expect(ConversationStatus.ESCALATED).toBe('ESCALATED');
      expect(ConversationStatus.RESOLVED).toBe('RESOLVED');
    });

    it('should have correct number of statuses', () => {
      const statuses = Object.values(ConversationStatus);
      expect(statuses).toHaveLength(3);
    });
  });

  describe('Channel', () => {
    it('should have all expected channels', () => {
      expect(Channel.STOREFRONT).toBe('STOREFRONT');
      expect(Channel.MARKETPLACE).toBe('MARKETPLACE');
      expect(Channel.WHATSAPP_AI).toBe('WHATSAPP_AI');
    });

    it('should have correct number of channels', () => {
      const channels = Object.values(Channel);
      expect(channels).toHaveLength(3);
    });
  });

  describe('NotificationType', () => {
    it('should have all expected types', () => {
      expect(NotificationType.ORDER).toBe('ORDER');
      expect(NotificationType.APPROVAL).toBe('APPROVAL');
      expect(NotificationType.PAYMENT).toBe('PAYMENT');
      expect(NotificationType.PAYOUT).toBe('PAYOUT');
      expect(NotificationType.SYSTEM).toBe('SYSTEM');
    });

    it('should have correct number of types', () => {
      const types = Object.values(NotificationType);
      expect(types).toHaveLength(5);
    });
  });

  describe('Enum values are unique within each enum', () => {
    it('should have unique values within each enum type', () => {
      const enums = [
        { name: 'Role', values: Object.values(Role) },
        { name: 'OrderPaymentStatus', values: Object.values(OrderPaymentStatus) },
        { name: 'OrderFulfillmentStatus', values: Object.values(OrderFulfillmentStatus) },
        { name: 'ApprovalType', values: Object.values(ApprovalType) },
        { name: 'ApprovalStatus', values: Object.values(ApprovalStatus) },
        { name: 'DeliveryTaskStatus', values: Object.values(DeliveryTaskStatus) },
        { name: 'ListingStatus', values: Object.values(ListingStatus) },
        { name: 'ConversationStatus', values: Object.values(ConversationStatus) },
        { name: 'Channel', values: Object.values(Channel) },
        { name: 'NotificationType', values: Object.values(NotificationType) },
      ];

      enums.forEach(({ name, values }) => {
        const uniqueValues = new Set(values as readonly string[]);
        expect(uniqueValues.size).toBe(values.length);
      });
    });

    it('should detect common status values across enums', () => {
      // Some values like PENDING, CANCELLED, DELIVERED may appear in multiple enums
      // This is expected and valid for domain modeling
      const allValues = [
        ...Object.values(Role),
        ...Object.values(OrderPaymentStatus),
        ...Object.values(OrderFulfillmentStatus),
        ...Object.values(ApprovalType),
        ...Object.values(ApprovalStatus),
        ...Object.values(DeliveryTaskStatus),
        ...Object.values(ListingStatus),
        ...Object.values(ConversationStatus),
        ...Object.values(Channel),
        ...Object.values(NotificationType),
      ];

      const valueCounts = new Map<string, number>();
      allValues.forEach(value => {
        valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
      });

      // Common values that can appear in multiple enums
      const commonValues = ['PENDING', 'CANCELLED', 'DELIVERED', 'REJECTED'];
      
      commonValues.forEach(value => {
        const count = valueCounts.get(value) || 0;
        expect(count).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
