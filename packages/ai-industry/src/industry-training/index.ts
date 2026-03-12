/**
 * Industry Training Module
 * Exports all industry-specific training data
 */

export { default as fashionTraining } from './fashion-training';
export { default as restaurantTraining } from './restaurant-training';
export { default as realEstateTraining } from './realestate-training';
export { default as healthcareTraining } from './healthcare-training';

export * from './fashion-training';
export * from './restaurant-training';
export * from './realestate-training';
export * from './healthcare-training';

import type { IndustryContext, TrainingScenario, IndustrySlug } from '../types';
import fashion from './fashion-training';
import restaurant from './restaurant-training';
import realEstate from './realestate-training';
import healthcare from './healthcare-training';

export const industryTrainingData: Record<string, {
  context: IndustryContext;
  getScenarios: (language?: string) => TrainingScenario[];
}> = {
  fashion,
  restaurant,
  realestate: realEstate,
  healthcare,
};

export const getIndustryContext = (industry: IndustrySlug): IndustryContext | undefined => {
  return industryTrainingData[industry]?.context;
};

export const getIndustryScenarios = (
  industry: IndustrySlug,
  language?: string
): TrainingScenario[] => {
  return industryTrainingData[industry]?.getScenarios(language) || [];
};

export const getAllScenarios = (language?: string): TrainingScenario[] => {
  return Object.values(industryTrainingData).flatMap(
    training => training.getScenarios(language)
  );
};
