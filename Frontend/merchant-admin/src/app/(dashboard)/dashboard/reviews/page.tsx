"use client";

import { logger, formatDate } from "@vayva/shared";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Star,
  Check,
  Archive,
  Spinner as Loader2,
} from "@phosphor-icons/react/ssr";
import { Button, cn } from "@vayva/ui";

interface Review {
  id: string;
  rating: number;
  title: string;
  status: string;
  customerName: string;
  product: string;
  createdAt: string;
}

import { apiJson } from "@/lib/api-client-shared";

interface ReviewResponse {
  data?: Review[];
}

export default function ReviewsPage() {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activeTab, setActiveTab] = useState("ALL");

  useEffect(() => {
    void fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await apiJson<ReviewResponse | Review[]>("/api/reviews");
      if (data && !Array.isArray(data) && data.data) {
        setReviews(data.data);
      } else if (Array.isArray(data)) {
        setReviews(data);
      } else {
        setReviews([]);
      }
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[FETCH_REVIEWS_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error(_errMsg || "Could not load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: string, id: string) => {
    try {
      // Optimistic update
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: action.toUpperCase() } : r,
        ),
      );

      await apiJson<{ success: boolean }>(`/api/reviews/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: action.toUpperCase() }),
      });

      toast.success(`Review ${action} successfully`);
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error("[REVIEW_ACTION_ERROR]", {
        error: _errMsg,
        app: "merchant",
      });
      toast.error("Action failed");
      void fetchReviews();
    }
  };

  const filteredReviews =
    activeTab === "ALL"
      ? reviews
      : reviews.filter((r) => (r as any).status === activeTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Reviews & Ratings
        </h1>
        <p className="text-slate-500">
          Manage customer feedback and moderate product reviews.
        </p>
      </div>

      <div className="flex items-center gap-4 border-b border-slate-200">
        {["ALL", "PENDING", "PUBLISHED", "ARCHIVED"].map((tab) => (
          <Button
            key={tab}
            variant="ghost"
            onClick={() => setActiveTab(tab)}
            className={cn(
              "pb-3 px-1 text-sm font-medium border-b-2 rounded-none transition-colors flex items-center gap-2 h-auto hover:bg-transparent",
              activeTab === tab
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
            )}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="bg-background/70 backdrop-blur-xl rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="h-12 w-12 bg-background/40 backdrop-blur-sm text-slate-400 rounded-lg flex items-center justify-center mb-4">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">
              No reviews found
            </h3>
            <p className="text-slate-500 max-w-sm">
              {activeTab === "ALL"
                ? "Customer reviews will appear here once you start receiving them."
                : `There are no ${activeTab.toLowerCase()} reviews at the moment.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-background/40 backdrop-blur-sm text-slate-600 font-medium border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Rating</th>
                  <th className="px-6 py-3">Review</th>
                  <th className="px-6 py-3">Product</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReviews.map((review) => (
                  <tr key={review.id} className="hover:bg-white/60 group">
                    <td className="px-6 py-4 align-top w-32">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < review.rating ? "fill-current" : "text-slate-200"}`}
                          />
                        ))}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {formatDate(review.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top max-w-sm">
                      <div className="font-medium text-slate-900 mb-0.5">
                        {review.title || "No Title"}
                      </div>
                      <div className="text-slate-500 line-clamp-2 text-xs mb-1">
                        by {review.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top text-slate-600">
                      {review.product}
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${review.status === "PUBLISHED"
                            ? "bg-emerald-100 text-emerald-700"
                            : (review as any).status?.toUpperCase() === "PENDING"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleAction("published", review.id)}
                          aria-label="Approve"
                          className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                          title="Approve"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleAction("archived", review.id)}
                          aria-label="Archive"
                          className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                          title="Archive"
                        >
                          <Archive className="h-4 w-4" />
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
