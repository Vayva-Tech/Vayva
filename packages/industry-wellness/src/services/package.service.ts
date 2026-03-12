import type {
  WellnessPackage,
  WellnessClient,
} from '../types';

export interface PackagePurchaseResult {
  purchaseId: string;
  package: WellnessPackage;
  redemptions: Array<{
    serviceId: string;
    serviceName: string;
    quantity: number;
    redeemed: number;
    remaining: number;
  }>;
}

export interface ClientPackages {
  purchaseId: string;
  packageName: string;
  purchaseDate: Date;
  expirationDate: Date;
  totalPrice: number;
  remainingRedemptions: number;
  status: 'active' | 'expired' | 'completed';
  services: Array<{
    serviceId: string;
    serviceName: string;
    totalQuantity: number;
    remainingQuantity: number;
    validityDays: number | null;
  }>;
}

/**
 * WellnessPackageService - Manages service packages, memberships, and redemptions
 * Handles package sales, service redemptions, and client package tracking
 */
export class WellnessPackageService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Purchase a wellness package
   */
  async purchasePackage(data: {
    clientId: string;
    packageId: string;
    paymentMethod: string;
  }): Promise<PackagePurchaseResult> {
    const wellnessPackage = await this.db.wellnessPackage.findUnique({
      where: { id: data.packageId },
      include: { includedServices: true },
    });

    if (!wellnessPackage) throw new Error('Package not found');

    const purchaseId = `pkg_${Date.now()}`;
    const purchaseDate = new Date();
    const expirationDate = new Date(purchaseDate);
    expirationDate.setMonth(expirationDate.getMonth() + wellnessPackage.validityMonths);

    // Create package purchase record
    await this.db.packagePurchase.create({
      data: {
        id: purchaseId,
        clientId: data.clientId,
        packageId: data.packageId,
        purchaseDate,
        expirationDate,
        totalPrice: wellnessPackage.price,
        paymentMethod: data.paymentMethod,
        status: 'active',
        remainingRedemptions: wellnessPackage.includedServices.reduce(
          (sum, item) => sum + item.quantity, 0
        ),
      },
    });

    // Create individual service redemptions
    const redemptions = [];

    for (const included of wellnessPackage.includedServices) {
      const service = await this.db.wellnessService.findUnique({
        where: { id: included.serviceId },
      });

      await this.db.serviceRedemption.create({
        data: {
          id: `red_${Date.now()}_${included.serviceId}`,
          purchaseId,
          serviceId: included.serviceId,
          totalQuantity: included.quantity,
          remainingQuantity: included.quantity,
          validityDays: included.validityDays,
        },
      });

      redemptions.push({
        serviceId: included.serviceId,
        serviceName: service?.name || 'Unknown Service',
        quantity: included.quantity,
        redeemed: 0,
        remaining: included.quantity,
      });
    }

    return {
      purchaseId,
      package: wellnessPackage,
      redemptions,
    };
  }

  /**
   * Redeem package service
   */
  async redeemService(data: {
    purchaseId: string;
    serviceId: string;
    appointmentId: string;
  }): Promise<{
    remainingRedemptions: number;
    serviceRemaining: number;
    packageExpired: boolean;
  }> {
    const [purchase, redemption, appointment] = await Promise.all([
      this.db.packagePurchase.findUnique({ where: { id: data.purchaseId } }),
      this.db.serviceRedemption.findUnique({
        where: { purchaseId_serviceId: { purchaseId: data.purchaseId, serviceId: data.serviceId } },
      }),
      this.db.wellnessAppointment.findUnique({ where: { id: data.appointmentId } }),
    ]);

    if (!purchase || !redemption || !appointment) {
      throw new Error('Invalid purchase, redemption, or appointment');
    }

    // Check if package is expired
    const packageExpired = new Date() > purchase.expirationDate;
    if (packageExpired) {
      throw new Error('Package has expired');
    }

    // Check if service can be redeemed
    if (redemption.remainingQuantity <= 0) {
      throw new Error('No remaining redemptions for this service');
    }

    // Check validity period
    if (redemption.validityDays) {
      const daysSincePurchase = Math.floor(
        (appointment.date.getTime() - purchase.purchaseDate.getTime()) / (24 * 60 * 60 * 1000)
      );

      if (daysSincePurchase > redemption.validityDays) {
        throw new Error(`Service must be redeemed within ${redemption.validityDays} days of purchase`);
      }
    }

    // Process redemption
    await this.db.serviceRedemption.update({
      where: { id: redemption.id },
      data: { remainingQuantity: { decrement: 1 } },
    });

    await this.db.packagePurchase.update({
      where: { id: data.purchaseId },
      data: { remainingRedemptions: { decrement: 1 } },
    });

    // Link appointment to package redemption
    await this.db.wellnessAppointment.update({
      where: { id: data.appointmentId },
      data: { packageRedemptionId: redemption.id },
    });

    // Get updated counts
    const updatedPurchase = await this.db.packagePurchase.findUnique({
      where: { id: data.purchaseId },
    });

    const updatedRedemption = await this.db.serviceRedemption.findUnique({
      where: { id: redemption.id },
    });

    return {
      remainingRedemptions: updatedPurchase?.remainingRedemptions || 0,
      serviceRemaining: updatedRedemption?.remainingQuantity || 0,
      packageExpired: false,
    };
  }

  /**
   * Get client package status
   */
  async getClientPackages(clientId: string): Promise<ClientPackages[]> {
    const purchases = await this.db.packagePurchase.findMany({
      where: { clientId },
      include: {
        wellnessPackage: { include: { includedServices: true } },
        serviceRedemptions: { include: { wellnessService: true } },
      },
      orderBy: { purchaseDate: 'desc' },
    });

    return purchases.map(purchase => {
      const isExpired = new Date() > purchase.expirationDate;
      const isCompleted = purchase.remainingRedemptions === 0;

      let status: 'active' | 'expired' | 'completed' = 'active';
      if (isCompleted) status = 'completed';
      else if (isExpired) status = 'expired';

      return {
        purchaseId: purchase.id,
        packageName: purchase.wellnessPackage.name,
        purchaseDate: purchase.purchaseDate,
        expirationDate: purchase.expirationDate,
        totalPrice: purchase.totalPrice,
        remainingRedemptions: purchase.remainingRedemptions,
        status,
        services: purchase.serviceRedemptions.map(redemption => ({
          serviceId: redemption.serviceId,
          serviceName: redemption.wellnessService?.name || 'Unknown Service',
          totalQuantity: redemption.totalQuantity,
          remainingQuantity: redemption.remainingQuantity,
          validityDays: redemption.validityDays,
        })),
      };
    });
  }

  /**
   * Get available packages for purchase
   */
  async getAvailablePackages(tenantId: string, type?: 'membership' | 'package' | 'series'): Promise<WellnessPackage[]> {
    const where: any = { tenantId, isActive: true };
    if (type) {
      where.type = type;
    }

    return this.db.wellnessPackage.findMany({
      where,
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Calculate package savings and value
   */
  async calculatePackageValue(packageId: string): Promise<{
    package: WellnessPackage;
    individualServiceCost: number;
    savingsAmount: number;
    savingsPercentage: number;
  }> {
    const wellnessPackage = await this.db.wellnessPackage.findUnique({
      where: { id: packageId },
      include: { includedServices: { include: { wellnessService: true } } },
    });

    if (!wellnessPackage) throw new Error('Package not found');

    const individualServiceCost = wellnessPackage.includedServices.reduce(
      (total, included) => {
        const servicePrice = included.wellnessService?.price || 0;
        return total + (servicePrice * included.quantity);
      },
      0
    );

    const savingsAmount = individualServiceCost - wellnessPackage.price;
    const savingsPercentage = individualServiceCost > 0 
      ? (savingsAmount / individualServiceCost) * 100 
      : 0;

    return {
      package: wellnessPackage,
      individualServiceCost: parseFloat(individualServiceCost.toFixed(2)),
      savingsAmount: parseFloat(savingsAmount.toFixed(2)),
      savingsPercentage: parseFloat(savingsPercentage.toFixed(1)),
    };
  }

  /**
   * Extend package expiration (administrative function)
   */
  async extendPackageExpiration(
    purchaseId: string,
    additionalMonths: number
  ): Promise<ClientPackages> {
    const purchase = await this.db.packagePurchase.findUnique({
      where: { id: purchaseId },
      include: { wellnessPackage: true },
    });

    if (!purchase) throw new Error('Purchase not found');

    const newExpirationDate = new Date(purchase.expirationDate);
    newExpirationDate.setMonth(newExpirationDate.getMonth() + additionalMonths);

    const updatedPurchase = await this.db.packagePurchase.update({
      where: { id: purchaseId },
      data: { expirationDate: newExpirationDate },
    });

    // Return updated client package info
    return {
      purchaseId: updatedPurchase.id,
      packageName: purchase.wellnessPackage.name,
      purchaseDate: updatedPurchase.purchaseDate,
      expirationDate: updatedPurchase.expirationDate,
      totalPrice: updatedPurchase.totalPrice,
      remainingRedemptions: updatedPurchase.remainingRedemptions,
      status: new Date() > updatedPurchase.expirationDate ? 'expired' : 'active',
      services: [], // Would need to fetch service details
    };
  }
}