"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Heart,
  DollarSign,
  Calendar,
  User,
  Mail,
  Phone,
  FileText,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { apiJson } from "@/lib/api-client-shared";
import { logger, formatCurrency, formatDate } from "@vayva/shared";
import { downloadReceipt, printReceipt, emailReceipt } from "@/lib/receipt-generator";

interface Donation {
  id: string;
  campaignId?: string;
  donorId?: string;
  donorEmail: string;
  donorName?: string;
  amount: number;
  currency: string;
  isAnonymous: boolean;
  message?: string;
  recurring: boolean;
  frequency?: string;
  paymentMethod: string;
  status: string;
  receiptSent: boolean;
  receiptUrl?: string;
  taxReceiptNumber?: string;
  matchedBy?: string;
  matchedAmount?: number;
  createdAt: string;
  updatedAt: string;
  campaign?: {
    title: string;
  };
}

export default function DonationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const donationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState<Donation | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (donationId) {
      fetchDonation();
    }
  }, [donationId]);

  const fetchDonation = async () => {
    try {
      setLoading(true);
      const data = await apiJson<{ data: any[] }>("/api/nonprofit/donations");
      const foundDonation = data.data?.find((d: any) => d.id === donationId);

      if (!foundDonation) {
        toast.error("Donation not found");
        router.push("/dashboard/nonprofit/donations");
        return;
      }

      setDonation(foundDonation);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_DONATION_ERROR]", { error: _errMsg });
      toast.error(_errMsg || "Failed to load donation");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await apiJson(`/api/nonprofit/donations/${donationId}`, { method: "DELETE" });
      toast.success("Donation deleted successfully");
      setDeleteConfirmOpen(false);
      router.push("/dashboard/nonprofit/donations");
    } catch (error: unknown) {
      logger.error("[DELETE_DONATION_ERROR]", { error });
      toast.error("Failed to delete donation");
    }
  };

  const handleDownloadReceipt = () => {
    if (donation) {
      const receiptData = {
        donationId: donation.id,
        donorName: donation.donorName || "Anonymous",
        donorEmail: donation.donorEmail,
        amount: donation.amount,
        currency: donation.currency,
        donationDate: donation.createdAt,
        paymentMethod: donation.paymentMethod,
        isAnonymous: donation.isAnonymous,
        campaignName: donation.campaign?.title,
        taxReceiptNumber: donation.taxReceiptNumber || `RCP-${donation.id.slice(0, 8).toUpperCase()}`,
        nonprofitName: "Nonprofit Organization",
      };
      downloadReceipt(receiptData);
      toast.success("Receipt downloaded successfully!");
    }
  };

  const handlePrintReceipt = () => {
    if (donation) {
      const receiptData = {
        donationId: donation.id,
        donorName: donation.donorName || "Anonymous",
        donorEmail: donation.donorEmail,
        amount: donation.amount,
        currency: donation.currency,
        donationDate: donation.createdAt,
        paymentMethod: donation.paymentMethod,
        isAnonymous: donation.isAnonymous,
        campaignName: donation.campaign?.title,
        taxReceiptNumber: donation.taxReceiptNumber || `RCP-${donation.id.slice(0, 8).toUpperCase()}`,
        nonprofitName: "Nonprofit Organization",
      };
      printReceipt(receiptData);
    }
  };

  const handleEmailReceipt = () => {
    if (donation) {
      const receiptData = {
        donationId: donation.id,
        donorName: donation.donorName || "Anonymous",
        donorEmail: donation.donorEmail,
        amount: donation.amount,
        currency: donation.currency,
        donationDate: donation.createdAt,
        paymentMethod: donation.paymentMethod,
        isAnonymous: donation.isAnonymous,
        campaignName: donation.campaign?.title,
        taxReceiptNumber: donation.taxReceiptNumber || `RCP-${donation.id.slice(0, 8).toUpperCase()}`,
        nonprofitName: "Nonprofit Organization",
      };
      emailReceipt(receiptData);
      toast.success("Opening email client...");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (!donation) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">
              {donation.donorName || donation.donorEmail}
            </h1>
            <Badge className={donation.status === "completed" ? "bg-green-500" : "bg-yellow-500"}>
              {donation.status.toUpperCase()}
            </Badge>
            {donation.recurring && (
              <Badge variant="secondary">🔄 Recurring</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            {formatDate(donation.createdAt)}
            {donation.frequency && ` • ${donation.frequency}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={handleDownloadReceipt}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" onClick={handlePrintReceipt}>
            Print
          </Button>
          <Button variant="outline" onClick={handleEmailReceipt}>
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

      {/* Amount Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Donation Amount</p>
              <p className="text-5xl font-bold text-green-600">
                {formatCurrency(donation.amount)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {donation.currency}
              </p>
            </div>
            <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center">
              <Heart className="h-12 w-12 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Donor Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Donor Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">
                {donation.donorName || (donation.isAnonymous ? "Anonymous" : "Not provided")}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <a href={`mailto:${donation.donorEmail}`} className="text-blue-600 hover:underline">
                {donation.donorEmail}
              </a>
            </div>
            {donation.donorId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/dashboard/nonprofit/donors/${donation.donorId}`)}
              >
                View Donor Profile
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Campaign Attribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Campaign
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {donation.campaign ? (
              <>
                <div>
                  <p className="text-sm text-gray-500">Campaign</p>
                  <p className="font-medium">{donation.campaign.title}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/dashboard/nonprofit/campaigns/${donation.campaignId}`)}
                >
                  View Campaign
                </Button>
              </>
            ) : (
              <p className="text-gray-500">General donation (not attributed to campaign)</p>
            )}
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium capitalize">{donation.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Transaction Status</p>
              <Badge className={donation.status === "completed" ? "bg-green-500" : "bg-yellow-500"}>
                {donation.status}
              </Badge>
            </div>
            {donation.isAnonymous && (
              <div>
                <p className="text-sm text-gray-500">Privacy</p>
                <Badge variant="secondary">Anonymous Donation</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Receipt & Tax Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Receipt & Tax
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              {donation.receiptSent ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-medium">
                {donation.receiptSent ? "Receipt sent" : "Receipt not sent"}
              </span>
            </div>
            {donation.taxReceiptNumber && (
              <div>
                <p className="text-sm text-gray-500">Tax Receipt Number</p>
                <p className="font-mono text-sm">{donation.taxReceiptNumber}</p>
              </div>
            )}
            {donation.matchedBy && (
              <div>
                <p className="text-sm text-gray-500">Matching Gift</p>
                <p className="font-medium">{donated.matchedBy}</p>
                {donation.matchedAmount && (
                  <p className="text-green-600 font-semibold">
                    +{formatCurrency(donation.matchedAmount)} matched
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Message */}
      {donation.message && (
        <Card>
          <CardHeader>
            <CardTitle>Donor Message</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 italic whitespace-pre-line">"{donation.message}"</p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Delete Donation"
        message={`Are you sure you want to delete this ${formatCurrency(donation.amount)} donation from ${donation.donorName || donation.donorEmail}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
