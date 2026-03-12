export * from "@vayva/db";
import { prisma as sharedPrisma } from "@vayva/db";

export const prisma = sharedPrisma;
export const db = sharedPrisma;

/**
 * Unified type for Prisma client or Transaction client
 * handles both normal and extended/isolated clients
 * Using any as fallback due to complex Prisma extension types
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExtendedPrismaClient = any;
