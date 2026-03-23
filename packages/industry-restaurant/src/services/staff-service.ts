// @ts-nocheck
/**
 * Staff Management Service
 * 
 * Manages restaurant staff including:
 * - Shift scheduling
 * - Performance tracking
 * - Tip pooling
 * - Labor cost management
 */

import { StaffMember, Shift } from '../types';

export class StaffManagementService {
  private staffMembers: Map<string, StaffMember>;
  private shifts: Map<string, Shift>;

  constructor() {
    this.staffMembers = new Map();
    this.shifts = new Map();
  }

  // ============================================================================
  // STAFF MANAGEMENT
  // ============================================================================

  /**
   * Add staff member
   */
  addStaffMember(staff: StaffMember): void {
    this.staffMembers.set(staff.id, staff);
  }

  /**
   * Update staff member
   */
  updateStaffMember(staffId: string, updates: Partial<StaffMember>): StaffMember | null {
    const staff = this.staffMembers.get(staffId);
    if (!staff) return null;

    Object.assign(staff, updates);
    this.staffMembers.set(staffId, staff);
    return staff;
  }

  /**
   * Get staff member by ID
   */
  getStaffMember(staffId: string): StaffMember | undefined {
    return this.staffMembers.get(staffId);
  }

  /**
   * Get all staff members
   */
  getAllStaff(): StaffMember[] {
    return Array.from(this.staffMembers.values());
  }

  // ============================================================================
  // SHIFT MANAGEMENT
  // ============================================================================

  /**
   * Create shift schedule
   */
  createShift(shift: Shift): void {
    this.shifts.set(shift.id, shift);
  }

  /**
   * Get shifts for date
   */
  getShiftsForDate(date: string): Shift[] {
    return Array.from(this.shifts.values()).filter((s) => s.date === date);
  }

  /**
   * Clock in staff member
   */
  clockIn(staffId: string, shiftId: string): StaffMember | null {
    const staff = this.staffMembers.get(staffId);
    if (!staff) return null;

    staff.isOnShift = true;
    staff.shiftStart = new Date();
    
    // Add to shift
    const shift = this.shifts.get(shiftId);
    if (shift && !shift.staffMembers.find((m) => m.id === staffId)) {
      shift.staffMembers.push(staff);
    }

    this.staffMembers.set(staffId, staff);
    return staff;
  }

  /**
   * Clock out staff member
   */
  clockOut(staffId: string): StaffMember | null {
    const staff = this.staffMembers.get(staffId);
    if (!staff) return null;

    staff.isOnShift = false;
    staff.shiftEnd = new Date();
    
    this.staffMembers.set(staffId, staff);
    return staff;
  }

  /**
   * Get staff currently on shift
   */
  getOnShiftStaff(): StaffMember[] {
    return this.getAllStaff().filter((s) => s.isOnShift);
  }

  // ============================================================================
  // PERFORMANCE TRACKING
  // ============================================================================

  /**
   * Update staff performance metrics
   */
  updatePerformance(
    staffId: string,
    metrics: Partial<NonNullable<StaffMember['performance']>>
  ): StaffMember | null {
    const staff = this.staffMembers.get(staffId);
    if (!staff) return null;

    staff.performance = {
      ...(staff.performance || {}),
      ...metrics,
    };

    this.staffMembers.set(staffId, staff);
    return staff;
  }

  /**
   * Get top performers
   */
  getTopPerformers(limit: number = 5): StaffMember[] {
    return this.getAllStaff()
      .filter((s) => s.performance)
      .sort((a, b) => {
        const ratingA = a.performance?.customerRating || 0;
        const ratingB = b.performance?.customerRating || 0;
        return ratingB - ratingA;
      })
      .slice(0, limit);
  }

  /**
   * Calculate labor cost percentage
   */
  calculateLaborCostPercentage(sales: number, laborCost: number): number {
    if (sales <= 0) return 0;
    return Math.round((laborCost / sales) * 1000) / 10;
  }

  // ============================================================================
  // TIP POOL MANAGEMENT
  // ============================================================================

  /**
   * Calculate tip pool distribution
   */
  distributeTips(
    totalTips: number,
    tipPoolConfig: Record<string, { percentage: number }>,
    eligibleStaff: StaffMember[]
  ): {
    distribution: Array<{
      staffId: string;
      name: string;
      role: string;
      share: number;
    }>;
    summary: {
      totalDistributed: number;
      byRole: Record<string, number>;
    };
  } {
    const distribution: Array<{
      staffId: string;
      name: string;
      role: string;
      share: number;
    }> = [];

    const byRole: Record<string, { percentage: number; amount: number; count: number }> = {};

    // Initialize roles
    Object.entries(tipPoolConfig).forEach(([role, config]) => {
      byRole[role] = {
        percentage: config.percentage,
        amount: 0,
        count: eligibleStaff.filter((s) => s.role === role).length,
      };
    });

    // Calculate amounts per role
    Object.entries(byRole).forEach(([role, data]) => {
      data.amount = (totalTips * data.percentage) / 100;
    });

    // Distribute to individual staff
    eligibleStaff.forEach((staff) => {
      const roleConfig = tipPoolConfig[staff.role];
      if (!roleConfig) return;

      const roleStaffCount = byRole[staff.role].count;
      const individualShare = roleStaffCount > 0 ? byRole[staff.role].amount / roleStaffCount : 0;

      distribution.push({
        staffId: staff.id,
        name: staff.name,
        role: staff.role,
        share: Math.round(individualShare * 100) / 100,
      });
    });

    return {
      distribution,
      summary: {
        totalDistributed: Math.round(totalTips * 100) / 100,
        byRole: Object.fromEntries(
          Object.entries(byRole).map(([role, data]) => [role, data.amount])
        ),
      },
    };
  }

  /**
   * Generate tip report for payroll
   */
  generateTipReport(dateRange: { start: Date; end: Date }): Array<{
    staffId: string;
    name: string;
    role: string;
    totalTips: number;
    shifts: number;
    avgPerShift: number;
  }> {
    // This would aggregate tip data from POS
    // Placeholder implementation
    return this.getAllStaff().map((staff) => ({
      staffId: staff.id,
      name: staff.name,
      role: staff.role,
      totalTips: Math.random() * 1000,
      shifts: Math.floor(Math.random() * 20),
      avgPerShift: Math.random() * 100,
    }));
  }

  // ============================================================================
  // SCHEDULING OPTIMIZATION
  // ============================================================================

  /**
   * Optimize staff scheduling based on forecast
   */
  optimizeScheduling(forecast: {
    covers: number;
    revenue: number;
    laborBudgetPercentage: number;
  }): {
    recommendedStaff: Array<{
      role: string;
      count: number;
      hours: number;
    }>;
    projectedLaborCost: number;
    laborCostPercentage: number;
  } {
    const laborBudget = forecast.revenue * (forecast.laborBudgetPercentage / 100);
    const avgHourlyRate = 20; // Would use actual staff rates

    // Simple algorithm based on covers
    const serversNeeded = Math.ceil(forecast.covers / 20);
    const cooksNeeded = Math.ceil(forecast.covers / 30);
    const supportNeeded = Math.ceil(forecast.covers / 40);

    const recommendedStaff = [
      { role: 'server', count: serversNeeded, hours: serversNeeded * 8 },
      { role: 'cook', count: cooksNeeded, hours: cooksNeeded * 8 },
      { role: 'support', count: supportNeeded, hours: supportNeeded * 6 },
    ];

    const totalHours = recommendedStaff.reduce((sum, s) => sum + s.hours, 0);
    const projectedLaborCost = totalHours * avgHourlyRate;

    return {
      recommendedStaff,
      projectedLaborCost: Math.round(projectedLaborCost * 100) / 100,
      laborCostPercentage: Math.round((projectedLaborCost / forecast.revenue) * 1000) / 10,
    };
  }

  /**
   * Check labor compliance
   */
  checkLaborCompliance(): Array<{
    type: 'warning' | 'violation';
    description: string;
    affectedStaff: string[];
  }> {
    const issues: Array<{
      type: 'warning' | 'violation';
      description: string;
      affectedStaff: string[];
    }> = [];

    // Check for overtime
    const approachingOT = this.getAllStaff().filter((s) => {
      // Would calculate actual hours worked
      return false;
    });

    if (approachingOT.length > 0) {
      issues.push({
        type: 'warning',
        description: 'Staff approaching overtime threshold',
        affectedStaff: approachingOT.map((s) => s.name),
      });
    }

    // Check for break violations
    // Would track actual break times

    return issues;
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get staff analytics
   */
  getAnalytics(period: 'week' | 'month' = 'month'): {
    totalStaff: number;
    onShift: number;
    avgPerformanceRating: number;
    turnoverRate: number;
    laborCostPercentage: number;
    topRoles: Array<{ role: string; count: number; avgRating: number }>;
  } {
    const staff = this.getAllStaff();
    const onShift = this.getOnShiftStaff().length;

    const ratings = staff
      .filter((s) => s.performance?.customerRating)
      .map((s) => s.performance!.customerRating!);

    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
      : 0;

    const roles = new Map<string, { count: number; ratings: number[] }>();
    staff.forEach((s) => {
      const existing = roles.get(s.role) || { count: 0, ratings: [] };
      existing.count += 1;
      if (s.performance?.customerRating) {
        existing.ratings.push(s.performance.customerRating);
      }
      roles.set(s.role, existing);
    });

    return {
      totalStaff: staff.length,
      onShift,
      avgPerformanceRating: Math.round(avgRating * 10) / 10,
      turnoverRate: 15, // Would calculate from historical data
      laborCostPercentage: 30, // Would calculate from actual costs
      topRoles: Array.from(roles.entries())
        .map(([role, data]) => ({
          role,
          count: data.count,
          avgRating:
            data.ratings.length > 0
              ? Math.round((data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length) * 10) /
                10
              : 0,
        }))
        .sort((a, b) => b.count - a.count),
    };
  }
}

// Export singleton instance
export const staffManagementService = new StaffManagementService();
