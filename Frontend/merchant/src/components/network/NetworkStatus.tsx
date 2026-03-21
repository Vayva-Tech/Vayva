"use client";

import { useOffline } from "@/context/OfflineContext";
import { WifiSlash, WifiHigh, Spinner } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

/**
 * Network status banner that shows when user goes offline
 * or when there are pending offline actions
 */
export function NetworkStatusBanner() {
  const { isOnline, getQueuedActions } = useOffline();
  const [queueCount, setQueueCount] = useState(0);
  const [showSynced, setShowSynced] = useState(false);

  useEffect(() => {
    const checkQueue = () => {
      const queue = getQueuedActions();
      setQueueCount(queue.length);
    };

    checkQueue();
    const interval = setInterval(checkQueue, 5000);

    return () => clearInterval(interval);
  }, [getQueuedActions]);

  // Show "synced" message briefly when coming back online with no queue
  useEffect(() => {
    if (isOnline && queueCount === 0) {
      // Defer setState to avoid cascading renders (react-compiler requirement)
      const showTimer = setTimeout(() => setShowSynced(true), 0);
      const hideTimer = setTimeout(() => setShowSynced(false), 3000);
      return () => {
        clearTimeout(showTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isOnline, queueCount]);

  // Don't show anything if online and no queued actions
  if (isOnline && queueCount === 0 && !showSynced) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-0 left-0 right-0 z-50 px-4 py-2 text-sm font-medium transition-all duration-300 ${
        isOnline
          ? queueCount > 0
            ? "bg-orange-500 text-white"
            : "bg-green-500 text-white"
          : "bg-red-500 text-white"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
        {!isOnline ? (
          <>
            <WifiSlash className="w-4 h-4" aria-hidden="true" />
            <span>You are offline. Changes will be synced when connection is restored.</span>
            {queueCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                {queueCount} pending
              </span>
            )}
          </>
        ) : queueCount > 0 ? (
          <>
            <Spinner className="w-4 h-4 animate-spin" aria-hidden="true" />
            <span>Syncing {queueCount} pending changes...</span>
          </>
        ) : showSynced ? (
          <>
            <WifiHigh className="w-4 h-4" aria-hidden="true" />
            <span>All changes synced successfully</span>
          </>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Button that shows offline status and allows manual sync
 */
export function OfflineSyncButton() {
  const { isOnline, processQueuedActions, getQueuedActions } = useOffline();
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    setQueueCount(getQueuedActions().length);
  }, [getQueuedActions]);

  const handleSync = async () => {
    if (!isOnline || isSyncing) return;
    
    setIsSyncing(true);
    try {
      await processQueuedActions();
    } finally {
      setIsSyncing(false);
      setQueueCount(getQueuedActions().length);
    }
  };

  if (queueCount === 0) return null;

  return (
    <button
      onClick={handleSync}
      disabled={!isOnline || isSyncing}
      className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-orange-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      title={isOnline ? "Sync pending changes" : "Cannot sync while offline"}
    >
      {isSyncing ? (
        <Spinner className="w-4 h-4 animate-spin" />
      ) : (
        <WifiSlash className="w-4 h-4" />
      )}
      <span>{queueCount} pending</span>
      {isOnline && !isSyncing && <span className="text-xs">(click to sync)</span>}
    </button>
  );
}
