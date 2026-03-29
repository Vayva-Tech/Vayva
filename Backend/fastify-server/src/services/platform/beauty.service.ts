import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * Beauty Service - Beauty and cosmetics industry features
 * 
 * Provides:
 * - Skin profiles
 * - Product shades
 * - Routine builders
 * - Skin type assessments
 */

export interface SkinProfile {
  id: string;
  storeId: string;
  customerId: string;
  skinType: 'normal' | 'dry' | 'oily' | 'combination' | 'sensitive';
  concerns: string[];
  allergies: string[];
  quizResults?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductShade {
  id: string;
  productId: string;
  name: string;
  description?: string;
  colorCode: string;
  undertone: 'warm' | 'cool' | 'neutral';
  intensity: number; // 1-10 scale
  inventory: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RoutineBuilder {
  id: string;
  storeId: string;
  name: string;
  steps: any[];
  skinType: string;
  concerns: string[];
  morningProducts: string[];
  eveningProducts: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class BeautyService {
  // ==================== Skin Profiles ====================
  
  async getSkinProfile(storeId: string, customerId: string) {
    try {
      const profile = await prisma.skinProfile.findFirst({
        where: { storeId, customerId },
        orderBy: { updatedAt: 'desc' },
      });

      if (!profile) return null;

      return {
        id: profile.id,
        storeId: profile.storeId,
        customerId: profile.customerId,
        skinType: profile.skinType as any,
        concerns: profile.concerns ? JSON.parse(profile.concerns as string) : [],
        allergies: profile.allergies ? JSON.parse(profile.allergies as string) : [],
        quizResults: profile.quizResults ? JSON.parse(profile.quizResults as string) : null,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      logger.error('[BeautyService] Failed to get skin profile', {
        storeId,
        customerId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }

  async createSkinProfile(storeId: string, data: any) {
    try {
      const profile = await prisma.skinProfile.create({
        data: {
          storeId,
          customerId: data.customerId,
          skinType: data.skinType,
          concerns: data.concerns ? JSON.stringify(data.concerns) : null,
          allergies: data.allergies ? JSON.stringify(data.allergies) : null,
          quizResults: data.quizResults ? JSON.stringify(data.quizResults) : null,
        },
      });

      logger.info('[BeautyService] Skin profile created', {
        profileId: profile.id,
      });

      return {
        id: profile.id,
        storeId: profile.storeId,
        customerId: profile.customerId,
        skinType: profile.skinType as any,
        concerns: profile.concerns ? JSON.parse(profile.concerns as string) : [],
        allergies: profile.allergies ? JSON.parse(profile.allergies as string) : [],
        quizResults: profile.quizResults ? JSON.parse(profile.quizResults as string) : null,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      logger.error('[BeautyService] Failed to create skin profile', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  async updateSkinProfile(storeId: string, customerId: string, data: any) {
    try {
      const existingProfile = await prisma.skinProfile.findFirst({
        where: { storeId, customerId },
      });

      if (!existingProfile) {
        throw new Error('Skin profile not found');
      }

      const updateData: any = {};
      if (data.skinType) updateData.skinType = data.skinType;
      if (data.concerns) updateData.concerns = JSON.stringify(data.concerns);
      if (data.allergies) updateData.allergies = JSON.stringify(data.allergies);
      if (data.quizResults) updateData.quizResults = JSON.stringify(data.quizResults);

      const profile = await prisma.skinProfile.update({
        where: { id: existingProfile.id },
        data: updateData,
      });

      logger.info('[BeautyService] Skin profile updated', {
        profileId: profile.id,
      });

      return {
        id: profile.id,
        storeId: profile.storeId,
        customerId: profile.customerId,
        skinType: profile.skinType as any,
        concerns: profile.concerns ? JSON.parse(profile.concerns as string) : [],
        allergies: profile.allergies ? JSON.parse(profile.allergies as string) : [],
        quizResults: profile.quizResults ? JSON.parse(profile.quizResults as string) : null,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      logger.error('[BeautyService] Failed to update skin profile', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==================== Product Shades ====================
  
  async getProductShades(productId: string) {
    try {
      const shades = await prisma.productShade.findMany({
        where: { productId },
        orderBy: { intensity: 'asc' },
      });

      return shades.map((s) => ({
        id: s.id,
        productId: s.productId,
        name: s.name,
        description: s.description,
        colorCode: s.colorCode,
        undertone: s.undertone as any,
        intensity: s.intensity,
        inventory: s.inventory,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      }));
    } catch (error) {
      logger.error('[BeautyService] Failed to get product shades', {
        productId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async createProductShade(data: any) {
    try {
      const shade = await prisma.productShade.create({
        data: {
          productId: data.productId,
          name: data.name,
          description: data.description,
          colorCode: data.colorCode,
          undertone: data.undertone,
          intensity: data.intensity,
          inventory: data.inventory || 0,
        },
      });

      logger.info('[BeautyService] Product shade created', {
        shadeId: shade.id,
      });

      return {
        id: shade.id,
        productId: shade.productId,
        name: shade.name,
        description: shade.description,
        colorCode: shade.colorCode,
        undertone: shade.undertone as any,
        intensity: shade.intensity,
        inventory: shade.inventory,
        createdAt: shade.createdAt,
        updatedAt: shade.updatedAt,
      };
    } catch (error) {
      logger.error('[BeautyService] Failed to create product shade', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  // ==================== Routine Builders ====================
  
  async getRoutineBuilders(storeId: string) {
    try {
      const routines = await prisma.routineBuilder.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
      });

      return routines.map((r) => ({
        id: r.id,
        storeId: r.storeId,
        name: r.name,
        steps: r.steps ? JSON.parse(r.steps as string) : [],
        skinType: r.skinType,
        concerns: r.concerns ? JSON.parse(r.concerns as string) : [],
        morningProducts: r.morningProducts ? JSON.parse(r.morningProducts as string) : [],
        eveningProducts: r.eveningProducts ? JSON.parse(r.eveningProducts as string) : [],
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      }));
    } catch (error) {
      logger.error('[BeautyService] Failed to get routine builders', {
        storeId,
        error: error instanceof Error ? error.message : String(error),
      });
      return [];
    }
  }

  async createRoutineBuilder(storeId: string, data: any) {
    try {
      const routine = await prisma.routineBuilder.create({
        data: {
          storeId,
          name: data.name,
          steps: data.steps ? JSON.stringify(data.steps) : null,
          skinType: data.skinType,
          concerns: data.concerns ? JSON.stringify(data.concerns) : null,
          morningProducts: data.morningProducts ? JSON.stringify(data.morningProducts) : null,
          eveningProducts: data.eveningProducts ? JSON.stringify(data.eveningProducts) : null,
        },
      });

      logger.info('[BeautyService] Routine builder created', {
        routineId: routine.id,
      });

      return {
        id: routine.id,
        storeId: routine.storeId,
        name: routine.name,
        steps: routine.steps ? JSON.parse(routine.steps as string) : [],
        skinType: routine.skinType,
        concerns: routine.concerns ? JSON.parse(routine.concerns as string) : [],
        morningProducts: routine.morningProducts ? JSON.parse(routine.morningProducts as string) : [],
        eveningProducts: routine.eveningProducts ? JSON.parse(routine.eveningProducts as string) : [],
        createdAt: routine.createdAt,
        updatedAt: routine.updatedAt,
      };
    } catch (error) {
      logger.error('[BeautyService] Failed to create routine builder', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
