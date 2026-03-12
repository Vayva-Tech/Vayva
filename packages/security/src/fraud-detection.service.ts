import { prisma } from "@vayva/db";
import crypto from "crypto";

export interface FraudCheck {
  id: string;
  storeId: string;
  orderId: string;
  customerId?: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  billingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country: string;
    zip: string;
  };
  amount: number; // in kobo
  paymentMethod: string;
  deviceFingerprint: string;
  riskScore: number; // 0-100
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "declined" | "review";
  rulesTriggered: FraudRule[];
  mlScore?: number;
  velocityData?: {
    ordersLastHour: number;
    ordersLastDay: number;
    amountLastHour: number;
    uniqueCountries24h: number;
  };
  checkedAt: Date;
  decision?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface FraudRule {
  id: string;
  name: string;
  description: string;
  type: "velocity" | "amount" | "geolocation" | "device" | "behavioral" | "ml" | "custom";
  condition: {
    field: string;
    operator: "equals" | "not_equals" | "gt" | "lt" | "gte" | "lte" | "contains" | "regex" | "in";
    value: unknown;
  };
  score: number;
  action: "score" | "block" | "review" | "challenge";
  isActive: boolean;
  priority: number;
}

export interface FraudStats {
  totalChecks: number;
  approved: number;
  declined: number;
  review: number;
  byRiskLevel: Record<string, number>;
  byRule: Array<{ ruleId: string; ruleName: string; triggered: number }>;
  falsePositiveRate: number;
  avgProcessingTime: number;
  trends: {
    daily: Array<{ date: string; fraudRate: number }>;
  };
}

export class FraudDetectionService {
  private readonly HIGH_RISK_THRESHOLD = 75;
  private readonly MEDIUM_RISK_THRESHOLD = 40;
  private readonly VELOCITY_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Perform fraud check on order
   */
  async checkOrder(
    storeId: string,
    data: {
      orderId: string;
      customerId?: string;
      email: string;
      ipAddress: string;
      userAgent: string;
      billingAddress: FraudCheck["billingAddress"];
      shippingAddress: FraudCheck["shippingAddress"];
      amount: number;
      paymentMethod: string;
    }
  ): Promise<FraudCheck> {
    // Generate device fingerprint
    const deviceFingerprint = this.generateDeviceFingerprint(data.userAgent, data.ipAddress);

    // Get active rules for store
    const rules = await prisma.fraudRule.findMany({
      where: { storeId, isActive: true },
      orderBy: { priority: "asc" },
    });

    // Calculate velocity data
    const velocityData = await this.calculateVelocity(storeId, data.customerId, data.email, data.ipAddress);

    // Run fraud checks
    let totalScore = 0;
    const triggeredRules: FraudRule[] = [];
    let autoAction: FraudCheck["status"] = "pending";

    for (const rule of rules) {
      const triggered = await this.evaluateRule(rule, data, velocityData);

      if (triggered) {
        triggeredRules.push(this.mapRule(rule));

        switch (rule.action) {
          case "block":
            autoAction = "declined";
            totalScore = 100;
            break;
          case "review":
            if (autoAction === "pending") autoAction = "review";
            totalScore += rule.score;
            break;
          case "challenge":
            if (autoAction !== "declined") autoAction = "review";
            totalScore += rule.score;
            break;
          case "score":
            totalScore += rule.score;
            break;
        }

        // Early exit if blocked
        if (autoAction === "declined") break;
      }
    }

    // Cap score at 100
    totalScore = Math.min(100, totalScore);

    // Determine risk level
    const riskLevel = this.determineRiskLevel(totalScore);

    // Final status
    const status = autoAction !== "pending" ? autoAction : this.determineStatusByScore(totalScore);

    // Save check result
    const check = await prisma.fraudCheck.create({
      data: {
        storeId,
        orderId: data.orderId,
        customerId: data.customerId,
        email: data.email,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        deviceFingerprint,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        riskScore: totalScore,
        riskLevel,
        status,
        rulesTriggered: triggeredRules,
        velocityData,
        checkedAt: new Date(),
      },
    });

    // Log to fraud history
    await prisma.fraudHistory.create({
      data: {
        checkId: check.id,
        storeId,
        customerId: data.customerId,
        email: data.email,
        ipAddress: data.ipAddress,
        deviceFingerprint,
        action: status,
        reason: triggeredRules.map((r) => r.name).join(", "),
      },
    });

    return this.mapCheck(check);
  }

  /**
   * Create fraud rule
   */
  async createRule(
    storeId: string,
    data: {
      name: string;
      description: string;
      type: FraudRule["type"];
      condition: FraudRule["condition"];
      score: number;
      action: FraudRule["action"];
      priority?: number;
    }
  ): Promise<FraudRule> {
    const rule = await prisma.fraudRule.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        type: data.type,
        condition: data.condition,
        score: data.score,
        action: data.action,
        priority: data.priority || 100,
        isActive: true,
      },
    });

    return this.mapRule(rule);
  }

  /**
   * Update fraud check decision
   */
  async updateDecision(
    checkId: string,
    decision: "approved" | "declined",
    reviewedBy: string,
    notes?: string
  ): Promise<FraudCheck> {
    const updated = await prisma.fraudCheck.update({
      where: { id: checkId },
      data: {
        status: decision,
        decision: notes,
        reviewedBy,
        reviewedAt: new Date(),
      },
    });

    // If it was a false positive, log for model retraining
    if (decision === "approved" && updated.riskLevel !== "low") {
      await prisma.fraudFalsePositive.create({
        data: {
          checkId,
          storeId: updated.storeId,
          riskScore: updated.riskScore,
          rulesTriggered: updated.rulesTriggered,
        },
      });
    }

    return this.mapCheck(updated);
  }

  /**
   * Get fraud statistics
   */
  async getStats(storeId: string, days = 30): Promise<FraudStats> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [
      totalChecks,
      byStatus,
      byRiskLevel,
      byRule,
      falsePositives,
      processingTime,
      dailyTrends,
    ] = await Promise.all([
      prisma.fraudCheck.count({ where: { storeId, checkedAt: { gte: startDate } } }),
      prisma.fraudCheck.groupBy({
        by: ["status"],
        where: { storeId, checkedAt: { gte: startDate } },
        _count: { status: true },
      }),
      prisma.fraudCheck.groupBy({
        by: ["riskLevel"],
        where: { storeId, checkedAt: { gte: startDate } },
        _count: { riskLevel: true },
      }),
      this.getRulesTriggered(storeId, startDate),
      prisma.fraudFalsePositive.count({ where: { storeId, createdAt: { gte: startDate } } }),
      prisma.fraudCheck.aggregate({
        where: { storeId, checkedAt: { gte: startDate } },
        _avg: { processingTimeMs: true },
      }),
      this.getDailyTrends(storeId, startDate),
    ]);

    const approved = byStatus.find((s) => s.status === "approved")?._count.status || 0;
    const declined = byStatus.find((s) => s.status === "declined")?._count.status || 0;
    const review = byStatus.find((s) => s.status === "review")?._count.status || 0;

    return {
      totalChecks,
      approved,
      declined,
      review,
      byRiskLevel: byRiskLevel.reduce(
        (acc, item) => ({ ...acc, [item.riskLevel]: item._count.riskLevel }),
        {}
      ),
      byRule,
      falsePositiveRate: totalChecks > 0 ? falsePositives / totalChecks : 0,
      avgProcessingTime: processingTime._avg.processingTimeMs || 0,
      trends: { daily: dailyTrends },
    };
  }

  /**
   * Check if IP is blocked
   */
  async isIPBlocked(storeId: string, ipAddress: string): Promise<boolean> {
    const blocked = await prisma.fraudBlocklist.findFirst({
      where: {
        storeId,
        type: "ip",
        value: ipAddress,
        expiresAt: { gt: new Date() },
      },
    });

    return !!blocked;
  }

  /**
   * Block IP/email/device
   */
  async addToBlocklist(
    storeId: string,
    data: {
      type: "ip" | "email" | "device" | "card";
      value: string;
      reason: string;
      duration?: "1h" | "24h" | "7d" | "30d" | "permanent";
    }
  ): Promise<void> {
    const durationMap: Record<string, number> = {
      "1h": 60 * 60 * 1000,
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
    };

    const expiresAt =
      data.duration === "permanent"
        ? new Date("2099-12-31")
        : new Date(Date.now() + (durationMap[data.duration || "24h"] || 24 * 60 * 60 * 1000));

    await prisma.fraudBlocklist.upsert({
      where: {
        storeId_type_value: { storeId, type: data.type, value: data.value },
      },
      create: {
        storeId,
        type: data.type,
        value: data.value,
        reason: data.reason,
        expiresAt,
      },
      update: {
        reason: data.reason,
        expiresAt,
      },
    });
  }

  /**
   * Get customer risk profile
   */
  async getCustomerRiskProfile(
    storeId: string,
    customerId: string
  ): Promise<{
    riskScore: number;
    totalOrders: number;
    fraudAttempts: number;
    trustedCustomer: boolean;
  }> {
    const [checks, successfulOrders] = await Promise.all([
      prisma.fraudCheck.findMany({
        where: { storeId, customerId },
        orderBy: { checkedAt: "desc" },
        take: 10,
      }),
      prisma.order.count({
        where: { storeId, customerId, status: { not: "cancelled" } },
      }),
    ]);

    if (checks.length === 0) {
      return { riskScore: 0, totalOrders: 0, fraudAttempts: 0, trustedCustomer: false };
    }

    const avgScore = checks.reduce((sum, c) => sum + c.riskScore, 0) / checks.length;
    const fraudAttempts = checks.filter(
      (c) => c.status === "declined" || c.riskLevel === "high"
    ).length;

    return {
      riskScore: avgScore,
      totalOrders: successfulOrders,
      fraudAttempts,
      trustedCustomer: successfulOrders > 5 && fraudAttempts === 0,
    };
  }

  // Private methods
  private generateDeviceFingerprint(userAgent: string, ipAddress: string): string {
    const hash = crypto.createHash("sha256");
    hash.update(userAgent + ipAddress);
    return hash.digest("hex").substring(0, 32);
  }

  private async calculateVelocity(
    storeId: string,
    customerId: string | undefined,
    email: string,
    ipAddress: string
  ): Promise<FraudCheck["velocityData"]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [ordersLastHour, ordersLastDay, amountLastHour, uniqueCountries] = await Promise.all([
      prisma.fraudCheck.count({
        where: {
          storeId,
          OR: [{ customerId }, { email }, { ipAddress }],
          checkedAt: { gte: oneHourAgo },
        },
      }),
      prisma.fraudCheck.count({
        where: {
          storeId,
          OR: [{ customerId }, { email }, { ipAddress }],
          checkedAt: { gte: oneDayAgo },
        },
      }),
      prisma.fraudCheck.aggregate({
        where: {
          storeId,
          OR: [{ customerId }, { email }, { ipAddress }],
          checkedAt: { gte: oneHourAgo },
        },
        _sum: { amount: true },
      }),
      prisma.fraudCheck.groupBy({
        by: ["billingCountry"],
        where: {
          storeId,
          OR: [{ customerId }, { email }],
          checkedAt: { gte: oneDayAgo },
        },
        _count: true,
      }),
    ]);

    return {
      ordersLastHour,
      ordersLastDay,
      amountLastHour: amountLastHour._sum.amount || 0,
      uniqueCountries24h: uniqueCountries.length,
    };
  }

  private async evaluateRule(
    rule: Record<string, unknown>,
    data: Record<string, unknown>,
    velocityData: Record<string, unknown>
  ): Promise<boolean> {
    const condition = rule.condition as Record<string, unknown>;
    const field = String(condition.field);
    const operator = String(condition.operator);
    const value = condition.value;

    let fieldValue: unknown;

    // Extract field value
    if (field.startsWith("velocity.")) {
      const velocityField = field.replace("velocity.", "");
      fieldValue = velocityData[velocityField];
    } else if (field.startsWith("billing.")) {
      const billing = data.billingAddress as Record<string, unknown>;
      fieldValue = billing?.[field.replace("billing.", "")];
    } else if (field.startsWith("shipping.")) {
      const shipping = data.shippingAddress as Record<string, unknown>;
      fieldValue = shipping?.[field.replace("shipping.", "")];
    } else {
      fieldValue = data[field];
    }

    // Evaluate condition
    switch (operator) {
      case "equals":
        return fieldValue === value;
      case "not_equals":
        return fieldValue !== value;
      case "gt":
        return Number(fieldValue) > Number(value);
      case "lt":
        return Number(fieldValue) < Number(value);
      case "gte":
        return Number(fieldValue) >= Number(value);
      case "lte":
        return Number(fieldValue) <= Number(value);
      case "contains":
        return String(fieldValue).includes(String(value));
      case "regex":
        return new RegExp(String(value)).test(String(fieldValue));
      case "in":
        return Array.isArray(value) && value.includes(fieldValue);
      default:
        return false;
    }
  }

  private determineRiskLevel(score: number): FraudCheck["riskLevel"] {
    if (score >= this.HIGH_RISK_THRESHOLD) return "critical";
    if (score >= this.MEDIUM_RISK_THRESHOLD) return "high";
    if (score >= 20) return "medium";
    return "low";
  }

  private determineStatusByScore(score: number): FraudCheck["status"] {
    if (score >= this.HIGH_RISK_THRESHOLD) return "declined";
    if (score >= this.MEDIUM_RISK_THRESHOLD) return "review";
    return "approved";
  }

  private async getRulesTriggered(
    storeId: string,
    startDate: Date
  ): Promise<FraudStats["byRule"]> {
    const checks = await prisma.fraudCheck.findMany({
      where: { storeId, checkedAt: { gte: startDate } },
      select: { rulesTriggered: true },
    });

    const ruleCounts = new Map<string, { name: string; count: number }>();

    for (const check of checks) {
      const rules = (check.rulesTriggered as Array<{ id: string; name: string }>) || [];
      for (const rule of rules) {
        const existing = ruleCounts.get(rule.id);
        if (existing) {
          existing.count++;
        } else {
          ruleCounts.set(rule.id, { name: rule.name, count: 1 });
        }
      }
    }

    return Array.from(ruleCounts.entries())
      .map(([ruleId, data]) => ({
        ruleId,
        ruleName: data.name,
        triggered: data.count,
      }))
      .sort((a, b) => b.triggered - a.triggered);
  }

  private async getDailyTrends(
    storeId: string,
    startDate: Date
  ): Promise<Array<{ date: string; fraudRate: number }>> {
    const checks = await prisma.fraudCheck.findMany({
      where: { storeId, checkedAt: { gte: startDate } },
      select: { checkedAt: true, status: true },
    });

    const grouped = new Map<string, { total: number; fraud: number }>();

    for (const check of checks) {
      const date = check.checkedAt.toISOString().split("T")[0];
      const existing = grouped.get(date);
      if (existing) {
        existing.total++;
        if (check.status === "declined") existing.fraud++;
      } else {
        grouped.set(date, { total: 1, fraud: check.status === "declined" ? 1 : 0 });
      }
    }

    return Array.from(grouped.entries())
      .map(([date, data]) => ({
        date,
        fraudRate: data.total > 0 ? data.fraud / data.total : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private mapRule(data: Record<string, unknown>): FraudRule {
    return {
      id: String(data.id),
      name: String(data.name),
      description: String(data.description || ""),
      type: data.type as FraudRule["type"],
      condition: data.condition as FraudRule["condition"],
      score: Number(data.score),
      action: data.action as FraudRule["action"],
      isActive: Boolean(data.isActive),
      priority: Number(data.priority),
    };
  }

  private mapCheck(data: Record<string, unknown>): FraudCheck {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      orderId: String(data.orderId),
      customerId: data.customerId ? String(data.customerId) : undefined,
      email: String(data.email),
      ipAddress: String(data.ipAddress),
      userAgent: String(data.userAgent),
      billingAddress: data.billingAddress as FraudCheck["billingAddress"],
      shippingAddress: data.shippingAddress as FraudCheck["shippingAddress"],
      amount: Number(data.amount),
      paymentMethod: String(data.paymentMethod),
      deviceFingerprint: String(data.deviceFingerprint),
      riskScore: Number(data.riskScore),
      riskLevel: data.riskLevel as FraudCheck["riskLevel"],
      status: data.status as FraudCheck["status"],
      rulesTriggered: (data.rulesTriggered as FraudRule[]) || [],
      mlScore: data.mlScore ? Number(data.mlScore) : undefined,
      velocityData: data.velocityData as FraudCheck["velocityData"],
      checkedAt: data.checkedAt as Date,
      decision: data.decision ? String(data.decision) : undefined,
      reviewedBy: data.reviewedBy ? String(data.reviewedBy) : undefined,
      reviewedAt: data.reviewedAt as Date,
    };
  }
}

// Export singleton instance
export const fraudDetectionService = new FraudDetectionService();
