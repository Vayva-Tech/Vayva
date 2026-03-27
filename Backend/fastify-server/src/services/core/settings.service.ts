import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class SettingsService {
  constructor(private readonly db = prisma) {}

  async getSettings(storeId: string) {
    const settings = await this.db.store.findUnique({
      where: { id: storeId },
      include: {
        settings: true,
      },
    });

    return settings?.settings || {};
  }

  async updateSettings(storeId: string, updates: any) {
    const existing = await this.db.storeSettings.findFirst({
      where: { storeId },
    });

    if (existing) {
      const updated = await this.db.storeSettings.update({
        where: { id: existing.id },
        data: updates,
      });

      logger.info(`[Settings] Updated settings for store ${storeId}`);
      return updated;
    }

    const created = await this.db.storeSettings.create({
      data: {
        id: `settings-${Date.now()}`,
        storeId,
        ...updates,
      },
    });

    logger.info(`[Settings] Created settings for store ${storeId}`);
    return created;
  }

  async getProfile(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: {
        id: true,
        name: true,
        description: true,
        logo: true,
        coverImage: true,
        contactEmail: true,
        contactPhone: true,
        address: true,
      },
    });

    return store;
  }

  async updateProfile(storeId: string, updates: any) {
    const updated = await this.db.store.update({
      where: { id: storeId },
      data: {
        ...(updates.name && { name: updates.name }),
        ...(updates.description && { description: updates.description }),
        ...(updates.logo !== undefined && { logo: updates.logo }),
        ...(updates.coverImage !== undefined && { coverImage: updates.coverImage }),
        ...(updates.contactEmail && { contactEmail: updates.contactEmail }),
        ...(updates.contactPhone && { contactPhone: updates.contactPhone }),
        ...(updates.address && { address: updates.address }),
      },
    });

    logger.info(`[Settings] Updated profile for store ${storeId}`);
    return updated;
  }

  async getPayments(storeId: string) {
    const [paymentMethods, beneficiaries] = await Promise.all([
      this.db.paymentMethod.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
      }),
      this.db.beneficiary.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return { paymentMethods, beneficiaries };
  }

  async addBeneficiary(storeId: string, beneficiaryData: any) {
    const { name, accountNumber, bankName, routingNumber, type } = beneficiaryData;

    const beneficiary = await this.db.beneficiary.create({
      data: {
        id: `ben-${Date.now()}`,
        storeId,
        name,
        accountNumber,
        bankName,
        routingNumber,
        type: type || 'bank_account',
      },
    });

    logger.info(`[Settings] Added beneficiary ${beneficiary.id}`);
    return beneficiary;
  }

  async deleteBeneficiary(beneficiaryId: string, storeId: string) {
    const beneficiary = await this.db.beneficiary.findFirst({
      where: { id: beneficiaryId },
    });

    if (!beneficiary || beneficiary.storeId !== storeId) {
      throw new Error('Beneficiary not found');
    }

    await this.db.beneficiary.delete({
      where: { id: beneficiaryId },
    });

    logger.info(`[Settings] Deleted beneficiary ${beneficiaryId}`);
    return { success: true };
  }

  async getShipping(storeId: string) {
    const shippingOptions = await this.db.shippingOption.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    });

    return shippingOptions;
  }

  async createShippingOption(storeId: string, shippingData: any) {
    const { name, price, minOrderValue, maxWeight, regions } = shippingData;

    const option = await this.db.shippingOption.create({
      data: {
        id: `ship-${Date.now()}`,
        storeId,
        name,
        price,
        minOrderValue: minOrderValue || 0,
        maxWeight: maxWeight || null,
        regions: regions || [],
      },
    });

    logger.info(`[Settings] Created shipping option ${option.id}`);
    return option;
  }

  async getDelivery(storeId: string) {
    const deliveryOptions = await this.db.deliveryOption.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    });

    return deliveryOptions;
  }

  async createDeliveryOption(storeId: string, deliveryData: any) {
    const { name, price, minOrderValue, estimatedDays } = deliveryData;

    const option = await this.db.deliveryOption.create({
      data: {
        id: `del-${Date.now()}`,
        storeId,
        name,
        price,
        minOrderValue: minOrderValue || 0,
        estimatedDays: estimatedDays || 3,
      },
    });

    logger.info(`[Settings] Created delivery option ${option.id}`);
    return option;
  }

  async getIndustrySettings(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: {
        industryType: true,
        metadata: true,
      },
    });

    return {
      industryType: store?.industryType || 'retail',
      metadata: store?.metadata || {},
    };
  }

  async updateIndustrySettings(storeId: string, industryData: any) {
    const { industryType, metadata } = industryData;

    const updated = await this.db.store.update({
      where: { id: storeId },
      data: {
        industryType: industryType || 'retail',
        metadata: metadata || {},
      },
    });

    logger.info(`[Settings] Updated industry settings for store ${storeId}`);
    return updated;
  }

  async getWhatsappSettings(storeId: string) {
    const whatsappConfig = await this.db.whatsappConfig.findFirst({
      where: { storeId },
    });

    return whatsappConfig || { enabled: false };
  }

  async updateWhatsappSettings(storeId: string, configData: any) {
    const { apiKey, phoneNumber, businessAccountId, templates } = configData;

    const existing = await this.db.whatsappConfig.findFirst({
      where: { storeId },
    });

    if (existing) {
      const updated = await this.db.whatsappConfig.update({
        where: { id: existing.id },
        data: {
          apiKey: apiKey || null,
          phoneNumber: phoneNumber || null,
          businessAccountId: businessAccountId || null,
          templates: templates || [],
        },
      });

      logger.info(`[Settings] Updated WhatsApp settings for store ${storeId}`);
      return updated;
    }

    const created = await this.db.whatsappConfig.create({
      data: {
        id: `wa-${Date.now()}`,
        storeId,
        apiKey: apiKey || null,
        phoneNumber: phoneNumber || null,
        businessAccountId: businessAccountId || null,
        templates: templates || [],
      },
    });

    logger.info(`[Settings] Created WhatsApp settings for store ${storeId}`);
    return created;
  }

  async getWhatsappTemplates(storeId: string) {
    const config = await this.db.whatsappConfig.findFirst({
      where: { storeId },
    });

    return config?.templates || [];
  }

  async getRoles(storeId: string) {
    const roles = await this.db.role.findMany({
      where: { storeId },
      include: {
        permissions: true,
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
      orderBy: { name: 'asc' },
    });

    return roles;
  }

  async createRole(storeId: string, roleData: any) {
    const { name, description, permissionIds } = roleData;

    const role = await this.db.role.create({
      data: {
        id: `role-${Date.now()}`,
        storeId,
        name,
        description: description || null,
        permissions: permissionIds ? {
          connect: permissionIds.map((id: string) => ({ id })),
        } : undefined,
      },
      include: { permissions: true },
    });

    logger.info(`[Settings] Created role ${role.id}`);
    return role;
  }
}
