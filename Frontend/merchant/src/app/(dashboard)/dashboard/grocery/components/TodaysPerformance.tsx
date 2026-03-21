/**
 * Today's Performance Component
 * Shows sales, transactions, and average basket size metrics
 */

import React from 'react';
import { TrendingUp, TrendingDown, ShoppingBag, CreditCard } from 'lucide-react';

interface Metrics {
  salesToday: number;
  salesTrend: number;
  transactions: number;
  onlineTransactions: number;
  inStoreTransactions: number;
  averageBasketSize: number;
  basketSizeTrend: number;
}

interface Props {
  metrics: Metrics;
}

export function TodaysPerformance({ metrics }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Sales Today */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Sales Today</h3>
          <ShoppingBag className="w-5 h-5 text-green-500" />
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">
              ${metrics.salesToday.toLocaleString()}
            </p>
            <div className={`flex items-center mt-2 ${
              metrics.salesTrend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.salesTrend >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(metrics.salesTrend * 100)}% vs last week
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Transactions</h3>
          <CreditCard className="w-5 h-5 text-blue-500" />
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900">{metrics.transactions}</p>
          <div className="mt-2 space-y-1">
            <div className="flex items-center text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              <span className="text-gray-600">Online: {metrics.onlineTransactions}</span>
            </div>
            <div className="flex items-center text-sm">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              <span className="text-gray-600">In-Store: {metrics.inStoreTransactions}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Average Basket Size */}
      <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-600">Avg Basket Size</h3>
          <div className="w-5 h-5 text-purple-500 font-bold flex items-center justify-center">$</div>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <p className="text-3xl font-bold text-gray-900">${metrics.averageBasketSize}</p>
            <div className={`flex items-center mt-2 ${
              metrics.basketSizeTrend >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {metrics.basketSizeTrend >= 0 ? (
                <TrendingUp className="w-4 h-4 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 mr-1" />
              )}
              <span className="text-sm font-medium">
                {Math.abs(metrics.basketSizeTrend * 100)}% vs last month
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
