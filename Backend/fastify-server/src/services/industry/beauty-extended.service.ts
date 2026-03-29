/**
 * Beauty Industry Service - Extended
 * 
 * Handles skin profiles, product shades, routine builders, and shade matching
 * For beauty salons, cosmetic stores, and skincare businesses
 */

import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

interface SkinProfile {
  id: string;
  customerId: string;
  skinType: string;
  skinTone?: string;
  undertone?: string;
  concerns?: string[];
  allergies?: string[];
  quizResults?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateSkinProfileInput {
  customerId: string;
  skinType: string;
  skinTone?: string;
  undertone?: string;
  concerns?: string[];
  allergies?: string[];
}

interface ProductShade {
  id: string;
  productId: string;
  shadeName: string;
  hexColor?: string;
  skinToneMatch?: string[];
  undertoneMatch?: string;
  imageUrl?: string;
}

interface RoutineBuilder {
  id: string;
  storeId: string;
  name: string;
  targetSkinType: string[];
  targetConcerns: string[];
  steps: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class BeautyExtendedService {
  constructor(private readonly db = prisma) {}

  // ===== SKIN PROFILES =====

  /**
   * Get skin profile for a customer
   */
  async getSkinProfile(storeId: string, customerId: string): Promise<SkinProfile | null> {
    try {
      // Verify customer belongs to store
      const customer = await this.db.customer.findFirst({
        where: { id: customerId, storeId },
      });

      if (!customer) {
        logger.warn('[BeautyExtended] Customer not found', { customerId, storeId });
        return null;
      }

      const profile = await this.db.skinProfile?.findUnique({
        where: { customerId },
      });

      if (!profile) {
        return null;
      }

      return {
        id: profile.id,
        customerId: profile.customerId,
        skinType: profile.skinType as string,
        skinTone: profile.skinTone ?? undefined,
        undertone: profile.undertone as string,
        concerns: profile.concerns,
        allergies: profile.allergies,
        quizResults: profile.quizResults,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      logger.error('[BeautyExtended] Failed to get skin profile', { 
        customerId, 
        storeId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Create skin profile for a customer
   */
  async createSkinProfile(
    storeId: string,
    data: CreateSkinProfileInput
  ): Promise<SkinProfile> {
    try {
      // Verify customer belongs to store
      const customer = await this.db.customer.findFirst({
        where: { id: data.customerId, storeId },
      });

      if (!customer) {
        logger.warn('[BeautyExtended] Customer not found for profile creation', { 
          customerId: data.customerId, 
          storeId 
        });
        throw new Error('Customer not found');
      }

      const profile = await this.db.skinProfile?.create({
        data: {
          customerId: data.customerId,
          skinType: data.skinType,
          skinTone: data.skinTone,
          undertone: data.undertone,
          concerns: data.concerns ?? [],
          allergies: data.allergies ?? [],
        },
      });

      logger.info('[BeautyExtended] Skin profile created', { 
        profileId: profile.id,
        customerId: data.customerId,
        storeId 
      });

      return {
        id: profile.id,
        customerId: profile.customerId,
        skinType: profile.skinType as string,
        skinTone: profile.skinTone ?? undefined,
        undertone: profile.undertone as string,
        concerns: profile.concerns,
        allergies: profile.allergies,
        quizResults: profile.quizResults,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      logger.error('[BeautyExtended] Failed to create skin profile', { 
        customerId: data.customerId, 
        storeId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Update skin profile
   */
  async updateSkinProfile(
    storeId: string,
    customerId: string,
    data: Partial<CreateSkinProfileInput>
  ): Promise<SkinProfile> {
    try {
      // Verify customer belongs to store
      const customer = await this.db.customer.findFirst({
        where: { id: customerId, storeId },
      });

      if (!customer) {
        logger.warn('[BeautyExtended] Customer not found for profile update', { 
          customerId, 
          storeId 
        });
        throw new Error('Customer not found');
      }

      const profile = await this.db.skinProfile?.update({
        where: { customerId },
        data: {
          ...(data.skinType && { skinType: data.skinType }),
          ...(data.skinTone && { skinTone: data.skinTone }),
          ...(data.undertone && { undertone: data.undertone }),
          ...(data.concerns && { concerns: data.concerns }),
          ...(data.allergies && { allergies: data.allergies }),
        },
      });

      logger.info('[BeautyExtended] Skin profile updated', { 
        profileId: profile.id,
        customerId,
        storeId 
      });

      return {
        id: profile.id,
        customerId: profile.customerId,
        skinType: profile.skinType as string,
        skinTone: profile.skinTone ?? undefined,
        undertone: profile.undertone as string,
        concerns: profile.concerns,
        allergies: profile.allergies,
        quizResults: profile.quizResults,
        createdAt: profile.createdAt,
        updatedAt: profile.updatedAt,
      };
    } catch (error) {
      logger.error('[BeautyExtended] Failed to update skin profile', { 
        customerId, 
        storeId, 
        error 
      });
      throw error;
    }
  }

  // ===== PRODUCT SHADES =====

  /**
   * Get all product shades for a product
   */
  async getProductShades(productId: string): Promise<ProductShade[]> {
    try {
      const shades = await this.db.productShade?.findMany({
        where: { productId },
      });

      return shades.map((shade: any) => ({
        id: shade.id,
        productId: shade.productId,
        shadeName: shade.shadeName,
        hexColor: shade.hexColor ?? undefined,
        skinToneMatch: shade.skinToneMatch,
        undertoneMatch: shade.undertoneMatch as string,
        imageUrl: shade.imageUrl ?? undefined,
      }));
    } catch (error) {
      logger.error('[BeautyExtended] Failed to get product shades', { 
        productId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Create a new product shade
   */
  async createProductShade(
    data: Omit<ProductShade, 'id'>
  ): Promise<ProductShade> {
    try {
      const shade = await this.db.productShade?.create({
        data: {
          productId: data.productId,
          shadeName: data.shadeName,
          hexColor: data.hexColor,
          skinToneMatch: data.skinToneMatch,
          undertoneMatch: data.undertoneMatch,
          imageUrl: data.imageUrl,
        },
      });

      logger.info('[BeautyExtended] Product shade created', { 
        shadeId: shade.id,
        productId: data.productId 
      });

      return {
        id: shade.id,
        productId: shade.productId,
        shadeName: shade.shadeName,
        hexColor: shade.hexColor ?? undefined,
        skinToneMatch: shade.skinToneMatch,
        undertoneMatch: shade.undertoneMatch as string,
        imageUrl: shade.imageUrl ?? undefined,
      };
    } catch (error) {
      logger.error('[BeautyExtended] Failed to create product shade', { 
        productId: data.productId, 
        error 
      });
      throw error;
    }
  }

  // ===== ROUTINE BUILDERS =====

  /**
   * Get all routines for a store
   */
  async getRoutinesByStore(storeId: string): Promise<RoutineBuilder[]> {
    try {
      const routines = await this.db.routineBuilder?.findMany({
        where: { storeId, isActive: true },
      });

      return routines.map((routine: any) => ({
        id: routine.id,
        storeId: routine.storeId,
        name: routine.name,
        targetSkinType: routine.targetSkinType as string[],
        targetConcerns: routine.targetConcerns,
        steps: routine.steps,
        isActive: routine.isActive,
        createdAt: routine.createdAt,
        updatedAt: routine.updatedAt,
      }));
    } catch (error) {
      logger.error('[BeautyExtended] Failed to get routines', { 
        storeId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Get recommended routines for a customer based on their skin profile
   */
  async getRecommendedRoutines(
    storeId: string,
    customerId: string
  ): Promise<RoutineBuilder[]> {
    try {
      const profile = await this.getSkinProfile(storeId, customerId);
      if (!profile || !profile.skinTone || !profile.undertone) {
        return [];
      }

      const routines = await this.db.routineBuilder?.findMany({
        where: {
          storeId,
          isActive: true,
          targetSkinType: { has: profile.skinType },
        },
      });

      // Score routines by concern match
      const scored = routines.map((routine: any) => {
        const concernMatches = routine.targetConcerns?.filter((c: string) =>
          profile.concerns?.includes(c)
        ).length;
        return { routine, score: concernMatches };
      });

      // Sort by score descending
      scored.sort((a: any, b: any) => b.score - a.score);

      logger.info('[BeautyExtended] Recommended routines calculated', { 
        customerId,
        storeId,
        routineCount: scored.length 
      });

      return scored.map((s: any) => ({
        id: s.routine?.id,
        storeId: s.routine?.storeId,
        name: s.routine?.name,
        targetSkinType: s.routine?.targetSkinType as string[],
        targetConcerns: s.routine?.targetConcerns,
        steps: s.routine?.steps,
        isActive: s.routine?.isActive,
        createdAt: s.routine?.createdAt,
        updatedAt: s.routine?.updatedAt,
      }));
    } catch (error) {
      logger.error('[BeautyExtended] Failed to get recommended routines', { 
        customerId, 
        storeId, 
        error 
      });
      throw error;
    }
  }

  /**
   * Create a new routine
   */
  async createRoutine(
    storeId: string,
    data: Omit<RoutineBuilder, 'id' | 'storeId' | 'createdAt' | 'updatedAt' | 'isActive'>
  ): Promise<RoutineBuilder> {
    try {
      const routine = await this.db.routineBuilder?.create({
        data: {
          storeId,
          name: data.name,
          targetSkinType: data.targetSkinType,
          targetConcerns: data.targetConcerns,
          steps: data.steps,
          isActive: true,
        },
      });

      logger.info('[BeautyExtended] Routine created', { 
        routineId: routine.id,
        storeId 
      });

      return {
        id: routine.id,
        storeId: routine.storeId,
        name: routine.name,
        targetSkinType: routine.targetSkinType as string[],
        targetConcerns: routine.targetConcerns,
        steps: routine.steps,
        isActive: routine.isActive,
        createdAt: routine.createdAt,
        updatedAt: routine.updatedAt,
      };
    } catch (error) {
      logger.error('[BeautyExtended] Failed to create routine', { 
        storeId, 
        error 
      });
      throw error;
    }
  }

  // ===== SHADE MATCHING =====

  /**
   * Match product shade to customer's skin profile
   */
  async matchShade(
    storeId: string,
    productId: string,
    customerId: string
  ): Promise<ProductShade | null> {
    try {
      // Verify product exists
      const product = await this.db.product.findFirst({
        where: { id: productId, storeId },
      });

      if (!product) {
        logger.warn('[BeautyExtended] Product not found', { productId, storeId });
        return null;
      }

      const profile = await this.getSkinProfile(storeId, customerId);
      if (!profile?.skinTone || !profile?.undertone) {
        logger.info('[BeautyExtended] No skin profile or missing data', { customerId });
        return null;
      }

      const shades = await this.db.productShade?.findMany({
        where: {
          productId,
          skinToneMatch: { has: profile.skinTone },
          undertoneMatch: { has: profile.undertone },
        },
      });

      if (shades.length === 0) {
        logger.info('[BeautyExtended] No matching shades found', { 
          productId, 
          customerId 
        });
        return null;
      }

      const match = shades[0];
      logger.info('[BeautyExtended] Shade matched', { 
        productId, 
        customerId, 
        shadeId: match.id 
      });

      return {
        id: match.id,
        productId: match.productId,
        shadeName: match.shadeName,
        hexColor: match.hexColor ?? undefined,
        skinToneMatch: match.skinToneMatch,
        undertoneMatch: match.undertoneMatch as string,
        imageUrl: match.imageUrl ?? undefined,
      };
    } catch (error) {
      logger.error('[BeautyExtended] Failed to match shade', { 
        productId, 
        customerId, 
        error 
      });
      throw error;
    }
  }
}
