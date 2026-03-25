import type { PrismaClient } from '@vayva/db';

/**
 * Delegates for blog-media features not yet present on the generated Prisma client.
 * Runtime routes should pass an extended client once matching models exist in schema.
 */
type LooseModelDelegate = {
  findMany(args?: object): Promise<unknown[]>;
  findFirst(args?: object): Promise<unknown | null>;
  findUnique?(args?: object): Promise<unknown | null>;
  create(args?: object): Promise<unknown>;
  update(args?: object): Promise<unknown>;
  delete(args?: object): Promise<unknown>;
  count(args?: object): Promise<number>;
  updateMany(args?: object): Promise<unknown>;
  upsert(args?: object): Promise<unknown>;
  deleteMany?(args?: object): Promise<unknown>;
  groupBy(args?: object): Promise<unknown[]>;
};

export type BlogMediaPrismaClient = PrismaClient & {
  contentCalendar: LooseModelDelegate;
  newsletterCampaign: LooseModelDelegate;
  emailSubscriber: LooseModelDelegate;
  comment: LooseModelDelegate;
  sEOMetric: LooseModelDelegate;
  socialMediaPost: LooseModelDelegate;
};
