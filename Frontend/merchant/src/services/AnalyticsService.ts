import { api } from '@/lib/api-client';
import { OverviewMetrics, AnalyticInsight, ChartDataItem } from "@/types/analytics";

export class AnalyticsService {
    /**
     * Get Overview Metrics (Real Data)
     */
    static async getOverview(storeId: string, range: string = '7d'): Promise<OverviewMetrics> {
        const response = await api.get(`/analytics/${storeId}/overview`, { range });
        return response.data || {};
    }

    /**
     * Group orders by day and return array for Recharts
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static groupByDay(orders: any[], days: number): ChartDataItem[] {
        // Keep this utility function as it's pure data transformation
        const map = new Map();
        const now = new Date();
        // Initialize all days with 0 to ensure continuous line
        for (let i = days; i >= 0; i--) {
            const date = subDays(now, i);
            const key = format(date, "MMM dd");
            map.set(key, { date: key, sales: 0, orders: 0 });
        }
        // Fill with data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        orders.forEach((order: any) => {
            const key = format(order.createdAt, "MMM dd");
            if (map.has(key)) {
                const entry = map.get(key) as ChartDataItem;
                entry.sales += Number(order.total);
                entry.orders += 1;
            }
        });
        return Array.from(map.values());
    }
    /**
     * Generate Insights (Text Summary)
     * For Pro: Could be more advanced. For now, rule-based.
     */
    static async getInsights(storeId: string): Promise<AnalyticInsight[]> {
        const response = await api.get(`/analytics/${storeId}/insights`);
        return response.data || [];
    }
}
