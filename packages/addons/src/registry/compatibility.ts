/**
 * Registry Compatibility - Add-on compatibility checking and dependency resolution
 * 
 * Provides:
 * - Template compatibility checking
 * - Add-on dependency resolution
 * - Conflict detection
 * - Installation order calculation
 */

import type { AddOnDefinition } from '../types';
import { satisfies } from './versioning';

// ============================================================================
// Types
// ============================================================================

export interface Dependency {
  /** Add-on ID or "template:*" for template features */
  addOnId: string;
  /** Version constraint (e.g., ">=1.0.0", "^2.0.0") */
  versionConstraint: string;
  /** Whether this is optional */
  optional: boolean;
  /** Reason for dependency */
  reason?: string;
}

export interface CompatibilityCheck {
  addOnId: string;
  compatible: boolean;
  dependencies: DependencyCheck[];
  conflicts: ConflictCheck[];
  missingRequirements: string[];
  errors: string[];
  warnings: string[];
}

export interface DependencyCheck {
  dependency: Dependency;
  satisfied: boolean;
  installedVersion?: string;
  error?: string;
}

export interface ConflictCheck {
  addOnId: string;
  reason: string;
  severity: 'error' | 'warning';
}

export interface InstallationPlan {
  /** Add-ons in installation order */
  installOrder: string[];
  /** Add-ons that need updating first */
  updatesRequired: Array<{ addOnId: string; fromVersion: string; toVersion: string }>;
  /** Unresolvable conflicts */
  conflicts: ConflictCheck[];
  /** Optional dependencies that could be added */
  recommended: string[];
  /** Valid */
  valid: boolean;
}

export interface TemplateCapability {
  id: string;
  name: string;
  description: string;
  available: boolean;
}

// ============================================================================
// Compatibility Engine
// ============================================================================

export class CompatibilityEngine {
  private addOns: Map<string, AddOnDefinition> = new Map();
  private installed: Map<string, string> = new Map(); // addOnId -> version
  private templateCapabilities: Set<string> = new Set();
  private conflicts: Map<string, string[]> = new Map(); // addOnId -> conflicting add-on IDs

  /**
   * Register an available add-on
   */
  registerAddOn(addOn: AddOnDefinition): void {
    this.addOns.set(addOn.id, addOn);
  }

  /**
   * Set currently installed add-ons
   */
  setInstalled(installed: Map<string, string> | Record<string, string>): void {
    this.installed = installed instanceof Map 
      ? new Map(installed) 
      : new Map(Object.entries(installed));
  }

  /**
   * Set template capabilities
   */
  setTemplateCapabilities(capabilities: string[]): void {
    this.templateCapabilities = new Set(capabilities);
  }

  /**
   * Register known conflicts between add-ons
   */
  registerConflict(addOnId1: string, addOnId2: string, _reason: string): void {
    const c1 = this.conflicts.get(addOnId1) || [];
    const c2 = this.conflicts.get(addOnId2) || [];
    
    if (!c1.includes(addOnId2)) c1.push(addOnId2);
    if (!c2.includes(addOnId1)) c2.push(addOnId1);
    
    this.conflicts.set(addOnId1, c1);
    this.conflicts.set(addOnId2, c2);
  }

  /**
   * Check compatibility for a single add-on
   */
  checkCompatibility(addOnId: string): CompatibilityCheck {
    const addOn = this.addOns.get(addOnId);
    if (!addOn) {
      return {
        addOnId,
        compatible: false,
        dependencies: [],
        conflicts: [],
        missingRequirements: [],
        errors: ['Add-on not found in registry'],
        warnings: [],
      };
    }

    const result: CompatibilityCheck = {
      addOnId,
      compatible: true,
      dependencies: [],
      conflicts: [],
      missingRequirements: [],
      errors: [],
      warnings: [],
    };

    // Check dependencies
    const requires = addOn.requires || [];
    for (const req of requires) {
      // Parse dependency string (e.g., "vayva.core>=1.0.0" or "feature:analytics")
      const depCheck = this.parseAndCheckDependency(req);
      result.dependencies.push(depCheck);
      
      if (!depCheck.satisfied && !depCheck.dependency.optional) {
        result.compatible = false;
        result.errors.push(
          `Missing required dependency: ${depCheck.dependency.addOnId}${
            depCheck.error ? ` (${depCheck.error})` : ''
          }`
        );
      }
    }

    // Check for conflicts
    const conflicts = this.conflicts.get(addOnId) || [];
    for (const conflictId of conflicts) {
      if (this.installed.has(conflictId)) {
        const conflict: ConflictCheck = {
          addOnId: conflictId,
          reason: 'Conflicting add-on is already installed',
          severity: 'error',
        };
        result.conflicts.push(conflict);
        result.compatible = false;
        result.errors.push(`Conflicts with installed add-on: ${conflictId}`);
      }
    }

    // Check template compatibility
    const compatibleTemplates = addOn.compatibleTemplates || [];
    if (compatibleTemplates.length > 0 && !compatibleTemplates.includes('*')) {
      // Check if any capability matches template requirements
      const hasMatch = compatibleTemplates.some((template) =>
        this.templateCapabilities.has(template)
      );
      if (!hasMatch) {
        result.warnings.push(
          `Add-on designed for templates: ${compatibleTemplates.join(', ')}`
        );
      }
    }

    return result;
  }

  /**
   * Check compatibility for multiple add-ons
   */
  checkMultiple(addOnIds: string[]): Record<string, CompatibilityCheck> {
    const results: Record<string, CompatibilityCheck> = {};
    
    for (const id of addOnIds) {
      results[id] = this.checkCompatibility(id);
    }
    
    // Additional cross-checks
    this.checkCrossDependencies(addOnIds, results);
    
    return results;
  }

  /**
   * Create installation plan for a set of add-ons
   */
  createInstallationPlan(desiredAddOnIds: string[]): InstallationPlan {
    const plan: InstallationPlan = {
      installOrder: [],
      updatesRequired: [],
      conflicts: [],
      recommended: [],
      valid: true,
    };

    // Collect all dependencies
    const allDeps = new Set<string>(desiredAddOnIds);
    const toProcess = [...desiredAddOnIds];
    const processed = new Set<string>();

    while (toProcess.length > 0) {
      const current = toProcess.pop()!;
      if (processed.has(current)) continue;
      processed.add(current);

      const addOn = this.addOns.get(current);
      if (!addOn) {
        plan.conflicts.push({
          addOnId: current,
          reason: 'Add-on not found',
          severity: 'error',
        });
        plan.valid = false;
        continue;
      }

      // Check dependencies
      for (const req of addOn.requires || []) {
        const dep = this.parseDependencyString(req);
        if (dep && !dep.optional && !dep.addOnId.startsWith('feature:')) {
          if (!allDeps.has(dep.addOnId) && !this.installed.has(dep.addOnId)) {
            allDeps.add(dep.addOnId);
            toProcess.push(dep.addOnId);
            plan.recommended.push(dep.addOnId);
          }

          // Check if update needed
          const installedVersion = this.installed.get(dep.addOnId);
          if (installedVersion && !satisfies(installedVersion, dep.versionConstraint)) {
            plan.updatesRequired.push({
              addOnId: dep.addOnId,
              fromVersion: installedVersion,
              toVersion: 'latest', // Would be resolved from registry
            });
          }
        }
      }

      // Check conflicts
      const conflicts = this.conflicts.get(current) || [];
      for (const conflictId of conflicts) {
        if (allDeps.has(conflictId) || this.installed.has(conflictId)) {
          plan.conflicts.push({
            addOnId: conflictId,
            reason: `Conflicts with ${current}`,
            severity: 'error',
          });
          plan.valid = false;
        }
      }
    }

    // Calculate installation order (topological sort)
    plan.installOrder = this.calculateInstallOrder(Array.from(allDeps));

    return plan;
  }

  /**
   * Get missing dependencies for an add-on
   */
  getMissingDependencies(addOnId: string): Dependency[] {
    const addOn = this.addOns.get(addOnId);
    if (!addOn) return [];

    const missing: Dependency[] = [];
    
    for (const req of addOn.requires || []) {
      const check = this.parseAndCheckDependency(req);
      if (!check.satisfied && !check.dependency.optional) {
        missing.push(check.dependency);
      }
    }

    return missing;
  }

  /**
   * Check if an add-on can be safely uninstalled
   */
  canUninstall(addOnId: string): { canUninstall: boolean; usedBy: string[] } {
    const usedBy: string[] = [];

    // Check which installed add-ons depend on this one
    for (const [installedId, _] of this.installed) {
      if (installedId === addOnId) continue;
      
      const addOn = this.addOns.get(installedId);
      if (!addOn) continue;

      const depends = addOn.requires?.some((req) => {
        const dep = this.parseDependencyString(req);
        return dep?.addOnId === addOnId;
      });

      if (depends) {
        usedBy.push(installedId);
      }
    }

    return {
      canUninstall: usedBy.length === 0,
      usedBy,
    };
  }

  // ==========================================================================
  // Private Methods
  // ==========================================================================

  private parseDependencyString(depString: string): Dependency | null {
    // Parse formats like:
    // "vayva.core>=1.0.0"
    // "vayva.core" (any version)
    // "feature:analytics" (template feature)
    
    const match = depString.match(/^([a-z0-9._:-]+)(?:([>=<^~]+)(\d+\.\d+\.\d+))?$/);
    if (!match) return null;

    const addOnId = match[1];
    const operator = match[2] as Dependency['versionConstraint'] || '*';
    const version = match[3] || '*';

    return {
      addOnId,
      versionConstraint: operator === '*' ? '*' : `${operator}${version}`,
      optional: false,
    };
  }

  private parseAndCheckDependency(depString: string): DependencyCheck {
    const dep = this.parseDependencyString(depString);
    if (!dep) {
      return {
        dependency: { addOnId: depString, versionConstraint: '*', optional: false },
        satisfied: false,
        error: 'Invalid dependency format',
      };
    }

    // Check template features
    if (dep.addOnId.startsWith('feature:')) {
      const feature = dep.addOnId.replace('feature:', '');
      const hasFeature = this.templateCapabilities.has(feature);
      return {
        dependency: dep,
        satisfied: hasFeature,
        error: hasFeature ? undefined : `Template feature '${feature}' not available`,
      };
    }

    // Check installed add-ons
    const installedVersion = this.installed.get(dep.addOnId);
    if (!installedVersion) {
      return {
        dependency: dep,
        satisfied: false,
        error: 'Not installed',
      };
    }

    // Check version constraint
    if (dep.versionConstraint !== '*' && !satisfies(installedVersion, dep.versionConstraint)) {
      return {
        dependency: dep,
        satisfied: false,
        installedVersion,
        error: `Version ${installedVersion} does not satisfy ${dep.versionConstraint}`,
      };
    }

    return {
      dependency: dep,
      satisfied: true,
      installedVersion,
    };
  }

  private checkCrossDependencies(
    addOnIds: string[],
    results: Record<string, CompatibilityCheck>
  ): void {
    // Check for version conflicts between requested add-ons
    for (let i = 0; i < addOnIds.length; i++) {
      for (let j = i + 1; j < addOnIds.length; j++) {
        const id1 = addOnIds[i];
        const id2 = addOnIds[j];
        
        // Check if they conflict
        const conflicts1 = this.conflicts.get(id1) || [];
        if (conflicts1.includes(id2)) {
          results[id1].conflicts.push({
            addOnId: id2,
            reason: 'Direct conflict',
            severity: 'error',
          });
          results[id1].compatible = false;
          
          results[id2].conflicts.push({
            addOnId: id1,
            reason: 'Direct conflict',
            severity: 'error',
          });
          results[id2].compatible = false;
        }
      }
    }
  }

  private calculateInstallOrder(addOnIds: string[]): string[] {
    // Build dependency graph
    const graph = new Map<string, Set<string>>();
    
    for (const id of addOnIds) {
      graph.set(id, new Set());
      
      const addOn = this.addOns.get(id);
      if (addOn?.requires) {
        for (const req of addOn.requires) {
          const dep = this.parseDependencyString(req);
          if (dep && !dep.addOnId.startsWith('feature:')) {
            graph.get(id)!.add(dep.addOnId);
          }
        }
      }
    }

    // Topological sort (Kahn's algorithm)
    const inDegree = new Map<string, number>();
    for (const [id, deps] of graph) {
      inDegree.set(id, inDegree.get(id) || 0);
      for (const dep of deps) {
        if (addOnIds.includes(dep)) {
          inDegree.set(dep, (inDegree.get(dep) || 0) + 1);
        }
      }
    }

    const queue = Array.from(inDegree.entries())
      .filter(([_, degree]) => degree === 0)
      .map(([id]) => id);
    
    const result: string[] = [];

    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const deps = graph.get(current) || new Set();
      for (const dep of deps) {
        const newDegree = (inDegree.get(dep) || 1) - 1;
        inDegree.set(dep, newDegree);
        if (newDegree === 0) {
          queue.push(dep);
        }
      }
    }

    // If we couldn't order everything, there was a cycle
    if (result.length !== addOnIds.length) {
      // Add remaining (dependency cycle - install in any order)
      for (const id of addOnIds) {
        if (!result.includes(id)) {
          result.push(id);
        }
      }
    }

    return result;
  }
}

// ============================================================================
// Static Utilities
// ============================================================================

export function createCompatibilityEngine(): CompatibilityEngine {
  return new CompatibilityEngine();
}

export function checkTemplateCompatibility(
  addOn: AddOnDefinition,
  templateCapabilities: string[]
): { compatible: boolean; missing: string[] } {
  const compatibleTemplates = addOn.compatibleTemplates || [];
  
  if (compatibleTemplates.includes('*') || compatibleTemplates.length === 0) {
    return { compatible: true, missing: [] };
  }

  const missing = compatibleTemplates.filter(
    (t) => !templateCapabilities.includes(t)
  );

  return {
    compatible: missing.length === 0,
    missing,
  };
}

export default CompatibilityEngine;
