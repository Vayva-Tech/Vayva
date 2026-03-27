"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Heart,
  Target,
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  Plus,
  ArrowRight,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import GrantAnalyticsDashboard from "@/components/grants/GrantAnalyticsDashboard";
import { NonprofitNotifications } from "@/components/nonprofit/NonprofitNotifications";
import { EmailTemplatesManager } from "@/components/nonprofit/EmailTemplatesManager";
import { TeamCollaboration } from "@/components/nonprofit/TeamCollaboration";
import { AdvancedAnalytics } from "@/components/nonprofit/AdvancedAnalytics";
import { CalendarIntegration } from "@/components/nonprofit/CalendarIntegration";
import { SkipLink } from "@/lib/accessibility";
import { useBreakpoint } from "@/hooks/useBreakpoint";

interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRaised: number;
  totalDonations: number;
  totalDonors: number;
  totalVolunteers: number;
  totalGrants: number;
  grantSuccessRate: number;
  upcomingDeadlines: number;
}

interface RecentDonation {
  id: string;
  donorName: string;
  amount: number;
  campaign?: string;
  createdAt: string;
}

interface UpcomingDeadline {
  id: string;
  title: string;
  type: "grant" | "campaign";
  deadline: string;
  daysUntil: number;
}

export default function NonprofitDashboardPage() {
  const router = useRouter();
  const { isMobile, currentBreakpoint } = useBreakpoint({ breakpoint: 'md' });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDonations, setRecentDonations] = useState<RecentDonation[]>([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState<UpcomingDeadline[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [campaignsRes, donationsRes, donorsRes, volunteersRes, grantsRes] = await Promise.all([
        apiJson<{ data: any[] }>("/api/nonprofit/campaigns"),
        apiJson<{ data: any[] }>("/api/nonprofit/donations"),
        apiJson<{ data: any[] }>("/api/nonprofit/donors"),
        apiJson<{ data: any[] }>("/api/nonprofit/volunteers"),
        apiJson<{ data: any[]; meta: any }>("/api/nonprofit/grants?limit=100"),
      ]);

      const campaigns = campaignsRes.data || [];
      const donations = donationsRes.data || [];
      const donors = donorsRes.data || [];
      const volunteers = volunteersRes.data || [];
      const grants = grantsRes.data || [];

      // Calculate stats
      const activeCampaigns = campaigns.filter((c: any) => c.status === "active").length;
      const totalRaised = donations.reduce((sum: number, d: any) => sum + Number(d.amount || 0), 0);
      
      // Calculate grant success rate
      const totalApplications = grants.reduce((sum: number, g: any) => sum + (g.applications?.length || 0), 0);
      const awardedApplications = grants.reduce(
        (sum: number, g: any) => sum + (g.applications?.filter((a: any) => a.status === "awarded")?.length || 0),
        0
      );
      const successRate = totalApplications > 0 
        ? Math.round((awardedApplications / totalApplications) * 10000) / 100 
        : 0;

      // Get recent donations
      const sortedDonations = [...donations].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 5);

      // Get upcoming deadlines (grants and campaigns)
      const now = Date.now();
      const grantDeadlines = grants
        .filter((g: any) => g.deadline)
        .map((g: any) => ({
          id: g.id,
          title: g.title,
          type: "grant" as const,
          deadline: g.deadline,
          daysUntil: Math.ceil((new Date(g.deadline).getTime() - now) / (1000 * 60 * 60 * 24)),
        }))
        .filter((d: any) => d.daysUntil > 0 && d.daysUntil <= 30);

      const campaignDeadlines = campaigns
        .filter((c: any) => c.endDate)
        .map((c: any) => ({
          id: c.id,
          title: c.name || c.title,
          type: "campaign" as const,
          deadline: c.endDate,
          daysUntil: Math.ceil((new Date(c.endDate).getTime() - now) / (1000 * 60 * 60 * 24)),
        }))
        .filter((d: any) => d.daysUntil > 0 && d.daysUntil <= 30);

      const allDeadlines = [...grantDeadlines, ...campaignDeadlines]
        .sort((a, b) => a.daysUntil - b.daysUntil)
        .slice(0, 5);

      setStats({
        totalCampaigns: campaigns.length,
        activeCampaigns,
        totalRaised,
        totalDonations: donations.length,
        totalDonors: donors.length,
        totalVolunteers: volunteers.length,
        totalGrants: grants.length,
        grantSuccessRate: successRate,
        upcomingDeadlines: allDeadlines.length,
      });

      setRecentDonations(sortedDonations);
      setUpcomingDeadlines(allDeadlines);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[NONPROFIT_DASHBOARD_ERROR]", { error: _errMsg });
      toast.error(_errMsg || "Failed to load dashboard data");
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Nonprofit Dashboard</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Overview of your nonprofit operations and impact
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => router.push("/dashboard/nonprofit/campaigns/new")}>
            <Plus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Campaign</span>
            <span className="sm:hidden">New</span>
          </Button>
          <Button size="sm" onClick={() => router.push("/dashboard/nonprofit/donations/new")} variant="outline">
            <Heart className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Record Donation</span>
            <span className="sm:hidden">Add</span>
          </Button>
        </div>
      </div>

      {/* Stats Overview - Mobile Responsive Grid */}
      <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRaised || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">
              From {stats?.totalDonations} donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeCampaigns || 0}</div>
            <p className="text-xs text-gray-500 mt-1">
              of {stats?.totalCampaigns} total campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Supporters</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats?.totalDonors || 0) + (stats?.totalVolunteers || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.totalDonors} donors • {stats?.totalVolunteers} volunteers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Grant Success</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.grantSuccessRate || 0}%</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats?.totalGrants} grants tracked
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/dashboard/nonprofit/grants")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Manage Grants</h3>
                <p className="text-sm text-gray-500">Track opportunities & applications</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/dashboard/nonprofit/donors")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Donor Management</h3>
                <p className="text-sm text-gray-500">Build relationships & track giving</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => router.push("/dashboard/nonprofit/volunteers")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">Volunteer Coordination</h3>
                <p className="text-sm text-gray-500">Schedule shifts & track hours</p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Donations</span>
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/nonprofit/donations")}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentDonations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Heart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No donations yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentDonations.map((donation) => (
                  <div key={donation.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Heart className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{donation.donorName || "Anonymous"}</p>
                        <p className="text-xs text-gray-500">
                          {donation.campaign || "General donation"} • {formatDate(donation.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-green-500">+{formatCurrency(donation.amount)}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming Deadlines</span>
              <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/nonprofit/grants")}>
                View All
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No upcoming deadlines</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingDeadlines.map((deadline) => (
                  <div key={deadline.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                        deadline.daysUntil < 7
                          ? "bg-red-500/10"
                          : deadline.daysUntil < 14
                          ? "bg-yellow-500/10"
                          : "bg-green-500/10"
                      }`}>
                        {deadline.daysUntil < 7 ? (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{deadline.title}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {deadline.type} • Due {formatDate(deadline.deadline)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={
                        deadline.daysUntil < 7
                          ? "bg-red-500"
                          : deadline.daysUntil < 14
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }
                    >
                      {deadline.daysUntil}d left
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notifications */}
      <div className="mt-6">
        <ErrorBoundary serviceName="NonprofitNotifications">
          <NonprofitNotifications 
            onNotificationClick={(notification) => {
              if (notification.entity) {
                const paths = {
                  grant: "/dashboard/nonprofit/grants",
                  campaign: "/dashboard/nonprofit/campaigns",
                  donation: "/dashboard/nonprofit/donations",
                  volunteer: "/dashboard/nonprofit/volunteers",
                  shift: "/dashboard/nonprofit/volunteers/schedule",
                };
                router.push(paths[notification.entity.type as keyof typeof paths] || "/dashboard/nonprofit");
              }
            }}
          />
        </ErrorBoundary>
      </div>

      {/* P2 Features - Tabs for Advanced Tools */}
      <Tabs defaultValue="analytics" className="w-full mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="analytics">Advanced Analytics</TabsTrigger>
          <TabsTrigger value="templates">Email Templates</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="grants">Grant Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-6">
          <ErrorBoundary serviceName="AdvancedAnalytics">
            <AdvancedAnalytics />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <ErrorBoundary serviceName="EmailTemplatesManager">
            <EmailTemplatesManager />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="team" className="mt-6">
          <ErrorBoundary serviceName="TeamCollaboration">
            <TeamCollaboration />
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="grants" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Grant Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <ErrorBoundary serviceName="GrantAnalyticsDashboard">
                <GrantAnalyticsDashboard />
              </ErrorBoundary>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
