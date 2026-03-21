"use client";

import Link from "next/link";
import { Button, Icon } from "@vayva/ui";
import { Megaphone, TrendUp, Users, Target, EnvelopeSimple, Ticket } from "@phosphor-icons/react";

export default function MarketingPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Marketing</h1>
          <p className="text-sm text-gray-500 mt-1">Grow your audience and drive sales</p>
        </div>
        <Link href="/dashboard/marketing/campaigns/new">
          <Button className="rounded-xl gap-2 bg-green-500 hover:bg-green-600 px-5 font-medium">
            <Icon name="Plus" size={16} />
            Create Campaign
          </Button>
        </Link>
      </div>

      {/* Summary Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryWidget
          icon={<Megaphone size={18} />}
          label="Active Campaigns"
          value="12"
          trend="+3 this week"
          positive
        />
        <SummaryWidget
          icon={<Users size={18} />}
          label="Total Reach"
          value="24.5K"
          trend="+18%"
          positive
        />
        <SummaryWidget
          icon={<Target size={18} />}
          label="Conversion Rate"
          value="3.8%"
          trend="+0.5%"
          positive
        />
        <SummaryWidget
          icon={<TrendUp size={18} />}
          label="Revenue Attributed"
          value="₦1.2M"
          trend="+25%"
          positive
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          icon={<Megaphone size={24} />}
          title="Campaigns"
          description="Create and manage marketing campaigns"
          href="/dashboard/marketing/campaigns"
          color="bg-gray-100 text-gray-600"
        />
        <QuickActionCard
          icon={<Ticket size={24} />}
          title="Discounts"
          description="Create discount codes and promotions"
          href="/dashboard/marketing/discounts"
          color="bg-green-50 text-green-600"
        />
        <QuickActionCard
          icon={<EnvelopeSimple size={24} />}
          title="Email Marketing"
          description="Send newsletters and automated emails"
          href="/dashboard/marketing/email"
          color="bg-gray-100 text-gray-600"
        />
        <QuickActionCard
          icon={<Users size={24} />}
          title="Affiliates"
          description="Manage affiliate partnerships"
          href="/dashboard/marketing/affiliates"
          color="bg-orange-50 text-orange-600"
        />
        <QuickActionCard
          icon={<Target size={24} />}
          title="Flash Sales"
          description="Run limited-time promotions"
          href="/dashboard/marketing/flash-sales"
          color="bg-red-50 text-red-600"
        />
        <QuickActionCard
          icon={<TrendUp size={24} />}
          title="Analytics"
          description="Track marketing performance"
          href="/dashboard/marketing/analytics"
          color="bg-green-50 text-green-600"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Recent Campaigns</h3>
            <p className="text-xs text-gray-500 mt-0.5">Latest marketing activities</p>
          </div>
          <Link href="/dashboard/marketing/campaigns" className="text-sm font-medium text-green-600 hover:text-green-700">
            View All
          </Link>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Megaphone size={20} className="text-gray-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Summer Sale Campaign</p>
                  <p className="text-xs text-gray-500">Email • Sent to 2,450 subscribers</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">₦245K</p>
                <p className="text-xs text-green-600 font-medium">+18% ROI</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Summary Widget Component
function SummaryWidget({
  icon,
  label,
  value,
  trend,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900 tracking-tight mt-1">
            {value}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
      <div className={`flex items-center text-sm font-medium ${positive ? 'text-green-600' : 'text-red-600'}`}>
        <span>{trend}</span>
        <span className="ml-1">{positive ? '↗' : '↘'}</span>
      </div>
    </div>
  );
}

// Quick Action Card Component
function QuickActionCard({
  icon,
  title,
  description,
  href,
  color,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-gray-200 transition-all cursor-pointer">
        <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </Link>
  );
}
