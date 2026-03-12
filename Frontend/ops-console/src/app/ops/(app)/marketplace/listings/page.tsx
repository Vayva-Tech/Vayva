"use client";

import React, { useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { Package, CheckCircle, XCircle, Clock, Eye, MagnifyingGlass as Search, Funnel as Filter, ArrowCounterClockwise as RefreshCw, Warning as AlertTriangle, Storefront as Store, ArrowSquareOut as ExternalLink } from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { toast } from "sonner";
import Link from "next/link";

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "SUSPENDED";
  createdAt: string;
  product: {
    id: string;
    title: string;
    images: { url: string }[];
  };
  store: {
    id: string;
    name: string;
    slug: string;
  };
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING_REVIEW: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    SUSPENDED: "bg-gray-100 text-gray-700",
  };

  const icons: Record<string, React.ReactNode> = {
    PENDING_REVIEW: <Clock size={12} />,
    APPROVED: <CheckCircle size={12} />,
    REJECTED: <XCircle size={12} />,
    SUSPENDED: <AlertTriangle size={12} />,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold ${styles[status] || "bg-gray-100 text-gray-700"}`}
    >
      {icons[status]}
      {status.replace("_", " ")}
    </span>
  );
}

export default function MarketplaceListingsPage(): React.JSX.Element {
  const [statusFilter, setStatusFilter] = useState<string>("PENDING_REVIEW");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, refetch } = useOpsQuery<{
    listings: MarketplaceListing[];
    total: number;
  }>(["marketplace-listings", statusFilter], () =>
    fetch(`/api/ops/marketplace/listings?status=${statusFilter}`).then((res) =>
      res.json(),
    ),
  );

  const handleAction = async (
    listingId: string,
    action: "approve" | "reject" | "suspend",
  ) => {
    try {
      const res = await fetch(`/api/ops/marketplace/listings/${listingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (!res.ok) throw new Error("Action failed");

      toast.success(`Listing ${action}d successfully`);
      refetch();
    } catch (error) {
      toast.error("Failed to update listing");
    }
  };

  const listings = data?.listings || [];
  const filteredListings = searchQuery
    ? listings.filter(
        (l: MarketplaceListing) =>
          l.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          l.store?.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : listings;

  return (
    <OpsPageShell
      title="Marketplace Listings Moderation"
      description="Review and approve products pushed to the Vayva Marketplace"
      headerActions={
        <Button
          variant="ghost"
          size="icon"
          onClick={() => refetch()}
          className="rounded-full"
          aria-label="Refresh listings"
        >
          <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      }
    >

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          {
            label: "Pending Review",
            value: "PENDING_REVIEW",
            color: "bg-yellow-50 border-yellow-200 text-yellow-700",
          },
          {
            label: "Approved",
            value: "APPROVED",
            color: "bg-green-50 border-green-200 text-green-700",
          },
          {
            label: "Rejected",
            value: "REJECTED",
            color: "bg-red-50 border-red-200 text-red-700",
          },
          {
            label: "Suspended",
            value: "SUSPENDED",
            color:
              "bg-gray-100 border-gray-200 text-gray-700",
          },
        ].map((stat) => (
          <Button
            variant="ghost"
            key={stat.value}
            onClick={() => setStatusFilter(stat.value)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              statusFilter === stat.value
                ? stat.color + " border-current"
                : "bg-white border-gray-100 hover:border-gray-200"
            }`}
          >
            <div className="text-2xl font-black">
              {statusFilter === stat.value ? filteredListings.length : "—"}
            </div>
            <div className="text-sm font-medium">{stat.label}</div>
          </Button>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4">
        <div className="flex-1 relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search by product title or merchant name..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target?.value)}
          />
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-medium">
            <tr>
              <th className="px-6 py-3">Product</th>
              <th className="px-6 py-3">Merchant</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Price</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Submitted</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {isLoading ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  Loading listings...
                </td>
              </tr>
            ) : filteredListings.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-6 py-12 text-center text-gray-400"
                >
                  No listings found
                </td>
              </tr>
            ) : (
              filteredListings.map((listing: MarketplaceListing) => (
                <tr key={listing.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {listing.product?.images?.[0]?.url ? (
                          <img
                            src={listing?.product?.images[0].url}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 line-clamp-1">
                          {listing.title}
                        </div>
                        <div className="text-xs text-gray-500 line-clamp-1">
                          {listing.description?.slice(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={`/ops/merchants/${listing?.store?.id}`}
                      className="flex items-center gap-2 text-indigo-600 hover:underline"
                    >
                      <Store size={14} />
                      {listing?.store?.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                      {listing.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    ₦{listing?.price?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={listing.status} />
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(listing.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {listing.status === "PENDING_REVIEW" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleAction(listing.id, "approve")}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                          >
                            <CheckCircle size={14} className="mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleAction(listing.id, "reject")}
                            className="text-xs h-8"
                          >
                            <XCircle size={14} className="mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                      {listing.status === "APPROVED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAction(listing.id, "suspend")}
                          className="text-xs h-8"
                        >
                          <AlertTriangle size={14} className="mr-1" />
                          Suspend
                        </Button>
                      )}
                      {listing.status === "SUSPENDED" && (
                        <Button
                          size="sm"
                          onClick={() => handleAction(listing.id, "approve")}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs h-8"
                        >
                          <CheckCircle size={14} className="mr-1" />
                          Reinstate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </OpsPageShell>
  );
}
