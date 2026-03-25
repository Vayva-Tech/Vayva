import { prisma } from "@vayva/db";

/**
 * Escape hatch: fashion modules use Prisma models that are not yet aligned with
 * the generated `@vayva/db` client. Consolidate `any` here for a single migration path.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fashionPrisma: any = prisma;
