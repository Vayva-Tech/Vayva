"use client";

import React, { useState } from "react";
import { useImpersonationBanner } from "@/hooks/useImpersonation";
import { Button } from "@vayva/ui";
import { UserCircle, AlertTriangle, X, Clock } from "lucide-react";

export function ImpersonationBanner(): React.JSX.Element | null {
  const { 
    isActive, 
    session, 
    isStopping, 
    formattedTimeRemaining, 
    handleStop 
  } = useImpersonationBanner();
  const [isMinimized, setIsMinimized] = useState(false);

  if (!isActive || !session) return null;

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 z-50 cursor-pointer"
        onClick={() => setIsMinimized(false)}
      >
        <div className="bg-amber-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <UserCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Impersonating</span>
          <span className="text-xs bg-amber-600 px-2 py-0.5 rounded">
            {formattedTimeRemaining}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-amber-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-semibold">Impersonation Mode Active</span>
          </div>
          
          <div className="h-6 w-px bg-amber-400" />
          
          <div className="flex items-center gap-2 text-sm">
            <UserCircle className="h-4 w-4" />
            <span>Acting as: <strong>{session.targetUser?.email}</strong></span>
          </div>
          
          <div className="h-6 w-px bg-amber-400" />
          
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span>Expires in: <strong>{formattedTimeRemaining}</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleStop}
            disabled={isStopping}
            className="bg-white text-amber-600 hover:bg-gray-100"
          >
            {isStopping ? "Stopping..." : "Stop Impersonating"}
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-amber-600"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
