/**
 * Fraud Detection Service - PURE BUSINESS LOGIC ONLY (NO DATABASE)
 * Database operations moved to Backend/core-api/src/services/security/fraud-detection.service.ts
 */
// import { OrderStatus, Prisma, prisma } from "@vayva/db";
// import { prismaDelegates } from "./prisma-delegates";
import crypto from "crypto";
import {
  parseFraudPayload,
  stringifyFraudPayload,
  type StoredFraudPayload,
} from "./fraud/fraud-payload";

/** Domain view of a fraud check row (payload stored in `recommendation` JSON). */
export interface FraudAssessment {
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

/** @deprecated Use `FraudAssessment`; kept for backward-compatible imports. */
export type FraudCheck = FraudAssessment;

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
  private readonly storeRules = new Map<string, FraudRule[]>();
  private readonly blocklist = new Map<string, { expiresAt: Date }>();

  private listRules(storeId: string): FraudRule[] {
    const extra = this.storeRules.get(storeId) ?? [];
    return [...extra].sort((a, b) => a.priority - b.priority);
  }

  /** Rules currently configured for a store (in-memory + defaults). */
  getStoreRules(storeId: string): FraudRule[] {
    return this.listRules(storeId);
  }

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
      billingAddress: FraudAssessment["billingAddress"];
      shippingAddress: FraudAssessment["shippingAddress"];
      amount: number;
      paymentMethod: string;
    }
  ): Promise<FraudAssessment> {
    const deviceFingerprint = this.generateDeviceFingerprint(data.userAgent, data.ipAddress);

    const rules = this.listRules(storeId);

    const velocityData =
      (await this.calculateVelocity(storeId, data.customerId, data.email, data.ipAddress)) ?? {
        ordersLastHour: 0,
        ordersLastDay: 0,
        amountLastHour: 0,
        uniqueCountries24h: 0,
      };

    let totalScore = 0;
    const triggeredRules: FraudRule[] = [];
    let autoAction: FraudAssessment["status"] = "pending";

    const evalData: Record<string, unknown> = { ...data };
    const velocityRecord: Record<string, unknown> = { ...velocityData };

    for (const rule of rules) {
      const triggered = await this.evaluateRule(rule, evalData, velocityRecord);

      if (triggered) {
        triggeredRules.push(rule);

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
            autoAction = "review";
            totalScore += rule.score;
            break;
          case "score":
            totalScore += rule.score;
            break;
        }

        if (autoAction === "declined") break;
      }
    }

    totalScore = Math.min(100, totalScore);

    const riskLevel = this.determineRiskLevel(totalScore);

    const status = autoAction !== "pending" ? autoAction : this.determineStatusByScore(totalScore);

    const payload: StoredFraudPayload = {
      v: 1,
      orderId: data.orderId,
      userAgent: data.userAgent,
      billingAddress: data.billingAddress,
      shippingAddress: data.shippingAddress,
      paymentMethod: data.paymentMethod,
      status,
      rulesTriggered: triggeredRules,
      velocityData,
    };

    const check = await prismaDelegates.fraudCheck.create({
      data: {
        storeId,
        customerId: data.customerId,
        email: data.email,
        ipAddress: data.ipAddress,
        amount: Math.round(data.amount),
        billingCountry: data.billingAddress.country,
        shippingCountry: data.shippingAddress.country,
        deviceFingerprint,
        riskScore: totalScore,
        riskLevel,
        recommendation: stringifyFraudPayload(payload),
        actionTaken: status,
      },
    });

    return this.mapCheckRow(check, payload);
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
    const rule: FraudRule = {
      id: `fr_${crypto.randomBytes(8).toString("hex")}`,
      name: data.name,
      description: data.description,
      type: data.type,
      condition: data.condition,
      score: data.score,
      action: data.action,
      isActive: true,
      priority: data.priority ?? 100,
    };
    const list = this.storeRules.get(storeId) ?? [];
    list.push(rule);
    this.storeRules.set(storeId, list);
    return rule;
  }

  /**
   * Update fraud check decision
   */
  async updateDecision(
    checkId: string,
    decision: "approved" | "declined",
    reviewedBy: string,
    notes?: string
  ): Promise<FraudAssessment> {
    const existing = await prismaDelegates.fraudCheck.findUnique({ where: { id: checkId } });
    if (!existing) {
      throw new Error(`Fraud check not found: ${checkId}`);
    }

    const prev = parseFraudPayload(existing.recommendation);
    const payload: StoredFraudPayload = {
      v: 1,
      orderId: prev.orderId ?? "",
      userAgent: prev.userAgent ?? "",
      billingAddress:
        prev.billingAddress ?? {
          street: "",
          city: "",
          state: "",
          country: existing.billingCountry,
          zip: "",
        },
      shippingAddress:
        prev.shippingAddress ?? {
          street: "",
          city: "",
          state: "",
          country: existing.shippingCountry,
          zip: "",
        },
      paymentMethod: prev.paymentMethod ?? "",
      status: decision,
      rulesTriggered: (prev.rulesTriggered as FraudRule[]) ?? [],
      velocityData: prev.velocityData,
      decision: notes,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
    };

    const updated = await prismaDelegates.fraudCheck.update({
      where: { id: checkId },
      data: {
        actionTaken: decision,
        recommendation: stringifyFraudPayload(payload),
      },
    });

    if (decision === "approved" && updated.riskLevel !== "low" && updated.riskLevel !== null) {
      await prismaDelegates.fraudModelFeedback
        .create({
          data: {
            storeId: updated.storeId,
            originalScore: updated.riskScore ?? 0,
            actualOutcome: "legitimate",
            features: {} as Prisma.InputJsonValue,
            modelVersion: "rules-v1",
          },
        })
        .catch(() => {});
    }

    return this.mapCheckRow(updated, payload);
  }

  /**
   * Get fraud statistics
   */
  async getStats(storeId: string, days = 30): Promise<FraudStats> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [totalChecks, byStatus, byRiskLevel, byRule, falsePositives, dailyTrends] =
      await Promise.all([
        prismaDelegates.fraudCheck.count({ where: { storeId, checkedAt: { gte: startDate } } }),
        prismaDelegates.fraudCheck.groupBy({
          by: ["actionTaken"],
          where: { storeId, checkedAt: { gte: startDate } },
          _count: { actionTaken: true },
        }),
        prismaDelegates.fraudCheck.groupBy({
          by: ["riskLevel"],
          where: { storeId, checkedAt: { gte: startDate } },
          _count: { riskLevel: true },
        }),
        this.getRulesTriggered(storeId, startDate),
        prismaDelegates.fraudModelFeedback.count({
          where: { storeId, createdAt: { gte: startDate } },
        }),
        this.getDailyTrends(storeId, startDate),
      ]);

    const approved =
      byStatus.find((s: { actionTaken: string | null }) => s.actionTaken === "approved")
        ?._count.actionTaken || 0;
    const declined =
      byStatus.find((s: { actionTaken: string | null }) => s.actionTaken === "declined")
        ?._count.actionTaken || 0;
    const review =
      byStatus.find((s: { actionTaken: string | null }) => s.actionTaken === "review")
        ?._count.actionTaken || 0;

    return {
      totalChecks,
      approved,
      declined,
      review,
      byRiskLevel: byRiskLevel.reduce(
        (
          acc: Record<string, number>,
          item: { riskLevel: string | null; _count: { riskLevel: number } }
        ) => ({
          ...acc,
          [item.riskLevel ?? "unknown"]: item._count.riskLevel,
        }),
        {}
      ),
      byRule,
      falsePositiveRate: totalChecks > 0 ? falsePositives / totalChecks : 0,
      avgProcessingTime: 0,
      trends: { daily: dailyTrends },
    };
  }

  /**
   * Check if IP is blocked
   */
  async isIPBlocked(storeId: string, ipAddress: string): Promise<boolean> {
    const key = `${storeId}::ip::${ipAddress}`;
    const entry = this.blocklist.get(key);
    return !!entry && entry.expiresAt > new Date();
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

    const key = `${storeId}::${data.type}::${data.value}`;
    this.blocklist.set(key, { expiresAt });
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
    type FraudCheckRiskRow = {
      riskScore?: number | null;
      actionTaken?: string | null;
      riskLevel?: string | null;
    };

    const [checksRaw, successfulOrders] = await Promise.all([
      prismaDelegates.fraudCheck.findMany({
        where: { storeId, customerId },
        orderBy: { checkedAt: "desc" },
        take: 10,
      }),
      prisma.order.count({
        where: { storeId, customerId, status: { not: OrderStatus.CANCELLED } },
      }),
    ]);

    const checks = checksRaw as FraudCheckRiskRow[];

    if (checks.length === 0) {
      return { riskScore: 0, totalOrders: 0, fraudAttempts: 0, trustedCustomer: false };
    }

    const avgScore =
      checks.reduce((sum: number, c: FraudCheckRiskRow) => sum + (c.riskScore ?? 0), 0) /
      checks.length;
    const fraudAttempts = checks.filter(
      (c: FraudCheckRiskRow) => c.actionTaken === "declined" || c.riskLevel === "high"
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
  ): Promise<FraudAssessment["velocityData"]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [ordersLastHour, ordersLastDay, amountLastHour, uniqueCountries] = await Promise.all([
      prismaDelegates.fraudCheck.count({
        where: {
          storeId,
          OR: [{ customerId }, { email }, { ipAddress }],
          checkedAt: { gte: oneHourAgo },
        },
      }),
      prismaDelegates.fraudCheck.count({
        where: {
          storeId,
          OR: [{ customerId }, { email }, { ipAddress }],
          checkedAt: { gte: oneDayAgo },
        },
      }),
      prismaDelegates.fraudCheck.aggregate({
        where: {
          storeId,
          OR: [{ customerId }, { email }, { ipAddress }],
          checkedAt: { gte: oneHourAgo },
        },
        _sum: { amount: true },
      }),
      prismaDelegates.fraudCheck.groupBy({
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
    rule: FraudRule,
    data: Record<string, unknown>,
    velocityData: Record<string, unknown>
  ): Promise<boolean> {
    const condition = rule.condition as unknown as Record<string, unknown>;
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

  private determineRiskLevel(score: number): FraudAssessment["riskLevel"] {
    if (score >= this.HIGH_RISK_THRESHOLD) return "critical";
    if (score >= this.MEDIUM_RISK_THRESHOLD) return "high";
    if (score >= 20) return "medium";
    return "low";
  }

  private determineStatusByScore(score: number): FraudAssessment["status"] {
    if (score >= this.HIGH_RISK_THRESHOLD) return "declined";
    if (score >= this.MEDIUM_RISK_THRESHOLD) return "review";
    return "approved";
  }

  private async getRulesTriggered(
    storeId: string,
    startDate: Date
  ): Promise<FraudStats["byRule"]> {
    const checks = await prismaDelegates.fraudCheck.findMany({
      where: { storeId, checkedAt: { gte: startDate } },
      select: { recommendation: true },
    });

    const ruleCounts = new Map<string, { name: string; count: number }>();

    for (const check of checks) {
      const payload = parseFraudPayload(check.recommendation);
      const rules = (payload.rulesTriggered as Array<{ id: string; name: string }>) || [];
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
    const checks = await prismaDelegates.fraudCheck.findMany({
      where: { storeId, checkedAt: { gte: startDate } },
      select: { checkedAt: true, actionTaken: true },
    });

    const grouped = new Map<string, { total: number; fraud: number }>();

    for (const check of checks) {
      const date = check.checkedAt.toISOString().split("T")[0];
      const existing = grouped.get(date);
      if (existing) {
        existing.total++;
        if (check.actionTaken === "declined") existing.fraud++;
      } else {
        grouped.set(date, { total: 1, fraud: check.actionTaken === "declined" ? 1 : 0 });
      }
    }

    return Array.from(grouped.entries())
      .map(([date, data]) => ({
        date,
        fraudRate: data.total > 0 ? data.fraud / data.total : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private mapCheckRow(
    row: {
      id: string;
      storeId: string;
      customerId: string | null;
      email: string;
      ipAddress: string;
      amount: number;
      billingCountry: string;
      shippingCountry: string;
      deviceFingerprint: string | null;
      riskScore: number | null;
      riskLevel: string | null;
      recommendation: string | null;
      actionTaken: string | null;
      checkedAt: Date;
    },
    payload: StoredFraudPayload
  ): FraudAssessment {
    const status = (payload.status ??
      (row.actionTaken as FraudAssessment["status"]) ??
      "pending") as FraudAssessment["status"];
    const rules = (payload.rulesTriggered as FraudRule[]) ?? [];

    return {
      id: row.id,
      storeId: row.storeId,
      orderId: payload.orderId,
      customerId: row.customerId ?? undefined,
      email: row.email,
      ipAddress: row.ipAddress,
      userAgent: payload.userAgent,
      billingAddress: payload.billingAddress,
      shippingAddress: payload.shippingAddress,
      amount: row.amount,
      paymentMethod: payload.paymentMethod,
      deviceFingerprint: row.deviceFingerprint ?? "",
      riskScore: row.riskScore ?? 0,
      riskLevel: (row.riskLevel as FraudAssessment["riskLevel"]) || "low",
      status,
      rulesTriggered: rules,
      velocityData: payload.velocityData,
      checkedAt: row.checkedAt,
      decision: payload.decision,
      reviewedBy: payload.reviewedBy,
      reviewedAt: payload.reviewedAt ? new Date(payload.reviewedAt) : undefined,
    };
  }
}

// Export singleton instance
export const fraudDetectionService = new FraudDetectionService();
