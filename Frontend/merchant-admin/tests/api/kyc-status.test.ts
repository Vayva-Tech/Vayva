import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, getResponseJson } from '../helpers/api';

// Mock the API handler wrapper to pass through
vi.mock('@/lib/api-handler', () => ({
    withVayvaAPI: (_permission: unknown, handler: (...args: any[]) => any) => handler,
}));

vi.mock('@/lib/team/permissions', () => ({
    PERMISSIONS: { KYC_MANAGE: 'KYC_MANAGE' },
}));

vi.mock('@vayva/db', () => ({
    prisma: {
        store: { findUnique: vi.fn() },
    },
}));

vi.mock('@/lib/logger', () => ({
    logger: { error: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { GET } from '@/app/api/kyc/status/route';
import { prisma } from '@vayva/db';

describe('KYC Status - GET /api/kyc/status', () => {
    const mockContext = {
        storeId: 'store_test_123',
        userId: 'user_test_123',
        user: { id: 'user_test_123', email: 'test@example.com' },
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return NOT_STARTED when no KYC record exists', async () => {
        (prisma.store.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 'store_test_123',
            kycRecord: null,
        });

        const request = createMockRequest('GET', '/api/kyc/status');
        const response = await GET(request, mockContext);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.status).toBe('NOT_STARTED');
        expect(data.documents).toEqual([]);
        expect(data.canWithdraw).toBe(false);
    });

    it('should return VERIFIED status with documents', async () => {
        const now = new Date();
        (prisma.store.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 'store_test_123',
            kycRecord: {
                status: 'VERIFIED',
                cacNumberEncrypted: 'encrypted_cac',
                fullBvnEncrypted: 'encrypted_bvn',
                fullNinEncrypted: 'encrypted_nin',
                createdAt: now,
            },
        });

        const request = createMockRequest('GET', '/api/kyc/status');
        const response = await GET(request, mockContext);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.status).toBe('VERIFIED');
        expect(data.businessType).toBe('REGISTERED');
        expect(data.canWithdraw).toBe(true);
        expect(data.documents).toHaveLength(2);
        expect(data.documents[0].type).toBe('BVN');
        expect(data.documents[0].status).toBe('UPLOADED');
        expect(data.documents[1].type).toBe('ID');
        expect(data.documents[1].status).toBe('UPLOADED');
    });

    it('should return PENDING status with partial documents', async () => {
        (prisma.store.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 'store_test_123',
            kycRecord: {
                status: 'PENDING',
                cacNumberEncrypted: null,
                fullBvnEncrypted: 'encrypted_bvn',
                fullNinEncrypted: null,
                createdAt: new Date(),
            },
        });

        const request = createMockRequest('GET', '/api/kyc/status');
        const response = await GET(request, mockContext);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.status).toBe('PENDING');
        expect(data.businessType).toBe('INDIVIDUAL');
        expect(data.canWithdraw).toBe(false);
        expect(data.documents[0].status).toBe('UPLOADED'); // BVN uploaded
        expect(data.documents[1].status).toBe('PENDING');  // NIN not uploaded
    });

    it('should return 404 when store not found', async () => {
        (prisma.store.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue(null);

        const request = createMockRequest('GET', '/api/kyc/status');
        const response = await GET(request, mockContext);

        expect(response.status).toBe(404);
    });

    it('should handle database errors gracefully', async () => {
        (prisma.store.findUnique as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('DB error'));

        const request = createMockRequest('GET', '/api/kyc/status');
        const response = await GET(request, mockContext);

        expect(response.status).toBe(500);
    });

    it('should include Cache-Control: no-store header', async () => {
        (prisma.store.findUnique as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 'store_test_123',
            kycRecord: null,
        });

        const request = createMockRequest('GET', '/api/kyc/status');
        const response = await GET(request, mockContext);

        expect(response.headers.get('Cache-Control')).toBe('no-store');
    });
});
