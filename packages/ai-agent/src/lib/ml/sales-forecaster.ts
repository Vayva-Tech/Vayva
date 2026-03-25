/**
 * Free Sales Forecaster
 * Uses statistical models (moving average, exponential smoothing, linear regression)
 * No ML training required - pure math, zero cost
 */

import { logger } from "../logger";

export interface SalesForecast {
  predictedRevenue: number;
  predictedOrders: number;
  confidence: number;
  trend: "up" | "down" | "stable";
  dailyBreakdown: Array<{ date: string; revenue: number; orders: number }>;
}

export interface HistoricalDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export class SalesForecaster {
  /**
   * Forecast sales using weighted ensemble of statistical methods
   */
  forecast(
    historicalData: HistoricalDataPoint[],
    days: number = 7
  ): SalesForecast | null {
    if (!historicalData || historicalData.length < 3) {
      logger.warn("[SalesForecaster] Insufficient data for forecasting");
      return null;
    }

    // Sort by date
    const sorted = [...historicalData].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const revenues = sorted.map(d => d.revenue);
    const orders = sorted.map(d => d.orders);

    // Generate forecasts using multiple methods
    const revenueForecasts = this.ensembleForecast(revenues, days);
    const orderForecasts = this.ensembleForecast(orders, days);

    // Calculate trend
    const trend = this.calculateTrend(revenues);

    // Calculate confidence based on data quality and volatility
    const confidence = this.calculateConfidence(revenues, revenueForecasts);

    // Generate daily breakdown
    const dailyBreakdown = this.generateDailyBreakdown(
      sorted[sorted.length - 1].date,
      days,
      revenueForecasts,
      orderForecasts
    );

    const totalRevenue = revenueForecasts.reduce((a, b) => a + b, 0);
    const totalOrders = orderForecasts.reduce((a, b) => a + b, 0);

    return {
      predictedRevenue: Math.round(totalRevenue),
      predictedOrders: Math.round(totalOrders),
      confidence,
      trend,
      dailyBreakdown,
    };
  }

  /**
   * Simple moving average forecast
   */
  movingAverageForecast(data: number[], days: number, window: number = 7): number[] {
    if (data.length < window) {
      window = Math.max(1, data.length);
    }

    const forecasts: number[] = [];
    const currentData = [...data];

    for (let i = 0; i < days; i++) {
      const recent = currentData.slice(-window);
      const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
      forecasts.push(avg);
      currentData.push(avg);
    }

    return forecasts;
  }

  /**
   * Exponential smoothing forecast
   */
  exponentialSmoothingForecast(data: number[], days: number, alpha: number = 0.3): number[] {
    if (data.length === 0) return new Array(days).fill(0);

    const forecasts: number[] = [];
    let smoothed = data[0];

    // Initialize with historical data
    for (let i = 1; i < data.length; i++) {
      smoothed = alpha * data[i] + (1 - alpha) * smoothed;
    }

    // Forecast future values
    for (let i = 0; i < days; i++) {
      forecasts.push(smoothed);
      // For simple exponential smoothing, forecast stays constant
      // For trend-adjusted, we'd update smoothed
    }

    return forecasts;
  }

  /**
   * Linear regression forecast
   */
  linearRegressionForecast(data: number[], days: number): number[] {
    if (data.length < 2) {
      return new Array(days).fill(data[0] || 0);
    }

    const n = data.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = data;

    // Calculate means
    const meanX = x.reduce((a, b) => a + b, 0) / n;
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    // Calculate slope (m) and intercept (b)
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
      denominator += Math.pow(x[i] - meanX, 2);
    }

    const slope = denominator !== 0 ? numerator / denominator : 0;
    const intercept = meanY - slope * meanX;

    // Generate forecasts
    const forecasts: number[] = [];
    for (let i = 1; i <= days; i++) {
      const forecast = slope * (n - 1 + i) + intercept;
      forecasts.push(Math.max(0, forecast)); // Ensure non-negative
    }

    return forecasts;
  }

  /**
   * Holt-Winters seasonal forecast (simplified)
   */
  seasonalForecast(data: number[], days: number, seasonLength: number = 7): number[] {
    if (data.length < seasonLength * 2) {
      return this.movingAverageForecast(data, days);
    }

    const forecasts: number[] = [];
    const seasons = Math.floor(data.length / seasonLength);
    
    // Calculate seasonal indices
    const seasonalIndices: number[] = [];
    for (let i = 0; i < seasonLength; i++) {
      let sum = 0;
      let count = 0;
      for (let j = 0; j < seasons; j++) {
        const idx = j * seasonLength + i;
        if (idx < data.length) {
          sum += data[idx];
          count++;
        }
      }
      seasonalIndices.push(count > 0 ? sum / count : 1);
    }

    // Calculate average level
    const avgLevel = data.reduce((a, b) => a + b, 0) / data.length;

    // Normalize seasonal indices
    const normalizedIndices = seasonalIndices.map(idx => idx / avgLevel);

    // Generate forecasts using recent trend and seasonality
    const recentAvg = data.slice(-seasonLength).reduce((a, b) => a + b, 0) / seasonLength;
    
    for (let i = 0; i < days; i++) {
      const seasonIdx = i % seasonLength;
      const forecast = recentAvg * normalizedIndices[seasonIdx];
      forecasts.push(Math.max(0, forecast));
    }

    return forecasts;
  }

  /**
   * Ensemble forecast combining multiple methods
   */
  private ensembleForecast(data: number[], days: number): number[] {
    const ma = this.movingAverageForecast(data, days, 7);
    const es = this.exponentialSmoothingForecast(data, days, 0.3);
    const lr = this.linearRegressionForecast(data, days);
    
    // Weighted ensemble
    // More weight to methods that perform better with data size
    let maWeight = 0.3;
    let esWeight = 0.3;
    let lrWeight = 0.4;

    // Adjust weights based on data characteristics
    const volatility = this.calculateVolatility(data);
    if (volatility > 0.5) {
      // High volatility: trust exponential smoothing more
      maWeight = 0.2;
      esWeight = 0.5;
      lrWeight = 0.3;
    }

    const forecasts: number[] = [];
    for (let i = 0; i < days; i++) {
      const ensemble = ma[i] * maWeight + es[i] * esWeight + lr[i] * lrWeight;
      forecasts.push(Math.max(0, ensemble));
    }

    return forecasts;
  }

  /**
   * Calculate trend direction
   */
  private calculateTrend(data: number[]): "up" | "down" | "stable" {
    if (data.length < 7) return "stable";

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (change > 10) return "up";
    if (change < -10) return "down";
    return "stable";
  }

  /**
   * Calculate forecast confidence
   */
  private calculateConfidence(historical: number[], forecasts: number[]): number {
    // Factors affecting confidence:
    // 1. Data quantity
    const dataQuantityScore = Math.min(historical.length / 30, 1); // Max at 30 days

    // 2. Data volatility
    const volatility = this.calculateVolatility(historical);
    const volatilityScore = Math.max(0, 1 - volatility);

    // 3. Forecast reasonableness (compare to historical range)
    const avg = historical.reduce((a, b) => a + b, 0) / historical.length;
    const max = Math.max(...historical);
    const min = Math.min(...historical);
    const forecastAvg = forecasts.reduce((a, b) => a + b, 0) / forecasts.length;
    
    let reasonablenessScore = 1;
    if (forecastAvg > max * 2 || forecastAvg < min * 0.5) {
      reasonablenessScore = 0.5;
    }

    // Combined confidence
    const confidence = (dataQuantityScore * 0.4 + volatilityScore * 0.4 + reasonablenessScore * 0.2);
    return Math.round(confidence * 100) / 100;
  }

  /**
   * Calculate coefficient of variation (volatility)
   */
  private calculateVolatility(data: number[]): number {
    if (data.length < 2) return 0;

    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    if (mean === 0) return 0;

    const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
    const stdDev = Math.sqrt(variance);

    return stdDev / mean; // Coefficient of variation
  }

  /**
   * Generate daily breakdown with dates
   */
  private generateDailyBreakdown(
    lastDate: string,
    days: number,
    revenues: number[],
    orders: number[]
  ): Array<{ date: string; revenue: number; orders: number }> {
    const breakdown: Array<{ date: string; revenue: number; orders: number }> = [];
    const last = new Date(lastDate);

    for (let i = 0; i < days; i++) {
      const date = new Date(last);
      date.setDate(date.getDate() + i + 1);
      
      breakdown.push({
        date: date.toISOString().split("T")[0],
        revenue: Math.round(revenues[i]),
        orders: Math.round(orders[i]),
      });
    }

    return breakdown;
  }

  /**
   * Detect seasonality in data
   */
  detectSeasonality(data: number[]): {
    hasSeasonality: boolean;
    seasonLength: number;
    strength: number;
  } {
    if (data.length < 14) {
      return { hasSeasonality: false, seasonLength: 7, strength: 0 };
    }

    // Test for weekly seasonality (7 days)
    const weeklyCorrelation = this.calculateSeasonalCorrelation(data, 7);
    
    // Test for bi-weekly seasonality (14 days)
    const biWeeklyCorrelation = this.calculateSeasonalCorrelation(data, 14);

    // Test for monthly seasonality (30 days)
    const monthlyCorrelation = data.length >= 60 
      ? this.calculateSeasonalCorrelation(data, 30)
      : 0;

    const bestSeason = weeklyCorrelation > biWeeklyCorrelation 
      ? (weeklyCorrelation > monthlyCorrelation ? 7 : 30)
      : (biWeeklyCorrelation > monthlyCorrelation ? 14 : 30);

    const bestCorrelation = Math.max(weeklyCorrelation, biWeeklyCorrelation, monthlyCorrelation);

    return {
      hasSeasonality: bestCorrelation > 0.3,
      seasonLength: bestSeason,
      strength: bestCorrelation,
    };
  }

  private calculateSeasonalCorrelation(data: number[], seasonLength: number): number {
    if (data.length < seasonLength * 2) return 0;

    const seasons = Math.floor(data.length / seasonLength);
    const seasonalAvgs: number[] = [];

    for (let i = 0; i < seasonLength; i++) {
      let sum = 0;
      for (let j = 0; j < seasons; j++) {
        sum += data[j * seasonLength + i];
      }
      seasonalAvgs.push(sum / seasons);
    }

    // Calculate correlation between consecutive seasons
    let correlationSum = 0;
    for (let i = 0; i < seasons - 1; i++) {
      const season1 = data.slice(i * seasonLength, (i + 1) * seasonLength);
      const season2 = data.slice((i + 1) * seasonLength, (i + 2) * seasonLength);
      correlationSum += this.correlation(season1, season2);
    }

    return correlationSum / (seasons - 1);
  }

  private correlation(x: number[], y: number[]): number {
    const n = Math.min(x.length, y.length);
    const meanX = x.slice(0, n).reduce((a, b) => a + b, 0) / n;
    const meanY = y.slice(0, n).reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denomX = 0;
    let denomY = 0;

    for (let i = 0; i < n; i++) {
      const diffX = x[i] - meanX;
      const diffY = y[i] - meanY;
      numerator += diffX * diffY;
      denomX += diffX * diffX;
      denomY += diffY * diffY;
    }

    const denominator = Math.sqrt(denomX * denomY);
    return denominator === 0 ? 0 : numerator / denominator;
  }
}
