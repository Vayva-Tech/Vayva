import { api } from '@/lib/api-client';
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
    const response = await api.get(`/realestate/properties/${propertyId}/virtual-tour`);
    return response.data || null;
  }

  async createVirtualTour(
    data: Omit<PropertyVirtualTour, 'id' | 'createdAt' | 'updatedAt' | 'scenes'>
  ): Promise<PropertyVirtualTour> {
    const response = await api.post('/realestate/virtual-tours', {
      ...data,
    });
    return response.data || {};
  }

  async addTourScene(
    tourId: string,
    data: Omit<TourScene, 'id' | 'tourId'>
  ): Promise<TourScene> {
    const response = await api.post(`/realestate/tours/${tourId}/scenes`, {
      tourId,
      ...data,
    });
    return response.data || {};
  }
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
    const response = await api.get(`/realestate/${storeId}/maintenance-requests`, {
      status,
    });
    return response.data || [];
  }

  async createMaintenanceRequest(
    data: Omit<MaintenanceRequest, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'completedAt' | 'cost' | 'tenantRating' | 'tenantFeedback' | 'assignedTo'>
  ): Promise<MaintenanceRequest> {
    const response = await api.post('/realestate/maintenance-requests', {
      ...data,
    });
    return response.data || {};
  }

  async assignMaintenanceRequest(
    id: string,
    assignedTo: string
  ): Promise<MaintenanceRequest> {
    const response = await api.post(`/realestate/maintenance-requests/${id}/assign`, {
      assignedTo,
    });
    return response.data || {};
  }

  async completeMaintenanceRequest(
    id: string,
    data: {
      cost?: number;
      notes?: string;
    }
  ): Promise<MaintenanceRequest> {
    const response = await api.post(`/realestate/maintenance-requests/${id}/complete`, {
      cost: data.cost,
      notes: data.notes,
    });
    return response.data || {};
  }

  async addTenantFeedback(
    id: string,
    data: {
      rating: number;
      feedback: string;
    }
  ): Promise<MaintenanceRequest> {
    const response = await api.post(`/realestate/maintenance-requests/${id}/feedback`, {
      rating: data.rating,
      feedback: data.feedback,
    });
    return response.data || {};
  }
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
