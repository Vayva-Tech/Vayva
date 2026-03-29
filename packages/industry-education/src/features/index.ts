/**
 * Education Industry Features
 * 
 * Core feature modules for education functionality
 */

export * from './courses';
export * from './students';
export * from './instructors';
export * from './assignments';
export * from './certificates';

// Phase 3: Enhanced Features
export { CourseProgressTracking, createCourseProgressTracking } from './course-progress-tracking';
export type { Course, StudentProgress, Grade } from './course-progress-tracking';

export { CertificationManagement, createCertificationManagement } from './certification-management';
export type { Certificate, StudentCertificate } from './certification-management';

export { ParentPortalAccess, createParentPortalAccess } from './parent-portal-access';
export type { ParentAccount, SchoolAnnouncement } from './parent-portal-access';
