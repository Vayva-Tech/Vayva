import { api } from '@/lib/api-client';
import type {
  SkinProfile,
  CreateSkinProfileInput,
  ProductShade,
  RoutineBuilder,
  SkinType,
} from '@/types/phase2-industry';

export class BeautyService {
  // ===== SKIN PROFILES =====

  async getSkinProfile(storeId: string, customerId: string): Promise<SkinProfile | null> {
    const response = await api.get(`/beauty/${storeId}/customers/${customerId}/skin-profile`);
    return response.data || null;
  }

  async createSkinProfile(storeId: string, data: CreateSkinProfileInput): Promise<SkinProfile> {
    const response = await api.post(`/beauty/${storeId}/skin-profiles`, {
      storeId,
      ...data,
    });
    return response.data || {};
  }

  async updateSkinProfile(
    storeId: string,
    customerId: string,
    data: Partial<CreateSkinProfileInput>
  ): Promise<SkinProfile> {
    const response = await api.put(`/beauty/${storeId}/customers/${customerId}/skin-profile`, {
      storeId,
      ...data,
    });
    return response.data || {};
  }
      concerns: profile.concerns,
      allergies: profile.allergies,
      quizResults: profile.quizResults as any,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  // ===== PRODUCT SHADES =====

  async getProductShades(productId: string): Promise<ProductShade[]> {
    const response = await api.get(`/beauty/products/${productId}/shades`);
    return response.data || [];
  }

  async createProductShade(
    data: Omit<ProductShade, 'id'>
  ): Promise<ProductShade> {
    const response = await api.post('/beauty/shades', {
      ...data,
    });
    return response.data || {};
  }

  // ===== ROUTINE BUILDERS =====

  async getRoutinesByStore(storeId: string): Promise<RoutineBuilder[]> {
    const response = await api.get(`/beauty/${storeId}/routines`);
    return response.data || [];
  }

  async getRecommendedRoutines(
    storeId: string,
    customerId: string
  ): Promise<RoutineBuilder[]> {
    const response = await api.get(`/beauty/${storeId}/customers/${customerId}/recommended-routines`);
    return response.data || [];
  }

  async createRoutine(
    storeId: string,
    data: Omit<RoutineBuilder, 'id' | 'storeId' | 'createdAt' | 'updatedAt' | 'isActive'>
  ): Promise<RoutineBuilder> {
    const response = await api.post(`/beauty/${storeId}/routines`, {
      storeId,
      ...data,
    });
    return response.data || {};
  }

  // ===== SHADE MATCHING =====

  async matchShade(
    storeId: string,
    productId: string,
    customerId: string
  ): Promise<ProductShade | null> {
    const response = await api.get(`/beauty/${storeId}/products/${productId}/match-shade`, {
      customerId,
    });
    return response.data || null;
  }
    return {
      id: match.id,
      productId: match.productId,
      shadeName: match.shadeName,
      hexColor: match.hexColor ?? undefined,
      skinToneMatch: match.skinToneMatch,
      undertoneMatch: match.undertoneMatch as any,
      imageUrl: match.imageUrl ?? undefined,
    };
  }
}

export const beautyService = new BeautyService();
