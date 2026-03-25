/**
 * Document Automation Feature Module
 */

import type { DocumentGenerationInput } from '../services/document-automation.service';
import { DocumentAutomationService } from '../services/document-automation.service';

export class DocumentAutomationFeature {
  private readonly service: DocumentAutomationService;
  private initialized = false;

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

  async generateDocument(input: DocumentGenerationInput) {
    return this.service.generateDocument(input);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    this.initialized = false;
  }
}
