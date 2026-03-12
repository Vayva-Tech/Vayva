
# Performance Benchmark: Ops Console v3.3.0

This document records the performance metrics and verification of the UX/Performance upgrades delivered in v3.3.0.

## 1. Environment Specifications
- **Build Mode**: Production (`next build && next start`)
- **Node Version**: v22.x (Target) / v25.x (Test)
- **Network Throttling**: None (Localhost)
- **CPU Throttling**: None

## 2. Navigation Benchmarks (Merchant Detail)

| Scenario | perceived Latency | Network Requests | Cache Status |
| :--- | :--- | :--- | :--- |
| **Cold Navigation** (No Hover) | 400ms - 800ms | 1 (API) | MISS |
| **Hover (250ms) -> Click** | **< 10ms** | 0 (at click time) | **HIT (Prefetched)** |
| **Rapid Hover Scroll** | N/A | 0 (Debounced) | N/A |

## 3. Truth Verification (Warm Path)
Sequence for verification:
1. Open Merchant List.
2. Pulse mouse over Row A (250ms).
3. Observe Network Tab: `GET /api/ops/merchants/row-a` fired in background.
4. Click Row A immediately.
5. **Verification**: Page content populates from memory. No new network request is initiated for the primary merchant object.

## 4. Query Performance (TanStack Settings)
- **Hydration**: Next.js Server Components pre-render the shell; TanStack Query hydrates the data layer.
- **Deduplication**: Simultaneous clicks or rapid re-enters of the same page in <1m result in 0 additional network calls due to `staleTime: 60000`.

## 5. Build Artifacts Status
- **Turbopack**: Enabled during build.
- **Route Status**:
    - All `/ops/*` routes are dynamic (ƒ) to ensure real-time auth and data.
    - API routes optimized for low-latency JSON response.
