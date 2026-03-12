/**
 * Document Automation Feature Module
 */

import { DocumentAutomationService } from '../services/document-automation.service.js';

export class DocumentAutomationFeature {
  private service: DocumentAutomationService;
  private initialized: boolean = false;

  constructor() {
    this.service = new DocumentAutomationService();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.service.initialize();
      this.initialized = true;
      console.log('[DocumentAutomationFeature] Initialized');
    }
  }

  async getTemplatesByPracticeArea(storeId: string, practiceAreaId?: string) {
    return this.service.getTemplatesByPracticeArea(storeId, practiceAreaId);
  }

  async assembleDocument(data: any) {
    return this.service.assembleDocument(data);
  }

  async generateDocument(storeId: string, documentType: string, caseId: string, additionalData?: any) {
    return this.service.generateDocument(storeId, documentType, caseId, additionalData);
  }

  async bulkGenerateDocuments(storeId: string, caseId: string, documentTypes: string[]) {
    return this.service.bulkGenerateDocuments(storeId, caseId, documentTypes);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    await this.service.dispose();
    this.initialized = false;
  }
}
