/**
 * Scenario Registry
 * Manages load test scenarios
 */

import { ScenarioDefinition } from '../index';

export class ScenarioRegistry {
  private scenarios: Map<string, ScenarioDefinition> = new Map();

  /**
   * Register a scenario
   */
  register(name: string, scenario: ScenarioDefinition): void {
    if (this.scenarios.has(name)) {
      console.warn(`Scenario '${name}' is being overwritten`);
    }
    this.scenarios.set(name, scenario);
  }

  /**
   * Get a scenario by name
   */
  get(name: string): ScenarioDefinition | undefined {
    return this.scenarios.get(name);
  }

  /**
   * Check if a scenario exists
   */
  has(name: string): boolean {
    return this.scenarios.has(name);
  }

  /**
   * Remove a scenario
   */
  unregister(name: string): boolean {
    return this.scenarios.delete(name);
  }

  /**
   * Get all registered scenario names
   */
  list(): string[] {
    return Array.from(this.scenarios.keys());
  }

  /**
   * Get all scenarios
   */
  getAll(): Map<string, ScenarioDefinition> {
    return new Map(this.scenarios);
  }

  /**
   * Clear all scenarios
   */
  clear(): void {
    this.scenarios.clear();
  }

  /**
   * Load scenarios from a directory
   */
  async loadFromDirectory(directory: string): Promise<void> {
    const fs = await import('fs');
    const path = await import('path');

    if (!fs.existsSync(directory)) {
      throw new Error(`Directory not found: ${directory}`);
    }

    const files = fs.readdirSync(directory);

    for (const file of files) {
      if (file.endsWith('.ts') || file.endsWith('.js')) {
        const filePath = path.join(directory, file);
        const module = await import(filePath);

        // Look for default export or named exports
        if (module.default && this.isValidScenario(module.default)) {
          const name = path.basename(file, path.extname(file));
          this.register(name, module.default);
        }

        // Also check for named exports
        Object.entries(module).forEach(([exportName, exportValue]) => {
          if (exportName !== 'default' && this.isValidScenario(exportValue)) {
            this.register(exportName, exportValue as ScenarioDefinition);
          }
        });
      }
    }
  }

  /**
   * Validate if an object is a valid scenario definition
   */
  private isValidScenario(obj: unknown): obj is ScenarioDefinition {
    return (
      typeof obj === 'object' &&
      obj !== null &&
      'name' in obj &&
      'description' in obj &&
      'execute' in obj &&
      typeof (obj as ScenarioDefinition).execute === 'function'
    );
  }
}
