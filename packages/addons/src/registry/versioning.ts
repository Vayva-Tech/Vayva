/**
 * Registry Versioning - Version management and compatibility checking
 * 
 * Provides:
 * - Semantic versioning comparison
 * - Version range parsing and satisfaction
 * - Changelog generation
 * - Migration path detection
 */

// ============================================================================
// Types
// ============================================================================

export interface Version {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

export interface VersionRange {
  operator: '>=' | '>' | '<=' | '<' | '=' | '~' | '^';
  version: Version;
}

export interface CompatibilityMatrix {
  /** Minimum compatible host version */
  minHostVersion: string;
  /** Maximum compatible host version */
  maxHostVersion?: string;
  /** Compatible template versions */
  templateVersions: Record<string, string>;
  /** Incompatible with these add-on versions */
  conflicts: Array<{ addOnId: string; versions: string }>;
}

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: Array<{
    type: 'breaking' | 'feature' | 'fix' | 'security' | 'performance' | 'docs';
    description: string;
    pullRequest?: string;
  }>;
}

export interface MigrationStep {
  fromVersion: string;
  toVersion: string;
  action: 'automatic' | 'manual' | 'none';
  description: string;
  dataTransform?: (data: Record<string, unknown>) => Record<string, unknown>;
}

export interface VersionInfo {
  current: string;
  latest: string;
  isLatest: boolean;
  hasUpdate: boolean;
  updateType: 'major' | 'minor' | 'patch' | 'none';
  changelog: ChangelogEntry[];
  migrationRequired: boolean;
}

// ============================================================================
// Version Parsing
// ============================================================================

export function parseVersion(versionString: string): Version | null {
  const match = versionString.match(
    /^(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.-]+))?(?:\+([a-zA-Z0-9.-]+))?$/
  );

  if (!match) return null;

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4],
    build: match[5],
  };
}

export function versionToString(version: Version): string {
  let result = `${version.major}.${version.minor}.${version.patch}`;
  if (version.prerelease) {
    result += `-${version.prerelease}`;
  }
  if (version.build) {
    result += `+${version.build}`;
  }
  return result;
}

// ============================================================================
// Version Comparison
// ============================================================================

export function compareVersions(v1: Version, v2: Version): number {
  if (v1.major !== v2.major) return v1.major - v2.major;
  if (v1.minor !== v2.minor) return v1.minor - v2.minor;
  if (v1.patch !== v2.patch) return v1.patch - v2.patch;

  // Prerelease versions are lower than release versions
  if (v1.prerelease && !v2.prerelease) return -1;
  if (!v1.prerelease && v2.prerelease) return 1;
  if (v1.prerelease && v2.prerelease) {
    return v1.prerelease.localeCompare(v2.prerelease);
  }

  return 0;
}

export function isGreaterThan(v1: Version | string, v2: Version | string): boolean {
  const version1 = typeof v1 === 'string' ? parseVersion(v1) : v1;
  const version2 = typeof v2 === 'string' ? parseVersion(v2) : v2;
  if (!version1 || !version2) return false;
  return compareVersions(version1, version2) > 0;
}

export function isLessThan(v1: Version | string, v2: Version | string): boolean {
  const version1 = typeof v1 === 'string' ? parseVersion(v1) : v1;
  const version2 = typeof v2 === 'string' ? parseVersion(v2) : v2;
  if (!version1 || !version2) return false;
  return compareVersions(version1, version2) < 0;
}

export function isEqual(v1: Version | string, v2: Version | string): boolean {
  const version1 = typeof v1 === 'string' ? parseVersion(v1) : v1;
  const version2 = typeof v2 === 'string' ? parseVersion(v2) : v2;
  if (!version1 || !version2) return false;
  return compareVersions(version1, version2) === 0;
}

export function satisfies(version: string, range: string): boolean {
  const v = parseVersion(version);
  if (!v) return false;

  const ranges = parseRange(range);
  return ranges.every((r) => satisfiesRange(v, r));
}

// ============================================================================
// Version Range Parsing
// ============================================================================

export function parseRange(rangeString: string): VersionRange[] {
  const ranges: VersionRange[] = [];
  
  // Handle hyphen ranges (e.g., "1.2.3 - 2.3.4")
  const hyphenMatch = rangeString.match(/^(\d+\.\d+\.\d+)\s+-\s+(\d+\.\d+\.\d+)$/);
  if (hyphenMatch) {
    const min = parseVersion(hyphenMatch[1]);
    const max = parseVersion(hyphenMatch[2]);
    if (min && max) {
      return [{ operator: '>=', version: min }, { operator: '<=', version: max }];
    }
  }

  // Handle comma-separated ranges (AND logic)
  const parts = rangeString.split(/\s*,\s*/);
  
  for (const part of parts) {
    const trimmed = part.trim();
    
    // Caret range (^1.2.3)
    const caretMatch = trimmed.match(/^\^(\d+\.\d+\.\d+)$/);
    if (caretMatch) {
      const v = parseVersion(caretMatch[1]);
      if (v) {
        ranges.push({ operator: '>=', version: v });
        ranges.push({ operator: '<', version: { major: v.major + 1, minor: 0, patch: 0 } });
      }
      continue;
    }

    // Tilde range (~1.2.3)
    const tildeMatch = trimmed.match(/^~(\d+\.\d+\.\d+)$/);
    if (tildeMatch) {
      const v = parseVersion(tildeMatch[1]);
      if (v) {
        ranges.push({ operator: '>=', version: v });
        ranges.push({ operator: '<', version: { major: v.major, minor: v.minor + 1, patch: 0 } });
      }
      continue;
    }

    // Standard range operators
    const opMatch = trimmed.match(/^(>=|>|<=|<|=)?(\d+\.\d+\.\d+)$/);
    if (opMatch) {
      const operator = (opMatch[1] || '=') as VersionRange['operator'];
      const v = parseVersion(opMatch[2]);
      if (v) {
        ranges.push({ operator, version: v });
      }
    }
  }

  return ranges;
}

function satisfiesRange(version: Version, range: VersionRange): boolean {
  const comparison = compareVersions(version, range.version);

  switch (range.operator) {
    case '>=':
      return comparison >= 0;
    case '>':
      return comparison > 0;
    case '<=':
      return comparison <= 0;
    case '<':
      return comparison < 0;
    case '=':
      return comparison === 0;
    case '~':
    case '^':
      return comparison >= 0;
    default:
      return false;
  }
}

// ============================================================================
// Update Type Detection
// ============================================================================

export function getUpdateType(
  currentVersion: string,
  newVersion: string
): 'major' | 'minor' | 'patch' | 'none' {
  const current = parseVersion(currentVersion);
  const next = parseVersion(newVersion);
  
  if (!current || !next) return 'none';

  if (next.major !== current.major) return 'major';
  if (next.minor !== current.minor) return 'minor';
  if (next.patch !== current.patch) return 'patch';
  return 'none';
}

export function isBreakingChange(
  currentVersion: string,
  newVersion: string
): boolean {
  return getUpdateType(currentVersion, newVersion) === 'major';
}

// ============================================================================
// Versioning Engine
// ============================================================================

export class VersioningEngine {
  private versions: Map<string, string[]> = new Map(); // addOnId -> versions
  private changelogs: Map<string, ChangelogEntry[]> = new Map();
  private compatibility: Map<string, CompatibilityMatrix> = new Map();

  /**
   * Register a new version of an add-on
   */
  registerVersion(
    addOnId: string,
    version: string,
    compatibility: CompatibilityMatrix,
    changelog: ChangelogEntry
  ): void {
    const versions = this.versions.get(addOnId) || [];
    
    if (!versions.includes(version)) {
      versions.push(version);
      versions.sort((a, b) => {
        const va = parseVersion(a)!;
        const vb = parseVersion(b)!;
        return compareVersions(va, vb);
      });
    }
    
    this.versions.set(addOnId, versions);
    this.compatibility.set(`${addOnId}@${version}`, compatibility);
    
    const changelogs = this.changelogs.get(addOnId) || [];
    changelogs.push(changelog);
    this.changelogs.set(addOnId, changelogs);
  }

  /**
   * Get all versions for an add-on
   */
  getVersions(addOnId: string): string[] {
    return [...(this.versions.get(addOnId) || [])];
  }

  /**
   * Get latest version for an add-on
   */
  getLatestVersion(addOnId: string): string | null {
    const versions = this.versions.get(addOnId);
    return versions?.[versions.length - 1] || null;
  }

  /**
   * Get version info for an installed add-on
   */
  getVersionInfo(
    addOnId: string,
    currentVersion: string,
    _hostVersion: string
  ): VersionInfo {
    const latest = this.getLatestVersion(addOnId);

    if (!latest) {
      return {
        current: currentVersion,
        latest: currentVersion,
        isLatest: true,
        hasUpdate: false,
        updateType: 'none',
        changelog: [],
        migrationRequired: false,
      };
    }

    const isLatest = currentVersion === latest;
    const hasUpdate = isGreaterThan(latest, currentVersion);
    const updateType = hasUpdate
      ? getUpdateType(currentVersion, latest)
      : 'none';

    // Get changelog entries between current and latest
    const changelog = this.getChangelogRange(addOnId, currentVersion, latest);

    // Check if migration is required
    const migrationRequired = changelog.some((entry) =>
      entry.changes.some((c) => c.type === 'breaking')
    );

    return {
      current: currentVersion,
      latest,
      isLatest,
      hasUpdate,
      updateType,
      changelog,
      migrationRequired,
    };
  }

  /**
   * Check if an add-on version is compatible with the host
   */
  isCompatible(
    addOnId: string,
    version: string,
    hostVersion: string,
    templateId?: string,
    templateVersion?: string
  ): { compatible: boolean; reason?: string } {
    const matrix = this.compatibility.get(`${addOnId}@${version}`);
    
    if (!matrix) {
      return { compatible: false, reason: 'No compatibility information available' };
    }

    // Check host version
    const hostV = parseVersion(hostVersion);
    const minHost = parseVersion(matrix.minHostVersion);
    const maxHost = matrix.maxHostVersion ? parseVersion(matrix.maxHostVersion) : null;

    if (!hostV || !minHost) {
      return { compatible: false, reason: 'Invalid version format' };
    }

    if (isLessThan(hostV, minHost)) {
      return {
        compatible: false,
        reason: `Requires host version >= ${matrix.minHostVersion}`,
      };
    }

    if (maxHost && isGreaterThan(hostV, maxHost)) {
      return {
        compatible: false,
        reason: `Not compatible with host version > ${matrix.maxHostVersion}`,
      };
    }

    // Check template compatibility if provided
    if (templateId && templateVersion && matrix.templateVersions[templateId]) {
      const requiredTemplateVersion = matrix.templateVersions[templateId];
      if (!satisfies(templateVersion, requiredTemplateVersion)) {
        return {
          compatible: false,
          reason: `Requires template ${templateId} version ${requiredTemplateVersion}`,
        };
      }
    }

    return { compatible: true };
  }

  /**
   * Find best compatible version for given host
   */
  findBestVersion(
    addOnId: string,
    hostVersion: string,
    templateId?: string,
    templateVersion?: string
  ): string | null {
    const versions = this.getVersions(addOnId);
    
    for (let i = versions.length - 1; i >= 0; i--) {
      const check = this.isCompatible(
        addOnId,
        versions[i],
        hostVersion,
        templateId,
        templateVersion
      );
      if (check.compatible) {
        return versions[i];
      }
    }
    
    return null;
  }

  /**
   * Get changelog for a specific version or range
   */
  getChangelog(
    addOnId: string,
    fromVersion?: string,
    toVersion?: string
  ): ChangelogEntry[] {
    const all = this.changelogs.get(addOnId) || [];
    
    if (!fromVersion && !toVersion) {
      return [...all];
    }

    return this.getChangelogRange(addOnId, fromVersion, toVersion);
  }

  /**
   * Generate release notes for an update
   */
  generateReleaseNotes(
    addOnId: string,
    fromVersion: string,
    toVersion: string
  ): string {
    const changelog = this.getChangelogRange(addOnId, fromVersion, toVersion);
    
    let notes = `## What's New\n\n`;
    
    changelog.forEach((entry) => {
      notes += `### ${entry.version} (${entry.date})\n\n`;
      
      entry.changes.forEach((change) => {
        const emoji = {
          breaking: '⚠️',
          feature: '✨',
          fix: '🐛',
          security: '🔒',
          performance: '⚡',
          docs: '📚',
        }[change.type];
        
        notes += `- ${emoji} ${change.description}\n`;
      });
      
      notes += '\n';
    });

    return notes;
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private getChangelogRange(
    addOnId: string,
    fromVersion?: string,
    toVersion?: string
  ): ChangelogEntry[] {
    const all = this.changelogs.get(addOnId) || [];
    
    return all.filter((entry) => {
      const entryV = parseVersion(entry.version);
      if (!entryV) return false;

      let include = true;
      
      if (fromVersion) {
        const fromV = parseVersion(fromVersion);
        if (fromV && isLessThan(entryV, fromV)) {
          include = false;
        }
      }
      
      if (toVersion) {
        const toV = parseVersion(toVersion);
        if (toV && isGreaterThan(entryV, toV)) {
          include = false;
        }
      }
      
      return include;
    });
  }
}

// ============================================================================
// Static Utilities
// ============================================================================

export function createVersioningEngine(): VersioningEngine {
  return new VersioningEngine();
}

export function isValidVersion(version: string): boolean {
  return parseVersion(version) !== null;
}

export function bumpVersion(
  version: string,
  type: 'major' | 'minor' | 'patch'
): string {
  const v = parseVersion(version);
  if (!v) return version;

  switch (type) {
    case 'major':
      return versionToString({ ...v, major: v.major + 1, minor: 0, patch: 0 });
    case 'minor':
      return versionToString({ ...v, minor: v.minor + 1, patch: 0 });
    case 'patch':
      return versionToString({ ...v, patch: v.patch + 1 });
  }
}

export default VersioningEngine;
