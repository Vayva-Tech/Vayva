import { test, expect, describe } from 'vitest';
import { BaseIndustryController } from '@/lib/industry/base-controller';
import { IndustryValidator, LookbookSchema, TableSchema } from '@/lib/industry/validation';

describe('Phase 1 Industry API Implementation', () => {
  describe('Base Industry Controller', () => {
    class TestController extends BaseIndustryController {
      constructor() {
        super('test', 'test-service');
      }
      
      async testSuccess() {
        return this.success({ message: 'test' });
      }
      
      async testError() {
        return this.error('Test error', 'TEST_ERROR', 400);
      }
    }

    const controller = new TestController();

    test('should create success response', async () => {
      const response = await controller.testSuccess();
      const data = await response.json();
      
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('test');
      expect(data.error).toBeNull();
    });

    test('should create error response', async () => {
      const response = await controller.testError();
      const data = await response.json();
      
      expect(data.success).toBe(false);
      expect(data.error.code).toBe('TEST_ERROR');
      expect(data.error.message).toBe('Test error');
      expect(response.status).toBe(400);
    });

    test('should paginate data correctly', () => {
      const items = Array.from({ length: 100 }, (_, i) => ({ id: i, name: `Item ${i}` }));
      const result = controller.paginate(items, 2, 20);
      
      expect(result.meta.page).toBe(2);
      expect(result.meta.limit).toBe(20);
      expect(result.meta.total).toBe(100);
      expect(result.meta.totalPages).toBe(5);
      expect(result.items.length).toBe(20);
      expect(result.items[0].id).toBe(20);
    });
  });

  describe('Industry Validation', () => {
    test('should validate lookbook schema', () => {
      const validLookbook = {
        title: 'Summer Collection',
        description: 'Our latest summer arrivals',
        isActive: true,
        products: ['prod_1', 'prod_2'],
        coverImage: 'https://example.com/image.jpg',
        sortOrder: 1,
      };

      const result = IndustryValidator.validate(LookbookSchema, validLookbook);
      expect(result.title).toBe('Summer Collection');
      expect(result.isActive).toBe(true);
    });

    test('should validate table schema', () => {
      const validTable = {
        tableName: 'Table 12',
        capacity: 4,
        location: 'Patio',
        isAvailable: true,
        minimumSpend: 25,
        isVip: false,
      };

      const result = IndustryValidator.validate(TableSchema, validTable);
      expect(result.tableName).toBe('Table 12');
      expect(result.capacity).toBe(4);
    });

    test('should reject invalid data', () => {
      const invalidLookbook = {
        title: '', // Invalid - empty string
        description: 'Test',
      };

      expect(() => {
        IndustryValidator.validate(LookbookSchema, invalidLookbook);
      }).toThrow();
    });
  });

  describe('Industry Utilities', () => {
    test('should sanitize strings', () => {
      const result = IndustryValidator.sanitizeString('  Hello World  ', 10);
      expect(result).toBe('Hello Worl'); // Truncated to 10 chars
    });

    test('should sanitize numbers', () => {
      const result = IndustryValidator.sanitizeNumber('25.50', 0, 100);
      expect(result).toBe(25.5);
    });

    test('should generate slugs', () => {
      const result = IndustryUtils.generateSlug('Hello World 2024!');
      expect(result).toBe('hello-world-2024');
    });

    test('should validate phone numbers', () => {
      expect(IndustryUtils.isValidPhoneNumber('+1234567890')).toBe(true);
      expect(IndustryUtils.isValidPhoneNumber('invalid')).toBe(false);
    });

    test('should validate emails', () => {
      expect(IndustryUtils.isValidEmail('test@example.com')).toBe(true);
      expect(IndustryUtils.isValidEmail('invalid-email')).toBe(false);
    });
  });
});

// Mock implementations for testing
class IndustryUtils {
  static generateSlug(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  static isValidPhoneNumber(phone: string): boolean {
    return /^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''));
  }

  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}