import React from "react";
import { Card, Button } from "@vayva/ui";
import { Users, CurrencyDollar, TrendingUp, Star } from "@phosphor-icons/react";
import type { ClientPortfolioData } from "@/types/professional";

interface ClientPortfolioProps {
  data?: ClientPortfolioData;
}

export function ClientPortfolio({ data }: ClientPortfolioProps) {
  if (!data) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const retentionClass = data.retentionRate >= 90 ? "text-green-600" : 
                        data.retentionRate >= 80 ? "text-yellow-600" : "text-red-600";

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-text-primary flex items-center gap-2">
          <Users size={20} className="text-blue-600" />
          Client Portfolio
        </h2>
        <Button variant="outline" size="sm">
          View All Clients
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Client Metrics */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Total Clients</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{data.totalClients}</div>
          <div className="text-xs text-blue-700 mt-1">
            {data.activeClients} active
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">Retention</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{data.retentionRate}%</div>
          <div className={`text-xs mt-1 ${retentionClass}`}>
            {data.newClientsThisQuarter} new this quarter
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <CurrencyDollar size={16} className="text-purple-600" />
            <span className="text-sm font-medium text-purple-800">Avg Value</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">
            ${(data.averageMatterValue / 1000).toFixed(1)}K
          </div>
          <div className="text-xs text-purple-700 mt-1">
            per matter
          </div>
        </div>

        <div className="bg-amber-50 p-4 rounded-lg border border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Star size={16} className="text-amber-600" />
            <span className="text-sm font-medium text-amber-800">Satisfaction</span>
          </div>
          <div className="text-2xl font-bold text-amber-900">
            {data.satisfactionScore}/5
          </div>
          <div className="text-xs text-amber-700 mt-1">
            Client rating
          </div>
        </div>
      </div>

      {/* Top Clients */}
      <div>
        <h3 className="font-medium text-text-primary mb-3">Top Clients (YTD)</h3>
        <div className="space-y-2">
          {data.topClients.slice(0, 5).map((client, index) => (
            <div key={client.clientId} className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-800">
                    {index + 1}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-text-primary">{client.clientName}</div>
                  <div className="text-xs text-text-secondary">
                    {client.mattersCount} matters
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-text-primary">
                  ${(client.revenueYTD / 1000).toFixed(1)}K
                </div>
                <div className="text-xs text-text-secondary">
                  YTD revenue
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}