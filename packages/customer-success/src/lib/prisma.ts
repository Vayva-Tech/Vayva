export { prisma } from '@vayva/db';

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
} from '../../../../platform/infra/db/src/generated/client';
