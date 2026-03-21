"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@vayva/ui";
import { toast } from "sonner";
import { Users, UserPlus, PersonSimpleWalk } from "@phosphor-icons/react";
import type { DoorEntry } from "@/types/nightlife";
import { apiJson } from "@/lib/api-client-shared";

interface DoorStats {
  admitted: number;
  denied: number;
  waiting: number;
  coverCharge: number;
  demographics: {
    male: number;
    female: number;
    other: number;
  };
  ageGroups: {
    [key: string]: number;
  };
}

export function DoorActivity() {
  const [stats, setStats] = useState<DoorStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      setLoading(true);
      const venueId = "venue_123";
      const eventId = "event_456";
      const data = await apiJson<{
        stats: DoorStats;
      }>(`/api/nightlife/door/activity?venueId=${venueId}&eventId=${eventId}`);
      
      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (error: unknown) {
      console.error("[LOAD_DOOR_ENTRIES_ERROR]", error);
      toast.error("Failed to load door activity");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-[#252525] border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900">Door Activity</h3>
          <p className="text-sm text-gray-500">Last hour statistics</p>
        </div>
      </div>

      {/* Entry Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="p-3 bg-[#1A1A1A] rounded-lg text-center">
          <Users size={20} className="mx-auto mb-1 text-green-400" />
          <div className="text-xl font-bold text-gray-900">{stats?.admitted || 0}</div>
          <div className="text-xs text-gray-500">Admitted</div>
        </div>
        <div className="p-3 bg-[#1A1A1A] rounded-lg text-center">
          <PersonSimpleWalk size={20} className="mx-auto mb-1 text-red-400" />
          <div className="text-xl font-bold text-gray-900">{stats?.denied || 0}</div>
          <div className="text-xs text-gray-500">Denied</div>
        </div>
        <div className="p-3 bg-[#1A1A1A] rounded-lg text-center">
          <UserPlus size={20} className="mx-auto mb-1 text-yellow-400" />
          <div className="text-xl font-bold text-gray-900">{stats?.waiting || 0}</div>
          <div className="text-xs text-gray-500">Waiting</div>
        </div>
      </div>

      {/* Demographics */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Gender Distribution</div>
        <div className="flex h-2 rounded-full overflow-hidden bg-[#1A1A1A]">
          <div className="bg-blue-500" style={{ width: `${stats?.demographics.male}%` }} />
          <div className="bg-pink-500" style={{ width: `${stats?.demographics.female}%` }} />
          <div className="bg-purple-500" style={{ width: `${stats?.demographics.other}%` }} />
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>M: {stats?.demographics.male}%</span>
          <span>F: {stats?.demographics.female}%</span>
          <span>O: {stats?.demographics.other}%</span>
        </div>
      </div>

      {/* Age Groups */}
      <div className="mb-4">
        <div className="text-xs text-gray-500 mb-2">Age Groups</div>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(stats?.ageGroups || {}).map(([group, percentage]) => (
            <div key={group} className="text-center">
              <div className="text-xs text-gray-900 font-medium">{group}</div>
              <div className="text-lg font-bold text-cyan-400">{percentage}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Cover Charge & Staff */}
      <div className="pt-4 border-t border-[#333333]">
        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-500">Cover Charge: </span>
            <span className="text-gray-900 font-medium">
              ₦{stats?.coverCharge.toLocaleString() || 0}
            </span>
          </div>
          <div className="text-gray-500">
            Bouncers: 6/8 active
          </div>
        </div>
      </div>
    </Card>
  );
}
