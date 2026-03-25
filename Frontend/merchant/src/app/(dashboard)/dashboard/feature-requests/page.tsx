"use client";

import { useState, useEffect } from "react";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  WarningCircle as AlertCircle,
  Funnel as Filter,
  ArrowsClockwise as RefreshCw,
  Paperclip
} from "@phosphor-icons/react/ssr";
import { apiJson } from "@/lib/api-client-shared";
import { format } from "date-fns";

interface FeatureRequest {
  id: string;
  merchantId: string;
  requestType: "PLATFORM" | "PERSONAL";
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "PENDING" | "REVIEWED" | "IMPLEMENTED" | "REJECTED";
  attachmentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS = {
  PENDING: "bg-orange-100 text-amber-800",
  REVIEWED: "bg-blue-100 text-blue-800",
  IMPLEMENTED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
};

const PRIORITY_COLORS = {
  LOW: "bg-gray-100 text-gray-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-red-100 text-red-800",
};

const REQUEST_TYPE_LABELS = {
  PLATFORM: "Platform Feature",
  PERSONAL: "Business Need",
};

export default function FeatureRequestsPage() {
  const [requests, setRequests] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "platform" | "personal">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "PENDING" | "REVIEWED" | "IMPLEMENTED" | "REJECTED">("all");

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await apiJson<{ items: FeatureRequest[] }>("/api/merchant/feature-request");
      setRequests(response.items || []);
    } catch (error) {
      console.error("Failed to fetch feature requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = requests.filter(request => {
    const typeMatch = filter === "all" || 
      (filter === "platform" && request.requestType === "PLATFORM") ||
      (filter === "personal" && request.requestType === "PERSONAL");
    
    const statusMatch = statusFilter === "all" || request.status === statusFilter;
    
    return typeMatch && statusMatch;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING": return <Clock size={16} />;
      case "REVIEWED": return <AlertCircle size={16} />;
      case "IMPLEMENTED": return <CheckCircle size={16} />;
      case "REJECTED": return <XCircle size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getRequestTypeIcon = (type: string) => {
    return type === "PLATFORM" ? 
      <Lightbulb size={16} className="text-blue-500" /> : 
      <Lightbulb size={16} className="text-purple-500" />;
  };

  return (
    <DashboardPageShell
      title="Feature Requests"
      description="Track and manage your feature requests and suggestions"
      category="Settings"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRequests}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-700" />
                <span className="text-sm text-gray-700">Type:</span>
                <div className="flex gap-2">
                  {(["all", "platform", "personal"] as const).map((type) => (
                    <Button
                      key={type}
                      variant={filter === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilter(type)}
                      className="capitalize"
                    >
                      {type === "all" ? "All Types" : REQUEST_TYPE_LABELS[type.toUpperCase() as keyof typeof REQUEST_TYPE_LABELS]}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700">Status:</span>
                <div className="flex gap-2">
                  {(["all", "PENDING", "REVIEWED", "IMPLEMENTED", "REJECTED"] as const).map((status) => (
                    <Button
                      key={status}
                      variant={statusFilter === status ? "default" : "outline"}
                      size="sm"
                      onClick={() => setStatusFilter(status)}
                      className="capitalize"
                    >
                      {status === "all" ? "All Status" : status.toLowerCase()}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Lightbulb size={20} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{requests.length}</p>
                  <p className="text-sm text-gray-700">Total Requests</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock size={20} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {requests.filter(r => r.status === "PENDING").length}
                  </p>
                  <p className="text-sm text-gray-700">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {requests.filter(r => r.status === "IMPLEMENTED").length}
                  </p>
                  <p className="text-sm text-gray-700">Implemented</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Lightbulb size={20} className="text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {requests.filter(r => r.requestType === "PERSONAL").length}
                  </p>
                  <p className="text-sm text-gray-700">Business Needs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Your Feature Requests ({filteredRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <Lightbulb size={48} className="mx-auto text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No feature requests found
                </h3>
                <p className="text-gray-700 mb-6">
                  {filter === "all" && statusFilter === "all" 
                    ? "You haven't submitted any feature requests yet." 
                    : "Try adjusting your filters to see more requests."}
                </p>
                <Button>
                  <Lightbulb size={16} className="mr-2" />
                  Request a Feature
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div 
                    key={request.id} 
                    className="border border-gray-100 rounded-2xl p-5 hover:bg-white/30 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          {getRequestTypeIcon(request.requestType)}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {request.title}
                            </h3>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {request.description}
                            </p>
                          </div>
                        </div>
                        
                        {request.attachmentUrl && (
                          <div className="flex items-center gap-2 mt-3">
                            <Paperclip size={14} className="text-gray-500" />
                            <a 
                              href={request.attachmentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-green-600 hover:underline"
                            >
                              View attachment
                            </a>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col items-end gap-2 min-w-[140px]">
                        <div className="flex items-center gap-2">
                          <Badge className={STATUS_COLORS[request.status]}>
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              {request.status.toLowerCase()}
                            </span>
                          </Badge>
                          <Badge className={PRIORITY_COLORS[request.priority]}>
                            {request.priority.toLowerCase()}
                          </Badge>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            Submitted {format(new Date(request.createdAt), "MMM d, yyyy")}
                          </p>
                          {request.updatedAt !== request.createdAt && (
                            <p className="text-xs text-gray-500">
                              Updated {format(new Date(request.updatedAt), "MMM d, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Type: {REQUEST_TYPE_LABELS[request.requestType]}</span>
                        <span>ID: {request.id.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPageShell>
  );
}
