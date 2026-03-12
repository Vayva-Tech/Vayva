/**
 * Registry Module - Add-on discovery, versioning, and compatibility
 * 
 * Exports:
 * - DiscoveryEngine: Search, filter, and discovery
 * - VersioningEngine: Semantic versioning and compatibility
 * - CompatibilityEngine: Dependency resolution and conflict detection
 */

export { DiscoveryEngine } from './discovery';
export type {
  DiscoveryFilter,
  DiscoverySort,
  DiscoveryOptions,
  DiscoveryResult,
  FeaturedAddOns,
} from './discovery';

export {
  VersioningEngine,
  parseVersion,
  versionToString,
  compareVersions,
  isGreaterThan,
  isLessThan,
  isEqual,
  satisfies,
  parseRange,
  getUpdateType,
  isBreakingChange,
  createVersioningEngine,
  isValidVersion,
  bumpVersion,
} from './versioning';
export type {
  Version,
  VersionRange,
  CompatibilityMatrix,
  ChangelogEntry,
  MigrationStep,
  VersionInfo,
} from './versioning';

export {
  CompatibilityEngine,
  createCompatibilityEngine,
  checkTemplateCompatibility,
} from './compatibility';
export type {
  Dependency,
  CompatibilityCheck,
  DependencyCheck,
  ConflictCheck,
  InstallationPlan,
  TemplateCapability,
} from './compatibility';
