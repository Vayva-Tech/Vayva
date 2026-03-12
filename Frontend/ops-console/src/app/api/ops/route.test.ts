import { NextRequest , NextResponse } from "next/server";
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
// @ts-expect-error - Module resolution pending
import { GET as metricsHandler } from './metrics/route';
// @ts-expect-error - Module resolution pending
import { POST as fixHandler } from './merchant-snapshot/fix/route';
// @ts-expect-error - Module resolution pending
import { OpsAuthService } from '@/lib/ops-auth';

// Mock OpsAuthService
vi.mock('@/lib/ops-auth', () => ({
    OpsAuthService: {
        requireSession: vi.fn(),
        logEvent: vi.fn(),
    },
}));

// Mock Next Response properly as a class
vi.mock('next/server', () => {
    return {
        NextResponse: class {
            constructor(body: any, init?: any) {
                return {
                    json: async () => typeof body === 'string' ? JSON.parse(body) : body,
                    status: init?.status || 200,
                    body
                } as { json: () => Promise<unknown>; status: number; body: unknown };
            }
            static json(body: any, init?: any) {
                return {
                    json: async () => body,
                    status: init?.status || 200,
                    body
                };
            }
        },
        NextRequest: class {
            url: string;
            constructor(url: string) {
                this.url = url;
            }
            json() { return {}; }
        }
    }
});

// Mock other dependencies to avoid deep tree issues
vi.mock('@/lib/ops-metrics', () => ({
    getOpsMetrics: vi.fn().mockResolvedValue({}),
}));
vi.mock('@/lib/ops/remediation', () => ({
    remediateStore: vi.fn().mockResolvedValue([]),
}));
vi.mock('@/lib/ops/computeReadiness', () => ({
    computeMerchantReadiness: vi.fn().mockResolvedValue({ level: 'ready' }),
}));

describe('Ops API Security Gates', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('Metrics: returns 401 when unauthenticated (requireSession throws)', async () => {
        vi.mocked(OpsAuthService.requireSession as Mock).mockRejectedValue(new Error('Unauthorized'));

        const req = new Request('http://localhost/api/ops/metrics');
        const res = await metricsHandler(req) as Response;

        expect(res.status).toBe(401);
    });

    it('Metrics: returns 403 when user has wrong role', async () => {
        vi.mocked(OpsAuthService.requireSession as Mock).mockResolvedValue({
            user: { id: '1', role: 'MERCHANT' }
        });

        const req = new Request('http://localhost/api/ops/metrics');
        const res = await metricsHandler(req) as Response;

        expect(res.status).toBe(403);
    });

    it('Metrics: returns 200 when user is OPS_OWNER', async () => {
        vi.mocked(OpsAuthService.requireSession as Mock).mockResolvedValue({
            user: { id: '1', role: 'OPS_OWNER' }
        });

        const req = new Request('http://localhost/api/ops/metrics');
        const res = await metricsHandler(req) as Response;

        expect(res.status).toBe(200);
    });

    it('Fix: returns 401 when unauthenticated', async () => {
        vi.mocked(OpsAuthService.requireSession as Mock).mockRejectedValue(new Error('Unauthorized'));

        const req = { json: async () => ({}) } as Request;
        const res = await fixHandler(req) as Response;

        expect(res.status).toBe(401);
    });
});
