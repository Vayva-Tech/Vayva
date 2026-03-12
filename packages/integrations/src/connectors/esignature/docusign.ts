/**
 * DocuSign Connector
 * Integration with DocuSign eSignature API
 */

import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface DocuSignConfig extends ConnectorConfig {
  integrationKey: string;
  secretKey: string;
  accountId: string;
  userId: string;
  privateKey: string;
  environment: 'sandbox' | 'production';
  accessToken?: string;
  tokenExpiry?: Date;
}

export interface DocuSignEnvelope {
  id?: string;
  subject: string;
  emailBlurb?: string;
  status: 'created' | 'sent' | 'delivered' | 'signed' | 'completed' | 'declined' | 'voided';
  createdAt?: Date;
  completedAt?: Date;
  signers: DocuSignSigner[];
  documents: DocuSignDocument[];
  expirationDays?: number;
}

export interface DocuSignSigner {
  email: string;
  name: string;
  recipientId: string;
  routingOrder?: number;
  tabs?: {
    signHereTabs?: Array<{
      anchorString?: string;
      anchorXOffset?: string;
      anchorYOffset?: string;
      pageNumber?: string;
      xPosition?: string;
      yPosition?: string;
    }>;
    dateSignedTabs?: Array<{
      anchorString?: string;
      pageNumber?: string;
      xPosition?: string;
      yPosition?: string;
    }>;
    textTabs?: Array<{
      tabLabel: string;
      value?: string;
      pageNumber?: string;
      xPosition?: string;
      yPosition?: string;
    }>;
  };
}

export interface DocuSignDocument {
  documentId: string;
  name: string;
  fileExtension: string;
  documentBase64?: string;
  documentPath?: string;
}

export interface DocuSignTemplate {
  templateId: string;
  name: string;
  description: string;
  shared: boolean;
  pageCount: number;
  createdAt: Date;
}

export class DocuSignConnector {
  private config: DocuSignConfig;
  private baseUrl: string;
  private oauthBaseUrl: string;

  constructor(config: DocuSignConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === 'production'
        ? `https://na.docusign.net/restapi/v2.1/accounts/${config.accountId}`
        : `https://demo.docusign.net/restapi/v2.1/accounts/${config.accountId}`;
    this.oauthBaseUrl =
      config.environment === 'production'
        ? 'https://account.docusign.com'
        : 'https://account-d.docusign.com';
  }

  /**
   * Get JWT access token (using RSA key pair)
   * Note: In production, use proper JWT library
   */
  async getAccessToken(): Promise<boolean> {
    try {
      // In real implementation, sign JWT with RS256 using privateKey
      // This is a placeholder for the JWT grant flow
      const response = await fetch(`${this.oauthBaseUrl}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: this.buildJwtAssertion(),
        }),
      });

      if (!response.ok) return false;

      const data = (await response.json()) as {
        access_token: string;
        expires_in: number;
      };

      this.config.accessToken = data.access_token;
      this.config.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

      return true;
    } catch (error) {
      console.error('DocuSign token error:', error);
      return false;
    }
  }

  private buildJwtAssertion(): string {
    // Placeholder - in production use jsonwebtoken library
    // jwt.sign({ ... }, this.config.privateKey, { algorithm: 'RS256' })
    return 'placeholder-jwt';
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!this.config.accessToken || (this.config.tokenExpiry && new Date() > this.config.tokenExpiry)) {
      await this.getAccessToken();
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        message?: string;
        errorCode?: string;
      };
      throw new Error(
        `DocuSign API error: ${error.errorCode ?? ''} - ${error.message ?? response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Send an envelope for signing
   */
  async sendEnvelope(envelope: DocuSignEnvelope): Promise<{ envelopeId: string; status: string }> {
    const result = await this.request<{ envelopeId: string; status: string }>(
      '/envelopes',
      {
        method: 'POST',
        body: JSON.stringify({
          emailSubject: envelope.subject,
          emailBlurb: envelope.emailBlurb,
          status: 'sent',
          expirationTime: envelope.expirationDays
            ? new Date(Date.now() + envelope.expirationDays * 86400000).toISOString()
            : undefined,
          documents: envelope.documents.map((doc) => ({
            documentId: doc.documentId,
            name: doc.name,
            fileExtension: doc.fileExtension,
            documentBase64: doc.documentBase64,
          })),
          recipients: {
            signers: envelope.signers.map((signer) => ({
              email: signer.email,
              name: signer.name,
              recipientId: signer.recipientId,
              routingOrder: signer.routingOrder ?? 1,
              tabs: signer.tabs,
            })),
          },
        }),
      }
    );

    return result;
  }

  /**
   * Get envelope status
   */
  async getEnvelopeStatus(envelopeId: string): Promise<DocuSignEnvelope> {
    const result = await this.request<{
      envelopeId: string;
      emailSubject: string;
      status: string;
      createdDateTime: string;
      completedDateTime?: string;
    }>(`/envelopes/${envelopeId}`);

    return {
      id: result.envelopeId,
      subject: result.emailSubject,
      status: result.status as DocuSignEnvelope['status'],
      createdAt: new Date(result.createdDateTime),
      completedAt: result.completedDateTime
        ? new Date(result.completedDateTime)
        : undefined,
      signers: [],
      documents: [],
    };
  }

  /**
   * Download completed document
   */
  async downloadDocument(
    envelopeId: string,
    documentId = 'combined'
  ): Promise<ArrayBuffer> {
    if (!this.config.accessToken || (this.config.tokenExpiry && new Date() > this.config.tokenExpiry)) {
      await this.getAccessToken();
    }

    const response = await fetch(
      `${this.baseUrl}/envelopes/${envelopeId}/documents/${documentId}`,
      {
        headers: { Authorization: `Bearer ${this.config.accessToken}` },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download document: ${response.statusText}`);
    }

    return response.arrayBuffer();
  }

  /**
   * Void an envelope
   */
  async voidEnvelope(envelopeId: string, reason: string): Promise<boolean> {
    try {
      await this.request(`/envelopes/${envelopeId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'voided', voidedReason: reason }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List templates
   */
  async getTemplates(): Promise<DocuSignTemplate[]> {
    const result = await this.request<{
      envelopeTemplates: Array<{
        templateId: string;
        name: string;
        description: string;
        shared: string;
        pageCount: number;
        created: string;
      }>;
    }>('/templates');

    return (result.envelopeTemplates ?? []).map((t) => ({
      templateId: t.templateId,
      name: t.name,
      description: t.description,
      shared: t.shared === 'true',
      pageCount: t.pageCount,
      createdAt: new Date(t.created),
    }));
  }

  /**
   * Send envelope from template
   */
  async sendFromTemplate(params: {
    templateId: string;
    subject: string;
    signers: Array<{
      email: string;
      name: string;
      roleName: string;
    }>;
    customFields?: Record<string, string>;
  }): Promise<{ envelopeId: string; status: string }> {
    return this.request('/envelopes', {
      method: 'POST',
      body: JSON.stringify({
        emailSubject: params.subject,
        status: 'sent',
        templateId: params.templateId,
        templateRoles: params.signers.map((s) => ({
          email: s.email,
          name: s.name,
          roleName: s.roleName,
        })),
        customFields: params.customFields
          ? {
              textCustomFields: Object.entries(params.customFields).map(
                ([name, value]) => ({ name, value })
              ),
            }
          : undefined,
      }),
    });
  }

  /**
   * Get list of envelopes
   */
  async listEnvelopes(from?: Date, status?: string): Promise<SyncResult & { envelopes: DocuSignEnvelope[] }> {
    try {
      const params = new URLSearchParams({
        from_date: (from ?? new Date(Date.now() - 30 * 86400000)).toISOString(),
        ...(status ? { status } : {}),
      });

      const result = await this.request<{
        envelopes: Array<{
          envelopeId: string;
          emailSubject: string;
          status: string;
          createdDateTime: string;
          completedDateTime?: string;
        }>;
      }>(`/envelopes?${params.toString()}`);

      const envelopes = (result.envelopes ?? []).map((e) => ({
        id: e.envelopeId,
        subject: e.emailSubject,
        status: e.status as DocuSignEnvelope['status'],
        createdAt: new Date(e.createdDateTime),
        completedAt: e.completedDateTime ? new Date(e.completedDateTime) : undefined,
        signers: [],
        documents: [],
      }));

      return {
        success: true,
        itemsSynced: envelopes.length,
        errors: [],
        lastSyncAt: new Date(),
        envelopes,
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [`Failed to list envelopes: ${error}`],
        lastSyncAt: new Date(),
        envelopes: [],
      };
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/users/' + this.config.userId);
      return true;
    } catch {
      return false;
    }
  }
}

export default DocuSignConnector;
