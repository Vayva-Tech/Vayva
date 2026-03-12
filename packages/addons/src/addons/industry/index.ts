/**
 * Industry-Specific Add-Ons Registry
 * 
 * Add-ons tailored for specific industries
 */

// ============================================================================
// AUTOMOTIVE
// ============================================================================
export { TEST_DRIVE_ADDON, TEST_DRIVE_MODELS } from './test-drive';

// ============================================================================
// RESTAURANT / FOOD
// ============================================================================
export { TABLE_BOOKING_ADDON, TABLE_BOOKING_MODELS } from './table-booking';
export { FOOD_MENU_ADDON, FOOD_MENU_MODELS } from './food-menu';
export { KITCHEN_DISPLAY_ADDON, KITCHEN_DISPLAY_MODELS } from './kitchen-display';

// ============================================================================
// REAL ESTATE
// ============================================================================
export { PROPERTY_SEARCH_ADDON, PROPERTY_SEARCH_MODELS } from './property-search';
export { PROPERTY_BOOKING_ADDON } from './property-booking';
export { MORTGAGE_CALCULATOR_ADDON } from './mortgage-calculator';
export { VIRTUAL_TOUR_ADDON } from './virtual-tour';

// ============================================================================
// SERVICES / BOOKING
// ============================================================================
export { APPOINTMENT_SCHEDULER_ADDON, APPOINTMENT_SCHEDULER_MODELS } from './appointment-scheduler';
export { INVENTORY_COUNTER_ADDON } from './inventory-counter';

// ============================================================================
// EVENTS
// ============================================================================
export { EVENT_CALENDAR_ADDON, EVENT_CALENDAR_MODELS } from './event-calendar';

// ============================================================================
// HEALTHCARE
// ============================================================================
export { PATIENT_PORTAL_ADDON, PATIENT_PORTAL_MODELS } from './patient-portal';
export { SYMPTOM_CHECKER_ADDON, SYMPTOM_CHECKER_MODELS } from './symptom-checker';
export { INSURANCE_VERIFICATION_ADDON, INSURANCE_VERIFICATION_MODELS } from './insurance-verification';
export { TELEHEALTH_ADDON, TELEHEALTH_MODELS } from './telehealth';
export { PRESCRIPTIONS_ADDON, PRESCRIPTIONS_MODELS } from './prescriptions';
export { LAB_RESULTS_ADDON, LAB_RESULTS_MODELS } from './lab-results';
export { WELLNESS_TRACKING_ADDON, WELLNESS_TRACKING_MODELS } from './wellness-tracking';
export { HIPAA_COMPLIANCE_ADDON, HIPAA_COMPLIANCE_MODELS } from './hipaa-compliance';

// ============================================================================
// EDUCATION
// ============================================================================
export { COURSES_ADDON, COURSES_MODELS } from './courses';
export { LESSON_PLAYER_ADDON, LESSON_PLAYER_MODELS } from './lesson-player';
export { QUIZZES_ADDON, QUIZZES_MODELS } from './quizzes';
export { STUDENT_DASHBOARD_ADDON, STUDENT_DASHBOARD_MODELS } from './student-dashboard';
export { FORUM_ADDON, FORUM_MODELS } from './forum';
export { ASSIGNMENTS_ADDON, ASSIGNMENTS_MODELS } from './assignments';
export { CERTIFICATES_ADDON, CERTIFICATES_MODELS } from './certificates';
export { LIVE_CLASS_ADDON, LIVE_CLASS_MODELS } from './live-class';

// ============================================================================
// CREATIVE / PORTFOLIO
// ============================================================================
export { PROJECTS_ADDON, PROJECTS_MODELS } from './projects';
export { SKILLS_ADDON, SKILLS_MODELS } from './skills';
export { PORTFOLIO_TESTIMONIALS_ADDON, PORTFOLIO_TESTIMONIALS_MODELS } from './portfolio-testimonials';
export { RESUME_ADDON, RESUME_MODELS } from './resume';
export { PORTFOLIO_FEED_ADDON, PORTFOLIO_FEED_MODELS } from './portfolio-feed';
export { HIRE_ME_ADDON, HIRE_ME_MODELS } from './hire-me';
export { PROCESS_ADDON, PROCESS_MODELS } from './process';
export { CLIENT_LOGOS_ADDON, CLIENT_LOGOS_MODELS } from './client-logos';

// ============================================================================
// IMPORTS FOR COLLECTIONS
// ============================================================================
import { TEST_DRIVE_ADDON } from './test-drive';
import { TABLE_BOOKING_ADDON } from './table-booking';
import { FOOD_MENU_ADDON } from './food-menu';
import { KITCHEN_DISPLAY_ADDON } from './kitchen-display';
import { PROPERTY_SEARCH_ADDON } from './property-search';
import { PROPERTY_BOOKING_ADDON } from './property-booking';
import { MORTGAGE_CALCULATOR_ADDON } from './mortgage-calculator';
import { VIRTUAL_TOUR_ADDON } from './virtual-tour';
import { APPOINTMENT_SCHEDULER_ADDON } from './appointment-scheduler';
import { INVENTORY_COUNTER_ADDON } from './inventory-counter';
import { EVENT_CALENDAR_ADDON } from './event-calendar';

// Healthcare
import { PATIENT_PORTAL_ADDON } from './patient-portal';
import { SYMPTOM_CHECKER_ADDON } from './symptom-checker';
import { INSURANCE_VERIFICATION_ADDON } from './insurance-verification';
import { TELEHEALTH_ADDON } from './telehealth';
import { PRESCRIPTIONS_ADDON } from './prescriptions';
import { LAB_RESULTS_ADDON } from './lab-results';
import { WELLNESS_TRACKING_ADDON } from './wellness-tracking';
import { HIPAA_COMPLIANCE_ADDON } from './hipaa-compliance';

// Education
import { COURSES_ADDON } from './courses';
import { LESSON_PLAYER_ADDON } from './lesson-player';
import { QUIZZES_ADDON } from './quizzes';
import { STUDENT_DASHBOARD_ADDON } from './student-dashboard';
import { FORUM_ADDON } from './forum';
import { ASSIGNMENTS_ADDON } from './assignments';
import { CERTIFICATES_ADDON } from './certificates';
import { LIVE_CLASS_ADDON } from './live-class';

// Creative
import { PROJECTS_ADDON } from './projects';
import { SKILLS_ADDON } from './skills';
import { PORTFOLIO_TESTIMONIALS_ADDON } from './portfolio-testimonials';
import { RESUME_ADDON } from './resume';
import { PORTFOLIO_FEED_ADDON } from './portfolio-feed';
import { HIRE_ME_ADDON } from './hire-me';
import { PROCESS_ADDON } from './process';
import { CLIENT_LOGOS_ADDON } from './client-logos';

import type { AddOnDefinition } from '../../types';

/** Industry-specific add-ons by industry */
export const INDUSTRY_ADDONS: Record<string, AddOnDefinition[]> = {
  automotive: [TEST_DRIVE_ADDON],
  restaurant: [TABLE_BOOKING_ADDON, FOOD_MENU_ADDON, KITCHEN_DISPLAY_ADDON],
  food: [TABLE_BOOKING_ADDON, FOOD_MENU_ADDON, KITCHEN_DISPLAY_ADDON],
  realestate: [PROPERTY_SEARCH_ADDON, PROPERTY_BOOKING_ADDON, MORTGAGE_CALCULATOR_ADDON, VIRTUAL_TOUR_ADDON],
  services: [APPOINTMENT_SCHEDULER_ADDON, INVENTORY_COUNTER_ADDON],
  events: [EVENT_CALENDAR_ADDON],
  healthcare: [
    PATIENT_PORTAL_ADDON,
    SYMPTOM_CHECKER_ADDON,
    INSURANCE_VERIFICATION_ADDON,
    TELEHEALTH_ADDON,
    PRESCRIPTIONS_ADDON,
    LAB_RESULTS_ADDON,
    WELLNESS_TRACKING_ADDON,
    HIPAA_COMPLIANCE_ADDON,
  ],
  education: [
    COURSES_ADDON,
    LESSON_PLAYER_ADDON,
    QUIZZES_ADDON,
    STUDENT_DASHBOARD_ADDON,
    FORUM_ADDON,
    ASSIGNMENTS_ADDON,
    CERTIFICATES_ADDON,
    LIVE_CLASS_ADDON,
  ],
  creative: [
    PROJECTS_ADDON,
    SKILLS_ADDON,
    PORTFOLIO_TESTIMONIALS_ADDON,
    RESUME_ADDON,
    PORTFOLIO_FEED_ADDON,
    HIRE_ME_ADDON,
    PROCESS_ADDON,
    CLIENT_LOGOS_ADDON,
  ],
};

/** All industry add-ons */
export const ALL_INDUSTRY_ADDONS: AddOnDefinition[] = [
  // Automotive
  TEST_DRIVE_ADDON,
  // Restaurant/Food
  TABLE_BOOKING_ADDON,
  FOOD_MENU_ADDON,
  KITCHEN_DISPLAY_ADDON,
  // Real Estate
  PROPERTY_SEARCH_ADDON,
  PROPERTY_BOOKING_ADDON,
  MORTGAGE_CALCULATOR_ADDON,
  VIRTUAL_TOUR_ADDON,
  // Services
  APPOINTMENT_SCHEDULER_ADDON,
  INVENTORY_COUNTER_ADDON,
  // Events
  EVENT_CALENDAR_ADDON,
  // Healthcare
  PATIENT_PORTAL_ADDON,
  SYMPTOM_CHECKER_ADDON,
  INSURANCE_VERIFICATION_ADDON,
  TELEHEALTH_ADDON,
  PRESCRIPTIONS_ADDON,
  LAB_RESULTS_ADDON,
  WELLNESS_TRACKING_ADDON,
  HIPAA_COMPLIANCE_ADDON,
  // Education
  COURSES_ADDON,
  LESSON_PLAYER_ADDON,
  QUIZZES_ADDON,
  STUDENT_DASHBOARD_ADDON,
  FORUM_ADDON,
  ASSIGNMENTS_ADDON,
  CERTIFICATES_ADDON,
  LIVE_CLASS_ADDON,
  // Creative
  PROJECTS_ADDON,
  SKILLS_ADDON,
  PORTFOLIO_TESTIMONIALS_ADDON,
  RESUME_ADDON,
  PORTFOLIO_FEED_ADDON,
  HIRE_ME_ADDON,
  PROCESS_ADDON,
  CLIENT_LOGOS_ADDON,
];

export default ALL_INDUSTRY_ADDONS;
