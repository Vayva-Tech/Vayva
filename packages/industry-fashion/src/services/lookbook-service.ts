import { prisma } from '@vayva/prisma';

export interface CreateLookbookInput {
  name: string;
  description?: string;
  images: string[];
  productIds: string[];
  publishDate?: Date;
}

export class LookbookService {
  /**
   * Create a new lookbook
   */
  async createLookbook(
    storeId: string,
    input: CreateLookbookInput
  ) {
    const lookbook = await prisma.lookbook.create({
      data: {
        storeId,
        name: input.name,
        description: input.description,
        images: input.images,
        isPublished: false,
        publishDate: input.publishDate,
      },
    });

    // Add products to lookbook
    if (input.productIds.length > 0) {
      await prisma.lookbookProduct.createMany({
        data: input.productIds.map((productId, index) => ({
          lookbookId: lookbook.id,
          productId,
          displayOrder: index,
        })),
      });
    }

    return prisma.lookbook.findUnique({
      where: { id: lookbook.id },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Publish a lookbook
   */
  async publishLookbook(lookbookId: string) {
    return prisma.lookbook.update({
      where: { id: lookbookId },
      data: {
        isPublished: true,
        publishDate: new Date(),
      },
    });
  }

  /**
   * Get lookbooks for merchant
   */
  async getLookbooks(storeId: string, includeUnpublished = false) {
    return prisma.lookbook.findMany({
      where: {
        storeId,
        ...(includeUnpublished ? {} : { isPublished: true }),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get lookbook by ID
   */
  async getLookbook(lookbookId: string) {
    return prisma.lookbook.findUnique({
      where: { id: lookbookId },
      include: {
        products: {
          include: {
            product: true,
          },
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });
  }
}

export const lookbookService = new LookbookService();
