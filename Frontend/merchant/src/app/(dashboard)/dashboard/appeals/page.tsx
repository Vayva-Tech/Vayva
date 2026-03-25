"use client";

import { logger } from "@vayva/shared";
import { useEffect, useState } from "react";
import { Button, Textarea, Input, Label } from "@vayva/ui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  Warning as AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
} from "@phosphor-icons/react/ssr";

interface Restriction {
  ordersDisabled: boolean;
  productsDisabled: boolean;
  marketingDisabled: boolean;
  settingsEditsDisabled: boolean;
  salesDisabled: boolean;
  paymentsDisabled: boolean;
  uploadsDisabled: boolean;
  aiDisabled: boolean;
}

interface Appeal {
  id: string;
  status: string;
  createdAt: string;
  reason: string;
  message: string;
  history: Array<{
    at: string;
    type: string;
    status: string;
    notes?: string;
  }>;
}

interface Warning {
  id: string;
  issuedAt: string;
  reason: string;
  message: string;
}

interface AppealsResponse {
  data: {
    appeals: Appeal[];
    warnings: Warning[];
    restrictions: Restriction;
  };
}

import { apiJson } from "@/lib/api-client-shared";
import { StatusBadge } from "@/components/shared";

export default function AppealsPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<{
    appeals: Appeal[];
    warnings: Warning[];
    restrictions: Restriction;
  } | null>(null);

  const [formData, setFormData] = useState({
    reason: "",
    message: "",
    customerEmail: "",
    customerPhone: "",
    evidenceUrls: [] as string[],
  });

  useEffect(() => {
    void fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      setLoading(true);
      const result = await apiJson<AppealsResponse>("/api/appeals");
      setData(result?.data);
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[FETCH_APPEALS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Failed to load appeals data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAppeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await apiJson<{ success: boolean }>("/api/appeals", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      toast.success("Appeal submitted successfully");
      setFormData({
        reason: "",
        message: "",
        customerEmail: "",
        customerPhone: "",
        evidenceUrls: [],
      });
      void fetchAppeals(); // Refresh data
    } catch (err: unknown) {
      const _errMsg = err instanceof Error ? err.message : String(err);
      logger.error("[SUBMIT_APPEAL_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Failed to submit appeal");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Clock className="h-4 w-4 text-green-600" />;
      case "UNDER_REVIEW":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
      case "RESOLVED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };


  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center" aria-live="polite" role="status">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text-green-600" />
        <span className="sr-only">Loading appeals data...</span>
      </div>
    );
  }

  const activeRestrictions = Object.entries(data?.restrictions || {}).filter(
    ([_, disabled]) => disabled,
  );

  return (
    <div className="max-w-6xl space-y-8">
      <div className="flex items-center gap-4">
        <FileText className="h-8 w-8 text-gray-700" />
        <div>
          <h1 className="text-3xl font-black text-gray-900">
            Appeals & Restrictions
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your account restrictions and appeal decisions
          </p>
        </div>
      </div>

      {/* Current Restrictions */}
      {activeRestrictions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Active Restrictions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeRestrictions.map(([key, _]) => (
                <div
                  key={key}
                  className="bg-red-500 border border-red-500/20 rounded-lg p-3"
                >
                  <p className="text-sm font-medium text-red-500/90 capitalize">
                    {key
                      .replace("Disabled", "")
                      .replace(/([A-Z])/g, " $1")
                      .trim()}
                  </p>
                  <p className="text-xs text-red-500/70 mt-1">
                    Operations restricted
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-700 mt-4">
              If you believe these restrictions were applied in error, submit an
              appeal below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Warnings */}
      {data?.warnings && data.warnings?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.warnings?.slice(0, 3).map((warning) => (
                <div
                  key={warning.id}
                  className="bg-amber-50 border border-amber-500/20 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-amber-600/90">
                        {warning.reason}
                      </p>
                      <p className="text-sm text-amber-600/80 mt-1">
                        {warning.message}
                      </p>
                      <p className="text-xs text-amber-600/70 mt-2">
                        Issued:{" "}
                        {new Date(warning.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Appeal History */}
      <Card>
        <CardHeader>
          <CardTitle>Appeal History</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.appeals && data.appeals?.length > 0 ? (
            <div className="space-y-4">
              {data?.appeals?.map((appeal) => (
                <div
                  key={appeal.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon((appeal as any).status)}
                        <StatusBadge status={appeal.status} />
                        <span className="text-sm text-gray-500">
                          {new Date(appeal.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-medium text-gray-900">
                        {appeal.reason}
                      </p>
                      <p className="text-sm text-gray-700 mt-1">
                        {appeal.message}
                      </p>
                      {appeal?.history?.length > 1 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-medium text-gray-700">
                            Updates:
                          </p>
                          {appeal?.history?.slice(1).map((update, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-gray-700 bg-white p-2 rounded"
                            >
                              <span className="font-medium">{update.type}</span>{" "}
                              - {update.notes || "No notes"}
                              <span className="ml-2 text-gray-500">
                                {new Date(update.at).toLocaleDateString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No appeals submitted yet.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Submit New Appeal */}
      <Card>
        <CardHeader>
          <CardTitle>Submit New Appeal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitAppeal} className="space-y-4">
            <div>
              <Label htmlFor="reason">Appeal Reason *</Label>
              <Input
                id="reason"
                value={formData.reason}
                onChange={(e) =>
                  setFormData({ ...formData, reason: e.target?.value })
                }
                placeholder="Briefly describe why you're appealing"
                required
                minLength={10}
              />
            </div>

            <div>
              <Label htmlFor="message">Detailed Message *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target?.value })
                }
                placeholder="Provide detailed explanation and any supporting information"
                rows={4}
                required
                minLength={5}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerEmail">Contact Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target?.value })
                  }
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Contact Phone</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target?.value })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit Appeal"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
