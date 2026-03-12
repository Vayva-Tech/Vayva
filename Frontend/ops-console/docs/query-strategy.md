
# Query Strategy: Ops Console Upgrades

This document outlines the caching, invalidation, and data-fetching strategy implemented during the Ops Console UX Audit.

## 1. Core Principles
- **Truth over Latency**: Operational data must be accurate. While caching is used for speed, specific mutation-based triggers must force truth alignment.
- **Fail-Fast Feedback**: Any fetching error is immediately surfaced via global toast notifications to prevent operators from acting on incomplete data.
- **Predictable GC**: Cache is held for 5 minutes during active sessions to allow rapid "Back/Forward" navigation without hitting the DB.

## 2. Global Configuration (`QueryProvider.tsx`)
```typescript
defaultOptions: {
  queries: {
    staleTime: 60 * 1000,         // 1 minute (Data considered fresh for 1m)
    gcTime: 5 * 60 * 1000,        // 5 minutes (Kept in memory for 5m)
    refetchOnWindowFocus: false,  // Avoid jitter when switching browser tabs
    retry: 1,                     // Single retry to handle transient blips
  },
}
```

## 3. Invalidation Rules
Manual invalidations are triggered via `queryClient.invalidateQueries` after any audited action:
- **Action**: `disable-payouts` -> **Invalidate**: `["merchant", id]`
- **Action**: `verify-kyc` -> **Invalidate**: `["kyc"]`, `["merchant", id]`
- **Action**: `impersonate` -> No invalidation needed (redirects to new session).

## 4. Prefetch Safety
Implemented in `MerchantsListPage`:
- **Trigger**: `onMouseEnter` with a **250ms debounce**.
- **Concurrency**: Governed by the browser's connection pool.
- **StaleTime**: Prefetched data is marked with a 5m `staleTime` to ensure the detail page load is instantaneous if clicked within that window.

## 5. Error Handling
The `useOpsQuery` wrapper automatically catches fetch errors and triggers:
```typescript
toast.error("Data Fetch Error", {
  description: error.message || "Something went wrong while fetching data.",
});
```
This ensures we don't have "silent failures" in operational dashboards.

## 7. Freshness & Invalidation Matrix

| Query Key | staleTime | Invalidation Trigger | High Stakes? |
| :--- | :--- | :--- | :--- |
| `["merchants"]` | 60s | Any merchant state change | No |
| `["merchant", id]` | 5m (Prefetch) | `verify-kyc`, `disable-payouts` | **Yes** |
| `["disputes"]` | 2m | Provider Webhook / Manual Resolution | **Yes** |
| `["ai-stats"]` | 30s | Auto-refetch (polling) | No |
| `["audit"]` | 5m | Never (Append only) | **Yes** |

### High-Stakes Sync
For "High Stakes" data (Payout status, Compliance), we ignore cache on manual reload and force a background refresh on every window focus (`refetchOnWindowFocus: true` specifically for these keys if needed, though currently disabled globally for simplicity).
