import React from "react";
import { OrderStats, OrderType, formatCurrency } from "@vayva/shared";
import { Icon } from "@vayva/ui";

interface OrderSummaryProps {
  stats?: OrderStats;
  type: OrderType;
}

export const OrderSummary = ({ stats, type }: OrderSummaryProps) => {
  if (!stats)
    return <div className="h-24 bg-white/40 animate-pulse rounded-2xl mb-8" />;

  const isService = type === OrderType.SERVICE;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {isService ? "New Requests" : "New Orders"}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold text-gray-900">
            {stats.countNew}
          </p>
          <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
            <Icon name="Bell" size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {isService ? "Upcoming" : "In Progress"}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold text-gray-900">
            {stats.countInProgress}
          </p>
          <div className="bg-orange-50 text-orange-600 p-2 rounded-lg">
            <Icon name="Activity" size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {isService ? "Completed" : "Ready"}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold text-gray-900">
            {stats.countCompleted}
          </p>
          <div className="bg-green-50 text-green-600 p-2 rounded-lg">
            <Icon name="CircleCheck" size={20} />
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
          {isService ? "Pending Payment" : "Revenue Today"}
        </p>
        <div className="flex items-center justify-between">
          {isService ? (
            <p className="text-3xl font-bold text-gray-900">
              {stats.countPendingPayment}
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </p>
          )}
          <div className="bg-white/40 text-gray-500 p-2 rounded-lg">
            <Icon name={isService ? "CreditCard" : "TrendingUp"} size={20} />
          </div>
        </div>
      </div>
    </div>
  );
};
