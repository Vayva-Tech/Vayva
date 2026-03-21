'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vayva/ui/components/ui/card';
import { Button } from '@vayva/ui/components/ui/button';
import { Badge } from '@vayva/ui/components/ui/badge';
import { Label } from '@vayva/ui/components/ui/label';
import { Slider } from '@vayva/ui/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vayva/ui/components/ui/select';
import { AlertCircle, Check, Utensils, Users, DollarSign } from 'lucide-react';

interface PlanOption {
  key: string;
  name: string;
  description: string;
  basePrice: number;
  perMealPrice: number;
  features: string[];
}

interface SubscriptionPlanBuilderProps {
  storeId: string;
  onPlanSelect?: (planData: any) => void;
  existingPlan?: any;
}

const PLAN_OPTIONS: PlanOption[] = [
  {
    key: 'BASIC',
    name: 'Basic',
    description: 'Perfect for individuals or couples',
    basePrice: 5000,
    perMealPrice: 2500,
    features: ['2-3 meals per week', 'Standard recipes', 'Email support'],
  },
  {
    key: 'PREMIUM',
    name: 'Premium',
    description: 'Great for small families',
    basePrice: 8000,
    perMealPrice: 3500,
    features: ['3-4 meals per week', 'Priority recipes', 'Priority support', 'Free delivery'],
  },
  {
    key: 'FAMILY',
    name: 'Family',
    description: 'Best value for larger families',
    basePrice: 12000,
    perMealPrice: 4500,
    features: ['4-5 meals per week', 'All recipes', '24/7 support', 'Free delivery', 'Exclusive content'],
  },
  {
    key: 'VEGAN',
    name: 'Vegan',
    description: '100% plant-based meals',
    basePrice: 7000,
    perMealPrice: 3000,
    features: ['Plant-based recipes', 'Organic ingredients', 'Nutrition guide'],
  },
  {
    key: 'KETO',
    name: 'Keto',
    description: 'Low-carb, high-fat meals',
    basePrice: 9000,
    perMealPrice: 4000,
    features: ['Keto-friendly recipes', 'Macro tracking', 'Expert guidance'],
  },
];

export function SubscriptionPlanBuilder({
  storeId,
  onPlanSelect,
  existingPlan,
}: SubscriptionPlanBuilderProps) {
  const [selectedPlan, setSelectedPlan] = useState(existingPlan?.planType || 'BASIC');
  const [portionsPerMeal, setPortionsPerMeal] = useState(existingPlan?.portionsPerMeal || 4);
  const [mealsPerWeek, setMealsPerWeek] = useState(existingPlan?.mealsPerWeek || 3);
  const [billingCycle, setBillingCycle] = useState<'weekly' | 'monthly'>('weekly');

  const planDetails = PLAN_OPTIONS.find(p => p.key === selectedPlan) || PLAN_OPTIONS[0];

  const calculatePrice = () => {
    const portionMultiplier = portionsPerMeal / 4;
    const weeklyPrice = (planDetails.basePrice + (planDetails.perMealPrice * mealsPerWeek)) * portionMultiplier;
    
    if (billingCycle === 'monthly') {
      return Math.round(weeklyPrice * 4.33); // Average weeks per month
    }
    
    return Math.round(weeklyPrice);
  };

  const handleCreateSubscription = () => {
    if (onPlanSelect) {
      onPlanSelect({
        planType: selectedPlan,
        portionsPerMeal,
        mealsPerWeek,
        billingCycle,
        price: calculatePrice(),
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Utensils className="h-5 w-5" />
              Build Your Meal Plan
            </CardTitle>
            <CardDescription>
              Customize your subscription to fit your needs
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            ₦{calculatePrice().toLocaleString()}/{billingCycle}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Plan Type Selection */}
        <div className="space-y-3">
          <Label>Select Plan Type</Label>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {PLAN_OPTIONS.map(plan => (
              <Card
                key={plan.key}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedPlan === plan.key ? 'ring-2 ring-emerald-500 bg-emerald-50' : ''
                }`}
                onClick={() => setSelectedPlan(plan.key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {selectedPlan === plan.key && (
                      <Check className="h-5 w-5 text-emerald-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                  <p className="text-lg font-bold">₦{plan.basePrice.toLocaleString()}</p>
                  <ul className="mt-3 space-y-1">
                    {plan.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-xs text-muted-foreground flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Portions Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Portions Per Meal
            </Label>
            <Badge variant="secondary">{portionsPerMeal} portions</Badge>
          </div>
          <Slider
            value={[portionsPerMeal]}
            min={2}
            max={8}
            step={2}
            onValueChange={([value]) => setPortionsPerMeal(value)}
            className="py-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>2</span>
            <span>4</span>
            <span>6</span>
            <span>8</span>
          </div>
        </div>

        {/* Meals Per Week */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-2">
              <Utensils className="h-4 w-4" />
              Meals Per Week
            </Label>
            <Badge variant="secondary">{mealsPerWeek} meals</Badge>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {[2, 3, 4, 5].map(num => (
              <Button
                key={num}
                variant={mealsPerWeek === num ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMealsPerWeek(num)}
              >
                {num}
              </Button>
            ))}
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="space-y-3">
          <Label>Billing Cycle</Label>
          <Select value={billingCycle} onValueChange={(val) => setBillingCycle(val as any)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly (Save 10%)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Summary */}
        <Card className="bg-slate-50">
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span>₦{planDetails.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Meals ({mealsPerWeek} × ₦{planDetails.perMealPrice.toLocaleString()})</span>
                <span>₦{(mealsPerWeek * planDetails.perMealPrice).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Portion Multiplier</span>
                <span>×{(portionsPerMeal / 4).toFixed(1)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Total</span>
                <span className="flex items-center gap-2 text-emerald-600">
                  <DollarSign className="h-4 w-4" />
                  ₦{calculatePrice().toLocaleString()}/{billingCycle}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleCreateSubscription}
        >
          {existingPlan ? 'Update Subscription' : 'Create Subscription'}
        </Button>

        {/* Info */}
        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg">
          <AlertCircle className="h-4 w-4 mt-0.5 text-blue-600" />
          <p>
            You can skip up to 4 weeks per month and change your meal preferences anytime.
            Free delivery on Premium and Family plans.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
