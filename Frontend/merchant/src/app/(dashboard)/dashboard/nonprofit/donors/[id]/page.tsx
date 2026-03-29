"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Heart,
  DollarSign,
  Calendar,
  TrendingUp,
  Award,
  Edit,
  Trash2,
  MailOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency, formatDate } from "@vayva/shared";

interface Donor {
  id: string;
  name?: string;
  email: string;
  phone?: string;
  totalDonated: number;
  donationCount: number;
  firstDonation?: string;
  lastDonation?: string;
  tier?: string;
  donorType?: string;
  preferredCause?: string;
  communicationPreference?: string;
  isRecurringDonor?: boolean;
  recurringAmount?: number;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface Donation {
  id: string;
  amount: number;
  campaignId?: string;
  campaign?: { title: string };
  createdAt: string;
  message?: string;
}

export default function DonorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const donorId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [donor, setDonor] = useState<Donor | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const tierColors: Record<string, string> = {
    bronze: "bg-amber-700",
    silver: "bg-gray-400",
    gold: "bg-yellow-500",
    platinum: "bg-blue-400",
  };

  useEffect(() => {
    if (donorId) {
      fetchDonor();
    }
  }, [donorId]);

  const fetchDonor = async () => {
    try {
      setLoading(true);
      const [donorsRes, donationsRes] = await Promise.all([
        apiJson<{ data: any[] }>("/nonprofit/donors"),
        apiJson<{ data: any[] }>(`/api/nonprofit/donations?donorId=${donorId}`),
      ]);

      const foundDonor = donorsRes.data?.find((d: any) => d.id === donorId);
      if (!foundDonor) {
        toast.error("Donor not found");
        router.push("/dashboard/nonprofit/donors");
        return;
      }

      setDonor(foundDonor);
      setDonations(donationsRes.data || []);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_DONOR_ERROR]", { error: _errMsg });
      toast.error(_errMsg || "Failed to load donor");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiJson(`/api/nonprofit/donors/${donorId}`, { method: "DELETE" });
      toast.success("Donor deleted successfully");
      setDeleteConfirmOpen(false);
      router.push("/dashboard/nonprofit/donors");
    } catch (error: unknown) {
      logger.error("[DELETE_DONOR_ERROR]", { error });
      toast.error("Failed to delete donor");
    }
  };

  const handleEmailDonor = () => {
    window.open(`mailto:${donor?.email}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!donor) {
    return null;
  }

  const averageDonation = donor.donationCount > 0 
    ? donor.totalDonated / donor.donationCount 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold">
              {(donor.name || donor.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-bold">{donor.name || "Anonymous Donor"}</h1>
              <div className="flex items-center gap-2 mt-1">
                {donor.tier && (
                  <Badge className={tierColors[donor.tier] || "bg-gray-500"}>
                    <Award className="h-3 w-3 mr-1" />
                    {donor.tier.toUpperCase()}
                  </Badge>
                )}
                {donor.isRecurringDonor && (
                  <Badge variant="secondary">🔄 Recurring Donor</Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleEmailDonor}>
            <Mail className="h-4 w-4 mr-2" />
            Email
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donated</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(donor.totalDonated)}</div>
            <p className="text-xs text-gray-500 mt-1">Lifetime giving</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donations</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{donor.donationCount}</div>
            <p className="text-xs text-gray-500 mt-1">Total contributions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Gift</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageDonation)}</div>
            <p className="text-xs text-gray-500 mt-1">Per donation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">First Gift</CardTitle>
            <Calendar className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {donor.firstDonation ? formatDate(donor.firstDonation) : "—"}
            </div>
            <p className="text-xs text-gray-500 mt-1">Supporter since</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="history">Giving History</TabsTrigger>
          <TabsTrigger value="notes">Notes & Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{donor.name || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a href={`mailto:${donor.email}`} className="text-blue-600 hover:underline">
                    {donor.email}
                  </a>
                </div>
                {donor.phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <a href={`tel:${donor.phone}`} className="text-blue-600 hover:underline">
                      {donor.phone}
                    </a>
                  </div>
                )}
                {donor.preferredCause && (
                  <div>
                    <p className="text-sm text-gray-500">Preferred Cause</p>
                    <p className="font-medium capitalize">{donor.preferredCause}</p>
                  </div>
                )}
                {donor.communicationPreference && (
                  <div>
                    <p className="text-sm text-gray-500">Communication Preference</p>
                    <Badge variant="secondary" className="capitalize">
                      {donor.communicationPreference}
                    </Badge>
                  </div>
                )}
                {donor.donorType && (
                  <div>
                    <p className="text-sm text-gray-500">Donor Type</p>
                    <Badge className="capitalize">{donor.donorType}</Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {donor.isRecurringDonor && donor.recurringAmount && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Recurring Donation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Monthly recurring amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(donor.recurringAmount)}
                    </p>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Donation History ({donations.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {donations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No donations recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => router.push(`/dashboard/nonprofit/donations/${donation.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Heart className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {donation.campaign?.title || "General donation"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(donation.createdAt)}
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
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          {donor.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-line bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  {donor.notes}
                </p>
              </CardContent>
            </Card>
          )}

          {donor.tags && donor.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {donor.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Donor"
        message={`Are you sure you want to delete "${donor.name || donor.email}"? This will remove all donor data and cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
