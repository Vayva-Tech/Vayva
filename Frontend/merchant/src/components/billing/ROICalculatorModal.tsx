'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@vayva/ui';
import { 
  TrendingUp, 
  DollarSign, 
  Clock, 
  BarChart3, 
  ArrowUpRight, 
  Calculator,
  Info,
  CheckCircle2,
  Target,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@vayva/shared';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface ROICalculatorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
  targetPlan?: string;
  onSelectUpgrade?: (plan: string) => void;
}

interface BusinessMetrics {
  monthlyRevenue: number;
  ordersPerMonth: number;
  averageOrderValue: number;
  hoursOnManualTasks: number;
  teamSize: number;
  customerCount: number;
}

interface ROIResult {
  timeSavings: {
    hoursPerMonth: number;
    hourlyRate: number;
    monthlyValue: number;
  };
  revenueIncrease: {
    conversionLift: number;
    additionalRevenue: number;
  };
  costReduction: {
    toolConsolidation: number;
    errorReduction: number;
  };
  totalMonthlyValue: number;
  totalAnnualValue: number;
  roiPercentage: number;
  paybackPeriod: number;
}

export function ROICalculatorModal({
  open,
  onOpenChange,
  currentPlan = 'starter',
  targetPlan = 'pro',
  onSelectUpgrade,
}: ROICalculatorModalProps) {
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    monthlyRevenue: 500000,
    ordersPerMonth: 100,
    averageOrderValue: 5000,
    hoursOnManualTasks: 20,
    teamSize: 3,
    customerCount: 200,
  });

  const [result, setResult] = useState<ROIResult | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Calculate ROI whenever metrics change
  useEffect(() => {
    if (open) {
      calculateROI();
    }
  }, [metrics, targetPlan]);

  const calculateROI = () => {
    setCalculating(true);
    
    // Simulate calculation delay for better UX
    setTimeout(() => {
      // Time Savings Calculation
      const automationEfficiency = targetPlan === 'pro' ? 0.6 : targetPlan === 'pro_plus' ? 0.8 : 0.4;
      const hoursSaved = metrics.hoursOnManualTasks * automationEfficiency;
      const hourlyRate = metrics.monthlyRevenue / (metrics.teamSize * 160); // Assuming 160 hrs/month
      const timeSavingsValue = hoursSaved * hourlyRate;

      // Revenue Increase Calculation
      const conversionImprovement = targetPlan === 'pro' ? 0.15 : targetPlan === 'pro_plus' ? 0.25 : 0.08;
      const additionalRevenue = metrics.monthlyRevenue * conversionImprovement;

      // Cost Reduction Calculation
      const toolConsolidation = targetPlan === 'pro' ? 15000 : targetPlan === 'pro_plus' ? 30000 : 8000;
      const errorReduction = (metrics.ordersPerMonth * metrics.averageOrderValue * 0.02) * (targetPlan === 'pro' ? 0.5 : targetPlan === 'pro_plus' ? 0.7 : 0.3);

      // Total Value
      const totalMonthlyValue = timeSavingsValue + additionalRevenue + toolConsolidation + errorReduction;
      const totalAnnualValue = totalMonthlyValue * 12;

      // Investment Cost
      const planPrices: Record<string, number> = {
        free: 0,
        starter: 25000,
        pro: 35000,
        pro_plus: 50000,
      };
      
      const currentPrice = planPrices[currentPlan] || 0;
      const targetPrice = planPrices[targetPlan] || 0;
      const incrementalCost = targetPrice - currentPrice;

      // ROI Calculation
      const roiPercentage = ((totalMonthlyValue - incrementalCost) / incrementalCost) * 100;
      const paybackPeriod = incrementalCost > 0 ? (incrementalCost / totalMonthlyValue) * 30 : 0; // in days

      setResult({
        timeSavings: {
          hoursPerMonth: Math.round(hoursSaved),
          hourlyRate: Math.round(hourlyRate),
          monthlyValue: Math.round(timeSavingsValue),
        },
        revenueIncrease: {
          conversionLift: conversionImprovement * 100,
          additionalRevenue: Math.round(additionalRevenue),
        },
        costReduction: {
          toolConsolidation: Math.round(toolConsolidation),
          errorReduction: Math.round(errorReduction),
        },
        totalMonthlyValue: Math.round(totalMonthlyValue),
        totalAnnualValue: Math.round(totalAnnualValue),
        roiPercentage: Math.round(roiPercentage),
        paybackPeriod: Math.round(paybackPeriod),
      });

      setCalculating(false);
    }, 800);
  };

  const updateMetric = (key: keyof BusinessMetrics, value: number) => {
    setMetrics((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            ROI Calculator
          </DialogTitle>
          <DialogDescription>
            See exactly how much value upgrading to {targetPlan.toUpperCase()} will bring to your business
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Business Metrics Input */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Business Metrics
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="revenue" className="text-sm font-medium text-gray-700">
                  Monthly Revenue (₦)
                </Label>
                <Input
                  id="revenue"
                  type="number"
                  value={metrics.monthlyRevenue}
                  onChange={(e) => updateMetric('monthlyRevenue', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="orders" className="text-sm font-medium text-gray-700">
                  Orders per Month
                </Label>
                <Input
                  id="orders"
                  type="number"
                  value={metrics.ordersPerMonth}
                  onChange={(e) => updateMetric('ordersPerMonth', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="aov" className="text-sm font-medium text-gray-700">
                  Avg Order Value (₦)
                </Label>
                <Input
                  id="aov"
                  type="number"
                  value={metrics.averageOrderValue}
                  onChange={(e) => updateMetric('averageOrderValue', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="hours" className="text-sm font-medium text-gray-700">
                  Hours on Manual Tasks/Week
                </Label>
                <Input
                  id="hours"
                  type="number"
                  value={metrics.hoursOnManualTasks}
                  onChange={(e) => updateMetric('hoursOnManualTasks', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="team" className="text-sm font-medium text-gray-700">
                  Team Size
                </Label>
                <Input
                  id="team"
                  type="number"
                  value={metrics.teamSize}
                  onChange={(e) => updateMetric('teamSize', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="customers" className="text-sm font-medium text-gray-700">
                  Customer Count
                </Label>
                <Input
                  id="customers"
                  type="number"
                  value={metrics.customerCount}
                  onChange={(e) => updateMetric('customerCount', parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* ROI Results */}
          {result && (
            <>
              {/* Summary Card */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-green-900 mb-2">
                      Your Estimated Returns
                    </h3>
                    <p className="text-sm text-green-700">
                      Based on your business metrics, here's what you can expect:
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Monthly Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(result.totalMonthlyValue)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Annual Value</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(result.totalAnnualValue)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">ROI</p>
                    <p className="text-2xl font-bold text-green-600">
                      {result.roiPercentage}%
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    Payback period: <strong>{result.paybackPeriod} days</strong>
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Time Savings */}
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <h4 className="font-semibold text-blue-900">Time Savings</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hours saved/month:</span>
                      <span className="font-semibold text-blue-700">{result.timeSavings.hoursPerMonth} hrs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hourly rate:</span>
                      <span className="font-semibold text-blue-700">{formatCurrency(result.timeSavings.hourlyRate)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-blue-200">
                      <span className="text-gray-600">Monthly value:</span>
                      <span className="font-bold text-blue-900">{formatCurrency(result.timeSavings.monthlyValue)}</span>
                    </div>
                  </div>
                </div>

                {/* Revenue Increase */}
                <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <ArrowUpRight className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-purple-900">Revenue Increase</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Conversion lift:</span>
                      <span className="font-semibold text-purple-700">+{result.revenueIncrease.conversionLift.toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional revenue:</span>
                      <span className="font-bold text-purple-900">{formatCurrency(result.revenueIncrease.additionalRevenue)}</span>
                    </div>
                  </div>
                </div>

                {/* Cost Reduction */}
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-green-900">Cost Reduction</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tool consolidation:</span>
                      <span className="font-semibold text-green-700">{formatCurrency(result.costReduction.toolConsolidation)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Error reduction:</span>
                      <span className="font-semibold text-green-700">{formatCurrency(result.costReduction.errorReduction)}</span>
                    </div>
                  </div>
                </div>

                {/* Investment */}
                <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-5 h-5 text-amber-600" />
                    <h4 className="font-semibold text-amber-900">Investment vs Return</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly investment:</span>
                      <span className="font-semibold text-amber-700">
                        {formatCurrency((targetPlan === 'pro' ? 35000 : targetPlan === 'pro_plus' ? 50000 : 25000) - (currentPlan === 'pro' ? 35000 : currentPlan === 'pro_plus' ? 50000 : currentPlan === 'starter' ? 25000 : 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Monthly return:</span>
                      <span className="font-bold text-green-700">{formatCurrency(result.totalMonthlyValue)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-amber-200">
                      <span className="text-gray-600">Net gain:</span>
                      <span className="font-bold text-green-700">
                        {formatCurrency(result.totalMonthlyValue - ((targetPlan === 'pro' ? 35000 : targetPlan === 'pro_plus' ? 50000 : 25000) - (currentPlan === 'pro' ? 35000 : currentPlan === 'pro_plus' ? 50000 : currentPlan === 'starter' ? 25000 : 0)))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value Drivers Explanation */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  How We Calculate This
                </h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Automation Efficiency</p>
                      <p>AI Autopilot reduces manual tasks by 60-80%, freeing up your team's time for high-value work.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Conversion Optimization</p>
                      <p>Advanced analytics and AI-driven insights typically improve conversion rates by 15-25%.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Tool Consolidation</p>
                      <p>Replace multiple tools (analytics, email marketing, automation) with one integrated platform.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">Error Reduction</p>
                      <p>Automated workflows reduce costly mistakes in order processing and inventory management.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Call to Action */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-2">
                      Ready to Get These Results?
                    </h3>
                    <p className="text-white/90 mb-4">
                      Upgrade to {targetPlan.toUpperCase()} and start seeing these returns within 30 days.
                    </p>
                    <ul className="space-y-1 text-sm text-white/80">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {result.timeSavings.hoursPerMonth} hours saved every month
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {result.revenueIncrease.conversionLift.toFixed(0)}% increase in conversions
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        {formatCurrency(result.totalAnnualValue)} annual value created
                      </li>
                    </ul>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      onClick={() => {
                        onSelectUpgrade?.(targetPlan);
                        onOpenChange(false);
                      }}
                      size="lg"
                      className="bg-white text-blue-600 hover:bg-blue-50 font-bold px-8"
                    >
                      Upgrade Now
                    </Button>
                    <p className="text-xs text-white/70">
                      No commitment. Cancel anytime.
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {calculating && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
