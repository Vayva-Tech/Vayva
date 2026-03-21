import { prisma } from '@/lib/prisma';
import type {
  PropertyVirtualTour,
  TourScene,
  MaintenanceRequest,
  MaintenanceStatus,
  MaintenancePriority,
} from '@/types/phase2-industry';

export class RealEstateService {
  // ===== VIRTUAL TOURS =====

  async getVirtualTour(propertyId: string): Promise<PropertyVirtualTour | null> {
    const tour = await prisma.propertyVirtualTour?.findUnique({
      where: { propertyId },
    });

    if (!tour) return null;

    const scenes = await prisma.tourScene?.findMany({
      where: { tourId: tour.id },
    });

    return {
      id: tour.id,
      propertyId: tour.propertyId,
      isActive: tour.isActive,
      coverImageUrl: tour.coverImageUrl,
      autoRotate: tour.autoRotate,
      showZoomCtrl: tour.showZoomCtrl,
      defaultPitch: Number(tour.defaultPitch),
      defaultYaw: Number(tour.defaultYaw),
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
      scenes: scenes.map((s: any) => ({
        id: s.id,
        tourId: s.tourId,
        sceneId: s.sceneId,
        title: s.title,
        panoramaUrl: s.panoramaUrl,
        thumbnailUrl: s.thumbnailUrl ?? undefined,
        positionX: Number(s.positionX),
        positionY: Number(s.positionY),
        positionZ: Number(s.positionZ),
      })),
    } as any;
  }

  async createVirtualTour(
    data: Omit<PropertyVirtualTour, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>
  ): Promise<PropertyVirtualTour> {
    const tour = await prisma.propertyVirtualTour?.create({
      data: {
        propertyId: data.propertyId,
        isActive: data.isActive,
        coverImageUrl: data.coverImageUrl,
        autoRotate: data.autoRotate,
        showZoomCtrl: data.showZoomCtrl,
        defaultPitch: data.defaultPitch,
        defaultYaw: data.defaultYaw,
      },
    });

    return {
      id: tour.id,
      propertyId: tour.propertyId,
      isActive: tour.isActive,
      coverImageUrl: tour.coverImageUrl,
      autoRotate: tour.autoRotate,
      showZoomCtrl: tour.showZoomCtrl,
      defaultPitch: Number(tour.defaultPitch),
      defaultYaw: Number(tour.defaultYaw),
      createdAt: tour.createdAt,
      updatedAt: tour.updatedAt,
      scenes: [],
    } as any;
  }

  async addTourScene(
    tourId: string,
    data: Omit<TourScene, 'id' | 'tourId'>
  ): Promise<TourScene> {
    const scene = await prisma.tourScene?.create({
      data: {
        tourId,
        sceneId: data.sceneId,
        title: data.title,
        panoramaUrl: data.panoramaUrl,
        thumbnailUrl: data.thumbnailUrl,
        positionX: data.positionX,
        positionY: data.positionY,
        positionZ: data.positionZ,
      },
    });

    return {
      id: scene.id,
      tourId: scene.tourId,
      sceneId: scene.sceneId,
      title: scene.title,
      panoramaUrl: scene.panoramaUrl,
      thumbnailUrl: scene.thumbnailUrl ?? undefined,
      positionX: Number(scene.positionX),
      positionY: Number(scene.positionY),
      positionZ: Number(scene.positionZ),
    };
  }

  // ===== MAINTENANCE REQUESTS =====

  async getMaintenanceRequests(
    storeId: string,
    status?: MaintenanceStatus
  ): Promise<MaintenanceRequest[]> {
    const requests = await prisma.maintenanceRequest?.findMany({
      where: {
        storeId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests.map((r: any) => ({
      id: r.id,
      storeId: r.storeId,
      propertyId: r.propertyId,
      tenantId: r.tenantId,
      category: r.category,
      priority: r.priority as MaintenancePriority,
      description: r.description,
      images: r.images,
      status: (r as any).status as MaintenanceStatus,
      assignedTo: r.assignedTo ?? undefined,
      completedAt: r.completedAt ?? undefined,
      cost: r.cost ? Number(r.cost) : undefined,
      tenantRating: r.tenantRating ?? undefined,
      tenantFeedback: r.tenantFeedback ?? undefined,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    }));
  }

  async createMaintenanceRequest(
    data: Omit<MaintenanceRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'completedAt' | 'cost' | 'tenantRating' | 'tenantFeedback' | 'assignedTo'>
  ): Promise<MaintenanceRequest> {
    const request = await prisma.maintenanceRequest?.create({
      data: {
        storeId: data.storeId,
        propertyId: data.propertyId,
        tenantId: data.tenantId,
        category: data.category,
        priority: data.priority,
        description: data.description,
        images: data.images,
        status: 'submitted',
      },
    });

    return {
      id: request.id,
      storeId: request.storeId,
      propertyId: request.propertyId,
      tenantId: request.tenantId,
      category: request.category,
      priority: request.priority as MaintenancePriority,
      description: request.description,
      images: request.images,
      status: (request as any).status as MaintenanceStatus,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  async assignMaintenanceRequest(
    id: string,
    assignedTo: string
  ): Promise<MaintenanceRequest> {
    const request = await prisma.maintenanceRequest?.update({
      where: { id },
      data: { assignedTo, status: 'assigned' },
    });

    return {
      id: request.id,
      storeId: request.storeId,
      propertyId: request.propertyId,
      tenantId: request.tenantId,
      category: request.category,
      priority: request.priority as MaintenancePriority,
      description: request.description,
      images: request.images,
      status: (request as any).status as MaintenanceStatus,
      assignedTo: request.assignedTo ?? undefined,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  async completeMaintenanceRequest(
    id: string,
    data: {
      cost?: number;
      notes?: string;
    }
  ): Promise<MaintenanceRequest> {
    const request = await prisma.maintenanceRequest?.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        cost: data.cost,
      },
    });

    return {
      id: request.id,
      storeId: request.storeId,
      propertyId: request.propertyId,
      tenantId: request.tenantId,
      category: request.category,
      priority: request.priority as MaintenancePriority,
      description: request.description,
      images: request.images,
      status: (request as any).status as MaintenanceStatus,
      assignedTo: request.assignedTo ?? undefined,
      completedAt: request.completedAt ?? undefined,
      cost: request.cost ? Number(request.cost) : undefined,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  async addTenantFeedback(
    id: string,
    data: {
      rating: number;
      feedback: string;
    }
  ): Promise<MaintenanceRequest> {
    const request = await prisma.maintenanceRequest?.update({
      where: { id },
      data: {
        tenantRating: data.rating,
        tenantFeedback: data.feedback,
      },
    });

    return {
      id: request.id,
      storeId: request.storeId,
      propertyId: request.propertyId,
      tenantId: request.tenantId,
      category: request.category,
      priority: request.priority as MaintenancePriority,
      description: request.description,
      images: request.images,
      status: (request as any).status as MaintenanceStatus,
      assignedTo: request.assignedTo ?? undefined,
      completedAt: request.completedAt ?? undefined,
      cost: request.cost ? Number(request.cost) : undefined,
      tenantRating: request.tenantRating ?? undefined,
      tenantFeedback: request.tenantFeedback ?? undefined,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    };
  }

  // ===== ANALYTICS =====

  async getMaintenanceAnalytics(storeId: string, period: number = 30): Promise<any> {
    const since = new Date();
    since.setDate(since.getDate() - period);

    const requests = await prisma.maintenanceRequest?.findMany({
      where: {
        storeId,
        createdAt: { gte: since },
      },
    });

    const byStatus = requests.reduce((acc: Record<string, number>, r: any) => {
      acc[(r as any).status] = (acc[(r as any).status] || 0) + 1;
      return acc;
    }, {});

    const byCategory = requests.reduce((acc: Record<string, number>, r: any) => {
      acc[r.category] = (acc[r.category] || 0) + 1;
      return acc;
    }, {});

    const avgResolutionTime = requests
      .filter((r: any) => r.completedAt)
      .reduce((sum: number, r: any) => {
        const days = (new Date(r.completedAt).getTime() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / requests.filter((r: any) => r.completedAt).length || 0;

    return {
      total: requests.length,
      byStatus,
      byCategory,
      avgResolutionTime: Math.round(avgResolutionTime * 10) / 10,
      period,
    };
  }
}

export const realEstateService = new RealEstateService();
