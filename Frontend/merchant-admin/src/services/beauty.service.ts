import { prisma } from '@/lib/prisma';
import type {
  SkinProfile,
  CreateSkinProfileInput,
  ProductShade,
  RoutineBuilder,
  SkinType,
} from '@/types/phase2-industry';

export class BeautyService {
  // ===== SKIN PROFILES =====

  async getSkinProfile(customerId: string): Promise<SkinProfile | null> {
    const profile = await prisma.skinProfile?.findUnique({
      where: { customerId },
    });

    if (!profile) return null;

    return {
      id: profile.id,
      customerId: profile.customerId,
      skinType: profile.skinType as SkinType,
      skinTone: profile.skinTone ?? undefined,
      undertone: profile.undertone as any,
      concerns: profile.concerns,
      allergies: profile.allergies,
      quizResults: profile.quizResults as any,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async createSkinProfile(data: CreateSkinProfileInput): Promise<SkinProfile> {
    const profile = await prisma.skinProfile?.create({
      data: {
        customerId: data.customerId,
        skinType: data.skinType,
        skinTone: data.skinTone,
        undertone: data.undertone,
        concerns: data.concerns ?? [],
        allergies: data.allergies ?? [],
      },
    });

    return {
      id: profile.id,
      customerId: profile.customerId,
      skinType: profile.skinType as SkinType,
      skinTone: profile.skinTone ?? undefined,
      undertone: profile.undertone as any,
      concerns: profile.concerns,
      allergies: profile.allergies,
      quizResults: profile.quizResults as any,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  async updateSkinProfile(
    customerId: string,
    data: Partial<CreateSkinProfileInput>
  ): Promise<SkinProfile> {
    const profile = await prisma.skinProfile?.update({
      where: { customerId },
      data: {
        ...(data.skinType && { skinType: data.skinType }),
        ...(data.skinTone && { skinTone: data.skinTone }),
        ...(data.undertone && { undertone: data.undertone }),
        ...(data.concerns && { concerns: data.concerns }),
        ...(data.allergies && { allergies: data.allergies }),
      },
    });

    return {
      id: profile.id,
      customerId: profile.customerId,
      skinType: profile.skinType as SkinType,
      skinTone: profile.skinTone ?? undefined,
      undertone: profile.undertone as any,
      concerns: profile.concerns,
      allergies: profile.allergies,
      quizResults: profile.quizResults as any,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
  }

  // ===== PRODUCT SHADES =====

  async getProductShades(productId: string): Promise<ProductShade[]> {
    const shades = await prisma.productShade?.findMany({
      where: { productId },
    });

    return shades.map((shade: any) => ({
      id: shade.id,
      productId: shade.productId,
      shadeName: shade.shadeName,
      hexColor: shade.hexColor ?? undefined,
      skinToneMatch: shade.skinToneMatch,
      undertoneMatch: shade.undertoneMatch as any,
      imageUrl: shade.imageUrl ?? undefined,
    }));
  }

  async createProductShade(
    data: Omit<ProductShade, 'id'>
  ): Promise<ProductShade> {
    const shade = await prisma.productShade?.create({
      data: {
        productId: data.productId,
        shadeName: data.shadeName,
        hexColor: data.hexColor,
        skinToneMatch: data.skinToneMatch,
        undertoneMatch: data.undertoneMatch,
        imageUrl: data.imageUrl,
      },
    });

    return {
      id: shade.id,
      productId: shade.productId,
      shadeName: shade.shadeName,
      hexColor: shade.hexColor ?? undefined,
      skinToneMatch: shade.skinToneMatch,
      undertoneMatch: shade.undertoneMatch as any,
      imageUrl: shade.imageUrl ?? undefined,
    };
  }

  // ===== ROUTINE BUILDERS =====

  async getRoutinesByStore(storeId: string): Promise<RoutineBuilder[]> {
    const routines = await prisma.routineBuilder?.findMany({
      where: { storeId, isActive: true },
    });

    return routines.map((routine: any) => ({
      id: routine.id,
      storeId: routine.storeId,
      name: routine.name,
      targetSkinType: routine.targetSkinType as SkinType[],
      targetConcerns: routine.targetConcerns,
      steps: routine.steps as any,
      isActive: routine.isActive,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
    }));
  }

  async getRecommendedRoutines(
    customerId: string
  ): Promise<RoutineBuilder[]> {
    const profile = await this.getSkinProfile(customerId);
    if (!profile) return [];

    const routines = await prisma.routineBuilder?.findMany({
      where: {
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

    return scored.map((s: any) => ({
      id: s.routine?.id,
      storeId: s.routine?.storeId,
      name: s.routine?.name,
      targetSkinType: s.routine?.targetSkinType as SkinType[],
      targetConcerns: s.routine?.targetConcerns,
      steps: s.routine?.steps as any,
      isActive: s.routine?.isActive,
      createdAt: s.routine?.createdAt,
      updatedAt: s.routine?.updatedAt,
    }));
  }

  async createRoutine(
    storeId: string,
    data: Omit<RoutineBuilder, 'id' | 'storeId' | 'createdAt' | 'updatedAt' | 'isActive'>
  ): Promise<RoutineBuilder> {
    const routine = await prisma.routineBuilder?.create({
      data: {
        storeId,
        name: data.name,
        targetSkinType: data.targetSkinType,
        targetConcerns: data.targetConcerns,
        steps: data.steps as any,
        isActive: true,
      },
    });

    return {
      id: routine.id,
      storeId: routine.storeId,
      name: routine.name,
      targetSkinType: routine.targetSkinType as SkinType[],
      targetConcerns: routine.targetConcerns,
      steps: routine.steps as any,
      isActive: routine.isActive,
      createdAt: routine.createdAt,
      updatedAt: routine.updatedAt,
    };
  }

  // ===== SHADE MATCHING =====

  async matchShade(
    productId: string,
    customerId: string
  ): Promise<ProductShade | null> {
    const profile = await this.getSkinProfile(customerId);
    if (!profile?.skinTone || !profile?.undertone) return null;

    const shades = await prisma.productShade?.findMany({
      where: {
        productId,
        skinToneMatch: { has: profile.skinTone },
        undertoneMatch: { has: profile.undertone },
      },
    });

    if (shades.length === 0) return null;

    const match = shades[0];
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
