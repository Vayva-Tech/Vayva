import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class VehicleService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string, filters: any) {
    const status = filters.status || null;

    const where: any = {
      storeId,
      productType: 'vehicle',
      ...(status ? { status } : {}),
    };

    const vehicles = await this.db.product.findMany({
      where,
      include: {
        productImages: { take: 1, orderBy: { position: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return vehicles.map((v) => {
      const meta: any = v.metadata || {};
      return {
        id: v.id,
        make: typeof meta.make === 'string' ? meta.make : '',
        model: typeof meta.model === 'string' ? meta.model : '',
        year: typeof meta.year === 'string' || typeof meta.year === 'number' ? meta.year : '',
        price: Number(v.price),
        status: v.status,
        image: v.productImages[0]?.url || null,
        createdAt: v.createdAt,
      };
    });
  }

  async create(storeId: string, data: any) {
    const {
      make,
      model,
      year,
      price,
      description,
      condition,
      mileage,
      fuelType,
      transmission,
      images,
    } = data;

    if (!make || !model || price === undefined) {
      throw new Error('Make, model and price are required');
    }

    const handle = `${make}-${model}-${Date.now()}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');

    const vehicle = await this.db.product.create({
      data: {
        storeId,
        title: `${year || ''} ${make} ${model}`.trim(),
        description: description || '',
        price: Number(price),
        handle,
        productType: 'vehicle',
        status: 'ACTIVE',
        metadata: {
          make,
          model,
          year: year ? String(year) : undefined,
          condition: condition || null,
          mileage: mileage !== undefined ? Number(mileage) : null,
          fuelType: fuelType || null,
          transmission: transmission || null,
        },
        productImages: Array.isArray(images) && images.length
          ? {
              create: images.map((url: string, i: number) => ({
                url,
                position: i,
              })),
            }
          : undefined,
      },
    });

    logger.info(`[Vehicle] Created vehicle ${vehicle.id}`);
    return vehicle;
  }

  async findOne(vehicleId: string, storeId: string) {
    const vehicle = await this.db.product.findFirst({
      where: {
        id: vehicleId,
        storeId,
        productType: 'vehicle',
      },
      include: {
        productImages: true,
      },
    });

    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    return vehicle;
  }

  async update(vehicleId: string, storeId: string, data: any) {
    const existing = await this.db.product.findFirst({
      where: {
        id: vehicleId,
        storeId,
        productType: 'vehicle',
      },
    });

    if (!existing) {
      throw new Error('Vehicle not found');
    }

    const {
      make,
      model,
      year,
      price,
      description,
      condition,
      mileage,
      fuelType,
      transmission,
      images,
    } = data;

    const updateData: any = {
      ...(make && { title: `${year || ''} ${make} ${model}`.trim() }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: Number(price) }),
      metadata: {
        ...((existing.metadata as any) || {}),
        ...(make && { make }),
        ...(model && { model }),
        ...(year !== undefined && { year: String(year) }),
        ...(condition !== undefined && { condition }),
        ...(mileage !== undefined && { mileage: Number(mileage) }),
        ...(fuelType !== undefined && { fuelType }),
        ...(transmission !== undefined && { transmission }),
      },
    };

    const vehicle = await this.db.product.update({
      where: { id: vehicleId },
      data: updateData,
    });

    logger.info(`[Vehicle] Updated vehicle ${vehicleId}`);
    return vehicle;
  }

  async delete(vehicleId: string, storeId: string) {
    const existing = await this.db.product.findFirst({
      where: {
        id: vehicleId,
        storeId,
        productType: 'vehicle',
      },
    });

    if (!existing) {
      throw new Error('Vehicle not found');
    }

    await this.db.product.delete({
      where: { id: vehicleId },
    });

    logger.info(`[Vehicle] Deleted vehicle ${vehicleId}`);
  }
}
