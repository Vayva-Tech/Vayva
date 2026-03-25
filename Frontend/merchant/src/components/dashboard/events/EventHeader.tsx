"use client";

import React from "react";
import { Button } from "@vayva/ui";
import { PartyPopper, BarChart3, Plus } from "lucide-react";

export interface Event {
  id: string;
  title: string;
  status: string;
}

interface EventHeaderProps {
  event?: Event | null;
  planTier?: string;
}

export function EventHeader({ event, planTier }: EventHeaderProps) {
  const eventDate = event ? new Date() : null; // Would come from event metadata
  const daysUntilEvent = eventDate 
    ? Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_#000000] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center border-2 border-black">
            <PartyPopper className="w-6 h-6 text-white" />
          </div>
          
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
              {event?.title || "Event Overview"}
            </h1>
            
            {event && (
              <div className="flex items-center gap-3 mt-1 text-sm">
                <span className="font-bold text-gray-700">
                  Status:{" "}
                  <span className={`inline-flex items-center gap-1 ${
                    event.status === "active" ? "text-green-600" : "text-gray-600"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      event.status === "active" ? "bg-green-600" : "bg-gray-600"
                    }`} />
                    {event.status === "active" ? "On Sale" : event.status}
                  </span>
                </span>
                
                {daysUntilEvent !== undefined && (
                  <>
                    <span className="font-bold text-gray-700">•</span>
                    <span className="font-bold text-gray-700">
                      Days Until Event:{" "}
                      <span className="text-pink-600">{daysUntilEvent}</span>
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-2 border-black hover:bg-gray-100 font-bold">
            <BarChart3 className="w-4 h-4 mr-2" />
            Sales Report
          </Button>
          
          <Button className="bg-gradient-to-r from-pink-500 to-red-500 text-white border-2 border-black hover:brightness-110 font-black uppercase tracking-wide shadow-[2px_2px_0px_#000000]">
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>
      </div>
    </div>
  );
}
