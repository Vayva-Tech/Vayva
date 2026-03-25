// ============================================================================
// Universal Pro Dashboard V2 - Usage Examples
// ============================================================================
// Demonstrates how to use the industry-adaptive dashboard
// ============================================================================

import { UniversalProDashboardV2 } from '@/components/dashboard-v2/UniversalProDashboardV2';
import type { IndustrySlug } from '@vayva/industry-core';

// Example 1: Basic usage with auto industry detection
export function RetailDashboardExample() {
  return (
    <UniversalProDashboardV2 
      industry="retail"
      userId="user-123"
      businessId="store-456"
    />
  );
}

// Example 2: Professional services (legal-style workflows use services slug in industry-core)
export function LegalDashboardExample() {
  return (
    <UniversalProDashboardV2 
      industry="services"
      userId="lawyer-789"
      businessId="firm-101"
      designCategory="signature" // Will auto-default to signature for legal
    />
  );
}

// Example 3: Healthcare industry with dark theme
export function HealthcareDashboardExample() {
  return (
    <UniversalProDashboardV2 
      industry="healthcare"
      userId="doctor-202"
      businessId="clinic-303"
      designCategory="dark" // Override auto-selection
    />
  );
}

// Example 4: Creative agency with bold styling
export function CreativeDashboardExample() {
  return (
    <UniversalProDashboardV2 
      industry="creative_portfolio"
      userId="designer-404"
      businessId="studio-505"
      designCategory="bold" // Creative gets bold by default
    />
  );
}

// Example 5: Education with natural theme
export function EducationDashboardExample() {
  return (
    <UniversalProDashboardV2 
      industry="education"
      userId="teacher-606"
      businessId="school-707"
      designCategory="natural" // Education gets natural by default
    />
  );
}

// ============================================================================
// Industry-Specific Adaptations Showcase
// ============================================================================

/*
RETAIL (Default):
- Header: "Store Dashboard" - "Manage and track your store"
- Metrics: REVENUE, ORDERS, CUSTOMERS, CONVERSION
- Primary Action: "Add Product"
- AI Labels: conversations, created, Response Time, Satisfaction
- Tasks: Inventory, orders, customer service

LEGAL:
- Header: "Practice Dashboard" - "Manage legal practice operations"  
- Metrics: REVENUE, CASES, CLIENTS, BILLABLE HOURS
- Primary Action: "New Case"
- AI Labels: cases, documents, Response Time, Client Rating
- Tasks: Case reviews, contract drafting, court appearances

HEALTHCARE:
- Header: "Clinic Dashboard" - "Monitor clinic operations"
- Metrics: REVENUE, PATIENTS, APPOINTMENTS, AVG CONSULTATION
- Primary Action: "New Patient"
- AI Labels: consultations, prescriptions, Wait Time, Patient Rating
- Tasks: Patient records, lab results, surgery scheduling

EDUCATION:
- Header: "School Dashboard" - "Manage educational programs"
- Metrics: ENROLLMENT, STUDENTS, COURSES, COMPLETION RATE
- Primary Action: "New Course"
- AI Labels: interactions, assignments, Response Time, Student Rating
- Tasks: Grading, parent conferences, curriculum planning

CREATIVE:
- Header: "Studio Dashboard" - "Manage creative workflows"
- Metrics: REVENUE, PROJECTS, CLIENTS, ON-TIME DELIVERY
- Primary Action: "New Project"
- AI Labels: briefs, deliverables, Turnaround Time, Client Rating
- Tasks: Presentations, revisions, collaboration sessions

FOOD:
- Header: "Kitchen Dashboard" - "Monitor kitchen operations"
- Metrics: REVENUE, ORDERS, TABLES, AVG ORDER VALUE
- Primary Action: "New Order"
- AI Labels: orders, processed, Prep Time, Food Rating
- Tasks: Order prep, ingredient restocking, cleaning
*/

// ============================================================================
// Design Category Mapping (Auto-selected by industry)
// ============================================================================
/*
- RETAIL: signature (clean professional)
- LEGAL: signature (clean professional)  
- HEALTHCARE: signature (clean professional)
- EDUCATION: natural (warm organic)
- CREATIVE: bold (high energy vibrant)
- FOOD: signature (clean professional)
- REAL_ESTATE: signature (clean professional)
- SAAS: dark (modern tech-focused)
- AUTOMOTIVE: bold (high energy)
- TRAVEL: natural (warm organic)
- FASHION: glass (premium luxurious)
- BEAUTY: glass (premium luxurious)
- NONPROFIT: natural (warm organic)
- EVENTS: bold (high energy)
*/