// @ts-nocheck
// ============================================================================
// Widget Registry
// ============================================================================
// Central registry for managing widget types and their components
// ============================================================================

import type { ComponentType } from "react";
import type { WidgetProps, WidgetType } from "../types";

interface RegistryEntry {
  type: WidgetType;
  component: ComponentType<WidgetProps>;
  displayName: string;
  description?: string;
}

/**
 * WidgetRegistry - Central registry for dashboard widgets
 *
 * Manages the mapping between widget types and their React components.
 * Provides methods for registering, retrieving, and listing widgets.
 */
export class WidgetRegistry {
  private static instance: WidgetRegistry;
  private widgets: Map<WidgetType, RegistryEntry> = new Map();

  private constructor() {}

  /**
   * Get the singleton instance of the widget registry
   */
  static getInstance(): WidgetRegistry {
    if (!WidgetRegistry.instance) {
      WidgetRegistry.instance = new WidgetRegistry();
    }
    return WidgetRegistry.instance;
  }

  /**
   * Register a widget type with its component
   */
  register(type: WidgetType, component: ComponentType<WidgetProps>, metadata?: Omit<RegistryEntry, "type" | "component">): void {
    this.widgets.set(type, {
      type,
      component,
      displayName: metadata?.displayName || type,
      description: metadata?.description,
    });
  }

  /**
   * Get a widget component by type
   */
  get(type: WidgetType): ComponentType<WidgetProps> | undefined {
    return this.widgets.get(type)?.component;
  }

  /**
   * Get full registry entry by type
   */
  getEntry(type: WidgetType): RegistryEntry | undefined {
    return this.widgets.get(type);
  }

  /**
   * Check if a widget type is registered
   */
  has(type: WidgetType): boolean {
    return this.widgets.has(type);
  }

  /**
   * Unregister a widget type
   */
  unregister(type: WidgetType): boolean {
    return this.widgets.delete(type);
  }

  /**
   * Get all registered widget types
   */
  getTypes(): WidgetType[] {
    return Array.from(this.widgets.keys());
  }

  /**
   * Get all registered widget entries
   */
  getAll(): RegistryEntry[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Clear all registered widgets
   */
  clear(): void {
    this.widgets.clear();
  }
}

/**
 * Convenience function to get the global widget registry instance
 */
export function getWidgetRegistry(): WidgetRegistry {
  return WidgetRegistry.getInstance();
}
