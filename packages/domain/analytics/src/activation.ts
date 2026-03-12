/**
 * Activation System
 *
 * Implements the Activation Triangle:
 * 1. First real WhatsApp order received
 * 2. Payment recorded against order
 * 3. Order lifecycle completed
 */

import { EventName } from "./events";
import { trackEvent } from "./tracker";

export interface ActivationStatus {
  isActivated: boolean;
  firstOrderCreated: boolean;
  firstPaymentRecorded: boolean;
  firstOrderCompleted: boolean;
  activatedAt?: Date;
  timeToActivation?: number; // minutes
}

export class ActivationManager {
  /**
   * Check if user has completed the Activation Triangle
   */
  static async checkActivation(userId: string): Promise<ActivationStatus> {
    try {
      const response = await fetch(`/api/activation/status?userId=${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to check activation status:", error);
      return {
        isActivated: false,
        firstOrderCreated: false,
        firstPaymentRecorded: false,
        firstOrderCompleted: false,
      };
    }
  }

  /**
   * Track first order creation (Activation Triangle step 1)
   */
  static async trackFirstOrder(
    userId: string,
    orderId: string,
    orderValue?: number,
    templateId?: string,
  ): Promise<void> {
    await trackEvent({
      userId,
      eventName: EventName.FIRST_ORDER_CREATED,
      properties: { orderId, orderValue },
      templateId,
    });
  }

  /**
   * Track first payment (Activation Triangle step 2)
   */
  static async trackFirstPayment(
    userId: string,
    orderId: string,
    orderValue?: number,
    paymentMethod?: string,
    templateId?: string,
  ): Promise<void> {
    await trackEvent({
      userId,
      eventName: EventName.FIRST_PAYMENT_RECORDED,
      properties: { orderId, orderValue, paymentMethod },
      templateId,
    });
  }

  /**
   * Track first order completion (Activation Triangle step 3)
   * This triggers activation if all steps are complete
   */
  static async trackFirstCompletion(
    userId: string,
    orderId: string,
    templateId?: string,
  ): Promise<void> {
    await trackEvent({
      userId,
      eventName: EventName.FIRST_ORDER_COMPLETED,
      properties: { orderId },
      templateId,
    });

    // Check if this completes activation
    const status = await this.checkActivation(userId);
    if (status.isActivated && !status.activatedAt) {
      // Fire activation event (one-time only)
      await this.triggerActivation(userId, templateId || "");
    }
  }

  /**
   * Trigger user activation (fires once)
   */
  private static async triggerActivation(
    userId: string,
    templateId: string,
  ): Promise<void> {
    const status = await this.checkActivation(userId);

    const activationPath = [];
    if (status.firstOrderCreated) activationPath.push("first_order");
    if (status.firstPaymentRecorded) activationPath.push("first_payment");
    if (status.firstOrderCompleted) activationPath.push("first_completion");

    await trackEvent({
      userId,
      eventName: EventName.USER_ACTIVATED,
      properties: {
        templateId,
        timeToActivation: status.timeToActivation || 0,
        activationPath,
      },
      templateId,
    });
  }
}

/**
 * Template-specific activation signals
 */
export interface TemplateActivationSignals {
  // Structured Retail
  inventoryItemCreated?: boolean;
  inventoryDeducted?: boolean;
  deliveryStatusUpdated?: boolean;

  // Services
  bookingConfirmed?: boolean;
  serviceCompleted?: boolean;

  // Food & Catering
  orderBatched?: boolean;
  repeatCustomer?: boolean;
}

export class TemplateActivationTracker {
  /**
   * Track template-specific activation signals
   */
  static async trackSignal(
    userId: string,
    templateId: string,
    signal: keyof TemplateActivationSignals,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    // Track as custom event with template context
    await trackEvent({
      userId,
      eventName: `template.${signal}` as EventName,
      properties: metadata || {},
      templateId,
    });
  }
}
