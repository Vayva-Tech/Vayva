"use client";

import React, { useEffect, useRef, useState } from "react";
import { useOpsQuery } from "@/hooks/useOpsQuery";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { Button } from "@vayva/ui";
import {
  Pulse,
  ShoppingBag,
  User,
  CreditCard,
  Warning,
  CheckCircle,
  Clock,
  Faders,
  Download,
  ArrowsClockwise,
  MagnifyingGlass,
} from "@phosphor-icons/react/ssr";
import Link from "next/link";

// ============================================================================
// Types
// ============================================================================

interface ActivityEvent {
  id: string;
  type: "order" | "login" | "payment" | "kyc" | "settings" | "suspicious";
  merchantId: string;
  merchantName: string;
  description: string;
  metadata: {
      ip?: string;
      userAgent?: string;
      orderValue?: number;
    };
  timestamp: string;
  severity: "info" | "warning" | "critical";
}

// ============================================================================
// Real Data from API
// ============================================================================

async function fetchActivityEvents(): Promise<ActivityEvent[]> {
  const res = await fetch("/api/ops/merchants/activity?limit=50");
  if (!res.ok) throw new Error("Failed to fetch activity");
  const json = await res.json();
  return json.data;
}

// ============================================================================
// Components
// ============================================================================

function EventIcon({ type }: { type: ActivityEvent["type"] }) {
  const icons = {
    order: ShoppingBag,
    login: User,
    payment: CreditCard,
    kyc: CheckCircle,
    settings: Pulse,
    suspicious: Warning,
  };
  const Icon = icons[type] || Pulse;
  return <Icon className="h-5 w-5" />;
}

function EventBadge({ severity }: { severity: ActivityEvent["severity"] }) {
  const styles = {
    info: "bg-blue-100 text-blue-700",
    warning: "bg-amber-100 text-amber-700",
    critical: "bg-red-100 text-red-700",
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[severity]}`}>
      {severity.toUpperCase()}
    </span>
  );
}

function TimeAgo({ timestamp }: { timestamp: string }) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = Date.now() - new Date(timestamp).getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 60) setTimeAgo("just now");
      else if (minutes < 60) setTimeAgo(`${minutes}m ago`);
      else if (hours < 24) setTimeAgo(`${hours}h ago`);
      else setTimeAgo(new Date(timestamp).toLocaleDateString());
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [timestamp]);

  return <span className="text-xs text-gray-500">{timeAgo}</span>;
}

// ============================================================================
// Main Page
// ============================================================================

export default function MerchantActivityPage(): React.JSX.Element {
  const [filter, setFilter] = useState<ActivityEvent["type"] | "all">("all");
  const [severityFilter, setSeverityFilter] = useState<ActivityEvent["severity"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLive, setIsLive] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: events, isLoading, refetch } = useOpsQuery<ActivityEvent[]>(
    ["merchant-activity"],
    fetchActivityEvents,
    { 
      refetchInterval: isLive ? 5000 : false,
      enabled: true 
    }
  );

  // Auto-scroll to bottom on new events
  useEffect(() => {
    if (scrollRef.current && isLive) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [events, isLive]);

  const filteredEvents = events?.filter((event) => {
    if (filter !== "all" && event.type !== filter) return false;
    if (severityFilter !== "all" && event.severity !== severityFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        event.merchantName.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const stats = {
    total: events?.length || 0,
    orders: events?.filter((e) => e.type === "order").length || 0,
    logins: events?.filter((e) => e.type === "login").length || 0,
    warnings: events?.filter((e) => e.severity === "warning").length || 0,
  };

  return (
    <OpsPageShell
      title="Merchant Activity Stream"
      description="Real-time monitoring of merchant actions across the platform"
      headerActions={
        <div className="flex items-center gap-3">
          <Button
            variant={isLive ? "primary" : "outline"}
            size="sm"
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 ${isLive ? "bg-green-600 hover:bg-green-700" : ""}`}
          >
            <Pulse className={`h-4 w-4 ${isLive ? "animate-pulse" : ""}`} />
            {isLive ? "Live" : "Paused"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex items-center gap-2"
          >
            <ArrowsClockwise className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      }
    >
      {/* Stats Cards */}
      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Pulse className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-500">Total Events</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.orders}</div>
                <div className="text-xs text-gray-500">Orders</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <User className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.logins}</div>
                <div className="text-xs text-gray-500">Logins</div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Warning className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.warnings}</div>
                <div className="text-xs text-gray-500">Warnings</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="mb-6">
        <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-2">
            <Faders className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filter:</span>
          </div>
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as ActivityEvent["type"] | "all")}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Types</option>
            <option value="order">Orders</option>
            <option value="login">Logins</option>
            <option value="payment">Payments</option>
            <option value="kyc">KYC</option>
            <option value="settings">Settings</option>
            <option value="suspicious">Suspicious</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value as ActivityEvent["severity"] | "all")}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="critical">Critical</option>
          </select>

          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search merchants or events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Activity Feed */}
      <section>
        <div 
          ref={scrollRef}
          className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="font-bold text-gray-900">Activity Feed</h3>
            <span className="text-sm text-gray-500">
              Showing {filteredEvents?.length || 0} events
            </span>
          </div>
          
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-gray-500">
                <Pulse className="h-8 w-8 animate-spin mx-auto mb-2" />
                Loading activity...
              </div>
            ) : filteredEvents?.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No events match your filters
              </div>
            ) : (
              filteredEvents?.map((event) => (
                <div
                  key={event.id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${
                    event.severity === "critical" ? "bg-red-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      event.type === "order" ? "bg-green-100 text-green-600" :
                      event.type === "login" ? "bg-blue-100 text-blue-600" :
                      event.type === "payment" ? "bg-purple-100 text-purple-600" :
                      event.type === "suspicious" ? "bg-amber-100 text-amber-600" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      <EventIcon type={event.type} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          href={`/ops/merchants/${event.merchantId}`}
                          className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors"
                        >
                          {event.merchantName}
                        </Link>
                        <EventBadge severity={event.severity} />
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                      
                      {event.metadata.orderValue && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          ₦{(event.metadata.orderValue as number).toLocaleString()}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <TimeAgo timestamp={event.timestamp} />
                        </span>
                        <span>IP: {event.metadata.ip}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/ops/merchants/${event.merchantId}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </OpsPageShell>
  );
}
