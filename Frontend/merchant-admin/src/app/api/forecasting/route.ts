import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { ForecastingService } from "@/services/forecasting.service";
import { PeriodType } from "@/types/intelligence";
import { logger } from "@/lib/logger";

// GET /api/forecasting - Get forecasting overview or specific forecast type
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (request: NextRequest, { storeId }: { storeId: string }) => {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const periodType = (searchParams.get("periodType") as PeriodType) || "daily";
    const days = parseInt(searchParams.get("days") || "30", 10);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    if (!storeId) {
      return NextResponse.json(
        { error: "Store ID is required" },
        { status: 400 }
      );
    }

    const now = new Date();
    const start = startDate ? new Date(startDate) : now;
    const end = endDate ? new Date(endDate) : new Date(now.setDate(now.getDate() + days));

    let result;

    switch (type) {
      case "sales":
        result = await ForecastingService.getSalesForecast(storeId, periodType, start, end);
        break;
      case "cashflow":
        result = await ForecastingService.getCashFlowForecast(storeId, start, end);
        break;
      case "inventory":
        result = await ForecastingService.getInventoryForecast(storeId);
        break;
      default:
        result = await ForecastingService.getForecastingOverview(storeId);
    }

    return NextResponse.json({ data: result }, { status: 200 });
  } catch (error) {
    logger.error("[FORECASTING_GET]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to fetch forecasting data" },
      { status: 500 }
    );
  }
});

// POST /api/forecasting - Generate new forecasts
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (request: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await request.json();
      const { type, periodType = "daily", periods = 30, productId } = body;

      if (!storeId) {
        return NextResponse.json(
          { error: "Store ID is required" },
          { status: 400 }
        );
      }

    let result;

    switch (type) {
      case "sales":
        result = await ForecastingService.generateSalesForecast(
          storeId,
          periodType as PeriodType,
          periods
        );
        break;
      case "cashflow":
        result = await ForecastingService.generateCashFlowForecast(storeId, periods);
        break;
      case "inventory":
        if (!productId) {
          return NextResponse.json(
            { error: "Product ID is required for inventory forecasting" },
            { status: 400 }
          );
        }
        result = await ForecastingService.generateInventoryForecast(storeId, productId);
        break;
      default: {
        // Generate all forecasts
        const [sales, cashFlow, inventory] = await Promise.all([
          ForecastingService.generateSalesForecast(storeId, periodType as PeriodType, periods),
          ForecastingService.generateCashFlowForecast(storeId, periods),
          // Generate inventory forecast for all products would need product list
          Promise.resolve([])
        ]);
        result = { sales, cashFlow, inventory };
        break;
      }
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    logger.error("[FORECASTING_POST]", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Failed to generate forecasts" },
      { status: 500 }
    );
  }
});
