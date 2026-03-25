import type { PrismaClient } from "@vayva/db";
import { prisma } from "@vayva/db";

/**
 * Optional analytics tables (roadmap). Cast until schema includes these models.
 */
export type AnalyticsPrismaClient = PrismaClient & {
  analyticsSnapshot: {
    findMany: (
      args?: object
    ) => Promise<Array<{ timestamp: Date; value: unknown; metricType?: string }>>;
    findFirst: (
      args?: object
    ) => Promise<{ value: unknown } | null>;
  };
  analyticsForecast: {
    findMany: (
      args?: object
    ) => Promise<
      Array<{
        forecastDate: Date;
        predictedValue: unknown;
        metricType?: string;
      }>
    >;
  };
};

export const analyticsPrisma = prisma as unknown as AnalyticsPrismaClient;
