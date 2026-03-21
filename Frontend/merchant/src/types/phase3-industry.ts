// ============================================================================
// PHASE 3: DIGITAL PRODUCTS, BLOG & MEDIA, CREATIVE PORTFOLIO TYPES
// ============================================================================

// ===== DIGITAL PRODUCTS & COURSES =====

export type LicenseStatus = 'active' | 'revoked' | 'expired';

export interface LicenseKey {
  id: string;
  storeId: string;
  productId: string;
  customerId: string;
  orderId: string;
  licenseKey: string;
  status: LicenseStatus;
  maxActivations: number;
  currentActivations: number;
  expiresAt?: Date;
  lastActivatedAt?: Date;
  revokedAt?: Date;
  revokeReason?: string;
  createdAt: Date;
}

export interface CreateLicenseKeyInput {
  storeId: string;
  productId: string;
  customerId: string;
  orderId: string;
  maxActivations?: number;
  expiresAt?: Date;
}

export type AssignmentType = 'quiz' | 'project' | 'essay' | 'peer_review';
export type SubmissionStatus = 'submitted' | 'graded' | 'resubmit';

export interface Assignment {
  id: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  description: string;
  type: AssignmentType;
  instructions: string;
  rubric?: {
    criteria: string;
    maxPoints: number;
  }[];
  maxScore: number;
  dueDate?: Date;
  timeLimit?: number;
  maxAttempts: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAssignmentInput {
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  description: string;
  type: AssignmentType;
  instructions: string;
  rubric?: Assignment['rubric'];
  maxScore: number;
  dueDate?: Date;
  timeLimit?: number;
  maxAttempts?: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  enrollmentId: string;
  answers: Record<string, unknown>;
  score?: number;
  feedback?: string;
  gradedBy?: string;
  submittedAt: Date;
  gradedAt?: Date;
  attemptNumber: number;
  status: SubmissionStatus;
}

export interface CreateSubmissionInput {
  assignmentId: string;
  enrollmentId: string;
  answers: Record<string, unknown>;
}

export interface GradeSubmissionInput {
  score: number;
  feedback?: string;
  gradedBy: string;
}

// ===== BLOG & MEDIA =====

export type BlogPostStatus = 'draft' | 'published' | 'archived';
export type ContentCalendarType = 'blog_post' | 'social_media' | 'email' | 'video';
export type ContentCalendarStatus = 'planned' | 'in_progress' | 'published' | 'cancelled';
export type NewsletterStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled';
export type SubscriberStatus = 'active' | 'unsubscribed' | 'bounced';

export interface BlogPost {
  id: string;
  storeId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  authorId: string;
  categoryId?: string;
  tags: string[];
  status: BlogPostStatus;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords: string[];
  publishedAt?: Date;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlogPostInput {
  storeId: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  authorId: string;
  categoryId?: string;
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
}

export interface ContentCalendar {
  id: string;
  storeId: string;
  title: string;
  type: ContentCalendarType;
  platform?: string;
  description?: string;
  scheduledDate: Date;
  status: ContentCalendarStatus;
  assigneeId?: string;
  contentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContentCalendarInput {
  storeId: string;
  title: string;
  type: ContentCalendarType;
  platform?: string;
  description?: string;
  scheduledDate: Date;
  assigneeId?: string;
  notes?: string;
}

export interface NewsletterCampaign {
  id: string;
  storeId: string;
  name: string;
  subject: string;
  content: string;
  previewText?: string;
  listId: string;
  status: NewsletterStatus;
  scheduledAt?: Date;
  sentAt?: Date;
  recipientCount: number;
  openCount: number;
  clickCount: number;
  bounceCount: number;
  unsubscribeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNewsletterInput {
  storeId: string;
  name: string;
  subject: string;
  content: string;
  previewText?: string;
  listId: string;
  scheduledAt?: Date;
}

export interface EmailSubscriber {
  id: string;
  storeId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tags: string[];
  status: SubscriberStatus;
  source?: string;
  subscribedAt: Date;
  unsubscribedAt?: Date;
  lastEngagedAt?: Date;
}

export interface CreateSubscriberInput {
  storeId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  source?: string;
}

// ===== CREATIVE PORTFOLIO =====

export type ProofingStatus = 'pending' | 'approved' | 'revisions_requested';
export type ContractType = 'service_agreement' | 'project_contract' | 'retainer' | 'nda';
export type ContractStatus = 'draft' | 'sent' | 'signed' | 'cancelled';

export interface ClientProofing {
  id: string;
  storeId: string;
  clientId: string;
  projectId: string;
  title: string;
  images: {
    id: string;
    url: string;
    thumbnail: string;
    filename: string;
  }[];
  status: ProofingStatus;
  selectedImages: string[];
  feedback?: string;
  revisionRound: number;
  expiresAt?: Date;
  password?: string;
  viewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateClientProofingInput {
  storeId: string;
  clientId: string;
  projectId: string;
  title: string;
  images: ClientProofing['images'];
  expiresAt?: Date;
  password?: string;
}

export interface ClientSelectionInput {
  selectedImageIds: string[];
  feedback?: string;
}

export interface TimeEntry {
  id: string;
  storeId: string;
  userId: string;
  projectId?: string;
  clientId?: string;
  task: string;
  description?: string;
  startedAt: Date;
  endedAt?: Date;
  duration: number;
  hourlyRate?: number;
  billable: boolean;
  invoiced: boolean;
  invoiceId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTimeEntryInput {
  storeId: string;
  userId: string;
  projectId?: string;
  clientId?: string;
  task: string;
  description?: string;
  startedAt: Date;
  hourlyRate?: number;
  billable?: boolean;
}

export interface UpdateTimeEntryInput {
  endedAt: Date;
  description?: string;
}

export interface ContractTemplate {
  id: string;
  storeId: string;
  name: string;
  type: ContractType;
  content: string;
  variables: string[];
  defaultTerms?: {
    paymentTerms?: string;
    revisionRounds?: number;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContractTemplateInput {
  storeId: string;
  name: string;
  type: ContractType;
  content: string;
  variables?: string[];
  defaultTerms?: ContractTemplate['defaultTerms'];
}

export interface SignedContract {
  id: string;
  templateId: string;
  clientId: string;
  projectId?: string;
  filledData: Record<string, string>;
  finalContent: string;
  status: ContractStatus;
  sentAt?: Date;
  signedAt?: Date;
  clientSignature?: string;
  providerSignature?: string;
  pdfUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSignedContractInput {
  templateId: string;
  clientId: string;
  projectId?: string;
  filledData: Record<string, string>;
}

export interface SignContractInput {
  signature: string;
  signedBy: 'client' | 'provider';
}
