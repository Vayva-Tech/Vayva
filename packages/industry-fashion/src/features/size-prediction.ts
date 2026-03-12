import { prisma } from '@vayva/prisma';

export interface SizePredictionInput {
  height?: number;
  weight?: number;
  age?: number;
  bodyType?: 'petite' | 'regular' | 'tall' | 'plus';
  preferredFit?: 'tight' | 'regular' | 'loose';
  brandSizeHistory?: BrandSizeHistory[];
}

export interface BrandSizeHistory {
  brand: string;
  size: string;
  fit: 'too-small' | 'perfect' | 'too-large';
}

export interface SizePrediction {
  recommendedSize: string;
  confidence: number;
  alternativeSizes: string[];
  fitPrediction: {
    chest: 'tight' | 'perfect' | 'loose';
    waist: 'tight' | 'perfect' | 'loose';
    hips: 'tight' | 'perfect' | 'loose';
    length: 'short' | 'perfect' | 'long';
  };
  returnRisk: 'low' | 'medium' | 'high';
}

export class SizePredictionService {
  /**
   * Predict the best size for a customer for a specific product
   */
  async predictSize(
    customerId: string,
    productId: string,
    storeId: string,
    input?: SizePredictionInput
  ): Promise<SizePrediction> {
    // Get or create customer size profile
    let profile = await prisma.sizePredictionProfile.findUnique({
      where: {
        customerId_storeId: {
          customerId,
          storeId,
        },
      },
    });

    // If input provided, update profile
    if (input && !profile) {
      profile = await prisma.sizePredictionProfile.create({
        data: {
          customerId,
          storeId,
          height: input.height,
          weight: input.weight,
          age: input.age,
          bodyType: input.bodyType,
          preferredFit: input.preferredFit,
          returnHistory: [],
          purchaseHistory: [],
        },
      });
    }

    // Get product size information
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        productVariants: true,
        sizeCurves: true,
      },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // Get available sizes from product variants
    const availableSizes = product.productVariants
      .map((v: { size?: string }) => v.size)
      .filter((size: string | undefined): size is string => !!size)
      .filter((v: string, i: number, a: string[]) => a.indexOf(v) === i); // unique

    if (availableSizes.length === 0) {
      throw new Error('Product has no size variants');
    }

    // Simple size prediction algorithm
    // In production, this would use an ML model
    const prediction = this.calculateSizePrediction(
      profile,
      product,
      availableSizes,
      input
    );

    return prediction;
  }

  private calculateSizePrediction(
    profile: { height?: number | null; weight?: number | null; bodyType?: string | null; preferredFit?: string | null } | null,
    product: { sizeCurves: { size: string; salesCount: number }[] },
    availableSizes: string[],
    input?: SizePredictionInput
  ): SizePrediction {
    // Default to middle size if no data
    const middleIndex = Math.floor(availableSizes.length / 2);
    let recommendedSize = availableSizes[middleIndex];

    // Use size curve data if available - recommend the best-selling size
    if (product.sizeCurves.length > 0) {
      const bestSelling = product.sizeCurves.reduce((prev, current) =>
        prev.salesCount > current.salesCount ? prev : current
      );
      if (availableSizes.includes(bestSelling.size)) {
        recommendedSize = bestSelling.size;
      }
    }

    // Calculate confidence based on available data
    let confidence = 0.5;
    if (profile?.height && profile?.weight) confidence += 0.2;
    if (profile?.bodyType) confidence += 0.1;
    if (input?.brandSizeHistory?.length) confidence += 0.2;

    // Determine alternative sizes
    const sizeIndex = availableSizes.indexOf(recommendedSize);
    const alternativeSizes = [
      availableSizes[sizeIndex - 1],
      availableSizes[sizeIndex + 1],
    ].filter((size): size is string => !!size);

    // Calculate fit prediction
    const fitPreference = input?.preferredFit || profile?.preferredFit || 'regular';
    const fitPrediction = this.predictFit(fitPreference);

    // Calculate return risk
    const returnRisk = confidence > 0.8 ? 'low' : confidence > 0.5 ? 'medium' : 'high';

    return {
      recommendedSize,
      confidence: Math.min(confidence, 0.95),
      alternativeSizes,
      fitPrediction,
      returnRisk,
    };
  }

  private predictFit(preferredFit: string): SizePrediction['fitPrediction'] {
    const fits: Record<string, SizePrediction['fitPrediction']> = {
      tight: {
        chest: 'tight',
        waist: 'tight',
        hips: 'perfect',
        length: 'perfect',
      },
      regular: {
        chest: 'perfect',
        waist: 'perfect',
        hips: 'perfect',
        length: 'perfect',
      },
      loose: {
        chest: 'loose',
        waist: 'loose',
        hips: 'loose',
        length: 'long',
      },
    };

    return fits[preferredFit] || fits.regular;
  }

  /**
   * Record a purchase for learning
   */
  async recordPurchase(
    customerId: string,
    productId: string,
    size: string,
    fit?: 'too-small' | 'perfect' | 'too-large'
  ): Promise<void> {
    const profile = await prisma.sizePredictionProfile.findFirst({
      where: { customerId },
    });

    if (!profile) return;

    const purchaseHistory = profile.purchaseHistory as Array<{
      productId: string;
      size: string;
      fit?: string;
      date: string;
    }>;

    purchaseHistory.push({
      productId,
      size,
      fit,
      date: new Date().toISOString(),
    });

    await prisma.sizePredictionProfile.update({
      where: { id: profile.id },
      data: { purchaseHistory },
    });
  }

  /**
   * Record a return for learning
   */
  async recordReturn(
    customerId: string,
    productId: string,
    size: string,
    reason: string
  ): Promise<void> {
    const profile = await prisma.sizePredictionProfile.findFirst({
      where: { customerId },
    });

    if (!profile) return;

    const returnHistory = profile.returnHistory as Array<{
      productId: string;
      size: string;
      reason: string;
      date: string;
    }>;

    returnHistory.push({
      productId,
      size,
      reason,
      date: new Date().toISOString(),
    });

    await prisma.sizePredictionProfile.update({
      where: { id: profile.id },
      data: { returnHistory },
    });
  }
}

export const sizePrediction = new SizePredictionService();
