// @ts-nocheck
// Pure business logic - no direct database imports
// This service receives data and returns computed results

import type {
  DocumentTemplate,
  DocumentTemplateCategory,
  TransactionDocument,
  DocumentStatus,
  DocumentSigner,
  SignatureRequest,
  SignatureEvent,
  TransactionChecklist,
  ChecklistTemplate,
  ChecklistItem,
  ChecklistPhase,
  Vendor,
  VendorType,
  VendorAssignment,
  VendorOrder,
  DocumentPackage,
  DocumentAnalytics,
  DocumentBottleneck,
} from '../../types/document';

// ============================================================================
// Document Template Service (Pure Logic)
// ============================================================================

export class DocumentTemplateService {
  /**
   * Render a template with provided variable values
   */
  renderTemplate(
    template: DocumentTemplate,
    variables: Record<string, string>
  ): string {
    let content = template.content;

    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
      content = content.replace(regex, value);
    }

    return content;
  }

  /**
   * Get template variables that need to be filled
   */
  getMissingVariables(
    template: DocumentTemplate,
    filledVariables: Record<string, string>
  ): string[] {
    return template.variables
      .filter((v: { required: boolean; name: string }) => v.required && !filledVariables[v.name])
      .map((v: { name: string }) => v.name);
  }
}

// ============================================================================
// Transaction Document Service (Pure Logic)
// ============================================================================

export class TransactionDocumentService {
  /**
   * Get document analytics for a transaction
   */
  getAnalytics(
    documents: TransactionDocument[],
    now: Date = new Date()
  ): DocumentAnalytics {
    const bottlenecks: DocumentBottleneck[] = [];

    for (const doc of documents) {
      for (const signer of doc.signers) {
        if (signer.status === 'pending' && doc.status === 'pending_signature') {
          const pendingHours = Math.floor(
            (now.getTime() - new Date(doc.updatedAt).getTime()) / (1000 * 60 * 60)
          );

          const urgencyLevel = pendingHours > 72
            ? 'critical'
            : pendingHours > 48
            ? 'high'
            : pendingHours > 24
            ? 'medium'
            : 'low';

          bottlenecks.push({
            documentId: doc.id,
            documentName: doc.name,
            pendingSigner: signer.name,
            pendingSinceHours: pendingHours,
            urgencyLevel,
          });
        }
      }
    }

    const signedDocs = documents.filter(d => d.status === 'fully_signed' || d.status === 'executed');
    const pendingDocs = documents.filter(d => d.status === 'pending_signature' || d.status === 'partially_signed');
    const overdueDocs = documents.filter(d =>
      d.dueDate && new Date(d.dueDate) < now && d.status !== 'executed' && d.status !== 'voided'
    );

    return {
      transactionId: documents[0]?.transactionId ?? '',
      totalDocuments: documents.length,
      signedDocuments: signedDocs.length,
      pendingDocuments: pendingDocs.length,
      overdueDocuments: overdueDocs.length,
      bottlenecks: bottlenecks.sort((a, b) => b.pendingSinceHours - a.pendingSinceHours),
    };
  }
}

// ============================================================================
// Checklist Service (Pure Logic)
// ============================================================================

export class TransactionChecklistService {
  /**
   * Get completion summary for a transaction across all phases
   */
  getCompletionSummary(
    checklists: TransactionChecklist[]
  ): {
    phases: Array<{
      phase: ChecklistPhase;
      completedItems: number;
      totalItems: number;
      completionPercent: number;
      isComplete: boolean;
    }>;
    overall: { completedItems: number; totalItems: number; completionPercent: number };
  } {
    const phaseMap = new Map<ChecklistPhase, { completed: number; total: number }>();

    for (const checklist of checklists) {
      const current = phaseMap.get(checklist.phase) ?? { completed: 0, total: 0 };
      current.completed += checklist.completedCount;
      current.total += checklist.totalCount;
      phaseMap.set(checklist.phase, current);
    }

    const phases = Array.from(phaseMap.entries()).map(([phase, data]) => ({
      phase,
      completedItems: data.completed,
      totalItems: data.total,
      completionPercent: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
      isComplete: data.completed === data.total && data.total > 0,
    }));

    const totalCompleted = phases.reduce((sum, p) => sum + p.completedItems, 0);
    const totalItems = phases.reduce((sum, p) => sum + p.totalItems, 0);

    return {
      phases,
      overall: {
        completedItems: totalCompleted,
        totalItems,
        completionPercent: totalItems > 0 ? Math.round((totalCompleted / totalItems) * 100) : 0,
      },
    };
  }
}

// ============================================================================
// Unified Document Management Facade
// ============================================================================

export class DocumentManagementService {
  public templates = new DocumentTemplateService();
  public documents = new TransactionDocumentService();
  public checklists = new TransactionChecklistService();
}

export const documentManagement = new DocumentManagementService();
