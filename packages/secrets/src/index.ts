/**
 * Vayva Secrets Management Package
 * 
 * Enterprise-grade secrets management supporting:
 * - HashiCorp Vault
 * - AWS Secrets Manager
 * - Azure Key Vault
 */

export {
  VaultClient,
  initializeVault,
  getVaultClient,
  getSecret,
  setSecret,
} from './vault';

export type {
  VaultConfig,
  SecretVersion,
  SecretMetadata,
  SecretValue,
} from './vault';
