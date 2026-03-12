
# Compact Mode Specification

This document describes the implementation, scope, and maintenance plan for the High-Density (Compact) view in the Ops Console.

## 1. Implementation Detail
Compact mode is activated by a global class `.ops-density-compact` applied to the root layout container in `OpsShell.tsx`. This class toggles specific CSS overrides in `globals.css`.

### Targeted Selectors
To avoid design-system drift and maintenance hazards, the overrides are strictly scoped to tabular data and common spacing containers.

| Selector | Properties | Rationale |
| :--- | :--- | :--- |
| `table tr td` | `padding-top: 0.35rem`, `padding-bottom: 0.35rem` | Standardizes row height for data-heavy views. |
| `table tr th` | `padding-top: 0.35rem`, `padding-bottom: 0.35rem` | Matches header density to row density. |
| `table tr td`, `table tr th` | `font-size: 0.8rem` | Slightly reduces text size to improve scanability. |
| `.p-8` | `padding: 1rem` | Reduces excessive "white-space-bloat" in main content areas. |

## 2. Constraints & Guardrails
- **No Broad Overrides**: We do not use `*` selectors or override base typography (headings, etc.) to maintain visual hierarchy.
- **Component Integrity**: Inputs, buttons, and modals maintain their primary touch-targets and internal padding to ensure usability.
- **Strictly Operational**: Only intended for use in the `Ops Console` package; not shared with `Storefront` or `Mobile`.

## 3. Migration Plan (v4.0.0)
The current `!important` overrides in `globals.css` are a bridging solution. The following migration path is scheduled:
1. **Component Variants**: Move density logic into the `@vayva/ui` Table component as a `density="compact"` prop.
2. **Context API**: Replace global class with a `useDensity()` hook that components subscribe to for local adjustment.
3. **CSS Variables**: Transition to variable-driven padding (e.g., `--td-padding: 1rem`) controlled by a single theme switch.

## 4. Visual Regression
Testing for compact mode should focus on:
- **Alignment**: Column headers must remain aligned with row data.
- **Clipping**: Ensure data with long strings (Email, IDs) doesn't clip uncontrollably.
- **Contrast**: Ensure reduced font size still meets WCAG accessibility standards.
