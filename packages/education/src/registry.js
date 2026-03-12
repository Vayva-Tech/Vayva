/**
 * Education Registry
 *
 * Central registry of all template education maps.
 */
import { RetailSellingEducation } from "./templates/retail-selling";
import { SoloServicesEducation } from "./templates/solo-services";
/**
 * Template Education Registry
 */
export const EducationRegistry = {
    "simple-retail": RetailSellingEducation,
    "solo-services": SoloServicesEducation,
    // Additional templates will be added here
};
/**
 * Get education map for template
 */
export function getTemplateEducation(templateId) {
    return EducationRegistry[templateId] || null;
}
/**
 * Get workflow guidance
 */
export function getWorkflowGuidance(templateId, workflowId) {
    const education = getTemplateEducation(templateId);
    return education?.workflows[workflowId] || null;
}
/**
 * Get empty state guidance
 */
export function getEmptyStateGuidance(templateId, workflowId) {
    const workflow = getWorkflowGuidance(templateId, workflowId);
    return workflow?.emptyState || null;
}
/**
 * Get first action hint
 */
export function getFirstActionHint(templateId, workflowId) {
    const workflow = getWorkflowGuidance(templateId, workflowId);
    return workflow?.firstAction || null;
}
/**
 * Get workflow stall nudge
 */
export function getWorkflowStallNudge(templateId, workflowId) {
    const workflow = getWorkflowGuidance(templateId, workflowId);
    return workflow?.workflowStall || null;
}
/**
 * Get explanation
 */
export function getExplanation(templateId, workflowId, key) {
    const workflow = getWorkflowGuidance(templateId, workflowId);
    return workflow?.explanations?.[key] || null;
}
