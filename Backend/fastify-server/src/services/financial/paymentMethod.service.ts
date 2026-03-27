import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class PaymentMethodService {
  constructor(private readonly db = prisma) {}

  async getPaymentMethods(storeId: string) {
    const paymentMethods = await this.db.savedPaymentMethod.findMany({
      where: {
        storeId,
        status: 'ACTIVE',
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
      select: {
        id: true,
        token: true,
        last4: true,
        brand: true,
        expiryMonth: true,
        expiryYear: true,
        bankName: true,
        accountNumber: true,
        isDefault: true,
        createdAt: true,
      },
    });

    return paymentMethods;
  }

  async createPaymentMethod(storeId: string, userId: string, paymentData: any) {
    const { token, last4, brand, expiryMonth, expiryYear, bankName, accountNumber, isDefault } = paymentData;

    if (!token || !last4 || !brand) {
      throw new Error('Token, last4, and brand are required');
    }

    // If this should be default, unset other defaults
    if (isDefault) {
      await this.db.savedPaymentMethod.updateMany({
        where: {
          storeId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const paymentMethod = await this.db.savedPaymentMethod.create({
      data: {
        storeId,
        userId,
        token,
        last4,
        brand,
        expiryMonth: expiryMonth || 0,
        expiryYear: expiryYear || 0,
        bankName: bankName || null,
        accountNumber: accountNumber || null,
        isDefault: isDefault || false,
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    logger.info(`[Payment] Saved payment method ${paymentMethod.id} for store ${storeId}`);
    return {
      id: paymentMethod.id,
      token: paymentMethod.token,
      last4: paymentMethod.last4,
      brand: paymentMethod.brand,
      expiryMonth: paymentMethod.expiryMonth,
      expiryYear: paymentMethod.expiryYear,
      bankName: paymentMethod.bankName,
      accountNumber: paymentMethod.accountNumber,
      isDefault: paymentMethod.isDefault,
      createdAt: paymentMethod.createdAt,
    };
  }

  async deletePaymentMethod(paymentMethodId: string, storeId: string) {
    const paymentMethod = await this.db.savedPaymentMethod.findFirst({
      where: { id: paymentMethodId },
    });

    if (!paymentMethod || paymentMethod.storeId !== storeId) {
      throw new Error('Payment method not found');
    }

    await this.db.savedPaymentMethod.update({
      where: { id: paymentMethodId },
      data: { status: 'INACTIVE' },
    });

    logger.info(`[Payment] Deleted payment method ${paymentMethodId}`);
    return { success: true };
  }
}
