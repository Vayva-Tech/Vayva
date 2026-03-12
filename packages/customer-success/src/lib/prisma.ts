import { PrismaClient } from '@prisma/client';

// Re-export prisma client from db package
export { prisma } from '@vayva/db';

// Type exports for customer success models
export type {
  HealthScore as HealthScoreModel,
  Store,
  User,
  Order,
  Customer,
  Conversation,
  SupportTicket,
  Subscription,
  AiUsageDaily,
} from '@prisma/client';
