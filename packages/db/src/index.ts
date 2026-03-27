// Re-export PrismaClient from infra/db
export { PrismaClient, Prisma } from '../../infra/db/src/client';

// Mock exports for @vayva/db - used for testing
// The actual implementation is in infra/db/src/client.ts

export const prisma = new PrismaClient();

export enum PolicyType {
  TERMS = "TERMS",
  PRIVACY = "PRIVACY",
  RETURNS = "RETURNS",
  REFUNDS = "REFUNDS",
  SHIPPING_DELIVERY = "SHIPPING_DELIVERY",
}

export type MerchantPolicy = {
  id?: string;
  storeId?: string;
  type: PolicyType;
  content?: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
};
