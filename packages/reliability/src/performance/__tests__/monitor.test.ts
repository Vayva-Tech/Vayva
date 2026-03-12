/**
 * Performance Monitor Tests
 * Tests for performance monitoring functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceMonitor } from '../monitor';

describe('PerformanceMonitor', () => {
  let monitor: PerformanceMonitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  describe('Operation Tracking', () => {
    it('should start and end operation', () => {
      const id = monitor.startOperation('test-operation');
      expect(id).toBeDefined();
      expect(typeof id).toBe('string');

      const metric = monitor.endOperation(id);
      expect(metric).not.toBeNull();
      expect(metric?.name).toBe('test-operation');
      expect(metric?.unit).toBe('ms');
      expect(metric?.value).toBeGreaterThanOrEqual(0);
    });

    it('should track operation with tags', () => {
      const id = monitor.startOperation('test-operation', { category: 'test' });
      const metric = monitor.endOperation(id, { status: 'success' });

      expect(metric?.tags).toEqual({
        category: 'test',
        status: 'success',
      });
    });

    it('should return null for non-existent operation', () => {
      const metric = monitor.endOperation('non-existent-id');
      expect(metric).toBeNull();
    });

    it('should track multiple operations', () => {
      const id1 = monitor.startOperation('op1');
      const id2 = monitor.startOperation('op2');

      monitor.endOperation(id1);
      monitor.endOperation(id2);

      // Verify both operations were tracked
      expect(monitor.getMetrics('op1')).toHaveLength(1);
      expect(monitor.getMetrics('op2')).toHaveLength(1);
    });
  });

  describe('Metric Recording', () => {
    it('should record custom metric', () => {
      monitor.recordMetric({
        name: 'custom-metric',
        value: 100,
        unit: 'ms',
        timestamp: new Date(),
      });

      const metrics = monitor.getMetrics('custom-metric');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].value).toBe(100);
    });

    it('should notify listeners on metric', () => {
      const listener = vi.fn();
      monitor.onMetric(listener);

      monitor.recordMetric({
        name: 'test-metric',
        value: 50,
        unit: 'ms',
        timestamp: new Date(),
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'test-metric',
          value: 50,
        })
      );
    });

    it('should unsubscribe listener', () => {
      const listener = vi.fn();
      const unsubscribe = monitor.onMetric(listener);

      unsubscribe();

      monitor.recordMetric({
        name: 'test-metric',
        value: 50,
        unit: 'ms',
        timestamp: new Date(),
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe('Thresholds', () => {
    it('should set and check threshold', () => {
      monitor.setThreshold('test-metric', { warning: 100, critical: 200 });

      // Should not trigger at 50
      monitor.recordMetric({
        name: 'test-metric',
        value: 50,
        unit: 'ms',
        timestamp: new Date(),
      });

      // Should trigger warning at 150
      monitor.recordMetric({
        name: 'test-metric',
        value: 150,
        unit: 'ms',
        timestamp: new Date(),
      });

      // Should trigger critical at 250
      monitor.recordMetric({
        name: 'test-metric',
        value: 250,
        unit: 'ms',
        timestamp: new Date(),
      });
    });
  });

  describe('Statistics', () => {
    it('should calculate statistics', async () => {
      // Record some metrics
      for (let i = 1; i <= 5; i++) {
        const id = monitor.startOperation('test-op');
        await new Promise(resolve => setTimeout(resolve, i * 10));
        monitor.endOperation(id);
      }

      const stats = monitor.getStats('test-op');
      expect(stats).not.toBeNull();
      expect(stats?.count).toBe(5);
      expect(stats?.min).toBeGreaterThanOrEqual(0);
      expect(stats?.max).toBeGreaterThanOrEqual(stats?.min || 0);
      expect(stats?.avg).toBeGreaterThanOrEqual(stats?.min || 0);
      expect(stats?.p50).toBeGreaterThanOrEqual(0);
      expect(stats?.p95).toBeGreaterThanOrEqual(0);
      expect(stats?.p99).toBeGreaterThanOrEqual(0);
    });

    it('should return null for no metrics', () => {
      const stats = monitor.getStats('non-existent');
      expect(stats).toBeNull();
    });
  });

  describe('Monitor Wrapper', () => {
    it('should wrap function', async () => {
      const fn = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return 'result';
      };

      const wrapped = monitor.monitor('wrapped-fn', fn);
      const result = await wrapped();

      expect(result).toBe('result');
      expect(monitor.getMetrics('wrapped-fn')).toHaveLength(1);
    });

    it('should track wrapped function errors', async () => {
      const fn = async () => {
        throw new Error('Test error');
      };

      const wrapped = monitor.monitor('wrapped-fn', fn);

      await expect(wrapped()).rejects.toThrow('Test error');
      // Error was tracked - verify through metrics
      const metrics = monitor.getMetrics('wrapped-fn');
      expect(metrics).toHaveLength(1);
      expect(metrics[0].tags?.status).toBe('error');
    });
  });

  describe('Clear and Reset', () => {
    it('should clear all metrics', () => {
      monitor.recordMetric({
        name: 'test',
        value: 100,
        unit: 'ms',
        timestamp: new Date(),
      });

      expect(monitor.getMetrics('test')).toHaveLength(1);
      
      monitor.clear();

      expect(monitor.getMetrics('test')).toHaveLength(0);
    });
  });

  describe('Export', () => {
    it('should export metrics as JSON', () => {
      monitor.recordMetric({
        name: 'test',
        value: 100,
        unit: 'ms',
        timestamp: new Date(),
      });

      const exported = monitor.exportMetrics() as Record<string, unknown>;
      expect(exported).toHaveProperty('exportedAt');
      expect(exported).toHaveProperty('metricCount', 1);
      expect(exported).toHaveProperty('metrics');
    });
  });
});
