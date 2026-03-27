// Backend/core-api/src/services/fashion/style-quiz.service.ts
import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class FashionStyleQuizService {
  constructor(private readonly db = prisma) {}

  /**
   * Get style quiz by ID
   */
  async getQuizById(id: string) {
    try {
      return await this.db.styleQuiz.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('[FashionStyleQuizService.getQuizById]', { id, error });
      throw error;
    }
  }

  /**
   * Get all quizzes for a store
   */
  async getStoreQuizzes(storeId: string) {
    try {
      return await this.db.styleQuiz.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('[FashionStyleQuizService.getStoreQuizzes]', { storeId, error });
      throw error;
    }
  }

  /**
   * Create style quiz
   */
  async createQuiz(storeId: string, data: any) {
    try {
      const quiz = await this.db.styleQuiz.create({
        data: {
          ...data,
          storeId,
        },
      });
      
      logger.info('[FashionStyleQuizService.createQuiz]', { 
        quizId: quiz.id, 
        storeId 
      });
      
      return quiz;
    } catch (error) {
      logger.error('[FashionStyleQuizService.createQuiz]', { storeId, error });
      throw error;
    }
  }

  /**
   * Update quiz
   */
  async updateQuiz(id: string, data: any) {
    try {
      return await this.db.styleQuiz.update({
        where: { id },
        data,
      });
    } catch (error) {
      logger.error('[FashionStyleQuizService.updateQuiz]', { id, error });
      throw error;
    }
  }
}
