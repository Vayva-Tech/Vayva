/**
 * HIPAA Encryption Service Unit Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EncryptionService, InMemoryKeyManager, createEncryptionService } from '../src/hipaa/EncryptionService';

describe('EncryptionService', () => {
  let keyManager: InMemoryKeyManager;
  let encryptionService: EncryptionService;

  beforeEach(async () => {
    keyManager = new InMemoryKeyManager();
    encryptionService = new EncryptionService(keyManager);
    await encryptionService.initialize();
  });

  describe('encryptAtRest()', () => {
    it('successfully encrypts data', async () => {
      const testData = 'sensitive PHI data';
      
      const encrypted = await encryptionService.encryptAtRest(testData);
      
      expect(encrypted).toHaveProperty('encryptedData');
      expect(encrypted).toHaveProperty('iv');
      expect(encrypted).toHaveProperty('authTag');
      expect(encrypted).toHaveProperty('keyId');
      expect(encrypted.encryptedData).not.toBe(testData);
    });

    it('produces different ciphertext for same plaintext (due to random IV)', async () => {
      const testData = 'same data';
      
      const encrypted1 = await encryptionService.encryptAtRest(testData);
      const encrypted2 = await encryptionService.encryptAtRest(testData);
      
      expect(encrypted1.encryptedData).not.toBe(encrypted2.encryptedData);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
    });

    it('throws error when no key is available', async () => {
      const emptyKeyManager = new InMemoryKeyManager();
      const service = new EncryptionService(emptyKeyManager);
      
      await expect(service.encryptAtRest('test')).rejects.toThrow('No encryption key available');
    });

    it('uses provided keyId instead of default', async () => {
      const { keyId: customKeyId } = await keyManager.generateKey();
      const testData = 'test data';
      
      const encrypted = await encryptionService.encryptAtRest(testData, customKeyId);
      
      expect(encrypted.keyId).toBe(customKeyId);
    });
  });

  describe('decryptAtRest()', () => {
    it('successfully decrypts data', async () => {
      const testData = 'sensitive PHI data';
      const encrypted = await encryptionService.encryptAtRest(testData);
      
      const decrypted = await encryptionService.decryptAtRest(encrypted);
      
      expect(decrypted).toBe(testData);
    });

    it('fails with wrong key', async () => {
      const testData = 'test data';
      const encrypted = await encryptionService.encryptAtRest(testData);
      
      // Generate new key and try to decrypt with it
      const { keyId: newKeyId } = await keyManager.generateKey();
      encrypted.keyId = newKeyId;
      
      await expect(encryptionService.decryptAtRest(encrypted)).rejects.toThrow();
    });

    it('fails with tampered auth tag', async () => {
      const testData = 'test data';
      const encrypted = await encryptionService.encryptAtRest(testData);
      
      // Tamper with auth tag
      encrypted.authTag = 'tampered-tag';
      
      await expect(encryptionService.decryptAtRest(encrypted)).rejects.toThrow();
    });

    it('fails with tampered ciphertext', async () => {
      const testData = 'test data';
      const encrypted = await encryptionService.encryptAtRest(testData);
      
      // Tamper with encrypted data
      encrypted.encryptedData = 'tampered-' + encrypted.encryptedData;
      
      await expect(encryptionService.decryptAtRest(encrypted)).rejects.toThrow();
    });
  });

  describe('encryptField() and decryptField()', () => {
    it('encrypts and decrypts database field', async () => {
      const fieldValue = 'patient-ssn-123-45-6789';
      
      const encryptedJson = await encryptionService.encryptField(fieldValue);
      const decrypted = await encryptionService.decryptField(encryptedJson);
      
      expect(decrypted).toBe(fieldValue);
    });

    it('returns JSON string suitable for database storage', async () => {
      const fieldValue = 'test value';
      
      const encryptedJson = await encryptionService.encryptField(fieldValue);
      
      expect(typeof encryptedJson).toBe('string');
      expect(() => JSON.parse(encryptedJson)).not.toThrow();
      
      const parsed = JSON.parse(encryptedJson);
      expect(parsed).toHaveProperty('encryptedData');
      expect(parsed).toHaveProperty('iv');
      expect(parsed).toHaveProperty('authTag');
    });
  });

  describe('encryptInTransit() and decryptInTransit()', () => {
    it('encrypts data for transmission', async () => {
      const testData = 'data to transmit';
      
      const encrypted = await encryptionService.encryptInTransit(testData);
      const decrypted = await encryptionService.decryptInTransit(encrypted);
      
      expect(decrypted).toBe(testData);
    });
  });

  describe('rotateKey()', () => {
    it('generates new encryption key', async () => {
      const oldKeyId = encryptionService.getCurrentKeyId();
      
      const newKeyId = await encryptionService.rotateKey();
      
      expect(newKeyId).not.toBe(oldKeyId);
      expect(encryptionService.getCurrentKeyId()).toBe(newKeyId);
    });

    it('calls reencryptData callback if provided', async () => {
      const reencryptMock = vi.fn().mockResolvedValue(undefined);
      const oldKeyId = encryptionService.getCurrentKeyId();
      
      await encryptionService.rotateKey(reencryptMock);
      
      expect(reencryptMock).toHaveBeenCalledWith(oldKeyId, expect.any(String));
    });
  });

  describe('verifyConfiguration()', () => {
    it('returns true when properly configured', async () => {
      const isValid = await encryptionService.verifyConfiguration();
      
      expect(isValid).toBe(true);
    });

    it('returns false when no default key is set', async () => {
      const service = new EncryptionService(new InMemoryKeyManager());
      
      const isValid = await service.verifyConfiguration();
      
      expect(isValid).toBe(false);
    });

    it('performs actual encryption/decryption test', async () => {
      const spy = vi.spyOn(keyManager, 'getKey');
      
      await encryptionService.verifyConfiguration();
      
      expect(spy).toHaveBeenCalled();
    });
  });

  describe('createEncryptionService()', () => {
    it('creates service with default key manager', () => {
      const service = createEncryptionService();
      
      expect(service).toBeInstanceOf(EncryptionService);
    });

    it('creates service with custom key manager', () => {
      const customKeyManager = new InMemoryKeyManager();
      const service = createEncryptionService(customKeyManager);
      
      expect(service).toBeInstanceOf(EncryptionService);
    });
  });

  describe('InMemoryKeyManager', () => {
    it('generates key with correct length', async () => {
      const keyManager = new InMemoryKeyManager();
      const { key } = await keyManager.generateKey();
      
      expect(key.length).toBe(32); // 256 bits = 32 bytes
    });

    it('retrieves stored key', async () => {
      const keyManager = new InMemoryKeyManager();
      const { keyId, key } = await keyManager.generateKey();
      
      const retrieved = await keyManager.getKey(keyId);
      
      expect(retrieved).toEqual(key);
    });

    it('throws error when key not found', async () => {
      const keyManager = new InMemoryKeyManager();
      
      await expect(keyManager.getKey('non-existent-key')).rejects.toThrow('Encryption key not found');
    });

    it('loads key directly', async () => {
      const keyManager = new InMemoryKeyManager();
      const crypto = require('crypto');
      const testKey = crypto.randomBytes(32);
      
      keyManager.loadKey('test-key', testKey);
      
      const retrieved = await keyManager.getKey('test-key');
      expect(retrieved).toEqual(testKey);
    });
  });
});
