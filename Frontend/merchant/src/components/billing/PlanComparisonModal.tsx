'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@vayva/ui';
import { Check, X, TrendingUp, Sparkles, Zap, BarChart3, Users, Shield, Globe, Headphones } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@vayva/shared';

interface PlanComparisonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan?: string;
  onSelectPlan?: (plan: string) => void;
}

interface PlanFeature {
  name: string;
  description?: string;
  free: string | boolean;
  starter: string | boolean;
  pro: string | boolean;
  proPlus: string | boolean;
  highlight?: boolean;
}

const PLANS = {
  FREE: {
    key: 'free',
    name: 'Free',
    price: 0,
    description: 'For individuals just starting out',
    color: 'from-gray-500 to-slate-500',
    popular: false,
  },
  STARTER: {
    key: 'starter',
    name: 'Starter',
    price: 25000,
    description: 'For small businesses getting started',
    color: 'from-blue-500 to-cyan-500',
    popular: false,
  },
  PRO: {
    key: 'pro',
    name: 'Pro',
    price: 35000,
    description: 'For growing businesses with advanced needs',
    color: 'from-purple-500 to-pink-500',
    popular: true,
  },
  PRO_PLUS: {
    key: 'pro_plus',
    name: 'Pro+',
    price: 50000,
    description: 'For established businesses needing full power',
    color: 'from-amber-500 to-orange-500',
    popular: false,
  },
};

const FEATURES: PlanFeature[] = [
  {
    name: 'Products',
    description: 'Maximum number of products in catalog',
    free: '10',
    starter: '100',
    pro: '1,000',
    proPlus: 'Unlimited',
    highlight: true,
  },
  {
    name: 'Orders per Month',
    description: 'Maximum orders you can process monthly',
    free: '20',
    starter: '200',
    pro: '2,000',
    proPlus: 'Unlimited',
    highlight: true,
  },
  {
    name: 'Customers',
    description: 'Customer records you can store',
    free: '50',
    starter: '500',
    pro: '5,000',
    proPlus: 'Unlimited',
    highlight: true,
  },
  {
    name: 'Team Members',
    description: 'Users with access to your store',
    free: '1',
    starter: '3',
    pro: '10',
    proPlus: 'Unlimited',
    highlight: true,
  },
  {
    name: 'Staff Accounts',
    description: 'Additional staff seats',
    free: '0',
    starter: '5',
    pro: '20',
    proPlus: 'Unlimited',
  },
  {
    name: 'AI Autopilot',
    description: 'Automated business operations',
    free: false,
    starter: 'Basic',
    pro: 'Advanced',
    proPlus: 'Full + Custom',
    highlight: true,
  },
  {
    name: 'Analytics Depth',
    description: 'Data insights and reporting',
    free: 'Basic',
    starter: 'Standard',
    pro: 'Advanced',
    proPlus: 'Custom + Predictive',
    highlight: true,
  },
  {
    name: 'API Access',
    description: 'Integration capabilities',
    free: false,
    starter: false,
    pro: true,
    proPlus: 'Priority',
  },
  {
    name: 'Custom Reports',
    description: 'Tailored analytics dashboards',
    free: false,
    starter: false,
    pro: '5 reports',
    proPlus: 'Unlimited',
  },
  {
    name: 'Email Support',
    description: 'Customer support via email',
    free: true,
    starter: true,
    pro: 'Priority',
    proPlus: 'VIP',
  },
  {
    name: 'Phone Support',
    description: 'Direct phone line to support',
    free: false,
    starter: false,
    pro: true,
    proPlus: '24/7 Dedicated',
  },
  {
    name: 'Success Manager',
    description: 'Dedicated account manager',
    free: false,
    starter: false,
    pro: false,
    proPlus: true,
    highlight: true,
  },
  {
    name: 'Custom Domain',
    description: 'Use your own domain name',
    free: false,
    starter: true,
    pro: true,
    proPlus: 'Multiple domains',
  },
  {
    name: 'White Label',
    description: 'Remove Vayva branding',
    free: false,
    starter: false,
    pro: true,
    proPlus: true,
  },
  {
    name: 'Advanced Permissions',
    description: 'Granular user access control',
    free: false,
    starter: false,
    pro: true,
    proPlus: true,
  },
  {
    name: 'Workflow Automation',
    description: 'Custom business workflows',
    free: false,
    starter: false,
    pro: '10 workflows',
    proPlus: 'Unlimited',
    highlight: true,
  },
];

export function PlanComparisonModal({
  open,
  onOpenChange,
  currentPlan,
  onSelectPlan,
}: PlanComparisonModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleSelectPlan = (planKey: string) => {
    setSelectedPlan(planKey);
    onSelectPlan?.(planKey);
    
    // Close after selection with delay
    setTimeout(() => {
      onOpenChange(false);
      setSelectedPlan(null);
    }, 1500);
  };

  const getDisplayValue = (feature: PlanFeature, planKey: string) => {
    const value = feature[planKey as keyof Omit<PlanFeature, 'name' | 'description' | 'highlight'>];
    
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <X className="w-5 h-5 text-gray-300" />
      );
    }
    
    return value;
  };

  const getPrice = (planKey: string) => {
    const plan = PLANS[planKey.toUpperCase() as keyof typeof PLANS];
    if (!plan) return 0;
    
    if (billingCycle === 'annual') {
      return Math.round(plan.price * 10 * 0.8); // 2 months free
    }
    return plan.price;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">
            Compare Plans
          </DialogTitle>
          <DialogDescription>
            Find the perfect plan for your business needs
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-6">
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={cn(
              "text-sm font-medium",
              billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'
            )}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={cn(
                "relative w-14 h-7 rounded-full transition-colors",
                billingCycle === 'annual' ? 'bg-green-600' : 'bg-gray-300'
              )}
            >
              <div
                className={cn(
                  "absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform",
                  billingCycle === 'annual' && 'translate-x-7'
                )}
              />
            </button>
            <span className={cn(
              "text-sm font-medium",
              billingCycle === 'annual' ? 'text-gray-900' : 'text-gray-500'
            )}>
              Annual
              <span className="ml-1.5 text-xs text-green-600 font-semibold">
                (Save 20%)
              </span>
            </span>
          </div>

          {/* Plan Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(PLANS).map(([key, plan]) => {
              const isCurrent = currentPlan === plan.key;
              const isSelected = selectedPlan === plan.key;
              
              return (
                <div
                  key={key}
                  className={cn(
                    "relative rounded-2xl border-2 p-6 transition-all hover:shadow-lg",
                    isSelected && "border-green-500 ring-2 ring-green-200",
                    isCurrent && "border-gray-400 bg-gray-50",
                    plan.popular && !isCurrent && "border-purple-500"
                  )}
                >
                  {/* Popular Badge */}
                  {plan.popular && !isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-purple-600 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-current" />
                        Most Popular
                      </span>
                    </div>
                  )}

                  {/* Current Plan Badge */}
                  {isCurrent && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="bg-gray-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                        Current Plan
                      </span>
                    </div>
                  )}

                  {/* Plan Header */}
                  <div className={cn(
                    "rounded-xl p-4 mb-4 text-white bg-gradient-to-r",
                    plan.color
                  )}>
                    <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                    <p className="text-xs text-white/90">{plan.description}</p>
                  </div>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(getPrice(plan.key))}
                      </span>
                      <span className="text-sm text-gray-500">
                        /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                      </span>
                    </div>
                    {billingCycle === 'annual' && plan.price > 0 && (
                      <p className="text-xs text-green-600 mt-1">
                        Save {formatCurrency(plan.price * 2 * 0.2)} with annual billing
                      </p>
                    )}
                  </div>

                  {/* Select Button */}
                  {!isCurrent && (
                    <Button
                      onClick={() => handleSelectPlan(plan.key)}
                      disabled={isSelected}
                      className={cn(
                        "w-full mb-6",
                        plan.popular && "bg-purple-600 hover:bg-purple-700"
                      )}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        `Choose ${plan.name}`
                      )}
                    </Button>
                  )}

                  {isCurrent && (
                    <Button
                      variant="outline"
                      disabled
                      className="w-full mb-6 border-gray-300 text-gray-500"
                    >
                      Current Plan
                    </Button>
                  )}

                  {/* Features Preview */}
                  <div className="space-y-2">
                    {FEATURES.slice(0, 5).map((feature) => (
                      <div key={feature.name} className="flex items-center gap-2 text-sm">
                        {getDisplayValue(feature, plan.key)}
                        <span className="text-gray-700">{feature.name}</span>
                      </div>
                    ))}
                    {FEATURES.length > 5 && (
                      <p className="text-xs text-gray-500 pt-2">
                        +{FEATURES.length - 5} more features
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Full Feature Comparison Table */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Detailed Feature Comparison
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 min-w-[200px]">
                      Feature
                    </th>
                    {Object.entries(PLANS).map(([key, plan]) => (
                      <th
                        key={key}
                        className={cn(
                          "py-3 px-4 text-center text-sm font-semibold min-w-[140px]",
                          currentPlan === plan.key && "bg-gray-50"
                        )}
                      >
                        <div className={cn(
                          "rounded-lg p-2 text-white bg-gradient-to-r",
                          plan.color
                        )}>
                          {plan.name}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURES.map((feature, idx) => (
                    <tr
                      key={feature.name}
                      className={cn(
                        "border-b border-gray-100 transition-colors",
                        feature.highlight && "bg-yellow-50",
                        idx % 2 === 0 && "bg-white",
                        idx % 2 === 1 && "bg-gray-50"
                      )}
                    >
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{feature.name}</p>
                          {feature.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{feature.description}</p>
                          )}
                        </div>
                      </td>
                      {Object.entries(PLANS).map(([key, plan]) => (
                        <td
                          key={key}
                          className={cn(
                            "py-3 px-4 text-center text-sm",
                            currentPlan === plan.key && "bg-gray-50"
                          )}
                        >
                          {getDisplayValue(feature, plan.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Upgrade Recommendations */}
          {currentPlan && currentPlan !== 'pro_plus' && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-6">
              <div className="flex items-start gap-4 mb-4">
                <TrendingUp className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Recommended Upgrade Path
                  </h3>
                  <p className="text-sm text-gray-600">
                    Based on typical growth patterns, here's the best path forward:
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {currentPlan === 'free' && (
                  <>
                    <div className="bg-white rounded-xl p-4 border border-blue-200">
                      <p className="font-semibold text-blue-900 mb-2">→ Start with Starter</p>
                      <p className="text-sm text-gray-600">
                        Get essential features for growing your business
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-purple-200">
                      <p className="font-semibold text-purple-900 mb-2">→ Then upgrade to Pro</p>
                      <p className="text-sm text-gray-600">
                        Unlock advanced features when you hit 50+ orders/month
                      </p>
                    </div>
                  </>
                )}
                {currentPlan === 'starter' && (
                  <div className="bg-white rounded-xl p-4 border border-purple-200">
                    <p className="font-semibold text-purple-900 mb-2">→ Upgrade to Pro</p>
                    <p className="text-sm text-gray-600">
                      Access AI Autopilot, advanced analytics, and API integrations
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        10x more product capacity
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        Advanced automation features
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        Priority support & phone access
                      </li>
                    </ul>
                  </div>
                )}
                {currentPlan === 'pro' && (
                  <div className="bg-white rounded-xl p-4 border border-amber-200">
                    <p className="font-semibold text-amber-900 mb-2">→ Go Pro+ for Maximum Power</p>
                    <p className="text-sm text-gray-600">
                      Unlimited everything + dedicated success manager
                    </p>
                    <ul className="mt-3 space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        Remove all limits and restrictions
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        Custom workflow automation
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        24/7 VIP support & success manager
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <Shield className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-green-900">Secure Payments</p>
              <p className="text-xs text-green-700">PCI-DSS compliant</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <Zap className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-blue-900">Instant Setup</p>
              <p className="text-xs text-blue-700">Get started immediately</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <Users className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-purple-900">10,000+ Businesses</p>
              <p className="text-xs text-purple-700">Trusted worldwide</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-xl">
              <Headphones className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-amber-900">Expert Support</p>
              <p className="text-xs text-amber-700">Here when you need us</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
