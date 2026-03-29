"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Target,
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Edit,
  Trash2,
  Share2,
  Download,
  Heart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency, formatDate } from "@vayva/shared";

interface Campaign {
  id: string;
  title: string;
  description?: string;
  goal: number;
  raised: number;
  currency: string;
  startDate: string;
  endDate?: string;
  status: string;
  bannerImage?: string;
  featured: boolean;
  impactMetrics?: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

interface Donation {
  id: string;
  donorName?: string;
  donorEmail: string;
  amount: number;
  message?: string;
  isAnonymous: boolean;
  createdAt: string;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const progress = campaign?.goal ? (campaign.raised / campaign.goal) * 100 : 0;
  const daysRemaining = campaign?.endDate
    ? Math.ceil((new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  useEffect(() => {
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      // Fetch campaign details and donations
      const [campaignsRes, donationsRes] = await Promise.all([
        apiJson<{ data: any[] }>("/nonprofit/campaigns"),
        apiJson<{ data: any[] }>(`/api/nonprofit/donations?campaignId=${campaignId}`),
      ]);

      const foundCampaign = campaignsRes.data?.find((c: any) => c.id === campaignId);
      if (!foundCampaign) {
        toast.error("Campaign not found");
        router.push("/dashboard/nonprofit/campaigns");
        return;
      }

      setCampaign(foundCampaign);
      setDonations(donationsRes.data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_CAMPAIGN_ERROR]", { error: _errMsg });
      toast.error(_errMsg || "Failed to load campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiJson(`/api/nonprofit/campaigns/${campaignId}`, { method: "DELETE" });
      toast.success("Campaign deleted successfully");
      setDeleteConfirmOpen(false);
      router.push("/dashboard/nonprofit/campaigns");
    } catch (error: unknown) {
      logger.error("[DELETE_CAMPAIGN_ERROR]", { error });
      toast.error("Failed to delete campaign");
    }
  };

  const handleShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    toast.success("Campaign link copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{campaign.title}</h1>
            <Badge className={campaign.status === "active" ? "bg-green-500" : "bg-gray-500"}>
              {campaign.status.toUpperCase()}
            </Badge>
            {campaign.featured && (
              <Badge variant="secondary">⭐ Featured</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Started {formatDate(campaign.startDate)}
            {campaign.endDate && ` • Ends ${formatDate(campaign.endDate)}`}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            className="text-red-500"
            onClick={() => setDeleteConfirmOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Progress Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Raised so far</p>
                <p className="text-4xl font-bold">{formatCurrency(campaign.raised)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Goal</p>
                <p className="text-2xl font-semibold">{formatCurrency(campaign.goal)}</p>
              </div>
            </div>

            <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="font-medium">{progress.toFixed(1)}% funded</span>
              </div>
              {daysRemaining !== null && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span className={daysRemaining < 7 ? "text-red-600 font-medium" : "text-gray-500"}>
                    {daysRemaining > 0 ? `${daysRemaining} days left` : "Ended"}
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donations.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              Average {formatCurrency(donations.length > 0 ? campaign.raised / donations.length : 0)} per donation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Donors</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(donations.map(d => d.donorEmail)).size}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {donations.filter(d => !d.isAnonymous).length} public donors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                campaign.startDate
                  ? campaign.raised / Math.max(1, Math.ceil((Date.now() - new Date(campaign.startDate).getTime()) / (1000 * 60 * 60 * 24)))
                  : 0
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">per day average</p>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {campaign.description && (
        <Card>
          <CardHeader>
            <CardTitle>About This Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-line">{campaign.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Impact Metrics */}
      {campaign.impactMetrics && Object.keys(campaign.impactMetrics).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Impact Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(campaign.impactMetrics).map(([key, value]) => (
                <div key={key} className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">{String(value)}</p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {key.replace(/_/g, " ")}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Donations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Donations ({donations.length})</span>
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/nonprofit/donations")}>
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No donations yet</p>
              <Button className="mt-4" onClick={() => router.push("/dashboard/nonprofit/donations/new")}>
                Record First Donation
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {donations.slice(0, 10).map((donation) => (
                <div key={donation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <Heart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {donation.isAnonymous || !donation.donorName ? "Anonymous" : donation.donorName}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(donation.createdAt)}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">+{formatCurrency(donation.amount)}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Campaign"
        message={`Are you sure you want to delete "${campaign.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
