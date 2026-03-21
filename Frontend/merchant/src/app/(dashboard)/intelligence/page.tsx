import { Metadata } from "next";
import { ForecastingDashboard } from "@/components/analytics/ForecastingDashboard";

export const metadata: Metadata = {
  title: "AI Forecasting | Vayva",
  description: "AI-powered forecasting for sales, cash flow, and inventory",
};

export default function IntelligencePage() {
  return <ForecastingDashboard />;
}
