/**
 * Application Service
 * Specialized service for application management
 */

import { prisma } from '@vayva/db';
import { Application, ApplicationStatus, ServiceType } from '../types';

export class ApplicationService {
  private storeId: string;

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  async createApplication(data: Omit<Application, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'submittedAt'>) {
    // Check for duplicate applications
    const existing = await prisma.serviceApplication.findFirst({
      where: {
        storeId: this.storeId,
        email: data.email,
        serviceType: data.serviceType,
        status: { in: ['submitted', 'under_review'] },
      },
    });

    if (existing) {
      throw new Error('An application from this email for this service type is already pending');
    }

    return await prisma.serviceApplication.create({
      data: {
        ...data,
        storeId: this.storeId,
        status: 'submitted',
        submittedAt: new Date(),
      },
    });
  }

  async getApplications(filters?: {
    status?: ApplicationStatus;
    serviceType?: ServiceType;
    email?: string;
  }) {
    const where: any = { storeId: this.storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.serviceType) where.serviceType = filters.serviceType;
    if (filters?.email) where.email = filters.email;

    return await prisma.serviceApplication.findMany({
      where,
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getApplicationById(applicationId: string) {
    return await prisma.serviceApplication.findUnique({
      where: { id: applicationId },
    });
  }

  async updateApplicationStatus(
    applicationId: string, 
    status: ApplicationStatus, 
    reviewerId?: string,
    notes?: string
  ) {
    const updateData: any = { 
      status,
      reviewedAt: new Date(),
    };

    if (reviewerId) updateData.reviewerId = reviewerId;
    if (notes) updateData.notes = notes;
    
    if (status === 'approved' || status === 'rejected') {
      updateData.decisionAt = new Date();
    }

    return await prisma.serviceApplication.update({
      where: { id: applicationId },
      data: updateData,
    });
  }

  async addDocument(applicationId: string, document: { name: string; url: string; type: string }) {
    const application = await prisma.serviceApplication.findUnique({
      where: { id: applicationId },
    });

    if (!application) {
      throw new Error('Application not found');
    }

    const documents = application.documents ? [...application.documents, document] : [document];

    return await prisma.serviceApplication.update({
      where: { id: applicationId },
      data: { documents },
    });
  }

  async getPendingApplications() {
    return await prisma.serviceApplication.findMany({
      where: {
        storeId: this.storeId,
        status: 'submitted',
      },
      orderBy: { submittedAt: 'asc' },
    });
  }

  async getApplicationsByServiceType(serviceType: ServiceType) {
    return await prisma.serviceApplication.findMany({
      where: {
        storeId: this.storeId,
        serviceType,
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getApplicationStats() {
    const byStatus = await prisma.serviceApplication.groupBy({
      by: ['status'],
      where: { storeId: this.storeId },
      _count: true,
    });

    const byServiceType = await prisma.serviceApplication.groupBy({
      by: ['serviceType'],
      where: { storeId: this.storeId },
      _count: true,
    });

    const recentCount = await prisma.serviceApplication.count({
      where: {
        storeId: this.storeId,
        submittedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    });

    return {
      byStatus: byStatus.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.status.toLowerCase()] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      byServiceType: byServiceType.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.serviceType.toLowerCase()] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      recent: recentCount,
    };
  }

  async deleteApplication(applicationId: string) {
    return await prisma.serviceApplication.delete({
      where: { id: applicationId },
    });
  }
}