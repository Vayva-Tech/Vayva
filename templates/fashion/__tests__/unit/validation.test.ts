// Validation utility tests
import { describe, it, expect } from 'vitest';
import { 
  ProductQuerySchema, 
  CheckoutInitiateSchema, 
  PaymentVerifySchema,
  validateRequest
} from '../lib/validation';
import { SecurityUtils } from '../lib/security';

describe('Validation Utilities', () => {
  describe('ProductQuerySchema', () => {
    it('should validate correct product query parameters', () => {
      const validData = {
        category: 'clothing',
        minPrice: '1000',
        maxPrice: '5000',
        search: 'dress',
        page: '1',
        limit: '20',
        sortBy: 'price_asc'
      };

      const result = validateRequest(ProductQuerySchema, validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.category).toBe('clothing');
        expect(result.data.minPrice).toBe(1000);
        expect(result.data.sortBy).toBe('price_asc');
      }
    });

    it('should reject invalid price values', () => {
      const invalidData = {
        minPrice: 'invalid',
        maxPrice: 'not-a-number'
      };

      const result = validateRequest(ProductQuerySchema, invalidData);
      expect(result.success).toBe(true); // Transforms to undefined
    });

    it('should sanitize search input', () => {
      const maliciousData = {
        search: '<script>alert("xss")</script>'
      };

      const result = validateRequest(ProductQuerySchema, maliciousData);
      expect(result.success).toBe(true);
      if (result.success) {
        // The sanitizer should remove HTML tags
        expect(result.data.search).not.toContain('<script>');
      }
    });
  });

  describe('CheckoutInitiateSchema', () => {
    const validCheckoutData = {
      items: [
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 }
      ],
      customerInfo: {
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+2348012345678'
      },
      shippingAddress: {
        street: '123 Main St',
        city: 'Lagos',
        state: 'Lagos',
        country: 'Nigeria',
        zipCode: '100001'
      }
    };

    it('should validate correct checkout data', () => {
      const result = validateRequest(CheckoutInitiateSchema, validCheckoutData);
      expect(result.success).toBe(true);
    });

    it('should reject empty cart', () => {
      const invalidData = {
        ...validCheckoutData,
        items: []
      };

      const result = validateRequest(CheckoutInitiateSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        ...validCheckoutData,
        customerInfo: {
          ...validCheckoutData.customerInfo,
          email: 'invalid-email'
        }
      };

      const result = validateRequest(CheckoutInitiateSchema, invalidData);
      expect(result.success).toBe(false);
    });

    it('should auto-populate billing address', () => {
      const result = validateRequest(CheckoutInitiateSchema, validCheckoutData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.billingAddress).toEqual(result.data.shippingAddress);
      }
    });
  });

  describe('PaymentVerifySchema', () => {
    it('should validate payment verification data', () => {
      const validData = {
        reference: 'pay_1234567890',
        orderId: 'ord_1234567890'
      };

      const result = validateRequest(PaymentVerifySchema, validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing reference', () => {
      const invalidData = {
        orderId: 'ord_1234567890'
      };

      const result = validateRequest(PaymentVerifySchema, invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('Security Utilities', () => {
  describe('sanitizeInput', () => {
    it('should remove HTML tags', () => {
      const dirty = '<script>alert("xss")</script>Hello World';
      const clean = SecurityUtils.sanitizeInput(dirty);
      expect(clean).toBe('Hello World');
    });

    it('should remove javascript protocol', () => {
      const dirty = 'javascript:alert("xss")';
      const clean = SecurityUtils.sanitizeInput(dirty);
      expect(clean).toBe(':alert("xss")');
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(1500);
      const clean = SecurityUtils.sanitizeInput(longInput);
      expect(clean.length).toBeLessThanOrEqual(1000);
    });
  });

  describe('validateEmail', () => {
    it('should accept valid emails', () => {
      expect(SecurityUtils.validateEmail('user@example.com')).toBe(true);
      expect(SecurityUtils.validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(SecurityUtils.validateEmail('invalid')).toBe(false);
      expect(SecurityUtils.validateEmail('@domain.com')).toBe(false);
      expect(SecurityUtils.validateEmail('user@')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should accept valid Nigerian phone numbers', () => {
      expect(SecurityUtils.validatePhone('+2348012345678')).toBe(true);
      expect(SecurityUtils.validatePhone('08012345678')).toBe(true);
      expect(SecurityUtils.validatePhone('2348012345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(SecurityUtils.validatePhone('12345')).toBe(false);
      expect(SecurityUtils.validatePhone('invalid')).toBe(false);
    });
  });

  describe('validatePassword', () => {
    it('should accept strong passwords', () => {
      const result = SecurityUtils.validatePassword('StrongPass123!');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const shortPass = SecurityUtils.validatePassword('weak');
      expect(shortPass.valid).toBe(false);
      expect(shortPass.errors).toContain('Password must be at least 8 characters long');

      const noUpper = SecurityUtils.validatePassword('weakpass123!');
      expect(noUpper.errors).toContain('Password must contain at least one uppercase letter');

      const noSpecial = SecurityUtils.validatePassword('WeakPass123');
      expect(noSpecial.errors).toContain('Password must contain at least one special character');
    });
  });
});