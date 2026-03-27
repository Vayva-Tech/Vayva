import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Fraud Detection Service - Backend
 * Analyzes orders for fraudulent activity
 */
export class FraudDetectionService {
  constructor(private readonly db = prisma) {}

  /**
   * Assess order for fraud risk
   */
  async assessOrderRisk(orderData: any) {
    const { orderId, storeId, customerId, email, ipAddress, amount, paymentMethod } = orderData;

    // Calculate risk score based on multiple factors
    const riskScore = await this.calculateRiskScore(orderData);
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
    if (riskScore >= 75) riskLevel = 'critical';
    else if (riskScore >= 50) riskLevel = 'high';
    else if (riskScore >= 25) riskLevel = 'medium';

    // Check velocity (orders in last hour/day)
    const velocityData = await this.checkVelocity(email, ipAddress);

    // Run rule-based checks
    const rulesTriggered = await this.runFraudRules(orderData);

    // Store assessment
    const assessment = await this.db.fraudAssessment.create({
      data: {
        id: `fraud-${Date.now()}`,
        storeId,
        orderId,
        customerId,
        email,
        ipAddress,
        userAgent: orderData.userAgent || '',
        billingAddress: orderData.billingAddress,
        shippingAddress: orderData.shippingAddress,
        amount,
        paymentMethod,
        deviceFingerprint: orderData.deviceFingerprint || '',
        riskScore,
        riskLevel,
        status: 'pending',
        rulesTriggered: rulesTriggered.map((r: any) => r.rule),
        mlScore: null,
        velocityData,
        checkedAt: new Date(),
      },
    });

    return {
      id: assessment.id,
      riskScore,
      riskLevel,
      rulesTriggered,
      velocityData,
      recommendation: this.getRecommendation(riskLevel),
    };
  }

  /**
   * Calculate risk score based on multiple factors
   */
  private async calculateRiskScore(orderData: any): Promise<number> {
    let score = 0;

    // High value order
    if (orderData.amount > 50000) score += 20;

    // Mismatched billing/shipping
    if (this.addressesDiffer(orderData.billingAddress, orderData.shippingAddress)) {
      score += 15;
    }

    // International shipping
    if (orderData.shippingAddress?.country !== orderData.billingAddress?.country) {
      score += 20;
    }

    // Multiple payment attempts
    if (orderData.paymentAttempts > 3) {
      score += 25;
    }

    // Suspicious email patterns
    if (this.isSuspiciousEmail(orderData.email)) {
      score += 15;
    }

    return Math.min(score, 100);
  }

  /**
   * Check customer velocity
   */
  private async checkVelocity(email: string, ipAddress: string) {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [ordersLastHour, ordersLastDay] = await Promise.all([
      this.db.order.count({
        where: {
          customerEmail: email,
          createdAt: { gte: oneHourAgo },
        },
      }),
      this.db.order.count({
        where: {
          customerEmail: email,
          createdAt: { gte: oneDayAgo },
        },
      }),
    ]);

    const amountLastHour = await this.db.order.aggregate({
      where: {
        customerEmail: email,
        createdAt: { gte: oneHourAgo },
      },
      _sum: { totalAmount: true },
    });

    return {
      ordersLastHour,
      ordersLastDay,
      amountLastHour: amountLastHour._sum.totalAmount || 0,
      uniqueCountries24h: 1, // Simplified
    };
  }

  /**
   * Run fraud detection rules
   */
  private async runFraudRules(orderData: any) {
    const triggered: any[] = [];

    // Rule: High velocity
    const velocity = await this.checkVelocity(orderData.email, orderData.ipAddress);
    if (velocity.ordersLastHour > 3) {
      triggered.push({ rule: 'HIGH_VELOCITY', severity: 'high' });
    }

    // Rule: High amount
    if (orderData.amount > 100000) {
      triggered.push({ rule: 'HIGH_AMOUNT', severity: 'medium' });
    }

    // Rule: Mismatched addresses
    if (this.addressesDiffer(orderData.billingAddress, orderData.shippingAddress)) {
      triggered.push({ rule: 'ADDRESS_MISMATCH', severity: 'medium' });
    }

    return triggered;
  }

  /**
   * Get recommendation based on risk level
   */
  private getRecommendation(riskLevel: string) {
    switch (riskLevel) {
      case 'critical':
        return 'DECLINE';
      case 'high':
        return 'REVIEW';
      case 'medium':
        return 'REVIEW';
      default:
        return 'APPROVE';
    }
  }

  /**
   * Helper: Check if addresses differ significantly
   */
  private addressesDiffer(addr1: any, addr2: any): boolean {
    if (!addr1 || !addr2) return false;
    return (
      addr1.street !== addr2.street ||
      addr1.city !== addr2.city ||
      addr1.state !== addr2.state ||
      addr1.zip !== addr2.zip ||
      addr1.country !== addr2.country
    );
  }

  /**
   * Helper: Check for suspicious email patterns
   */
  private isSuspiciousEmail(email: string): boolean {
    // Temporary/disposable email domains
    const disposableDomains = ['tempmail.com', 'throwaway.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    return disposableDomains.includes(domain);
  }
}
