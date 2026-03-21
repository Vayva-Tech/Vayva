import { prisma } from '@/lib/prisma';
import type {
  WarrantyRecord,
  ExtendedProtectionPlan,
  WarrantyStatus,
} from '@/types/phase2-industry';

export class ElectronicsService {
  // ===== WARRANTY RECORDS =====

  async getWarrantyByOrder(orderId: string): Promise<WarrantyRecord[]> {
    const warranties = await prisma.warrantyRecord?.findMany({
      where: { orderId },
    });

    return warranties.map((w: any) => ({
      id: w.id,
      storeId: w.storeId,
      orderId: w.orderId,
      productId: w.productId,
      customerId: w.customerId,
      serialNumber: w.serialNumber ?? undefined,
      warrantyType: w.warrantyType as any,
      startDate: w.startDate,
      endDate: w.endDate,
      durationMonths: w.durationMonths,
      status: (w as any).status as WarrantyStatus,
      renewalOffered: w.renewalOffered,
      createdAt: w.createdAt,
    }));
  }

  async getCustomerWarranties(customerId: string): Promise<WarrantyRecord[]> {
    const warranties = await prisma.warrantyRecord?.findMany({
      where: { customerId },
      orderBy: { endDate: 'asc' },
    });

    return warranties.map((w: any) => ({
      id: w.id,
      storeId: w.storeId,
      orderId: w.orderId,
      productId: w.productId,
      customerId: w.customerId,
      serialNumber: w.serialNumber ?? undefined,
      warrantyType: w.warrantyType as any,
      startDate: w.startDate,
      endDate: w.endDate,
      durationMonths: w.durationMonths,
      status: (w as any).status as WarrantyStatus,
      renewalOffered: w.renewalOffered,
      createdAt: w.createdAt,
    }));
  }

  async createWarranty(
    data: Omit<WarrantyRecord, 'id' | 'createdAt' | 'status' | 'renewalOffered'>
  ): Promise<WarrantyRecord> {
    const warranty = await prisma.warrantyRecord?.create({
      data: {
        storeId: data.storeId,
        orderId: data.orderId,
        productId: data.productId,
        customerId: data.customerId,
        serialNumber: data.serialNumber,
        warrantyType: data.warrantyType,
        startDate: data.startDate,
        endDate: data.endDate,
        durationMonths: data.durationMonths,
        status: 'active',
        renewalOffered: false,
      },
    });

    return {
      id: warranty.id,
      storeId: warranty.storeId,
      orderId: warranty.orderId,
      productId: warranty.productId,
      customerId: warranty.customerId,
      serialNumber: warranty.serialNumber ?? undefined,
      warrantyType: warranty.warrantyType as any,
      startDate: warranty.startDate,
      endDate: warranty.endDate,
      durationMonths: warranty.durationMonths,
      status: (warranty as any).status as WarrantyStatus,
      renewalOffered: warranty.renewalOffered,
      createdAt: warranty.createdAt,
    };
  }

  async updateWarrantyStatus(
    id: string,
    status: WarrantyStatus
  ): Promise<WarrantyRecord> {
    const warranty = await prisma.warrantyRecord?.update({
      where: { id },
      data: { status },
    });

    return {
      id: warranty.id,
      storeId: warranty.storeId,
      orderId: warranty.orderId,
      productId: warranty.productId,
      customerId: warranty.customerId,
      serialNumber: warranty.serialNumber ?? undefined,
      warrantyType: warranty.warrantyType as any,
      startDate: warranty.startDate,
      endDate: warranty.endDate,
      durationMonths: warranty.durationMonths,
      status: (warranty as any).status as WarrantyStatus,
      renewalOffered: warranty.renewalOffered,
      createdAt: warranty.createdAt,
    };
  }

  async getExpiringWarranties(
    storeId: string,
    daysThreshold: number = 30
  ): Promise<WarrantyRecord[]> {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + daysThreshold);

    const warranties = await prisma.warrantyRecord?.findMany({
      where: {
        storeId,
        endDate: { lte: threshold },
        status: 'active',
        renewalOffered: false,
      },
    });

    return warranties.map((w: any) => ({
      id: w.id,
      storeId: w.storeId,
      orderId: w.orderId,
      productId: w.productId,
      customerId: w.customerId,
      serialNumber: w.serialNumber ?? undefined,
      warrantyType: w.warrantyType as any,
      startDate: w.startDate,
      endDate: w.endDate,
      durationMonths: w.durationMonths,
      status: (w as any).status as WarrantyStatus,
      renewalOffered: w.renewalOffered,
      createdAt: w.createdAt,
    }));
  }

  // ===== EXTENDED PROTECTION PLANS =====

  async getProtectionPlans(storeId: string): Promise<ExtendedProtectionPlan[]> {
    const plans = await prisma.extendedProtectionPlan?.findMany({
      where: { storeId, isActive: true },
    });

    return plans.map((p: any) => ({
      id: p.id,
      storeId: p.storeId,
      name: p.name,
      description: p.description ?? undefined,
      coverage: p.coverage,
      price: Number(p.price),
      durationMonths: p.durationMonths,
      isActive: p.isActive,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async createProtectionPlan(
    storeId: string,
    data: Omit<ExtendedProtectionPlan, 'id' | 'storeId' | 'createdAt' | 'updatedAt' | 'isActive'>
  ): Promise<ExtendedProtectionPlan> {
    const plan = await prisma.extendedProtectionPlan?.create({
      data: {
        storeId,
        name: data.name,
        description: data.description,
        coverage: data.coverage,
        price: data.price,
        durationMonths: data.durationMonths,
        isActive: true,
      },
    });

    return {
      id: plan.id,
      storeId: plan.storeId,
      name: plan.name,
      description: plan.description ?? undefined,
      coverage: plan.coverage,
      price: Number(plan.price),
      durationMonths: plan.durationMonths,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }

  // ===== WARRANTY CLAIMS =====

  async createWarrantyClaim(
    warrantyId: string,
    data: {
      issue: string;
      description?: string;
    }
  ): Promise<any> {
    const claim = await prisma.warrantyClaim?.create({
      data: {
        warrantyId,
        claimNumber: `WCL-${Date.now()}`,
        issue: data.issue,
        status: 'pending',
      },
    });

    return {
      id: claim.id,
      warrantyId: claim.warrantyId,
      claimNumber: claim.claimNumber,
      issue: claim.issue,
      status: (claim as any).status as any,
      claimedAt: claim.claimedAt,
    };
  }

  async getWarrantyClaims(warrantyId: string): Promise<any[]> {
    const claims = await prisma.warrantyClaim?.findMany({
      where: { warrantyId },
      orderBy: { claimedAt: 'desc' },
    });

    return claims.map((c: any) => ({
      id: c.id,
      warrantyId: c.warrantyId,
      claimNumber: c.claimNumber,
      issue: c.issue,
      status: (c as any).status as any,
      resolution: c.resolution ?? undefined,
      claimedAt: c.claimedAt,
      resolvedAt: c.resolvedAt ?? undefined,
    }));
  }

  // ===== RENEWAL OFFERS =====

  async markRenewalOffered(id: string): Promise<WarrantyRecord> {
    const warranty = await prisma.warrantyRecord?.update({
      where: { id },
      data: { renewalOffered: true },
    });

    return {
      id: warranty.id,
      storeId: warranty.storeId,
      orderId: warranty.orderId,
      productId: warranty.productId,
      customerId: warranty.customerId,
      serialNumber: warranty.serialNumber ?? undefined,
      warrantyType: warranty.warrantyType as any,
      startDate: warranty.startDate,
      endDate: warranty.endDate,
      durationMonths: warranty.durationMonths,
      status: (warranty as any).status as WarrantyStatus,
      renewalOffered: warranty.renewalOffered,
      createdAt: warranty.createdAt,
    };
  }
}

export const electronicsService = new ElectronicsService();
