import * as React from "react";
/**
 * Switch Component - Canonical Implementation
 *
 * This is the single source of truth for Switch components across the monorepo.
 * All apps should import from @vayva/ui, not create local copies.
 *
 * @example
 * ```tsx
 * <Switch
 *   checked={isEnabled}
 *   onCheckedChange={setIsEnabled}
 * />
 * ```
 */
export interface SwitchProps {
    /** Current checked state */
    checked: boolean;
    /** Callback when checked state changes */
    onCheckedChange: (checked: boolean) => void;
    /** Whether the switch is disabled */
    disabled?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Unique identifier */
    id?: string;
    /** Form field name */
    name?: string;
    /** Required for accessibility when not using a label */
    "aria-label"?: string;
    /** ID of element that labels this switch */
    "aria-labelledby"?: string;
}
export declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLButtonElement>>;
