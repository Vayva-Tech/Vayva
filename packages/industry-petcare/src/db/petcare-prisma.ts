import { prisma as basePrisma } from '@vayva/db';
import type { PetcareDb } from './petcare-prisma-client';

export const prisma: PetcareDb = basePrisma as unknown as PetcareDb;
