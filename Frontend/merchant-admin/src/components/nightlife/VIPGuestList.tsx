"use client";

import React, { useState, useEffect } from "react";
import { Card, Button } from "@vayva/ui";
import { toast } from "sonner";
import { UserStar, Check, Message, Clock } from "@phosphor-icons/react";
import type { VIPGuest } from "@/types/nightlife";
import { apiJson } from "@/lib/api-client-shared";

interface VIPStats {
  total: number;
  checkedIn: number;
  pending: number;
}

export function VIPGuestList() {
  const [guests, setGuests] = useState<VIPGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VIPStats | null>(null);

  useEffect(() => {
    void loadGuests();
  }, []);

  const loadGuests = async () => {
    try {
      setLoading(true);
      const eventId = "event_456";
      const data = await apiJson<{
        guests: VIPGuest[];
        stats?: VIPStats;
      }>(`/api/nightlife/vip-list?eventId=${eventId}`);
      
      if (data?.guests) {
        setGuests(data.guests.slice(0, 8)); // Show first 8
        setStats(data.stats || null);
      }
    } catch (error: unknown) {
      console.error("[LOAD_VIP_ERROR]", error);
      toast.error("Failed to load VIP guest list");
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'celebrity': return '🌟';
      case 'high_roller': return '💎';
      case 'special_occasion': return '🎂';
      default: return '🎉';
    }
  };

  return (
    <Card className="p-6 bg-[#252525] border-[#333333]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-text-primary">VIP Guest List</h3>
          <p className="text-sm text-text-secondary">
            {stats ? `${stats.total} guests tonight` : 'Loading...'}
          </p>
        </div>
        <Button variant="outline" size="sm">Manage List</Button>
      </div>

      <div className="space-y-3">
        {guests.map((guest) => (
          <div
            key={guest.id}
            className="p-3 bg-[#1A1A1A] rounded-lg border border-[#333333] hover:border-[#00D9FF] transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1">
                <span className="text-xl">{getCategoryIcon(guest.category)}</span>
                <div>
                  <div className="font-medium text-text-primary">{guest.name}</div>
                  <div className="text-xs text-text-secondary">
                    {guest.tableName ? `Table ${guest.tableName}` : 'No table'} • {guest.guestCount} guests
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!guest.hasArrived ? (
                  <Button size="sm" variant="outline">
                    <Check size={14} className="mr-1" />
                    Check-in
                  </Button>
                ) : (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <Check size={12} /> Arrived
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {stats && (
        <div className="mt-4 pt-4 border-t border-[#333333] text-xs text-text-secondary flex items-center justify-between">
          <div>Checked in: {stats.checkedIn}/{stats.total}</div>
          <div>Pending: {stats.pending}</div>
        </div>
      )}
    </Card>
  );
}
