// @ts-nocheck
/**
 * Certificate Management Feature
 * 
 * Handles certificate generation, verification, and tracking
 */

import type { PrismaClient } from '@vayva/db';
import type { Certificate, GenerateCertificateResponse } from '../types';

/**
 * Get recent certificates
 */
export async function getCertificates(
  prisma: PrismaClient,
  storeId: string,
  options?: {
    studentId?: string;
    courseId?: string;
    limit?: number;
  }
): Promise<Certificate[]> {
  const { studentId, courseId, limit = 50 } = options || {};

  const where: any = { storeId };
  
  if (studentId) {
    where.studentId = studentId;
  }
  
  if (courseId) {
    where.courseId = courseId;
  }

  const certificates = await prisma.certificate.findMany({
    where,
    include: {
      student: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
    orderBy: {
      issuedAt: 'desc',
    },
    take: limit,
  });

  return certificates.map(transformCertificate);
}

/**
 * Generate a certificate for course completion
 */
export async function generateCertificate(
  prisma: PrismaClient,
  storeId: string,
  studentId: string,
  courseId: string,
  templateId?: string
): Promise<GenerateCertificateResponse['data']> {
  // Verify student completed the course
  const enrollment = await prisma.enrollment.findFirst({
    where: {
      studentId,
      courseId,
      status: 'completed',
    },
  });

  if (!enrollment) {
    throw new Error('Student has not completed the course');
  }

  // Check if certificate already exists
  const existingCertificate = await prisma.certificate.findFirst({
    where: {
      studentId,
      courseId,
    },
  });

  if (existingCertificate) {
    throw new Error('Certificate already issued for this course');
  }

  // Generate certificate number and verification code
  const certificateNumber = `CERT-${storeId.toUpperCase()}-${Date.now()}`;
  const verificationCode = generateVerificationCode();

  // Create certificate
  const certificate = await prisma.certificate.create({
    data: {
      storeId,
      studentId,
      courseId,
      certificateNumber,
      verificationCode,
      templateUrl: templateId || '/templates/default-certificate.svg',
      grade: enrollment.grade,
      issuedAt: new Date(),
    },
    include: {
      student: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  const transformedCert = transformCertificate(certificate);

  return {
    certificate: transformedCert,
    downloadUrl: `/api/certificates/${certificate.id}/download`,
    verificationUrl: `/verify/${verificationCode}`,
  };
}

/**
 * Verify a certificate by verification code
 */
export async function verifyCertificate(
  prisma: PrismaClient,
  verificationCode: string
): Promise<{ valid: boolean; certificate?: Certificate }> {
  const certificate = await prisma.certificate.findUnique({
    where: { verificationCode },
    include: {
      student: {
        select: {
          name: true,
          email: true,
        },
      },
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!certificate) {
    return { valid: false };
  }

  return {
    valid: true,
    certificate: transformCertificate(certificate),
  };
}

/**
 * Bulk generate certificates for all completed students
 */
export async function bulkGenerateCertificates(
  prisma: PrismaClient,
  storeId: string,
  courseId: string,
  templateId?: string
): Promise<number> {
  // Find all completed enrollments without certificates
  const completedEnrollments = await prisma.enrollment.findMany({
    where: {
      storeId,
      courseId,
      status: 'completed',
    },
    include: {
      student: true,
    },
  });

  // Filter out students who already have certificates
  const existingCertificates = await prisma.certificate.findMany({
    where: {
      storeId,
      courseId,
    },
    select: {
      studentId: true,
    },
  });

  const existingStudentIds = new Set(
    existingCertificates.map((c) => c.studentId)
  );

  const eligibleEnrollments = completedEnrollments.filter(
    (e) => !existingStudentIds.has(e.studentId)
  );

  // Generate certificates for eligible students
  let generatedCount = 0;
  
  for (const enrollment of eligibleEnrollments) {
    try {
      await generateCertificate(
        prisma,
        storeId,
        enrollment.studentId,
        courseId,
        templateId
      );
      generatedCount++;
    } catch (error) {
      console.error(`Error generating certificate for student ${enrollment.studentId}:`, error);
    }
  }

  return generatedCount;
}

// Helper functions
function transformCertificate(cert: any): Certificate {
  return {
    id: cert.id,
    studentId: cert.studentId,
    studentName: cert.student?.name || cert.student?.email,
    courseId: cert.courseId,
    courseTitle: cert.course?.title,
    certificateNumber: cert.certificateNumber,
    issuedAt: cert.issuedAt,
    grade: cert.grade,
    verificationCode: cert.verificationCode,
    templateUrl: cert.templateUrl,
    studentEmail: cert.student?.email,
  };
}

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
