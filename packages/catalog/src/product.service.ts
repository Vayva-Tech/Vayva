import { prisma } from "@vayva/db";

// ============================================================================
// Types
// ============================================================================

export interface ProductVariant {
  id: string;
  sku: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  quantity: number;
  weight?: number;
  weightUnit?: "kg" | "lb" | "g" | "oz";
  barcode?: string;
  imageUrl?: string;
  options: Record<string, string>; // e.g. { color: "red", size: "M" }
  isDefault: boolean;
  isActive: boolean;
}

export interface Product {
  id: string;
  storeId: string;
  categoryId?: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  images: string[];
  status: "draft" | "active" | "archived";
  productType: "physical" | "digital" | "service";
  vendor?: string;
  tags: string[];
  variants: ProductVariant[];
  options: Array<{
    name: string;
    values: string[];
  }>;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProductInput {
  name: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string;
  images?: string[];
  status?: "draft" | "active" | "archived";
  productType?: "physical" | "digital" | "service";
  vendor?: string;
  tags?: string[];
  variants?: Omit<ProductVariant, "id" | "isDefault">[];
  options?: Array<{ name: string; values: string[] }>;
  seo?: Product["seo"];
  metadata?: Record<string, unknown>;
}

export interface UpdateProductInput {
  name?: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  categoryId?: string | null;
  images?: string[];
  status?: "draft" | "active" | "archived";
  productType?: "physical" | "digital" | "service";
  vendor?: string;
  tags?: string[];
  options?: Array<{ name: string; values: string[] }>;
  seo?: Product["seo"];
  metadata?: Record<string, unknown>;
}

export interface ProductListOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: "draft" | "active" | "archived";
  tags?: string[];
  sortBy?: "name" | "createdAt" | "updatedAt" | "price";
  sortDir?: "asc" | "desc";
}

export interface ProductListResult {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

// ============================================================================
// Service
// ============================================================================

export class ProductService {
  /**
   * Create a new product with optional variants
   */
  async createProduct(storeId: string, input: CreateProductInput): Promise<Product> {
    const slug = input.slug ?? this.generateSlug(input.name);

    // Ensure slug is unique within store
    await this.ensureUniqueSlug(storeId, slug);

    // Validate category if provided
    if (input.categoryId) {
      await this.validateCategory(storeId, input.categoryId);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      storeId,
      name: input.name,
      slug,
      description: input.description,
      shortDescription: input.shortDescription,
      categoryId: input.categoryId,
      images: input.images ?? [],
      status: input.status ?? "draft",
      productType: input.productType ?? "physical",
      vendor: input.vendor,
      tags: input.tags ?? [],
      options: input.options ?? [],
      seo: input.seo ?? {},
      metadata: input.metadata ?? {},
    };

    const product = await prisma.product.create({ data });

    // Create default variant if no variants provided
    const variantsInput = input.variants ?? [
      {
        sku: `${slug}-default`,
        title: "Default",
        price: 0,
        quantity: 0,
        options: {},
        isActive: true,
      },
    ];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const variantData: any[] = variantsInput.map((v, idx) => ({
      ...v,
      productId: product.id,
      isDefault: idx === 0,
      isActive: v.isActive ?? true,
      options: v.options ?? {},
    }));

    await prisma.productVariant.createMany({ data: variantData });

    return this.getProduct(storeId, product.id) as Promise<Product>;
  }

  /**
   * Get a single product by ID
   */
  async getProduct(storeId: string, productId: string): Promise<Product | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma.product as any).findFirst({
      where: { id: productId, storeId },
      include: { variants: true },
    });

    if (!product) return null;
    return this.toProduct(product);
  }

  /**
   * Get a product by slug
   */
  async getProductBySlug(storeId: string, slug: string): Promise<Product | null> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma.product as any).findFirst({
      where: { slug, storeId },
      include: { variants: true },
    });

    if (!product) return null;
    return this.toProduct(product);
  }

  /**
   * List products with pagination and filtering
   */
  async listProducts(storeId: string, options: ProductListOptions = {}): Promise<ProductListResult> {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      status,
      tags,
      sortBy = "createdAt",
      sortDir = "desc",
    } = options;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { storeId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { vendor: { contains: search, mode: "insensitive" } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (status) where.status = status;
    if (tags && tags.length > 0) where.tags = { hasSome: tags };

    const [total, products] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma.product as any).count({ where }),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (prisma.product as any).findMany({
        where,
        include: { variants: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { [sortBy]: sortDir },
      }),
    ]);

    return {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      products: products.map((p: any) => this.toProduct(p)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update a product
   */
  async updateProduct(
    storeId: string,
    productId: string,
    input: UpdateProductInput
  ): Promise<Product> {
    await this.assertProductExists(storeId, productId);

    if (input.slug) {
      await this.ensureUniqueSlug(storeId, input.slug, productId);
    }

    if (input.categoryId) {
      await this.validateCategory(storeId, input.categoryId);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.product as any).update({
      where: { id: productId },
      data: { ...input, updatedAt: new Date() },
    });

    return this.getProduct(storeId, productId) as Promise<Product>;
  }

  /**
   * Archive (soft-delete) a product
   */
  async archiveProduct(storeId: string, productId: string): Promise<void> {
    await this.assertProductExists(storeId, productId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.product as any).update({
      where: { id: productId },
      data: { status: "archived", updatedAt: new Date() },
    });
  }

  /**
   * Permanently delete a product and its variants
   */
  async deleteProduct(storeId: string, productId: string): Promise<void> {
    await this.assertProductExists(storeId, productId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.productVariant as any).deleteMany({ where: { productId } });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.product as any).delete({ where: { id: productId } });
  }

  // --------------------------------------------------------------------------
  // Variant management
  // --------------------------------------------------------------------------

  /**
   * Add a variant to an existing product
   */
  async addVariant(
    storeId: string,
    productId: string,
    variant: Omit<ProductVariant, "id" | "isDefault">
  ): Promise<ProductVariant> {
    await this.assertProductExists(storeId, productId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const created = await (prisma.productVariant as any).create({
      data: { ...variant, productId, isDefault: false },
    });

    return created as ProductVariant;
  }

  /**
   * Update a specific variant
   */
  async updateVariant(
    storeId: string,
    productId: string,
    variantId: string,
    data: Partial<Omit<ProductVariant, "id">>
  ): Promise<ProductVariant> {
    await this.assertProductExists(storeId, productId);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updated = await (prisma.productVariant as any).update({
      where: { id: variantId },
      data,
    });

    return updated as ProductVariant;
  }

  /**
   * Remove a variant
   */
  async removeVariant(storeId: string, productId: string, variantId: string): Promise<void> {
    await this.assertProductExists(storeId, productId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma.productVariant as any).delete({ where: { id: variantId } });
  }

  // --------------------------------------------------------------------------
  // Bulk operations
  // --------------------------------------------------------------------------

  /**
   * Bulk update product status
   */
  async bulkUpdateStatus(
    storeId: string,
    productIds: string[],
    status: "draft" | "active" | "archived"
  ): Promise<{ updated: number }> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (prisma.product as any).updateMany({
      where: { id: { in: productIds }, storeId },
      data: { status, updatedAt: new Date() },
    });

    return { updated: result.count };
  }

  /**
   * Bulk assign a category
   */
  async bulkAssignCategory(
    storeId: string,
    productIds: string[],
    categoryId: string | null
  ): Promise<{ updated: number }> {
    if (categoryId) {
      await this.validateCategory(storeId, categoryId);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (prisma.product as any).updateMany({
      where: { id: { in: productIds }, storeId },
      data: { categoryId, updatedAt: new Date() },
    });

    return { updated: result.count };
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  private async ensureUniqueSlug(
    storeId: string,
    slug: string,
    excludeId?: string
  ): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const existing = await (prisma.product as any).findFirst({
      where: { slug, storeId, ...(excludeId ? { id: { not: excludeId } } : {}) },
    });

    if (existing) {
      throw new Error(`Product with slug "${slug}" already exists in this store`);
    }
  }

  private async validateCategory(storeId: string, categoryId: string): Promise<void> {
    const category = await prisma.category.findFirst({ where: { id: categoryId, storeId } });
    if (!category) {
      throw new Error(`Category "${categoryId}" not found`);
    }
  }

  private async assertProductExists(storeId: string, productId: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const product = await (prisma.product as any).findFirst({ where: { id: productId, storeId } });
    if (!product) {
      throw new Error(`Product "${productId}" not found`);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toProduct(raw: any): Product {
    return {
      id: raw.id,
      storeId: raw.storeId,
      categoryId: raw.categoryId ?? undefined,
      name: raw.name,
      slug: raw.slug,
      description: raw.description ?? undefined,
      shortDescription: raw.shortDescription ?? undefined,
      images: raw.images ?? [],
      status: raw.status,
      productType: raw.productType ?? "physical",
      vendor: raw.vendor ?? undefined,
      tags: raw.tags ?? [],
      variants: (raw.variants ?? []) as ProductVariant[],
      options: raw.options ?? [],
      seo: raw.seo ?? undefined,
      metadata: raw.metadata ?? undefined,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}

export const productService = new ProductService();
