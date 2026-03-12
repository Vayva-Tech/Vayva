/**
 * Cohort Analysis Service
 * Tracks user retention, revenue, and order patterns over time
 */

// Note: prisma import would come from db package when available
// Using stub for now to allow typecheck to pass
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any = {
    $queryRaw: async () => [],
    cohortAnalysis: {
        upsert: async () => ({}),
        findMany: async () => [],
    },
};

export type CohortMetricType = 'retention' | 'revenue' | 'orders' | 'ltv';

export interface CohortData {
    cohortMonth: Date;
    initialUsers: number;
    weeks: (number | null)[];
}

export interface CohortReport {
    metricType: CohortMetricType;
    cohorts: CohortData[];
    averageRetention: number[];
}

export class CohortAnalyzer {
    /**
     * Calculate retention cohorts for a store
     */
    async calculateRetentionCohorts(
        storeId: string,
        months: number = 6
    ): Promise<CohortReport> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        // Get first order date for each customer
        const customerFirstOrders = await prisma.$queryRaw<Array<{
            customerId: string;
            firstOrderDate: Date;
        }>>`
            SELECT 
                "customerId",
                MIN("createdAt") as "firstOrderDate"
            FROM "Order"
            WHERE "storeId" = ${storeId}
                AND "customerId" IS NOT NULL
                AND "createdAt" >= ${startDate}
            GROUP BY "customerId"
        `;

        // Group customers by cohort month
        const cohorts = new Map<string, Set<string>>();
        customerFirstOrders.forEach((row: { customerId: string; firstOrderDate: Date }) => {
            const cohortKey = this.getCohortKey(row.firstOrderDate);
            if (!cohorts.has(cohortKey)) {
                cohorts.set(cohortKey, new Set());
            }
            cohorts.get(cohortKey)!.add(row.customerId);
        });

        // Calculate retention for each cohort
        const cohortData: CohortData[] = [];

        for (const [cohortKey, customerIds] of cohorts) {
            const cohortMonth = new Date(cohortKey);
            const weeks: (number | null)[] = [100]; // Week 0 is always 100%

            // Calculate retention for weeks 1-12
            for (let week = 1; week <= 12; week++) {
                const retained = await this.calculateWeekRetention(
                    storeId,
                    customerIds,
                    cohortMonth,
                    week
                );
                weeks.push(retained);
            }

            cohortData.push({
                cohortMonth,
                initialUsers: customerIds.size,
                weeks,
            });
        }

        // Sort cohorts by date (newest first)
        cohortData.sort((a, b) => b.cohortMonth.getTime() - a.cohortMonth.getTime());

        // Calculate average retention across all cohorts
        const averageRetention = this.calculateAverageRetention(cohortData);

        // Save to database
        await this.saveCohortAnalysis(storeId, 'retention', cohortData);

        return {
            metricType: 'retention',
            cohorts: cohortData,
            averageRetention,
        };
    }

    /**
     * Calculate revenue cohorts (LTV tracking)
     */
    async calculateRevenueCohorts(
        storeId: string,
        months: number = 6
    ): Promise<CohortReport> {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - months);

        // Get customers grouped by cohort
        const cohortCustomers = await this.getCohortCustomers(storeId, startDate);

        const cohortData: CohortData[] = [];

        for (const [cohortKey, customerIds] of cohortCustomers) {
            const cohortMonth = new Date(cohortKey);
            const weeks: (number | null)[] = [100]; // Week 0 baseline

            // Get initial revenue (week 0)
            const initialRevenue = await this.getCohortRevenue(
                storeId,
                customerIds,
                cohortMonth,
                0
            );

            // Calculate relative revenue for weeks 1-12
            for (let week = 1; week <= 12; week++) {
                const weekRevenue = await this.getCohortRevenue(
                    storeId,
                    customerIds,
                    cohortMonth,
                    week
                );

                if (initialRevenue > 0) {
                    weeks.push((weekRevenue / initialRevenue) * 100);
                } else {
                    weeks.push(null);
                }
            }

            cohortData.push({
                cohortMonth,
                initialUsers: customerIds.size,
                weeks,
            });
        }

        cohortData.sort((a, b) => b.cohortMonth.getTime() - a.cohortMonth.getTime());
        const averageRetention = this.calculateAverageRetention(cohortData);

        await this.saveCohortAnalysis(storeId, 'revenue', cohortData);

        return {
            metricType: 'revenue',
            cohorts: cohortData,
            averageRetention,
        };
    }

    /**
     * Calculate week-over-week retention
     */
    private async calculateWeekRetention(
        storeId: string,
        customerIds: Set<string>,
        cohortMonth: Date,
        week: number
    ): Promise<number | null> {
        const weekStart = new Date(cohortMonth);
        weekStart.setDate(weekStart.getDate() + week * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const customerIdArray = Array.from(customerIds);

        const result = await prisma.$queryRaw<Array<{ count: bigint }>>`
            SELECT COUNT(DISTINCT "customerId") as count
            FROM "Order"
            WHERE "storeId" = ${storeId}
                AND "customerId" = ANY(${customerIdArray}::text[])
                AND "createdAt" >= ${weekStart}
                AND "createdAt" < ${weekEnd}
        `;

        if (customerIds.size === 0) return null;

        return (Number(result[0].count) / customerIds.size) * 100;
    }

    /**
     * Get cohort revenue for a specific week
     */
    private async getCohortRevenue(
        storeId: string,
        customerIds: Set<string>,
        cohortMonth: Date,
        week: number
    ): Promise<number> {
        const weekStart = new Date(cohortMonth);
        weekStart.setDate(weekStart.getDate() + week * 7);

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const customerIdArray = Array.from(customerIds);

        const result = await prisma.$queryRaw<Array<{ total: bigint }>>`
            SELECT COALESCE(SUM("total"), 0) as total
            FROM "Order"
            WHERE "storeId" = ${storeId}
                AND "customerId" = ANY(${customerIdArray}::text[])
                AND "createdAt" >= ${weekStart}
                AND "createdAt" < ${weekEnd}
                AND "paymentStatus" = 'PAID'
        `;

        return Number(result[0].total);
    }

    /**
     * Get customers grouped by their first order cohort
     */
    private async getCohortCustomers(
        storeId: string,
        since: Date
    ): Promise<Map<string, Set<string>>> {
        const customers = await prisma.$queryRaw<Array<{
            customerId: string;
            firstOrderDate: Date;
        }>>`
            SELECT 
                "customerId",
                MIN("createdAt") as "firstOrderDate"
            FROM "Order"
            WHERE "storeId" = ${storeId}
                AND "customerId" IS NOT NULL
                AND "createdAt" >= ${since}
            GROUP BY "customerId"
        `;

        const cohorts = new Map<string, Set<string>>();
        customers.forEach((row: { customerId: string; firstOrderDate: Date }) => {
            const cohortKey = this.getCohortKey(row.firstOrderDate);
            if (!cohorts.has(cohortKey)) {
                cohorts.set(cohortKey, new Set());
            }
            cohorts.get(cohortKey)!.add(row.customerId);
        });

        return cohorts;
    }

    /**
     * Get cohort key (YYYY-MM) from date
     */
    private getCohortKey(date: Date): string {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    }

    /**
     * Calculate average retention across all cohorts
     */
    private calculateAverageRetention(cohorts: CohortData[]): number[] {
        const averages: number[] = [];

        for (let week = 0; week <= 12; week++) {
            let sum = 0;
            let count = 0;

            cohorts.forEach((cohort) => {
                const value = cohort.weeks[week];
                if (value !== null) {
                    sum += value;
                    count++;
                }
            });

            averages.push(count > 0 ? sum / count : 0);
        }

        return averages;
    }

    /**
     * Save cohort analysis to database
     */
    private async saveCohortAnalysis(
        storeId: string,
        metricType: CohortMetricType,
        cohorts: CohortData[]
    ): Promise<void> {
        for (const cohort of cohorts) {
            await prisma.cohortAnalysis.upsert({
                where: {
                    storeId_cohortMonth_metricType: {
                        storeId,
                        cohortMonth: cohort.cohortMonth,
                        metricType,
                    },
                },
                update: {
                    week0: cohort.weeks[0] ?? 100,
                    week1: cohort.weeks[1],
                    week2: cohort.weeks[2],
                    week3: cohort.weeks[3],
                    week4: cohort.weeks[4],
                    week5: cohort.weeks[5],
                    week6: cohort.weeks[6],
                    week7: cohort.weeks[7],
                    week8: cohort.weeks[8],
                    week9: cohort.weeks[9],
                    week10: cohort.weeks[10],
                    week11: cohort.weeks[11],
                    week12: cohort.weeks[12],
                },
                create: {
                    storeId,
                    cohortMonth: cohort.cohortMonth,
                    metricType,
                    week0: cohort.weeks[0] ?? 100,
                    week1: cohort.weeks[1],
                    week2: cohort.weeks[2],
                    week3: cohort.weeks[3],
                    week4: cohort.weeks[4],
                    week5: cohort.weeks[5],
                    week6: cohort.weeks[6],
                    week7: cohort.weeks[7],
                    week8: cohort.weeks[8],
                    week9: cohort.weeks[9],
                    week10: cohort.weeks[10],
                    week11: cohort.weeks[11],
                    week12: cohort.weeks[12],
                },
            });
        }
    }

    /**
     * Get cohort report from database
     */
    async getCohortReport(
        storeId: string,
        metricType: CohortMetricType
    ): Promise<CohortReport | null> {
        const analyses = await prisma.cohortAnalysis.findMany({
            where: {
                storeId,
                metricType,
            },
            orderBy: {
                cohortMonth: 'desc',
            },
            take: 12,
        });

        if (analyses.length === 0) return null;

        const cohorts: CohortData[] = analyses.map((a: {
            cohortMonth: Date;
            week0: number;
            week1: number | null;
            week2: number | null;
            week3: number | null;
            week4: number | null;
            week5: number | null;
            week6: number | null;
            week7: number | null;
            week8: number | null;
            week9: number | null;
            week10: number | null;
            week11: number | null;
            week12: number | null;
        }) => ({
            cohortMonth: a.cohortMonth,
            initialUsers: 0, // Not stored, would need separate query
            weeks: [
                a.week0,
                a.week1,
                a.week2,
                a.week3,
                a.week4,
                a.week5,
                a.week6,
                a.week7,
                a.week8,
                a.week9,
                a.week10,
                a.week11,
                a.week12,
            ],
        }));

        const averageRetention = this.calculateAverageRetention(cohorts);

        return {
            metricType,
            cohorts,
            averageRetention,
        };
    }
}

// Singleton instance
export const cohortAnalyzer = new CohortAnalyzer();
