import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { Assignment as AssignmentDb, LicenseKey as LicenseKeyDb, Submission as SubmissionDb, Prisma } from '@vayva/db';
import type {
  LicenseKey,
  LicenseStatus,
  CreateLicenseKeyInput,
  Assignment,
  AssignmentType,
  CreateAssignmentInput,
  Submission,
  CreateSubmissionInput,
  GradeSubmissionInput,
  SubmissionStatus,
} from '@/types/phase3-industry';

function toOptionalDate(value: Date | null | undefined): Date | undefined {
  return value ?? undefined;
}

function mapLicenseKey(key: LicenseKeyDb): LicenseKey {
  return {
    id: key.id,
    storeId: key.storeId,
    productId: key.productId,
    customerId: key.customerId,
    orderId: key.orderId,
    licenseKey: key.licenseKey,
    status: key.status as LicenseStatus,
    maxActivations: key.maxActivations,
    currentActivations: key.currentActivations,
    expiresAt: toOptionalDate(key.expiresAt),
    lastActivatedAt: toOptionalDate(key.lastActivatedAt),
    revokedAt: toOptionalDate(key.revokedAt),
    revokeReason: key.revokeReason ?? undefined,
    createdAt: key.createdAt,
  };
}

function mapAssignment(assignment: AssignmentDb): Assignment {
  return {
    id: assignment.id,
    courseId: assignment.courseId,
    moduleId: assignment.moduleId,
    lessonId: assignment.lessonId,
    title: assignment.title,
    description: assignment.description,
    type: assignment.type as AssignmentType,
    instructions: assignment.instructions,
    rubric: (assignment.rubric ?? undefined) as unknown as Assignment['rubric'],
    maxScore: assignment.maxScore,
    dueDate: toOptionalDate(assignment.dueDate),
    timeLimit: assignment.timeLimit ?? undefined,
    maxAttempts: assignment.maxAttempts,
    isPublished: assignment.isPublished,
    createdAt: assignment.createdAt,
    updatedAt: assignment.updatedAt,
  };
}

function mapSubmission(submission: SubmissionDb): Submission {
  return {
    id: submission.id,
    assignmentId: submission.assignmentId,
    enrollmentId: submission.enrollmentId,
    answers: submission.answers as unknown as Submission['answers'],
    score: submission.score ?? undefined,
    feedback: submission.feedback ?? undefined,
    gradedBy: submission.gradedBy ?? undefined,
    submittedAt: submission.submittedAt,
    gradedAt: toOptionalDate(submission.gradedAt),
    attemptNumber: submission.attemptNumber,
    status: submission.status as SubmissionStatus,
  };
}

export class DigitalProductsService {
  // ===== LICENSE KEYS =====

  async getLicenseKeys(
    storeId: string,
    filters?: { productId?: string; customerId?: string; status?: LicenseStatus }
  ): Promise<LicenseKey[]> {
    const keys = await prisma.licenseKey.findMany({
      where: {
        storeId,
        ...(filters?.productId && { productId: filters.productId }),
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.status && { status: filters.status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map(mapLicenseKey);
  }

  async getLicenseByKey(licenseKey: string): Promise<LicenseKey | null> {
    const key = await prisma.licenseKey.findUnique({
      where: { licenseKey },
    });

    if (!key) return null;

    return mapLicenseKey(key);
  }

  async createLicenseKey(data: CreateLicenseKeyInput): Promise<LicenseKey> {
    const licenseKey = this.generateLicenseKey();

    const key = await prisma.licenseKey.create({
      data: {
        storeId: data.storeId,
        productId: data.productId,
        customerId: data.customerId,
        orderId: data.orderId,
        licenseKey,
        status: 'active',
        maxActivations: data.maxActivations ?? 1,
        currentActivations: 0,
        expiresAt: data.expiresAt,
      },
    });

    return mapLicenseKey(key);
  }

  async activateLicense(licenseKey: string): Promise<LicenseKey> {
    const key = await prisma.licenseKey.findUnique({
      where: { licenseKey },
    });

    if (!key) {
      throw new Error('License key not found');
    }

    if (key.status !== 'active') {
      throw new Error(`License is ${key.status}`);
    }

    if (key.currentActivations >= key.maxActivations) {
      throw new Error('Maximum activations reached');
    }

    if (key.expiresAt && new Date() > key.expiresAt) {
      throw new Error('License has expired');
    }

    const updated = await prisma.licenseKey.update({
      where: { licenseKey },
      data: {
        currentActivations: { increment: 1 },
        lastActivatedAt: new Date(),
      },
    });

    return mapLicenseKey(updated);
  }

  async revokeLicense(licenseKey: string, reason: string): Promise<LicenseKey> {
    const updated = await prisma.licenseKey.update({
      where: { licenseKey },
      data: {
        status: 'revoked',
        revokedAt: new Date(),
        revokeReason: reason,
      },
    });

    return mapLicenseKey(updated);
  }

  private generateLicenseKey(): string {
    const bytes = crypto.randomBytes(16);
    return bytes.toString('base64').replace(/[+/=]/g, '').substring(0, 24).toUpperCase();
  }

  // ===== ASSIGNMENTS =====

  async getAssignments(courseId: string): Promise<Assignment[]> {
    const assignments = await prisma.assignment.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
    });

    return assignments.map(mapAssignment);
  }

  async createAssignment(data: CreateAssignmentInput): Promise<Assignment> {
    const assignment = await prisma.assignment.create({
      data: {
        courseId: data.courseId,
        moduleId: data.moduleId,
        lessonId: data.lessonId,
        title: data.title,
        description: data.description,
        type: data.type,
        instructions: data.instructions,
        rubric: (data.rubric ?? undefined) as unknown as Prisma.InputJsonValue,
        maxScore: data.maxScore,
        dueDate: data.dueDate,
        timeLimit: data.timeLimit,
        maxAttempts: data.maxAttempts ?? 1,
        isPublished: false,
      },
    });

    return mapAssignment(assignment);
  }

  async publishAssignment(id: string): Promise<Assignment> {
    const assignment = await prisma.assignment.update({
      where: { id },
      data: { isPublished: true },
    });

    return mapAssignment(assignment);
  }

  // ===== SUBMISSIONS =====

  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    const submissions = await prisma.submission.findMany({
      where: { assignmentId },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions.map(mapSubmission);
  }

  async getStudentSubmissions(enrollmentId: string): Promise<Submission[]> {
    const submissions = await prisma.submission.findMany({
      where: { enrollmentId },
      orderBy: { submittedAt: 'desc' },
    });

    return submissions.map(mapSubmission);
  }

  async createSubmission(data: CreateSubmissionInput): Promise<Submission> {
    const assignment = await prisma.assignment.findUnique({
      where: { id: data.assignmentId },
    });

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const existingSubmissions = await prisma.submission.count({
      where: {
        assignmentId: data.assignmentId,
        enrollmentId: data.enrollmentId,
      },
    });

    if (existingSubmissions >= assignment.maxAttempts) {
      throw new Error('Maximum attempts reached for this assignment');
    }

    const submission = await prisma.submission.create({
      data: {
        assignmentId: data.assignmentId,
        enrollmentId: data.enrollmentId,
        answers: data.answers as unknown as Prisma.InputJsonValue,
        attemptNumber: existingSubmissions + 1,
        status: 'submitted',
      },
    });

    return mapSubmission(submission);
  }

  async gradeSubmission(
    submissionId: string,
    data: GradeSubmissionInput
  ): Promise<Submission> {
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        score: data.score,
        feedback: data.feedback,
        gradedBy: data.gradedBy,
        gradedAt: new Date(),
        status: 'graded',
      },
    });

    return mapSubmission(submission);
  }

  async requestResubmit(submissionId: string, feedback: string): Promise<Submission> {
    const submission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        feedback,
        status: 'resubmit',
      },
    });

    return mapSubmission(submission);
  }
}

export const digitalProductsService = new DigitalProductsService();
