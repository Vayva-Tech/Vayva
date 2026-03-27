/**
 * HIPAA Audit Logger Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HIPAAAAuditLogger, type AuditLogEvent } from '../src/hipaa/AuditLogger';

// Mock Prisma
const mockPrisma = {
  hIPAAAAuditLog: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
};

describe('HIPAAAAuditLogger', () => {
  let logger: HIPAAAAuditLogger;

  beforeEach(() => {
    vi.clearAllMocks();
    logger = new HIPAAAAuditLogger(mockPrisma as any);
  });

  const sampleEvent: AuditLogEvent = {
    userId: 'user-123',
    action: 'VIEW',
    resourceType: 'PATIENT_RECORD',
    resourceId: 'patient-456',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0',
    storeId: 'store-789',
    patientId: 'patient-456',
  };

  describe('log()', () => {
    it('successfully logs a HIPAA audit event', async () => {
      mockPrisma.hIPAAAAuditLog.create.mockResolvedValue({ id: 'audit-log-1' });

      await expect(logger.log(sampleEvent)).resolves.not.toThrow();

      expect(mockPrisma.hIPAAAAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'user-123',
          action: 'VIEW',
          resourceType: 'PATIENT_RECORD',
          resourceId: 'patient-456',
          ipAddress: '192.168.1.100',
          immutable: true,
          hash: expect.any(String),
        }),
      });
    });

    it('generates integrity hash for audit log entry', async () => {
      mockPrisma.hIPAAAAuditLog.create.mockResolvedValue({ id: 'audit-log-1' });

      await logger.log(sampleEvent);

      const callData = mockPrisma.hIPAAAAuditLog.create.mock.calls[0][0].data;
      expect(callData.hash).toHaveLength(64); // SHA-256 produces 64-char hex
    });

    it('sets retention date to 6 years from timestamp', async () => {
      mockPrisma.hIPAAAAuditLog.create.mockResolvedValue({ id: 'audit-log-1' });
      const testDate = new Date('2026-03-26');

      await logger.log({
        ...sampleEvent,
        timestamp: testDate,
      });

      const callData = mockPrisma.hIPAAAAuditLog.create.mock.calls[0][0].data;
      const expectedRetention = new Date('2032-03-26');
      expect(callData.retentionUntil).toEqual(expectedRetention);
    });

    it('includes metadata when provided', async () => {
      mockPrisma.hIPAAAAuditLog.create.mockResolvedValue({ id: 'audit-log-1' });
      const eventWithMetadata = {
        ...sampleEvent,
        metadata: { department: 'Emergency', urgency: 'critical' },
      };

      await logger.log(eventWithMetadata);

      const callData = mockPrisma.hIPAAAAuditLog.create.mock.calls[0][0].data;
      expect(callData.metadata).toBe(JSON.stringify({ department: 'Emergency', urgency: 'critical' }));
    });

    it('includes reason for emergency access', async () => {
      mockPrisma.hIPAAAAuditLog.create.mockResolvedValue({ id: 'audit-log-1' });
      const emergencyEvent = {
        ...sampleEvent,
        reason: 'Emergency treatment required',
      };

      await logger.log(emergencyEvent);

      const callData = mockPrisma.hIPAAAAuditLog.create.mock.calls[0][0].data;
      expect(callData.reason).toBe('Emergency treatment required');
    });

    it('throws error when database write fails', async () => {
      mockPrisma.hIPAAAAuditLog.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(logger.log(sampleEvent)).rejects.toThrow('Failed to log HIPAA audit event');
    });
  });

  describe('search()', () => {
    beforeEach(() => {
      mockPrisma.hIPAAAAuditLog.findMany.mockResolvedValue([]);
    });

    it('searches audit logs with filters', async () => {
      await logger.search({
        userId: 'user-123',
        resourceType: 'PATIENT_RECORD',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-03-26'),
      });

      expect(mockPrisma.hIPAAAAuditLog.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          resourceType: 'PATIENT_RECORD',
          timestamp: {
            gte: new Date('2026-01-01'),
            lte: new Date('2026-03-26'),
          },
        },
        orderBy: [{ timestamp: 'desc' }],
        take: 1000,
      });
    });

    it('searches by store ID', async () => {
      await logger.search({ storeId: 'store-789' });

      expect(mockPrisma.hIPAAAAuditLog.findMany).toHaveBeenCalledWith({
        where: {
          storeId: 'store-789',
        },
        orderBy: [{ timestamp: 'desc' }],
        take: 1000,
      });
    });

    it('searches by patient ID', async () => {
      await logger.search({ patientId: 'patient-456' });

      expect(mockPrisma.hIPAAAAuditLog.findMany).toHaveBeenCalledWith({
        where: {
          patientId: 'patient-456',
        },
        orderBy: [{ timestamp: 'desc' }],
        take: 1000,
      });
    });

    it('performs text search across multiple fields', async () => {
      await logger.search({ searchTerm: 'emergency' });

      expect(mockPrisma.hIPAAAAuditLog.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { resourceId: { contains: 'emergency' } },
            { reason: { contains: 'emergency' } },
            { userId: { contains: 'emergency' } },
          ],
        },
        orderBy: [{ timestamp: 'desc' }],
        take: 1000,
      });
    });

    it('parses metadata JSON in results', async () => {
      const mockEntries = [
        {
          id: 'audit-1',
          metadata: JSON.stringify({ key: 'value' }),
          ...sampleEvent,
        },
      ];
      mockPrisma.hIPAAAAuditLog.findMany.mockResolvedValue(mockEntries);

      const results = await logger.search({});

      expect(results[0].metadata).toEqual({ key: 'value' });
    });
  });

  describe('exportToCSV()', () => {
    it('exports audit logs to CSV format', async () => {
      const mockEntries = [
        {
          id: 'audit-1',
          timestamp: new Date('2026-03-26T10:00:00Z'),
          userId: 'user-123',
          action: 'VIEW',
          resourceType: 'PATIENT_RECORD',
          resourceId: 'patient-456',
          patientId: 'patient-456',
          ipAddress: '192.168.1.100',
          reason: null,
          storeId: 'store-789',
          hash: 'abc123',
          metadata: null,
        },
      ];
      mockPrisma.hIPAAAAuditLog.findMany.mockResolvedValue(mockEntries);

      const csv = await logger.exportToCSV({
        start: new Date('2026-01-01'),
        end: new Date('2026-12-31'),
      });

      expect(csv).toContain('ID,Timestamp,User ID,Action,Resource Type');
      expect(csv).toContain('audit-1,2026-03-26T10:00:00.000Z,user-123,VIEW,PATIENT_RECORD');
    });

    it('escapes CSV fields properly', async () => {
      const mockEntries = [
        {
          id: 'audit-1',
          timestamp: new Date('2026-03-26T10:00:00Z'),
          userId: 'user-123',
          action: 'VIEW',
          resourceType: 'PATIENT_RECORD',
          resourceId: 'patient-456',
          patientId: 'patient-456',
          ipAddress: '192.168.1.100',
          reason: 'Reason with "quotes"',
          storeId: 'store-789',
          hash: 'abc123',
          metadata: null,
        },
      ];
      mockPrisma.hIPAAAAuditLog.findMany.mockResolvedValue(mockEntries);

      const csv = await logger.exportToCSV({
        start: new Date('2026-01-01'),
        end: new Date('2026-12-31'),
      });

      // Should escape quotes
      expect(csv).toContain('"Reason with ""quotes"""');
    });
  });

  describe('verifyIntegrity()', () => {
    it('returns true when hash matches', async () => {
      const mockEntry = {
        id: 'audit-1',
        userId: 'user-123',
        action: 'VIEW',
        resourceType: 'PATIENT_RECORD',
        resourceId: 'patient-456',
        timestamp: new Date('2026-03-26T10:00:00Z'),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        storeId: 'store-789',
        patientId: 'patient-456',
        reason: null,
        hash: 'expected-hash-value',
      };
      mockPrisma.hIPAAAAuditLog.findUnique.mockResolvedValue(mockEntry);

      // Mock crypto to return predictable hash
      vi.spyOn(require('crypto'), 'createHash').mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('expected-hash-value'),
      });

      const result = await logger.verifyIntegrity('audit-1');
      expect(result).toBe(true);
    });

    it('returns false when hash does not match (tampering detected)', async () => {
      const mockEntry = {
        id: 'audit-1',
        userId: 'user-123',
        action: 'VIEW',
        resourceType: 'PATIENT_RECORD',
        resourceId: 'patient-456',
        timestamp: new Date('2026-03-26T10:00:00Z'),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0',
        storeId: 'store-789',
        patientId: 'patient-456',
        reason: null,
        hash: 'tampered-hash',
      };
      mockPrisma.hIPAAAAuditLog.findUnique.mockResolvedValue(mockEntry);

      vi.spyOn(require('crypto'), 'createHash').mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue('different-hash'),
      });

      const result = await logger.verifyIntegrity('audit-1');
      expect(result).toBe(false);
    });

    it('returns false when entry does not exist', async () => {
      mockPrisma.hIPAAAAuditLog.findUnique.mockResolvedValue(null);

      const result = await logger.verifyIntegrity('non-existent-id');
      expect(result).toBe(false);
    });
  });

  describe('detectSuspiciousActivity()', () => {
    it('detects excessive PHI access (>20 in 5 minutes)', async () => {
      mockPrisma.hIPAAAAuditLog.count.mockResolvedValue(25);

      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation();

      await (logger as any).detectSuspiciousActivity(sampleEvent);

      expect(mockPrisma.hIPAAAAuditLog.count).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          resourceType: 'PATIENT_RECORD',
          timestamp: expect.any(Object),
        },
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Excessive PHI access'),
        expect.any(Object)
      );

      consoleWarnSpy.mockRestore();
    });

    it('detects after-hours access (before 6 AM or after 10 PM)', async () => {
      mockPrisma.hIPAAAAuditLog.count.mockResolvedValue(1);

      const consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation();

      // Set time to 3 AM
      const originalDate = global.Date;
      global.Date = class extends originalDate {
        constructor() {
          super();
          return new originalDate('2026-03-26T03:00:00Z');
        }
      } as any;

      await (logger as any).detectSuspiciousActivity(sampleEvent);

      expect(consoleInfoSpy).toHaveBeenCalledWith(
        expect.stringContaining('after-hours access'),
        expect.any(Object)
      );

      global.Date = originalDate;
      consoleInfoSpy.mockRestore();
    });
  });
});
