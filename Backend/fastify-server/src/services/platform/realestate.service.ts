import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Real Estate Service - Property management features
 * 
 * Provides:
 * - Virtual tours with 360° scenes
 * - Maintenance request tracking
 * - Tenant feedback and ratings
 * - Analytics and reporting
 */

export interface PropertyVirtualTour {
  id: string;
  propertyId: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TourScene {
  id: string;
  tourId: string;
  name: string;
  description?: string;
  panoramaUrl: string;
  thumbnailUrl?: string;
  positionX: number;
  positionY: number;
  positionZ: number;
  orderIndex: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MaintenanceRequest {
  id: string;
  storeId: string;
  propertyId: string;
  tenantId: string;
  tenantName: string;
  tenantPhone: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'emergency';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  description: string;
  assignedTo?: string;
  cost?: number;
  notes?: string;
  tenantRating?: number;
  tenantFeedback?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class RealEstateService {
  // ==================== Virtual Tours ====================
  
  async getVirtualTour(propertyId: string) {
    try {
      const tour = await prisma.propertyVirtualTour.findFirst({
        where: { propertyId },
        include: {
          scenes: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!tour) return null;

      return {
        id: tour.id,
        propertyId: tour.propertyId,
        title: tour.title,
        description: tour.description,
        thumbnailUrl: tour.thumbnailUrl,
        isPublished: tour.isPublished,
        scenes: tour.scenes.map((s) => ({
          id: s.id,
          tourId: s.tourId,
          name: s.name,
          description: s.description,
          panoramaUrl: s.panoramaUrl,
          thumbnailUrl: s.thumbnailUrl,
          positionX: Number(s.positionX),
          positionY: Number(s.positionY),
          positionZ: Number(s.positionZ),
          orderIndex: s.orderIndex,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
        })),
        createdAt: tour.createdAt,
        updatedAt: tour.updatedAt,
      };
    } catch (error) {
      logger.error('[RealEstateService] Failed to get virtual tour', {
        propertyId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async createVirtualTour(data: any) {
    try {
      const tour = await prisma.propertyVirtualTour.create({
        data: {
          propertyId: data.propertyId,
          title: data.title,
          description: data.description,
          thumbnailUrl: data.thumbnailUrl,
          isPublished: data.isPublished ?? false,
        },
      });

      logger.info('[RealEstateService] Virtual tour created', {
        tourId: tour.id,
      });

      return {
        id: tour.id,
        propertyId: tour.propertyId,
        title: tour.title,
        description: tour.description,
        thumbnailUrl: tour.thumbnailUrl,
        isPublished: tour.isPublished,
        createdAt: tour.createdAt,
        updatedAt: tour.updatedAt,
      };
    } catch (error) {
      logger.error('[RealEstateService] Failed to create virtual tour', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async addTourScene(tourId: string, data: any) {
    try {
      const scene = await prisma.tourScene.create({
        data: {
          tourId,
          name: data.name,
          description: data.description,
          panoramaUrl: data.panoramaUrl,
          thumbnailUrl: data.thumbnailUrl,
          positionX: data.positionX,
          positionY: data.positionY,
          positionZ: data.positionZ,
          orderIndex: data.orderIndex || 0,
        },
      });

      logger.info('[RealEstateService] Tour scene added', {
        sceneId: scene.id,
      });

      return {
        id: scene.id,
        tourId: scene.tourId,
        name: scene.name,
        description: scene.description,
        panoramaUrl: scene.panoramaUrl,
        thumbnailUrl: scene.thumbnailUrl,
        positionX: Number(scene.positionX),
        positionY: Number(scene.positionY),
        positionZ: Number(scene.positionZ),
        orderIndex: scene.orderIndex,
        createdAt: scene.createdAt,
        updatedAt: scene.updatedAt,
      };
    } catch (error) {
      logger.error('[RealEstateService] Failed to add tour scene', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==================== Maintenance Requests ====================
  
  async getMaintenanceRequests(storeId: string, status?: string) {
    try {
      const where: any = { storeId };
      if (status) where.status = status;

      const requests = await prisma.maintenanceRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });

      return requests.map((r) => this.mapMaintenanceRequestRow(r));
    } catch (error) {
      logger.error('[RealEstateService] Failed to get maintenance requests', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async createMaintenanceRequest(data: any) {
    try {
      const request = await prisma.maintenanceRequest.create({
        data: {
          storeId: data.storeId,
          propertyId: data.propertyId,
          tenantId: data.tenantId,
          tenantName: data.tenantName,
          tenantPhone: data.tenantPhone,
          category: data.category,
          priority: data.priority || 'medium',
          status: 'pending',
          description: data.description,
        },
      });

      logger.info('[RealEstateService] Maintenance request created', {
        requestId: request.id,
      });

      return this.mapMaintenanceRequestRow(request);
    } catch (error) {
      logger.error('[RealEstateService] Failed to create maintenance request', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async assignMaintenanceRequest(id: string, assignedTo: string) {
    try {
      const request = await prisma.maintenanceRequest.update({
        where: { id },
        data: {
          assignedTo,
          status: 'assigned',
        },
      });

      logger.info('[RealEstateService] Maintenance request assigned', {
        requestId: id,
      });

      return this.mapMaintenanceRequestRow(request);
    } catch (error) {
      logger.error('[RealEstateService] Failed to assign maintenance request', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async completeMaintenanceRequest(id: string, data: any) {
    try {
      const request = await prisma.maintenanceRequest.update({
        where: { id },
        data: {
          cost: data.cost,
          notes: data.notes,
          status: 'completed',
          completedAt: new Date(),
        },
      });

      logger.info('[RealEstateService] Maintenance request completed', {
        requestId: id,
      });

      return this.mapMaintenanceRequestRow(request);
    } catch (error) {
      logger.error('[RealEstateService] Failed to complete maintenance request', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async addTenantFeedback(id: string, data: any) {
    try {
      const request = await prisma.maintenanceRequest.update({
        where: { id },
        data: {
          tenantRating: data.rating,
          tenantFeedback: data.feedback,
        },
      });

      logger.info('[RealEstateService] Tenant feedback added', {
        requestId: id,
      });

      return this.mapMaintenanceRequestRow(request);
    } catch (error) {
      logger.error('[RealEstateService] Failed to add tenant feedback', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==================== Analytics ====================
  
  async getMaintenanceAnalytics(storeId: string, period: number = 30) {
    try {
      const since = new Date();
      since.setDate(since.getDate() - period);

      const requests = await prisma.maintenanceRequest.findMany({
        where: {
          storeId,
          createdAt: { gte: since },
        },
      });

      const byStatus = requests.reduce((acc: Record<string, number>, r) => {
        acc[r.status] = (acc[r.status] || 0) + 1;
        return acc;
      }, {});

      const byCategory = requests.reduce((acc: Record<string, number>, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
      }, {});

      const completedRequests = requests.filter((r) => r.completedAt);
      const avgResolutionTime = completedRequests.length > 0
        ? completedRequests.reduce((sum, r) => {
            const days = (new Date(r.completedAt!).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / completedRequests.length
        : 0;

      return {
        total: requests.length,
        byStatus,
        byCategory,
        avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
        period,
      };
    } catch (error) {
      logger.error('[RealEstateService] Failed to get maintenance analytics', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  // ==================== Helpers ====================
  
  private mapMaintenanceRequestRow(r: any): MaintenanceRequest {
    return {
      id: r.id,
      storeId: r.storeId,
      propertyId: r.propertyId,
      tenantId: r.tenantId,
      tenantName: r.tenantName,
      tenantPhone: r.tenantPhone,
      category: r.category,
      priority: r.priority as any,
      status: r.status as any,
      description: r.description,
      assignedTo: r.assignedTo ?? undefined,
      cost: r.cost ? Number(r.cost) : undefined,
      notes: r.notes ?? undefined,
      tenantRating: r.tenantRating ?? undefined,
      tenantFeedback: r.tenantFeedback ?? undefined,
      completedAt: r.completedAt ?? undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }
}
