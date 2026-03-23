// @ts-nocheck
/**
 * Credit Balance Widget
 * 
 * Displays current credit balance, usage, and reset date.
 * Follows the unified design system (white cards, green accents, rounded-xl).
 */

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Lightning as Zap, Warning as AlertTriangle, TrendUp, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@vayva/ui';

interface CreditBalance {
  monthlyCredits: number;
  usedCredits: number;
  remainingCredits: number;
  resetDate: string | null;
  plan: string;
}

export function CreditBalanceWidget() {
  const { data: balance, isLoading, error } = useQuery<CreditBalance>({
    queryKey: ['credits', 'balance'],
    queryFn: async () => {
      const res = await fetch('/api/credits/balance');
      if (!res.ok) throw new Error('Failed to fetch credits');
      return res.json();
    },
    refetchInterval: 60000, // Update every minute
  });

  if (isLoading || !balance) {
    return (
      <div className="w-40 h-10 bg-gray-100 animate-pulse rounded-xl" />
    );
  }

  const percentage = balance.monthlyCredits > 0
    ? (balance.remainingCredits / balance.monthlyCredits) * 100
    : 0;

  const isLow = percentage < 20 && balance.plan !== 'FREE';
  const isFree = balance.plan === 'FREE';

  return (
    <div className="relative group">
      {/* Widget */}
      <Link href="/dashboard/billing">
        <div className={cn(
          "flex items-center gap-2.5 px-3.5 py-2 rounded-xl border transition-all cursor-pointer hover:shadow-md",
          isLow 
            ? "bg-red-50 border-red-200 hover:border-red-300" 
            : isFree
            ? "bg-gray-50 border-gray-200 hover:border-gray-300"
            : "bg-green-50 border-green-200 hover:border-green-300"
        )}>
          <div className={cn(
            "p-1.5 rounded-lg",
            isLow 
              ? "bg-red-100 text-red-600" 
              : isFree
              ? "bg-gray-200 text-gray-600"
              : "bg-green-100 text-green-600"
          )}>
            {isFree ? (
              <Info size={16} weight="fill" />
            ) : (
              <Zap size={16} weight="fill" />
            )}
          </div>
          
          <div className="flex flex-col min-w-0">
            <span className={cn(
              "text-xs font-bold",
              isLow ? "text-red-700" : isFree ? "text-gray-700" : "text-green-700"
            )}>
              {isFree ? 'Trial' : `${balance.remainingCredits.toLocaleString()} credits`}
            </span>
            {!isFree && balance.monthlyCredits > 0 && (
              <span className="text-[10px] text-gray-600">
                {percentage.toFixed(0)}% remaining
              </span>
            )}
          </div>

          {isLow && (
            <AlertTriangle size={14} className="text-red-600 shrink-0" />
          )}
        </div>
      </Link>

      {/* Tooltip on hover */}
      <div className="absolute right-0 top-full mt-2 w-80 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <Zap size={18} weight="fill" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900">Credit Balance</h4>
              <p className="text-xs text-gray-500">Monthly allocation & usage</p>
            </div>
          </div>

          <div className="space-y-3">
            {/* Progress Bar */}
            {!isFree && balance.monthlyCredits > 0 && (
              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "absolute left-0 top-0 h-full rounded-full transition-all",
                    isLow ? "bg-red-500" : "bg-green-500"
                  )}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Monthly
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {balance.monthlyCredits.toLocaleString()}
                </p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Used
                </p>
                <p className="text-lg font-bold text-red-600">
                  {balance.usedCredits.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs font-medium text-gray-700">Remaining</p>
                <p className={cn(
                  "text-base font-bold",
                  isLow ? "text-red-600" : "text-green-600"
                )}>
                  {balance.remainingCredits.toLocaleString()}
                </p>
              </div>
              
              {balance.resetDate && (
                <p className="text-xs text-gray-500 text-right">
                  Resets {new Date(balance.resetDate).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              )}
            </div>

            {/* Usage Breakdown */}
            <div className="pt-3 border-t border-gray-100">
              <p className="text-xs font-medium text-gray-700 mb-2">Common Uses</p>
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">AI Message</span>
                  <span className="font-medium text-gray-900">1 credit</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Template Change</span>
                  <span className="font-medium text-gray-900">5,000 credits</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Autopilot Run</span>
                  <span className="font-medium text-gray-900">100 credits</span>
                </div>
              </div>
            </div>

            {/* Low Credit Warning */}
            {isLow && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs font-medium text-red-800">
                  ⚠️ Low Credits Warning
                </p>
                <p className="text-xs text-red-700 mt-1">
                  You have less than 20% of your monthly credits remaining. Consider upgrading to Pro for more credits.
                </p>
                <Link href="/dashboard/control-center/pro" className="block mt-2">
                  <Button size="sm" className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded-lg">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            )}

            {/* Free Plan Notice */}
            {isFree && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <p className="text-xs font-medium text-gray-700">
                  ℹ️ Trial Mode
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  You're on the free trial. Upgrade to Starter or Pro for full access and monthly credits.
                </p>
                <Link href="/dashboard/control-center/pro" className="block mt-2">
                  <Button size="sm" className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-2 rounded-lg">
                    View Plans
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
