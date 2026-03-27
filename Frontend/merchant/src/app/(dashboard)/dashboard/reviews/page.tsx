"use client";

import React, { useEffect, useState } from "react";
import { formatDate } from "@vayva/shared";
import { Card, Button } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { logger } from "@vayva/shared";
import {
  Star,
  Check,
  Archive,
  ThumbsUp,
  ThumbsDown,
} from "@phosphor-icons/react";

interface Review {
  id: string;
  rating: number;
  title?: string;
  body?: string;
  customerName: string;
  product: string;
  status: "PENDING" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await apiJson<Review[]>("/api/reviews");
      setReviews(data || []);
    } catch (error) {
      logger.error("[REVIEWS_LOAD_ERROR]", { error });
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, id: string) => {
    try {
      await apiJson(`/api/reviews/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: action.toUpperCase() }),
      });
      toast.success("Review updated successfully");
      loadReviews();
    } catch (error) {
      logger.error("[REVIEW_UPDATE_ERROR]", { error });
      toast.error("Failed to update review");
    }
  };

  const filteredReviews =
    activeTab === "ALL"
      ? reviews
      : reviews.filter((r) => r.status === activeTab);

  // Calculate metrics
  const totalReviews = reviews.length;
  const pendingReviews = reviews.filter((r) => r.status === "PENDING").length;
  const publishedReviews = reviews.filter((r) => r.status === "PUBLISHED").length;
  const archivedReviews = reviews.filter((r) => r.status === "ARCHIVED").length;
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Reviews & Ratings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage customer feedback and moderate product reviews</p>
        </div>
      </div>

      {/* Summary Widgets */}
      {reviews.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <SummaryWidget
            icon={<Star size={18} />}
            label="Total Reviews"
            value={String(totalReviews)}
            trend={`Avg: ${avgRating}★`}
            positive={parseFloat(avgRating) >= 4}
          />
          <SummaryWidget
            icon={<Check size={18} />}
            label="Published"
            value={String(publishedReviews)}
            trend="+this week"
            positive
          />
          <SummaryWidget
            icon={<Archive size={18} />}
            label="Pending"
            value={String(pendingReviews)}
            trend="needs review"
            positive={pendingReviews === 0}
          />
          <SummaryWidget
            icon={<ThumbsUp size={18} />}
            label="Approved"
            value={String(publishedReviews)}
            trend="live"
            positive
          />
          <SummaryWidget
            icon={<ThumbsDown size={18} />}
            label="Archived"
            value={String(archivedReviews)}
            trend="hidden"
            positive
          />
        </div>
      )}

      {/* Tab Navigation */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-6 border-b border-gray-200 pb-3">
          {["ALL", "PENDING", "PUBLISHED", "ARCHIVED"].map((tab) => (
            <Button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium border-b-2 pb-3 -mb-3.5 transition-colors ${
                activeTab === tab
                  ? "border-green-500 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.charAt(0) + tab.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>
      )}

      {/* Reviews Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Star size={32} className="text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No reviews found</h3>
            <p className="text-sm text-gray-500 max-w-sm">
              {activeTab === "ALL"
                ? "Customer reviews will appear here once you start receiving them."
                : `There are no ${activeTab.toLowerCase()} reviews at the moment.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Review</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 align-top w-32">
                      <div className="flex text-yellow-400 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className={`${i < review.rating ? "fill-current" : "text-gray-200"}`}
                          />
                        ))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(review.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-sm">
                      <div className="font-semibold text-gray-900 mb-0.5">
                        {review.title || "No Title"}
                      </div>
                      <div className="text-xs text-gray-500">
                        by {review.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-gray-700">
                      {review.product}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                          review.status === "PUBLISHED"
                            ? "bg-green-50 text-green-600"
                            : review.status === "PENDING"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleAction("published", review.id)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <Check size={16} />
                        </Button>
                        <Button
                          onClick={() => handleAction("archived", review.id)}
                          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Archive"
                        >
                          <Archive size={16} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewSummaryWidget() {
  return (
    <Card className="rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Summary</h3>
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-gray-900">4.8</div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className="text-yellow-500 text-xl">★</span>
            ))}
          </div>
          <span className="text-sm text-gray-500">Based on 127 reviews</span>
        </div>
      </div>
    </Card>
  );
}
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
          <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-orange-600'}`}>
            {trend}
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
    </div>
  );
}
