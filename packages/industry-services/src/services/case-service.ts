// @ts-nocheck
/**
 * Case Service
 * Specialized service for case management
 */

import { prisma } from '@vayva/db';
import { Case, CaseStatus, PriorityLevel } from '../types';

export class CaseService {
  private storeId: string;

  constructor(storeId: string) {
    this.storeId = storeId;
  }

  async createCase(data: Omit<Case, 'id' | 'createdAt' | 'updatedAt'>) {
    return await prisma.serviceCase.create({
      data: {
        ...data,
        storeId: this.storeId,
        status: 'open',
      },
      include: {
        serviceProvider: true,
        customer: true,
      },
    });
  }

  async getCases(filters?: {
    status?: CaseStatus;
    customerId?: string;
    serviceProviderId?: string;
    priority?: PriorityLevel;
    category?: string;
  }) {
    const where: any = { storeId: this.storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.customerId) where.customerId = filters.customerId;
    if (filters?.serviceProviderId) where.serviceProviderId = filters.serviceProviderId;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.category) where.category = filters.category;

    return await prisma.serviceCase.findMany({
      where,
      include: {
        serviceProvider: true,
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getCaseById(caseId: string) {
    return await prisma.serviceCase.findUnique({
      where: { id: caseId },
      include: {
        serviceProvider: true,
        customer: true,
      },
    });
  }

  async updateCaseStatus(caseId: string, status: CaseStatus, resolution?: string) {
    const updateData: any = { status };
    
    if (resolution) {
      updateData.resolution = resolution;
    }
    
    if (status === 'resolved' || status === 'closed') {
      updateData.updatedAt = new Date();
    }

    return await prisma.serviceCase.update({
      where: { id: caseId },
      data: updateData,
      include: {
        serviceProvider: true,
        customer: true,
      },
    });
  }

  async assignCase(caseId: string, assignedTo: string) {
    return await prisma.serviceCase.update({
      where: { id: caseId },
      data: { assignedTo },
      include: {
        serviceProvider: true,
        customer: true,
      },
    });
  }

  async addCaseNote(caseId: string, note: string) {
    // This would typically be stored in a separate notes table
    // For now, we'll append to existing notes field
    const existingCase = await prisma.serviceCase.findUnique({
      where: { id: caseId },
    });

    const updatedNotes = existingCase?.notes 
      ? `${existingCase.notes}\n\n${new Date().toISOString()}: ${note}`
      : note;

    return await prisma.serviceCase.update({
      where: { id: caseId },
      data: { notes: updatedNotes },
    });
  }

  async getCasesByPriority(priority: PriorityLevel) {
    return await prisma.serviceCase.findMany({
      where: {
        storeId: this.storeId,
        priority,
        status: { not: 'closed' },
      },
      include: {
        serviceProvider: true,
        customer: true,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getOverdueCases() {
    const now = new Date();
    return await prisma.serviceCase.findMany({
      where: {
        storeId: this.storeId,
        dueDate: { lte: now },
        status: { in: ['open', 'in_progress'] },
      },
      include: {
        serviceProvider: true,
        customer: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getCaseStats() {
    const byStatus = await prisma.serviceCase.groupBy({
      by: ['status'],
      where: { storeId: this.storeId },
      _count: true,
    });

    const byPriority = await prisma.serviceCase.groupBy({
      by: ['priority'],
      where: { storeId: this.storeId },
      _count: true,
    });

    const overdueCount = await prisma.serviceCase.count({
      where: {
        storeId: this.storeId,
        dueDate: { lte: new Date() },
        status: { in: ['open', 'in_progress'] },
      },
    });

    return {
      byStatus: byStatus.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.status.toLowerCase()] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      byPriority: byPriority.reduce((acc: Record<string, number>, stat: any) => {
        acc[stat.priority.toLowerCase()] = stat._count;
        return acc;
      }, {} as Record<string, number>),
      overdue: overdueCount,
    };
  }
}