/**
 * Restaurant Finance Module
 * 
 * Manages restaurant-specific financial operations:
 * - Revenue tracking and analysis
 * - Cost management (food, labor, prime costs)
 * - Tip reporting
 * - Financial analytics
 */

import {
  RevenueBreakdown,
  CostAnalysis,
  TipDistribution,
  Order,
  StaffMember,
} from '../types';

export class RestaurantFinanceService {
  private orders: Map<string, Order>;
  private staffMembers: Map<string, StaffMember>;

  constructor() {
    this.orders = new Map();
    this.staffMembers = new Map();
  }

  // ============================================================================
  // REVENUE TRACKING
  // ============================================================================

  /**
   * Track order for revenue calculation
   */
  trackOrder(order: Order): void {
    this.orders.set(order.id, order);
  }

  /**
   * Get revenue breakdown
   */
  getRevenueBreakdown(dateRange?: { start: Date; end: Date }): RevenueBreakdown {
    let ordersArray = Array.from(this.orders.values());

    if (dateRange) {
      ordersArray = ordersArray.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= dateRange.start && orderDate <= dateRange.end;
      });
    }

    const byStream = {
      dineIn: ordersArray.filter((o) => o.type === 'dine-in').reduce((sum, o) => sum + o.total, 0),
      takeout: ordersArray.filter((o) => o.type === 'takeout').reduce((sum, o) => sum + o.total, 0),
      delivery: ordersArray.filter((o) => o.type === 'delivery').reduce((sum, o) => sum + o.total, 0),
      catering: ordersArray.filter((o) => o.type === 'catering').reduce((sum, o) => sum + o.total, 0),
      bar: 0,
    };

    const total = Object.values(byStream).reduce((sum, val) => sum + val, 0);

    // Calculate meal period breakdown
    const byMealPeriod = this.getRevenueByMealPeriod(ordersArray);

    // Calculate comparison
    const previousPeriodRevenue = total * 0.9; // Simulated
    const percentageChange = ((total - previousPeriodRevenue) / previousPeriodRevenue) * 100;

    return {
      total: Math.round(total * 100) / 100,
      byStream,
      byMealPeriod,
      percentageChange: Math.round(percentageChange * 10) / 10,
      comparison: 'yesterday',
    };
  }

  /**
   * Get revenue trends
   */
  getRevenueTrends(days: number = 7): Array<{
    date: string;
    revenue: number;
    orders: number;
    avgTicket: number;
  }> {
    const trends: Array<{
      date: string;
      revenue: number;
      orders: number;
      avgTicket: number;
    }> = [];

    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayOrders = Array.from(this.orders.values()).filter((o) => {
        const orderDate = new Date(o.createdAt);
        return (
          orderDate.getDate() === date.getDate() &&
          orderDate.getMonth() === date.getMonth() &&
          orderDate.getFullYear() === date.getFullYear()
        );
      });

      const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);
      const orders = dayOrders.length;
      const avgTicket = orders > 0 ? revenue / orders : 0;

      trends.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(revenue * 100) / 100,
        orders,
        avgTicket: Math.round(avgTicket * 100) / 100,
      });
    }

    return trends;
  }

  // ============================================================================
  // COST ANALYSIS
  // ============================================================================

  /**
   * Analyze food costs
   */
  analyzeFoodCosts(
    totalRevenue: number,
    ingredientCosts: Array<{ category: string; amount: number }>
  ): CostAnalysis {
    const totalFoodCost = ingredientCosts.reduce((sum, ic) => sum + ic.amount, 0);
    const foodCostPercentage = totalRevenue > 0 ? (totalFoodCost / totalRevenue) * 100 : 0;

    // Top cost categories
    const topCostItems = ingredientCosts
      .map((ic) => ({
        category: ic.category,
        amount: ic.amount,
        percentage: totalFoodCost > 0 ? (ic.amount / totalFoodCost) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    return {
      foodCost: Math.round(totalFoodCost * 100) / 100,
      foodCostPercentage: Math.round(foodCostPercentage * 10) / 10,
      foodCostTarget: 30,
      laborCost: 0, // Would calculate separately
      laborCostPercentage: 0,
      laborCostTarget: 30,
      primeCost: Math.round(totalFoodCost * 100) / 100, // Would add labor
      primeCostPercentage: Math.round(foodCostPercentage * 10) / 10,
      primeCostTarget: 60,
      topCostItems,
    };
  }

  /**
   * Calculate prime cost
   */
  calculatePrimeCost(foodCost: number, laborCost: number): {
    total: number;
    percentage: number;
    isHealthy: boolean;
  } {
    const totalRevenue = this.getTotalRevenue();
    const primeCost = foodCost + laborCost;
    const primeCostPercentage = totalRevenue > 0 ? (primeCost / totalRevenue) * 100 : 0;

    return {
      total: Math.round(primeCost * 100) / 100,
      percentage: Math.round(primeCostPercentage * 10) / 10,
      isHealthy: primeCostPercentage <= 60,
    };
  }

  /**
   * Monitor cost trends
   */
  monitorCostTrends(): {
    foodCostTrend: 'increasing' | 'decreasing' | 'stable';
    laborCostTrend: 'increasing' | 'decreasing' | 'stable';
    recommendations: string[];
  } {
    // Would analyze historical cost data
    return {
      foodCostTrend: 'stable',
      laborCostTrend: 'increasing',
      recommendations: [
        'Review supplier contracts for better pricing',
        'Optimize staff scheduling to reduce overtime',
        'Consider menu engineering to improve margins',
      ],
    };
  }

  // ============================================================================
  // TIP MANAGEMENT
  // ============================================================================

  /**
   * Calculate tip distribution
   */
  calculateTipDistribution(
    totalTips: number,
    tipPoolConfig: {
      servers: { percentage: number; count: number };
      bartenders: { percentage: number; count: number };
      runners: { percentage: number; count: number };
      kitchen: { percentage: number; count: number };
    }
  ): TipDistribution {
    const distribution = {
      servers: {
        percentage: tipPoolConfig.servers.percentage,
        amount: (totalTips * tipPoolConfig.servers.percentage) / 100,
        count: tipPoolConfig.servers.count,
        perPerson:
          tipPoolConfig.servers.count > 0
            ? (totalTips * tipPoolConfig.servers.percentage) / 100 / tipPoolConfig.servers.count
            : 0,
      },
      bartenders: {
        percentage: tipPoolConfig.bartenders.percentage,
        amount: (totalTips * tipPoolConfig.bartenders.percentage) / 100,
        count: tipPoolConfig.bartenders.count,
        perPerson:
          tipPoolConfig.bartenders.count > 0
            ? (totalTips * tipPoolConfig.bartenders.percentage) / 100 /
              tipPoolConfig.bartenders.count
            : 0,
      },
      runners: {
        percentage: tipPoolConfig.runners.percentage,
        amount: (totalTips * tipPoolConfig.runners.percentage) / 100,
        count: tipPoolConfig.runners.count,
        perPerson:
          tipPoolConfig.runners.count > 0
            ? (totalTips * tipPoolConfig.runners.percentage) / 100 / tipPoolConfig.runners.count
            : 0,
      },
      kitchen: {
        percentage: tipPoolConfig.kitchen.percentage,
        amount: (totalTips * tipPoolConfig.kitchen.percentage) / 100,
        count: tipPoolConfig.kitchen.count,
        perPerson:
          tipPoolConfig.kitchen.count > 0
            ? (totalTips * tipPoolConfig.kitchen.percentage) / 100 / tipPoolConfig.kitchen.count
            : 0,
      },
    };

    return {
      totalTips: Math.round(totalTips * 100) / 100,
      distribution,
    };
  }

  /**
   * Generate tip report for IRS Form 4070
   */
  generateTipReport(employeeId: string, month: Date): {
    employeeId: string;
    month: string;
    totalTips: number;
    cashTips: number;
    creditCardTips: number;
    reportedTips: number;
  } {
    // Placeholder - would aggregate actual tip data
    return {
      employeeId,
      month: month.toISOString().split('-')[0],
      totalTips: Math.random() * 2000,
      cashTips: Math.random() * 500,
      creditCardTips: Math.random() * 1500,
      reportedTips: Math.random() * 2000,
    };
  }

  // ============================================================================
  // PROFITABILITY ANALYSIS
  // ============================================================================

  /**
   * Analyze profitability by revenue stream
   */
  analyzeProfitabilityByStream(): Array<{
    stream: string;
    revenue: number;
    costs: number;
    profit: number;
    margin: number;
    recommendation: string;
  }> {
    const { byStream } = this.getRevenueBreakdown();

    return Object.entries(byStream).map(([stream, revenue]) => {
      // Simulated cost allocation
      const costs = revenue * 0.65; // 65% average cost
      const profit = revenue - costs;
      const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

      let recommendation = 'Maintain current strategy';
      if (margin < 25) {
        recommendation = 'Review pricing or reduce costs';
      } else if (margin > 40) {
        recommendation = 'Consider expanding this stream';
      }

      return {
        stream,
        revenue: Math.round(revenue * 100) / 100,
        costs: Math.round(costs * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        margin: Math.round(margin * 10) / 10,
        recommendation,
      };
    });
  }

  /**
   * Calculate break-even point
   */
  calculateBreakEven(fixedCosts: number, avgTicketPrice: number, variableCostPercentage: number): {
    breakEvenTickets: number;
    breakEvenRevenue: number;
    safetyMargin: number;
  } {
    const contributionMargin = avgTicketPrice * (1 - variableCostPercentage / 100);
    const breakEvenTickets = fixedCosts / contributionMargin;
    const breakEvenRevenue = breakEvenTickets * avgTicketPrice;

    const currentRevenue = this.getTotalRevenue();
    const safetyMargin = currentRevenue > 0 ? ((currentRevenue - breakEvenRevenue) / currentRevenue) * 100 : 0;

    return {
      breakEvenTickets: Math.ceil(breakEvenTickets),
      breakEvenRevenue: Math.round(breakEvenRevenue * 100) / 100,
      safetyMargin: Math.round(safetyMargin * 10) / 10,
    };
  }

  // ============================================================================
  // FINANCIAL REPORTING
  // ============================================================================

  /**
   * Generate P&L statement
   */
  generatePLStatement(period: { start: Date; end: Date }): {
    revenue: number;
    cogs: number;
    grossProfit: number;
    laborCost: number;
    operatingExpenses: number;
    netProfit: number;
    netMargin: number;
  } {
    const revenue = this.getRevenueBreakdown(period).total;
    const cogs = revenue * 0.3; // Simulated 30% COGS
    const grossProfit = revenue - cogs;
    const laborCost = revenue * 0.3; // Simulated 30% labor
    const operatingExpenses = revenue * 0.2; // Simulated 20% ops expenses
    const netProfit = grossProfit - laborCost - operatingExpenses;
    const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    return {
      revenue: Math.round(revenue * 100) / 100,
      cogs: Math.round(cogs * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      laborCost: Math.round(laborCost * 100) / 100,
      operatingExpenses: Math.round(operatingExpenses * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      netMargin: Math.round(netMargin * 10) / 10,
    };
  }

  /**
   * Generate daily sales summary
   */
  generateDailySummary(date: Date): {
    date: string;
    totalSales: number;
    orderCount: number;
    avgTicket: number;
    paymentMethods: Record<string, number>;
    comparisons: {
      vsYesterday: number;
      vsLastWeek: number;
      vsLastMonth: number;
    };
  } {
    const dayOrders = Array.from(this.orders.values()).filter((o) => {
      const orderDate = new Date(o.createdAt);
      return (
        orderDate.getDate() === date.getDate() &&
        orderDate.getMonth() === date.getMonth() &&
        orderDate.getFullYear() === date.getFullYear()
      );
    });

    const totalSales = dayOrders.reduce((sum, o) => sum + o.total, 0);
    const orderCount = dayOrders.length;
    const avgTicket = orderCount > 0 ? totalSales / orderCount : 0;

    const paymentMethods = dayOrders.reduce(
      (acc, o) => {
        const method = o.paymentMethod || 'unknown';
        acc[method] = (acc[method] || 0) + o.total;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      date: date.toISOString().split('T')[0],
      totalSales: Math.round(totalSales * 100) / 100,
      orderCount,
      avgTicket: Math.round(avgTicket * 100) / 100,
      paymentMethods,
      comparisons: {
        vsYesterday: 5.2, // Would calculate from actual data
        vsLastWeek: 8.7,
        vsLastMonth: 12.3,
      },
    };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private getTotalRevenue(): number {
    return Array.from(this.orders.values()).reduce((sum, o) => sum + o.total, 0);
  }

  private getRevenueByMealPeriod(orders: Order[]): RevenueBreakdown['byMealPeriod'] {
    const mealPeriods = {
      breakfast: { start: 6, end: 11 },
      lunch: { start: 11, end: 15 },
      dinner: { start: 15, end: 22 },
      lateNight: { start: 22, end: 6 },
      brunch: { start: 10, end: 14 },
    };

    const revenue = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      lateNight: 0,
      brunch: 0,
    };

    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      
      if (hour >= mealPeriods.breakfast.start && hour < mealPeriods.breakfast.end) {
        revenue.breakfast += order.total;
      } else if (hour >= mealPeriods.lunch.start && hour < mealPeriods.lunch.end) {
        revenue.lunch += order.total;
      } else if (hour >= mealPeriods.dinner.start && hour < mealPeriods.dinner.end) {
        revenue.dinner += order.total;
      } else if (hour >= mealPeriods.lateNight.start || hour < mealPeriods.lateNight.end) {
        revenue.lateNight += order.total;
      }
    });

    return revenue;
  }
}

// Export singleton instance
export const restaurantFinanceService = new RestaurantFinanceService();
