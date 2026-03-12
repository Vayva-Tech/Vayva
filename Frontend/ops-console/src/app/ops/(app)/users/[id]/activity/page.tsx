"use client";

import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Pulse as Activity, ArrowLeft, Shield, LockKey as Lock, Warning as AlertTriangle, Terminal, Calendar, Envelope as Mail } from "@phosphor-icons/react/ssr";
import Link from "next/link";
import { useParams } from "next/navigation";
import { OpsPageShell } from "@/components/ops/OpsPageShell";
import { logger } from "@vayva/shared";

interface AuditEvent {
  id: string;
  eventType: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata: any;
  createdAt: string;
}

interface OpsUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

export default function UserActivityPage(): React.JSX.Element {
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<OpsUser | null>(null);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Parallel fetch
      const [userRes, logsRes] = await Promise.all([
        fetch(`/api/ops/users?id=${userId}`),
        fetch(`/api/ops/security/logs?userId=${userId}&limit=100`),
      ]);

      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData);
      }

      if (logsRes.ok) {
        const logsData = await logsRes.json();
        setEvents(logsData.data || []);
      }
    } catch (e) {
      logger.error("[USER_ACTIVITY_FETCH_ERROR]", { error: e });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    if (type.includes("LOGIN"))
      return <Lock className="w-4 h-4 text-blue-500" />;
    if (type.includes("FAIL"))
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    return <Activity className="w-4 h-4 text-gray-400" />;
  };

  return (
    <OpsPageShell
      title={user?.name || "User Activity"}
      description={user ? `${user.email} • ${user.role}` : "Loading..."}
    >
      <div className="max-w-5xl mx-auto space-y-6">

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2">
          Pulse as Activity Log
        </h2>

        <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 py-2">
          {loading ? (
            <div className="pl-6 text-gray-400 italic">Loading activity...</div>
          ) : events.length === 0 ? (
            <div className="pl-6 text-gray-400 italic">
              No activity recorded.
            </div>
          ) : (
            events.map((e) => (
              <div key={e.id} className="relative pl-6">
                <span className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                </span>
                <div className="bg-white border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 mb-1">
                      {getIcon(e.eventType)}
                      <span className="font-mono text-sm font-bold text-gray-800">
                        {e.eventType}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(e.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2 font-mono break-all">
                    {JSON.stringify(e.metadata)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </div>
    </OpsPageShell>
  );
}
