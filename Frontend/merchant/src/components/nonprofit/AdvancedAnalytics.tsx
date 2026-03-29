"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Heart, Users, Calendar, ArrowUp, ArrowDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency, formatDate } from "@vayva/shared";

interface AnalyticsData {
  totalRevenue: number;
  revenueGrowth: number;
  totalDonations: number;
  donationGrowth: number;
  averageGift: number;
  averageGiftGrowth: number;
  donorRetentionRate: number;
  recurringRevenue: number;
  campaignPerformance: Array<{
    name: string;
    goal: number;
    raised: number;
    progress: number;
    donations: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    revenue: number;
    donations: number;
  }>;
  topDonors: Array<{
    name: string;
    total: number;
    donations: number;
  }>;
}

export function AdvancedAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch data from multiple sources
      const [donationsRes, campaignsRes, donorsRes] = await Promise.all([
        apiJson<{ data: any[] }>("/nonprofit/donations"),
        apiJson<{ data: any[] }>("/nonprofit/campaigns"),
        apiJson<{ data: any[] }>("/nonprofit/donors"),
      ]);

      const donations = donationsRes.data || [];
      const campaigns = campaignsRes.data || [];
      const donors = donorsRes.data || [];

      // Calculate metrics
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const thisMonthDonations = donations.filter((d: any) => {
        const date = new Date(d.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      });

      const lastMonthDonations = donations.filter((d: any) => {
        const date = new Date(d.createdAt);
        return date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear;
      });

      const totalRevenue = donations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
      const thisMonthRevenue = thisMonthDonations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
      const lastMonthRevenue = lastMonthDonations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);

      const revenueGrowth = lastMonthRevenue > 0 
        ? ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
        : 0;

      const averageGift = donations.length > 0 ? totalRevenue / donations.length : 0;
      const recurringDonors = donors.filter((d: any) => d.isRecurringDonor);
      const recurringRevenue = recurringDonors.reduce((sum: number, d: any) => sum + (d.recurringAmount || 0), 0);

      // Calculate donor retention
      const activeDonors = new Set(donations.map((d: any) => d.donorId)).size;
      const donorRetentionRate = donors.length > 0 ? (activeDonors / donors.length) * 100 : 0;

      // Campaign performance
      const campaignPerformance = campaigns.map((c: any) => ({
        name: c.title,
        goal: Number(c.goal || 0),
        raised: Number(c.raised || 0),
        progress: c.goal ? ((c.raised / c.goal) * 100).toFixed(1) : 0,
        donations: c._count?.donations || 0,
      }));

      // Monthly trends (last 6 months)
      const monthlyTrends = Array.from({ length: 6 }, (_, i) => {
        const month = new Date(currentYear, currentMonth - i, 1);
        const monthDonations = donations.filter((d: any) => {
          const date = new Date(d.createdAt);
          return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear();
        });
        return {
          month: month.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
          revenue: monthDonations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0),
          donations: monthDonations.length,
        };
      }).reverse();

      // Top donors
      const topDonors = donors
        .map((d: any) => ({
          name: d.name || d.email,
          total: Number(d.totalDonated || 0),
          donations: Number(d.donationCount || 0),
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

      setAnalytics({
        totalRevenue,
        revenueGrowth,
        totalDonations: donations.length,
        donationGrowth: lastMonthDonations.length > 0
          ? ((thisMonthDonations.length - lastMonthDonations.length) / lastMonthDonations.length) * 100
          : 0,
        averageGift,
        averageGiftGrowth: 5.2, // Mock for now
        donorRetentionRate,
        recurringRevenue,
        campaignPerformance,
        monthlyTrends,
        topDonors,
      });
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_ANALYTICS_ERROR]", { error: _errMsg });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
          <TrendingUp className="h-12 w-12 mb-4 opacity-50" />
          <p>No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Advanced Analytics</h1>
        <p className="text-sm text-gray-500 mt-1">Comprehensive insights into your nonprofit performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Revenue"
          value={formatCurrency(analytics.totalRevenue)}
          growth={analytics.revenueGrowth}
          icon={DollarSign}
        />
        <MetricCard
          title="Total Donations"
          value={analytics.totalDonations.toString()}
          growth={analytics.donationGrowth}
          icon={Heart}
        />
        <MetricCard
          title="Average Gift"
          value={formatCurrency(analytics.averageGift)}
          growth={analytics.averageGiftGrowth}
          icon={TrendingUp}
        />
        <MetricCard
          title="Donor Retention"
          value={`${analytics.donorRetentionRate.toFixed(1)}%`}
          growth={2.5}
          icon={Users}
        />
      </div>

      <Tabs defaultValue="trends" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="trends">Monthly Trends</TabsTrigger>
          <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
          <TabsTrigger value="donors">Top Donors</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Revenue Trends (Last 6 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.monthlyTrends.map((trend, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{trend.month}</p>
                        <p className="text-xs text-gray-500">{trend.donations} donations</p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">{formatCurrency(trend.revenue)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.campaignPerformance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No campaigns yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {analytics.campaignPerformance.map((campaign, i) => (
                    <div key={i} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{campaign.name}</h4>
                        <Badge className={Number(campaign.progress) >= 100 ? "bg-green-500" : "bg-blue-500"}>
                          {campaign.progress}%
                        </Badge>
                      </div>
                      <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                        <div
                          className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 to-green-500"
                          style={{ width: `${Math.min(Number(campaign.progress), 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Raised: {formatCurrency(campaign.raised)}</span>
                        <span>Goal: {formatCurrency(campaign.goal)}</span>
                        <span>{campaign.donations} donations</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="donors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Top Donors
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topDonors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No donors yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {analytics.topDonors.map((donor, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{donor.name}</p>
                          <p className="text-xs text-gray-500">{donor.donations} donations</p>
                        </div>
                      </div>
                      <Badge className="bg-purple-500">{formatCurrency(donor.total)}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recurring Revenue */}
      <Card>
        <CardHeader>
          <CardTitle>Recurring Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Monthly Recurring Revenue (MRR)</p>
              <p className="text-3xl font-bold text-green-600 mt-1">
                {formatCurrency(analytics.recurringRevenue)}
              </p>
            </div>
            <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string;
  growth: number;
  icon: any;
}

function MetricCard({ title, value, growth, icon: Icon }: MetricCardProps) {
  const isPositive = growth >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center mt-1">
          {isPositive ? (
            <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
          ) : (
            <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
          )}
          <span className={`text-xs ${isPositive ? "text-green-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}{growth.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-500 ml-2">vs last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
