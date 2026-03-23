// @ts-nocheck
/**
 * Real Estate Document Management Types
 * Covers document templates, e-signatures, transaction checklists, and vendor coordination
 */

// ============================================================================
// Document Template Types
// ============================================================================

export type DocumentTemplateCategory =
  | 'listing_agreement'
  | 'purchase_agreement'
  | 'counter_offer'
  | 'disclosure'
  | 'inspection_report'
  | 'addendum'
  | 'lease_agreement'
  | 'buyer_representation'
  | 'seller_representation'
  | 'commission_agreement'
  | 'closing_documents'
  | 'custom';

export type DocumentStatus =
  | 'draft'
  | 'pending_signature'
  | 'partially_signed'
  | 'fully_signed'
  | 'executed'
  | 'expired'
  | 'voided';

export type SignatureStatus = 'pending' | 'signed' | 'declined' | 'expired';

export interface DocumentTemplate {
  id: string;
  merchantId: string;
  name: string;
  description?: string;
  category: DocumentTemplateCategory;
  content: string; // HTML or markdown with template variables
  variables: TemplateVariable[]; // e.g., {{buyer_name}}, {{property_address}}
  requiredSignatures: SignatureRole[];
  isDefault: boolean;
  state?: string; // State-specific templates (CA, TX, NY, etc.)
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateVariable {
  name: string; // e.g., "buyer_name"
  label: string; // e.g., "Buyer Full Name"
  type: 'text' | 'date' | 'currency' | 'checkbox' | 'signature' | 'initials';
  required: boolean;
  defaultValue?: string;
  source?: 'transaction' | 'property' | 'client' | 'agent' | 'manual'; // Auto-fill source
}

export interface SignatureRole {
  role: 'buyer' | 'seller' | 'agent' | 'co_buyer' | 'co_seller' | 'lender' | 'attorney' | 'title_company';
  label: string;
  required: boolean;
  order?: number; // Signing order (1 = first)
}

// ============================================================================
// Document Instance Types
// ============================================================================

export interface TransactionDocument {
  id: string;
  transactionId: string;
  templateId?: string;
  name: string;
  category: DocumentTemplateCategory;
  status: DocumentStatus;
  fileUrl?: string; // Stored document URL
  signatureRequestId?: string; // DocuSign/PandaDoc envelope ID
  signers: DocumentSigner[];
  variables: Record<string, string>; // Filled template variables
  notes?: string;
  dueDate?: string;
  executedAt?: string;
  voidedAt?: string;
  voidedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSigner {
  id: string;
  documentId: string;
  role: SignatureRole['role'];
  name: string;
  email: string;
  phone?: string;
  status: SignatureStatus;
  signedAt?: string;
  declinedAt?: string;
  declinedReason?: string;
  ipAddress?: string;
  signingUrl?: string; // URL for embedded signing
}

// ============================================================================
// E-Signature Integration Types
// ============================================================================

export type ESignatureProvider = 'docusign' | 'pandadoc' | 'hellosign' | 'vayva_native';

export interface ESignatureConfig {
  provider: ESignatureProvider;
  apiKey?: string;
  accountId?: string;
  testMode: boolean;
  callbackUrl?: string;
  branding?: {
    logoUrl?: string;
    companyName?: string;
    primaryColor?: string;
  };
}

export interface SignatureRequest {
  id: string;
  documentId: string;
  provider: ESignatureProvider;
  providerEnvelopeId?: string;
  subject: string;
  message?: string;
  signers: DocumentSigner[];
  expiresAt?: string;
  reminderDays?: number[]; // Days before expiry to send reminders
  status: 'sent' | 'delivered' | 'partially_signed' | 'completed' | 'voided' | 'declined';
  createdAt: string;
  completedAt?: string;
}

export interface SignatureEvent {
  envelopeId: string;
  event: 'sent' | 'delivered' | 'signed' | 'completed' | 'declined' | 'voided';
  recipientEmail?: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

// ============================================================================
// Transaction Checklist Types
// ============================================================================

export type ChecklistPhase =
  | 'listing'
  | 'offer'
  | 'under_contract'
  | 'inspection'
  | 'appraisal'
  | 'title'
  | 'loan_processing'
  | 'clear_to_close'
  | 'closing'
  | 'post_closing';

export interface TransactionChecklist {
  id: string;
  transactionId: string;
  templateId?: string;
  name: string;
  phase: ChecklistPhase;
  items: ChecklistItem[];
  completedCount: number;
  totalCount: number;
  completionPercent: number;
  dueDate?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ChecklistItem {
  id: string;
  checklistId: string;
  phase: ChecklistPhase;
  title: string;
  description?: string;
  category: 'document' | 'action' | 'review' | 'compliance' | 'communication';
  isRequired: boolean;
  isCompleted: boolean;
  completedAt?: string;
  completedBy?: string;
  dueDate?: string;
  assignedTo?: string; // Agent, buyer, seller, vendor
  linkedDocumentId?: string;
  notes?: string;
  order: number;
}

export interface ChecklistTemplate {
  id: string;
  merchantId: string;
  name: string;
  transactionType: 'purchase' | 'sale' | 'refinance' | 'lease';
  state?: string;
  items: Omit<ChecklistItem, 'id' | 'checklistId' | 'isCompleted' | 'completedAt' | 'completedBy' | 'linkedDocumentId' | 'notes'>[];
  isDefault: boolean;
  createdAt: string;
}

// ============================================================================
// Vendor Coordination Types
// ============================================================================

export type VendorType =
  | 'home_inspector'
  | 'appraiser'
  | 'title_company'
  | 'lender'
  | 'attorney'
  | 'contractor'
  | 'pest_inspector'
  | 'home_warranty'
  | 'moving_company'
  | 'photographer'
  | 'stager'
  | 'escrow'
  | 'other';

export interface Vendor {
  id: string;
  merchantId: string;
  name: string;
  type: VendorType;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  licenseNumber?: string;
  rating?: number; // 1-5
  reviewCount?: number;
  serviceAreas?: string[]; // ZIP codes or city names
  averageTurnaround?: number; // Days
  preferredStatus: 'preferred' | 'approved' | 'neutral' | 'avoid';
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VendorAssignment {
  id: string;
  transactionId: string;
  vendorId: string;
  vendor?: Vendor;
  serviceType: VendorType;
  status: 'requested' | 'confirmed' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate?: string;
  completedDate?: string;
  fee?: number;
  invoiceUrl?: string;
  reportUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VendorOrder {
  transactionId: string;
  vendorId: string;
  serviceType: VendorType;
  requestedDate?: string;
  notes?: string;
  urgency: 'standard' | 'rush' | 'emergency';
}

// ============================================================================
// Document Package Types (for closing)
// ============================================================================

export interface DocumentPackage {
  id: string;
  transactionId: string;
  name: string;
  description?: string;
  documents: TransactionDocument[];
  status: 'assembling' | 'ready' | 'sent_to_closing' | 'executed';
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Document Analytics
// ============================================================================

export interface DocumentAnalytics {
  transactionId: string;
  totalDocuments: number;
  signedDocuments: number;
  pendingDocuments: number;
  overdueDocuments: number;
  avgSigningTime?: number; // Hours
  bottlenecks: DocumentBottleneck[];
}

export interface DocumentBottleneck {
  documentId: string;
  documentName: string;
  pendingSigner: string;
  pendingSinceHours: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}
