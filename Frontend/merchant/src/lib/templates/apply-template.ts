/**
 * Template Application System
 * Handles preview, apply, and rollback of store templates
 */

import { apiJson } from '@/lib/api-client-shared';

export interface TemplateApplyOptions {
  preserveContent?: boolean;
  preview?: boolean;
}

export interface TemplateApplyResult {
  success: boolean;
  data?: {
    appliedAt: string;
    previewUrl: string;
    changes: {
      layoutChanged: boolean;
      themeChanged: boolean;
      widgetsAdded: number;
    };
  };
  error?: string;
}

/**
 * Apply a template to merchant's store
 */
export async function applyTemplate(
  templateId: string,
  options: TemplateApplyOptions = {}
): Promise<TemplateApplyResult> {
  try {
    const response = await apiJson<TemplateApplyResult>('/api/templates/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId,
        preserveContent: options.preserveContent ?? false,
        preview: options.preview ?? false,
      }),
    });

    return response as TemplateApplyResult;
  } catch (error) {
    console.error('[TEMPLATE] Apply failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to apply template',
    };
  }
}

/**
 * Preview template without applying
 */
export async function previewTemplate(templateId: string): Promise<string | null> {
  try {
    const result = await applyTemplate(templateId, { preview: true });
    return result.success ? result.data?.previewUrl || null : null;
  } catch (error) {
    console.error('[TEMPLATE] Preview failed:', error);
    return null;
  }
}

/**
 * Open template preview in new window
 */
export function openTemplatePreview(templateId: string) {
  const windowFeatures = 'width=1200,height=800,scrollbars=yes,resizable=yes';
  const previewUrl = `/dashboard/designer?preview=${templateId}`;
  
  window.open(previewUrl, '_blank', windowFeatures);
}

/**
 * Rollback to previous template configuration
 */
export async function rollbackTemplate(): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await apiJson<{ success: boolean; error?: string }>(
      '/api/templates/rollback',
      {
        method: 'POST',
      }
    );

    if (response.success) {
      // Reload to show previous template
      window.location.reload();
    }

    return response;
  } catch (error) {
    console.error('[TEMPLATE] Rollback failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to rollback',
    };
  }
}

/**
 * Validate template compatibility with current store setup
 */
export async function validateTemplateCompatibility(
  templateId: string,
  industrySlug: string
): Promise<{ compatible: boolean; warnings?: string[] }> {
  try {
    const response = await apiJson<{ 
      compatible: boolean; 
      warnings?: string[];
      missingFeatures?: string[];
    }>(`/api/templates/${templateId}/validate?industry=${industrySlug}`);

    return {
      compatible: response.compatible,
      warnings: response.warnings || [],
    };
  } catch (error) {
    console.error('[TEMPLATE] Validation failed:', error);
    return {
      compatible: false,
      warnings: ['Unable to validate template'],
    };
  }
}
