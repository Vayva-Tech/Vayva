---
trigger: always_on
---

# UX Documentation Standard (Authoritative)

This file defines the **mandatory standard** for generating UX, feature, dashboard, and user-flow documentation in this repository.

All AI-generated documentation MUST comply with this standard.
Failure to comply invalidates the document.

---

## 1. Purpose

The goal of UX documentation in this repository is to produce **repo-grounded, verifiable, bounded, and review-ready** artifacts that accurately reflect what users can see and do in the application.

This is not a speculative or design-aspirational document format.

---

## 2. Source of Truth (Non-Negotiable)

* The repository source code is the **only source of truth**.
* Do NOT guess, infer, or invent:

  * features
  * routes
  * dashboards
  * UI variants
  * navigation items
  * user capabilities
* If something cannot be located in code, it MUST be explicitly labeled as **Not found in repo**.

---

## 3. Evidence Requirement

* Every major claim MUST reference at least one concrete file path.
* If a feature is mentioned without a backing route, component, or state, it MUST be downgraded via confidence labeling (see below).
* Statements without evidence are invalid.

---

## 4. Confidence Labeling (MANDATORY)

Every documented feature, dashboard, or flow MUST include exactly one of the following labels:

* 🟢 **Routed & user-visible**
* 🟡 **Implemented but conditionally reachable**
* 🔴 **Referenced but not user-accessible**

Rules:

* If uncertain, default to 🟡 or 🔴.
* Never assume 🟢 without route-level proof.

---

## 5. Variant Resolution Order (Authoritative)

All UX flows, dashboards, and navigation MUST respect this precedence order:

1. Authentication
2. Onboarding completion
3. Industry slug
4. Feature flags
5. Subscription state

When a flow branches:

* Explicitly state which condition caused the branch.
* Cite where that condition is defined in code.

---

## 6. Navigation Authority

* `src/config/sidebar.ts` is the **canonical navigation definition** for authenticated users.
* Authentication and onboarding routes render **outside** the primary application shell unless proven otherwise.
* Navigation items MUST NOT be invented or inferred.

---

## 7. Diagram Scope Standard

All diagrams MUST be **Level 2**.

Included:

* User-visible states
* Route-level navigation
* Major branching conditions

Explicitly excluded:

* Component-level structure
* API call flows
* Backend job internals

---

## 8. Out of Scope (Do Not Document)

The following MUST NOT be included:

* Backend-only jobs or workers
* Public marketing surfaces
* Mobile applications
* Non–merchant-admin tools or apps

---

## 9. Required Output Structure (Strict Order)

All UX documentation MUST follow this order exactly:

### 1) Executive Summary

* 5–10 bullets
* System structure and UX philosophy
* Grounded in repo evidence

### 2) Route Inventory

For every route in `src/app/**`:

* Route path
* User-facing purpose
* Layout/shell used
* Navigation group (if any)
* Source file paths
* Confidence label (🟢🟡🔴)

### 3) Navigation Specification

* Global shell description
* Sidebar/topbar items
* Conditional navigation rules
* Settings/profile menus
* Source file paths

### 4) Onboarding State Machine

* Enumerated states
* Required vs optional steps
* Transition logic
* Source context/types files
* Completion criteria

If onboarding does not exist, this MUST be stated explicitly.

### 5) Dashboards & Variants

For each dashboard variant:

* Variant name
* Activation condition (mapped to precedence order)
* Widgets/sections shown
* Primary components/hooks
* Source file paths
* Confidence label

### 6) New User End-to-End Walkthrough

* First screen
* Required actions
* Branches (empty states, errors, incomplete onboarding)
* Blocking conditions and why
* Implementation locations

### 7) Diagrams (Mermaid REQUIRED)

All three diagrams MUST be included:

#### A) High-level user journey

```mermaid
flowchart TD
```

#### B) Information architecture / sitemap

```mermaid
flowchart LR
```

#### C) Onboarding state machine (if applicable)

```mermaid
stateDiagram-v2
```

Diagrams MUST reflect only documented routes and states.

### 8) Repo Health Notes

* Broken imports
* Type mismatches affecting UX
* Dead or unreachable routes
* Inconsistent naming
* TODOs blocking UX completeness

Speculation is forbidden. File paths are required.

---

## 10. Self-Check (Required)

Before finalizing any document, verify:

* No guessed features
* Every major claim has a file path
* Every feature has a confidence label
* Variant resolution order is respected
* Diagrams match documented routes and states

If any requirement cannot be satisfied, the document MUST explain why.

---

## 11. Enforcement

This file is authoritative.

Any UX documentation that violates this standard is considered incomplete and non-reviewable.
