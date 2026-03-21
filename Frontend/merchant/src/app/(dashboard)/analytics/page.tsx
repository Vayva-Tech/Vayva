import { requireAuth } from "@/lib/session.server";
import { AnalyticsService } from "@/lib/analytics/service";
import { AnalyticsPageClient } from "./AnalyticsPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Analytics | Vayva Dashboard",
  description: "Track your store's performance and conversion metrics.",
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const NOW_TIMESTAMP = Date.now();

export default async function AnalyticsPage() {
  const user = await requireAuth();
  const storeId = user.storeId;
  const range = {
    from: new Date(NOW_TIMESTAMP - THIRTY_DAYS_MS), // Last 30 days
    to: new Date(NOW_TIMESTAMP),
  };

  const [funnel, dailyRevenue, eventCounts] = await Promise.all([
    AnalyticsService.getCheckoutFunnel(storeId, range),
    AnalyticsService.getDailyRevenue(storeId, range),
    AnalyticsService.getEventCounts(storeId, range),
  ]);

  const totalRevenue = dailyRevenue.reduce((acc: number, curr: number) => acc + curr, 0);

  return (
    <AnalyticsPageClient
      funnel={funnel}
      dailyRevenue={dailyRevenue}
      eventCounts={eventCounts}
      totalRevenue={totalRevenue}
    />
  );
}
