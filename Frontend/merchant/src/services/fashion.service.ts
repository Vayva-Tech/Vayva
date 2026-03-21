import { prisma } from '@/lib/prisma';
import type { Prisma, SizeChart as SizeChartDb, SizeProfile as SizeProfileDb, StyleQuiz as StyleQuizDb } from '@vayva/db';
import type {
  SizeProfile,
  CreateSizeProfileInput,
  SizeChart,
  StyleQuiz,
} from '@/types/phase2-industry';

function mapSizeProfile(profile: SizeProfileDb): SizeProfile {
  return {
    id: profile.id,
    customerId: profile.customerId,
    measurements: profile.measurements as unknown as SizeProfile['measurements'],
    sizePreferences: profile.sizePreferences as unknown as SizeProfile['sizePreferences'],
    createdAt: profile.createdAt,
    updatedAt: profile.updatedAt,
  };
}

function mapSizeChart(chart: SizeChartDb): SizeChart {
  return {
    id: chart.id,
    storeId: chart.storeId,
    category: chart.category as SizeChart['category'],
    brand: chart.brand ?? undefined,
    measurements: chart.measurements as unknown as SizeChart['measurements'],
    conversion: (chart.conversion ?? undefined) as unknown as SizeChart['conversion'],
    createdAt: chart.createdAt,
  };
}

function mapStyleQuiz(quiz: StyleQuizDb): StyleQuiz {
  return {
    id: quiz.id,
    storeId: quiz.storeId,
    title: quiz.title,
    questions: quiz.questions as unknown as StyleQuiz['questions'],
    results: quiz.results as unknown as StyleQuiz['results'],
    isActive: quiz.isActive,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  };
}

export class FashionService {
  // ===== SIZE PROFILES =====
  
  async getSizeProfile(customerId: string): Promise<SizeProfile | null> {
    const profile = await prisma.sizeProfile.findFirst({
      where: { customerId },
    });
    
    if (!profile) return null;

    return mapSizeProfile(profile);
  }

  async createSizeProfile(data: CreateSizeProfileInput): Promise<SizeProfile> {
    const profile = await prisma.sizeProfile.create({
      data: {
        customerId: data.customerId,
        measurements: data.measurements as unknown as Prisma.InputJsonValue,
        sizePreferences: data.sizePreferences as unknown as Prisma.InputJsonValue,
      },
    });

    return mapSizeProfile(profile);
  }

  async updateSizeProfile(
    id: string,
    data: Partial<CreateSizeProfileInput>
  ): Promise<SizeProfile> {
    const profile = await prisma.sizeProfile.update({
      where: { id },
      data: {
        ...(data.measurements !== undefined &&
          ({ measurements: data.measurements as unknown as Prisma.InputJsonValue } as const)),
        ...(data.sizePreferences !== undefined &&
          ({ sizePreferences: data.sizePreferences as unknown as Prisma.InputJsonValue } as const)),
      },
    });

    return mapSizeProfile(profile);
  }

  // ===== SIZE CHARTS =====

  async getSizeCharts(
    storeId: string,
    category?: string
  ): Promise<SizeChart[]> {
    const charts = await prisma.sizeChart.findMany({
      where: {
        storeId,
        ...(category && { category }),
      },
    });

    return charts.map(mapSizeChart);
  }

  async createSizeChart(
    storeId: string,
    data: Omit<SizeChart, 'id' | 'storeId' | 'createdAt'>
  ): Promise<SizeChart> {
    const chart = await prisma.sizeChart.create({
      data: {
        storeId,
        category: data.category,
        brand: data.brand,
        measurements: data.measurements as unknown as Prisma.InputJsonValue,
        conversion: data.conversion as unknown as Prisma.InputJsonValue,
      },
    });

    return mapSizeChart(chart);
  }

  async deleteSizeChart(id: string): Promise<void> {
    await prisma.sizeChart.delete({
      where: { id },
    });
  }

  // ===== STYLE QUIZZES =====

  async getActiveStyleQuizzes(storeId: string): Promise<StyleQuiz[]> {
    const quizzes = await prisma.styleQuiz.findMany({
      where: {
        storeId,
        isActive: true,
      },
    });

    return quizzes.map(mapStyleQuiz);
  }

  async createStyleQuiz(
    storeId: string,
    data: Omit<StyleQuiz, 'id' | 'storeId' | 'createdAt' | 'updatedAt' | 'isActive'>
  ): Promise<StyleQuiz> {
    const quiz = await prisma.styleQuiz.create({
      data: {
        storeId,
        title: data.title,
        questions: data.questions as unknown as Prisma.InputJsonValue,
        results: data.results as unknown as Prisma.InputJsonValue,
        isActive: true,
      },
    });

    return mapStyleQuiz(quiz);
  }

  async updateStyleQuiz(
    id: string,
    data: Partial<Omit<StyleQuiz, 'id' | 'storeId' | 'createdAt' | 'updatedAt'>>
  ): Promise<StyleQuiz> {
    const quiz = await prisma.styleQuiz.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.questions !== undefined &&
          ({ questions: data.questions as unknown as Prisma.InputJsonValue } as const)),
        ...(data.results !== undefined &&
          ({ results: data.results as unknown as Prisma.InputJsonValue } as const)),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return mapStyleQuiz(quiz);
  }

  // ===== SIZE RECOMMENDATION =====

  async recommendSize(
    customerId: string,
    productId: string,
    category: string
  ): Promise<{ size: string; confidence: 'high' | 'medium' | 'low' } | null> {
    const profile = await this.getSizeProfile(customerId);
    if (!profile) return null;

    // Get product size chart
    const charts = await prisma.sizeChart.findMany({
      where: { category },
    });

    if (!charts.length) return null;

    // Simple recommendation logic - match measurements to size
    const customerPrefs = profile.sizePreferences || [];
    const preferredSizes = customerPrefs
      .filter((p) => p.fits === 'well')
      .map((p) => p.size);

    if (preferredSizes.length > 0) {
      return { size: preferredSizes[0], confidence: 'high' };
    }

    // Fallback: check measurement ranges
    const measurements = profile.measurements || {};
    for (const chart of charts) {
      const chartData = chart.measurements as unknown as SizeChart['measurements'];
      for (const sizeRow of chartData) {
        if (this.measurementsMatch(measurements, sizeRow)) {
          return { size: sizeRow.size, confidence: 'medium' };
        }
      }
    }

    return { size: 'M', confidence: 'low' };
  }

  private measurementsMatch(
    measurements: SizeProfile['measurements'],
    sizeRow: SizeChart['measurements'][number]
  ): boolean {
    if (sizeRow.chest && measurements.chest) {
      return measurements.chest >= sizeRow.chest?.min && 
             measurements.chest <= sizeRow.chest?.max;
    }
    if (sizeRow.waist && measurements.waist) {
      return measurements.waist >= sizeRow.waist?.min && 
             measurements.waist <= sizeRow.waist?.max;
    }
    return false;
  }
}

export const fashionService = new FashionService();
