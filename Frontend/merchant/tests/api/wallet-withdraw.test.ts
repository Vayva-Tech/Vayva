import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createMockRequest, getResponseJson } from '../helpers/api';

// Mock the API handler wrapper to pass through
vi.mock('@/lib/api-handler', () => ({
    withVayvaAPI: (_permission: unknown, handler: (...args: any[]) => any) => handler,
    PERMISSIONS: { PAYOUTS_MANAGE: 'PAYOUTS_MANAGE' },
}));

vi.mock('@/lib/team/permissions', () => ({
    PERMISSIONS: { PAYOUTS_MANAGE: 'PAYOUTS_MANAGE' },
}));

vi.mock('@vayva/db', () => ({
    prisma: {
        withdrawal: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
        wallet: { findUnique: vi.fn(), update: vi.fn() },
        bankBeneficiary: { findFirst: vi.fn() },
        ledgerEntry: { create: vi.fn() },
        $transaction: vi.fn(),
    },
}));

vi.mock('@vayva/payments', () => ({
    Paystack: {
        createTransferRecipient: vi.fn().mockResolvedValue({ recipientCode: 'RCP_test' }),
        initiateTransfer: vi.fn().mockResolvedValue({ transferCode: 'TRF_test', status: 'success' }),
    },
}));

import { POST } from '@/app/api/wallet/withdraw/route';
import { prisma } from '@vayva/db';

describe('Wallet Withdraw - POST /api/wallet/withdraw', () => {
    const mockContext = {
        storeId: 'store_test_123',
        userId: 'user_test_123',
        user: { id: 'user_test_123', email: 'test@example.com' },
    };

    const validBody = {
        amountKobo: 500000, // ₦5,000
        bankAccountId: 'bank_123',
        idempotencyKey: 'idem_key_001',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should create a withdrawal successfully', async () => {
        (prisma.withdrawal.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: any) => {
            const tx = {
                bankBeneficiary: {
                    findFirst: vi.fn().mockResolvedValue({
                        id: 'bank_123',
                        accountName: 'Test Account',
                        accountNumber: '0123456789',
                        bankCode: '058',
                    }),
                },
                wallet: {
                    findUnique: vi.fn().mockResolvedValue({
                        storeId: 'store_test_123',
                        availableKobo: BigInt(1000000),
                        pendingKobo: BigInt(0),
                    }),
                    update: vi.fn().mockResolvedValue({}),
                },
                withdrawal: {
                    create: vi.fn().mockResolvedValue({
                        id: 'withdrawal_123',
                        status: 'PROCESSING',
                        amountKobo: BigInt(500000),
                        feeKobo: BigInt(0),
                        amountNetKobo: BigInt(500000),
                    }),
                },
                ledgerEntry: { create: vi.fn().mockResolvedValue({}) },
            };
            return fn(tx);
        });

        const request = createMockRequest('POST', '/api/wallet/withdraw', {
            body: validBody,
            headers: { 'Idempotency-Key': 'idem_key_001' },
        });
        const response = await POST(request, mockContext);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.payoutId).toBe('withdrawal_123');
        expect(data.status).toBe('PROCESSING');
    });

    it('should return existing withdrawal for duplicate idempotency key', async () => {
        (prisma.withdrawal.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 'withdrawal_existing',
            status: 'PROCESSING',
        });

        const request = createMockRequest('POST', '/api/wallet/withdraw', {
            body: validBody,
            headers: { 'Idempotency-Key': 'idem_key_001' },
        });
        const response = await POST(request, mockContext);
        const data = await getResponseJson(response);

        expect(response.status).toBe(200);
        expect(data.payoutId).toBe('withdrawal_existing');
        // Should NOT create a new transaction
        expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('should reject invalid amount (zero)', async () => {
        const request = createMockRequest('POST', '/api/wallet/withdraw', {
            body: { ...validBody, amountKobo: 0 },
            headers: { 'Idempotency-Key': 'idem_key_002' },
        });
        const response = await POST(request, mockContext);

        expect(response.status).toBe(400);
    });

    it('should reject negative amount', async () => {
        const request = createMockRequest('POST', '/api/wallet/withdraw', {
            body: { ...validBody, amountKobo: -100 },
            headers: { 'Idempotency-Key': 'idem_key_003' },
        });
        const response = await POST(request, mockContext);

        expect(response.status).toBe(400);
    });

    it('should reject missing bankAccountId', async () => {
        const request = createMockRequest('POST', '/api/wallet/withdraw', {
            body: { amountKobo: 500000, idempotencyKey: 'idem_key_004' },
            headers: { 'Idempotency-Key': 'idem_key_004' },
        });
        const response = await POST(request, mockContext);

        expect(response.status).toBe(400);
    });

    it('should reject missing idempotency key', async () => {
        const request = createMockRequest('POST', '/api/wallet/withdraw', {
            body: { amountKobo: 500000, bankAccountId: 'bank_123' },
        });
        const response = await POST(request, mockContext);

        expect(response.status).toBe(400);
    });

    it('should fail on insufficient balance', async () => {
        (prisma.withdrawal.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: any) => {
            const tx = {
                bankBeneficiary: {
                    findFirst: vi.fn().mockResolvedValue({
                        id: 'bank_123',
                        accountName: 'Test',
                        accountNumber: '0123456789',
                        bankCode: '058',
                    }),
                },
                wallet: {
                    findUnique: vi.fn().mockResolvedValue({
                        storeId: 'store_test_123',
                        availableKobo: BigInt(100), // Only ₦1 available
                        pendingKobo: BigInt(0),
                    }),
                    update: vi.fn(),
                },
                withdrawal: { create: vi.fn() },
                ledgerEntry: { create: vi.fn() },
            };
            return fn(tx);
        });

        const request = createMockRequest('POST', '/api/wallet/withdraw', {
            body: validBody,
            headers: { 'Idempotency-Key': 'idem_key_005' },
        });
        const response = await POST(request, mockContext);

        expect(response.status).toBe(500);
        const data = await getResponseJson(response);
        expect(data.error).toContain('Insufficient');
    });

    it('should fail when bank account not found', async () => {
        (prisma.withdrawal.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: any) => {
            const tx = {
                bankBeneficiary: { findFirst: vi.fn().mockResolvedValue(null) },
                wallet: { findUnique: vi.fn(), update: vi.fn() },
                withdrawal: { create: vi.fn() },
                ledgerEntry: { create: vi.fn() },
            };
            return fn(tx);
        });

        const request = createMockRequest('POST', '/api/wallet/withdraw', {
            body: validBody,
            headers: { 'Idempotency-Key': 'idem_key_006' },
        });
        const response = await POST(request, mockContext);

        expect(response.status).toBe(500);
        const data = await getResponseJson(response);
        expect(data.error).toContain('Bank account');
    });

    it('should fail when wallet not found', async () => {
        (prisma.withdrawal.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (prisma.$transaction as ReturnType<typeof vi.fn>).mockImplementation(async (fn: any) => {
            const tx = {
                bankBeneficiary: {
                    findFirst: vi.fn().mockResolvedValue({ id: 'bank_123' }),
                },
                wallet: { findUnique: vi.fn().mockResolvedValue(null), update: vi.fn() },
                withdrawal: { create: vi.fn() },
                ledgerEntry: { create: vi.fn() },
            };
            return fn(tx);
        });

        const request = createMockRequest('POST', '/api/wallet/withdraw', {
            body: validBody,
            headers: { 'Idempotency-Key': 'idem_key_007' },
        });
        const response = await POST(request, mockContext);

        expect(response.status).toBe(500);
        const data = await getResponseJson(response);
        expect(data.error).toContain('Wallet');
    });
});
