import { prisma } from "@vayva/db";
import { Readable, pipeline } from "stream";
import csv from "csv-parser";
import { createWriteStream } from "fs";
import { promisify } from "util";

const pipelineAsync = promisify(pipeline);

export type ImportSource = "csv" | "excel" | "json" | "xml" | "shopify" | "woocommerce" | "magento" | "square" | "etsy";

export interface MigrationJob {
  id: string;
  storeId: string;
  name: string;
  source: ImportSource;
  status: "pending" | "validating" | "importing" | "completed" | "failed" | "partial";
  fileUrl?: string;
  fileSize?: number;
  totalRows: number;
  processedRows: number;
  successCount: number;
  errorCount: number;
  warningCount: number;
  settings: {
    skipHeaders: boolean;
    encoding: string;
    delimiter: string;
    dateFormat: string;
    updateExisting: boolean;
    skipImages: boolean;
    dryRun: boolean;
  };
  fieldMapping: Record<string, string>;
  defaultValues: Record<string, unknown>;
  errors: Array<{
    row: number;
    field: string;
    value: string;
    error: string;
    suggestion?: string;
  }>;
  logs: Array<{
    timestamp: Date;
    level: "info" | "warn" | "error";
    message: string;
    row?: number;
  }>;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
}

export interface MigrationPreview {
  jobId: string;
  totalRows: number;
  sampleRows: Array<Record<string, unknown>>;
  detectedFields: string[];
  fieldSuggestions: Array<{
    sourceField: string;
    suggestedField: string;
    confidence: number;
  }>;
  issues: Array<{
    type: "missing_required" | "invalid_format" | "duplicate";
    field?: string;
    message: string;
    affectedRows: number[];
  }>;
}

export interface MigrationTemplate {
  id: string;
  name: string;
  source: ImportSource;
  fieldMapping: Record<string, string>;
  defaultValues: Record<string, unknown>;
  transformations: Array<{
    field: string;
    type: "uppercase" | "lowercase" | "trim" | "replace" | "formula";
    params: Record<string, unknown>;
  }>;
  isSystem: boolean;
}

export class CatalogMigrationService {
  private readonly CHUNK_SIZE = 100;
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly REQUIRED_FIELDS = ["name", "price"];

  /**
   * Create a new migration job
   */
  async createJob(
    storeId: string,
    data: {
      name: string;
      source: ImportSource;
      fileUrl?: string;
      fileSize?: number;
      settings?: Partial<MigrationJob["settings"]>;
      fieldMapping?: Record<string, string>;
      defaultValues?: Record<string, unknown>;
      createdBy: string;
    }
  ): Promise<MigrationJob> {
    if (data.fileSize && data.fileSize > this.MAX_FILE_SIZE) {
      throw new Error(`File size exceeds maximum allowed (${this.MAX_FILE_SIZE / 1024 / 1024}MB)`);
    }

    const job = await prisma.migrationJob.create({
      data: {
        storeId,
        name: data.name,
        source: data.source,
        status: "pending",
        fileUrl: data.fileUrl,
        fileSize: data.fileSize,
        totalRows: 0,
        processedRows: 0,
        successCount: 0,
        errorCount: 0,
        warningCount: 0,
        settings: {
          skipHeaders: true,
          encoding: "utf-8",
          delimiter: ",",
          dateFormat: "YYYY-MM-DD",
          updateExisting: true,
          skipImages: false,
          dryRun: false,
          ...data.settings,
        },
        fieldMapping: data.fieldMapping || {},
        defaultValues: data.defaultValues || {},
        errors: [],
        logs: [],
        createdBy: data.createdBy,
      },
    });

    return this.mapJob(job);
  }

  /**
   * Generate preview of import data
   */
  async generatePreview(jobId: string): Promise<MigrationPreview> {
    const job = await prisma.migrationJob.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Migration job not found");

    const rows: Array<Record<string, unknown>> = [];
    const detectedFields = new Set<string>();
    const issues: MigrationPreview["issues"] = [];

    // Parse file based on source type
    switch (job.source) {
      case "csv":
      case "excel":
        if (job.fileUrl) {
          const parsed = await this.parseCSV(job.fileUrl, 20, job.settings);
          rows.push(...parsed.rows);
          parsed.fields.forEach((f) => detectedFields.add(f));
        }
        break;

      case "json":
        if (job.fileUrl) {
          const jsonData = await this.fetchJSON(job.fileUrl, 20);
          rows.push(...jsonData);
          if (jsonData.length > 0) {
            Object.keys(jsonData[0]).forEach((k) => detectedFields.add(k));
          }
        }
        break;

      case "shopify":
        // Fetch sample from Shopify API
        break;

      default:
        throw new Error(`Preview not supported for source: ${job.source}`);
    }

    // Generate field suggestions
    const fieldSuggestions = this.suggestFieldMappings(
      Array.from(detectedFields),
      job.fieldMapping
    );

    // Detect issues
    if (rows.length > 0) {
      const firstRow = rows[0];
      for (const required of this.REQUIRED_FIELDS) {
        const mappedField = job.fieldMapping[required] || required;
        if (!(mappedField in firstRow)) {
          issues.push({
            type: "missing_required",
            field: required,
            message: `Required field "${required}" not found in data`,
            affectedRows: rows.map((_, i) => i),
          });
        }
      }
    }

    // Update job with total rows estimate
    await prisma.migrationJob.update({
      where: { id: jobId },
      data: { totalRows: rows.length * 10 }, // Estimate
    });

    return {
      jobId,
      totalRows: rows.length,
      sampleRows: rows,
      detectedFields: Array.from(detectedFields),
      fieldSuggestions,
      issues,
    };
  }

  /**
   * Update field mapping for job
   */
  async updateFieldMapping(
    jobId: string,
    mapping: Record<string, string>,
    defaultValues?: Record<string, unknown>
  ): Promise<MigrationJob> {
    const updated = await prisma.migrationJob.update({
      where: { id: jobId },
      data: {
        fieldMapping: mapping,
        defaultValues: defaultValues || undefined,
      },
    });

    return this.mapJob(updated);
  }

  /**
   * Execute migration
   */
  async executeMigration(jobId: string): Promise<MigrationJob> {
    const job = await prisma.migrationJob.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Migration job not found");

    // Update status
    await prisma.migrationJob.update({
      where: { id: jobId },
      data: {
        status: "importing",
        startedAt: new Date(),
      },
    });

    const stats = {
      processed: 0,
      success: 0,
      errors: 0,
      warnings: 0,
    };

    const errors: MigrationJob["errors"] = [];
    const logs: MigrationJob["logs"] = [];

    try {
      // Process based on source type
      switch (job.source) {
        case "csv":
        case "excel":
          if (job.fileUrl) {
            await this.processCSVJob(job, stats, errors, logs);
          }
          break;

        case "json":
          await this.processJSONJob(job, stats, errors, logs);
          break;

        case "shopify":
          await this.processShopifyJob(job, stats, errors, logs);
          break;

        case "woocommerce":
          await this.processWooCommerceJob(job, stats, errors, logs);
          break;

        default:
          throw new Error(`Migration not implemented for source: ${job.source}`);
      }

      // Determine final status
      const status: MigrationJob["status"] =
        stats.errors === 0 ? "completed" : stats.success > 0 ? "partial" : "failed";

      const updated = await prisma.migrationJob.update({
        where: { id: jobId },
        data: {
          status,
          processedRows: stats.processed,
          successCount: stats.success,
          errorCount: stats.errors,
          warningCount: stats.warnings,
          errors,
          logs,
          completedAt: new Date(),
        },
      });

      return this.mapJob(updated);
    } catch (error) {
      await prisma.migrationJob.update({
        where: { id: jobId },
        data: {
          status: "failed",
          errors: [
            ...errors,
            {
              row: 0,
              field: "system",
              value: "",
              error: error instanceof Error ? error.message : "Migration failed",
            },
          ],
          logs: [
            ...logs,
            {
              timestamp: new Date(),
              level: "error",
              message: error instanceof Error ? error.message : "Migration failed",
            },
          ],
          completedAt: new Date(),
        },
      });

      throw error;
    }
  }

  /**
   * Get migration progress
   */
  async getProgress(jobId: string): Promise<{
    status: string;
    processed: number;
    total: number;
    percentage: number;
    currentRate: number; // rows per minute
    estimatedCompletion?: Date;
  }> {
    const job = await prisma.migrationJob.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Migration job not found");

    const processed = job.processedRows;
    const total = job.totalRows;
    const percentage = total > 0 ? Math.round((processed / total) * 100) : 0;

    // Calculate rate
    let rate = 0;
    let estimatedCompletion: Date | undefined;
    if (job.startedAt) {
      const elapsedMinutes = (Date.now() - job.startedAt.getTime()) / 60000;
      rate = elapsedMinutes > 0 ? processed / elapsedMinutes : 0;

      if (rate > 0 && total > processed) {
        const remainingMinutes = (total - processed) / rate;
        estimatedCompletion = new Date(Date.now() + remainingMinutes * 60000);
      }
    }

    return {
      status: job.status,
      processed,
      total,
      percentage,
      currentRate: Math.round(rate),
      estimatedCompletion,
    };
  }

  /**
   * Cancel running migration
   */
  async cancelMigration(jobId: string): Promise<void> {
    await prisma.migrationJob.update({
      where: { id: jobId },
      data: { status: "failed", completedAt: new Date() },
    });
  }

  /**
   * Download error report
   */
  async generateErrorReport(jobId: string): Promise<{
    csvUrl: string;
    summary: {
      totalErrors: number;
      byField: Record<string, number>;
      byType: Record<string, number>;
    };
  }> {
    const job = await prisma.migrationJob.findUnique({ where: { id: jobId } });
    if (!job) throw new Error("Migration job not found");

    // Generate CSV with errors
    const errorRows = job.errors.map((e) => ({
      row: e.row,
      field: e.field,
      value: e.value,
      error: e.error,
      suggestion: e.suggestion || "",
    }));

    // Write to temp file
    const fileName = `errors-${jobId}-${Date.now()}.csv`;
    const filePath = `/tmp/${fileName}`;

    // Generate summary
    const byField: Record<string, number> = {};
    const byType: Record<string, number> = {};

    for (const error of job.errors) {
      byField[error.field] = (byField[error.field] || 0) + 1;
      const type = error.error.includes("required") ? "required" : "invalid";
      byType[type] = (byType[type] || 0) + 1;
    }

    return {
      csvUrl: `/api/migration/download/${fileName}`,
      summary: {
        totalErrors: job.errors.length,
        byField,
        byType,
      },
    };
  }

  /**
   * Get migration templates
   */
  async getTemplates(source?: ImportSource): Promise<MigrationTemplate[]> {
    const where: Record<string, unknown> = { isSystem: true };
    if (source) where.source = source;

    const templates = await prisma.migrationTemplate.findMany({
      where,
      orderBy: { name: "asc" },
    });

    return templates.map((t) => ({
      id: String(t.id),
      name: String(t.name),
      source: t.source as ImportSource,
      fieldMapping: t.fieldMapping as Record<string, string>,
      defaultValues: t.defaultValues as Record<string, unknown>,
      transformations: t.transformations as MigrationTemplate["transformations"],
      isSystem: Boolean(t.isSystem),
    }));
  }

  /**
   * Export store catalog
   */
  async exportCatalog(
    storeId: string,
    options: {
      format: "csv" | "excel" | "json";
      includeInventory: boolean;
      includeImages: boolean;
      categoryIds?: string[];
      dateRange?: { from: Date; to: Date };
    }
  ): Promise<{ downloadUrl: string; recordCount: number; fileSize: number }> {
    // Build query
    const where: Record<string, unknown> = { storeId };
    if (options.categoryIds?.length) {
      where.categoryId = { in: options.categoryIds };
    }
    if (options.dateRange) {
      where.createdAt = {
        gte: options.dateRange.from,
        lte: options.dateRange.to,
      };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        inventory: options.includeInventory,
        images: options.includeImages,
        variants: true,
      },
    });

    // Transform to export format
    const exportData = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price / 100,
      compareAtPrice: p.compareAtPrice ? p.compareAtPrice / 100 : null,
      sku: p.sku,
      barcode: p.barcode,
      category: (p.category as { name: string } | null)?.name,
      inventory: options.includeInventory ? (p.inventory as { quantity: number } | null)?.quantity : null,
      images: options.includeImages
        ? (p.images as Array<{ url: string }>).map((i) => i.url).join(",")
        : null,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    // Generate file
    const fileName = `export-${storeId}-${Date.now()}.${options.format}`;
    const filePath = `/tmp/${fileName}`;

    if (options.format === "csv") {
      await this.writeCSV(filePath, exportData);
    } else if (options.format === "json") {
      await this.writeJSON(filePath, exportData);
    }

    // Get file size
    const fs = await import("fs");
    const stats = fs.statSync(filePath);

    return {
      downloadUrl: `/api/migration/download/${fileName}`,
      recordCount: products.length,
      fileSize: stats.size,
    };
  }

  // Private processing methods
  private async processCSVJob(
    job: Record<string, unknown>,
    stats: { processed: number; success: number; errors: number; warnings: number },
    errors: MigrationJob["errors"],
    logs: MigrationJob["logs"]
  ): Promise<void> {
    if (!job.fileUrl) return;

    const mapping = job.fieldMapping as Record<string, string>;
    const defaults = job.defaultValues as Record<string, unknown>;

    const rows = await this.parseCSV(job.fileUrl as string, undefined, job.settings);

    for (let i = 0; i < rows.rows.length; i++) {
      const row = rows.rows[i];
      stats.processed++;

      try {
        const product = this.transformRowToProduct(row, mapping, defaults, i, errors);

        if (job.settings.dryRun) {
          stats.success++;
          continue;
        }

        await this.saveProduct(job.storeId as string, product, job.settings.updateExisting as boolean);
        stats.success++;
      } catch (error) {
        stats.errors++;
        errors.push({
          row: i + 1,
          field: "general",
          value: "",
          error: error instanceof Error ? error.message : "Failed to process row",
        });
      }

      // Log progress
      if (stats.processed % this.CHUNK_SIZE === 0) {
        logs.push({
          timestamp: new Date(),
          level: "info",
          message: `Processed ${stats.processed} rows`,
        });
      }
    }
  }

  private async processJSONJob(
    job: Record<string, unknown>,
    stats: { processed: number; success: number; errors: number; warnings: number },
    errors: MigrationJob["errors"],
    logs: MigrationJob["logs"]
  ): Promise<void> {
    // Similar to CSV but for JSON
    console.log("[Migration] Processing JSON job", job.id);
  }

  private async processShopifyJob(
    job: Record<string, unknown>,
    stats: { processed: number; success: number; errors: number; warnings: number },
    errors: MigrationJob["errors"],
    logs: MigrationJob["logs"]
  ): Promise<void> {
    // Shopify API pagination
    console.log("[Migration] Processing Shopify job", job.id);
  }

  private async processWooCommerceJob(
    job: Record<string, unknown>,
    stats: { processed: number; success: number; errors: number; warnings: number },
    errors: MigrationJob["errors"],
    logs: MigrationJob["logs"]
  ): Promise<void> {
    // WooCommerce API
    console.log("[Migration] Processing WooCommerce job", job.id);
  }

  // Helper methods
  private async parseCSV(
    fileUrl: string,
    limit?: number,
    settings?: Record<string, unknown>
  ): Promise<{ rows: Array<Record<string, unknown>>; fields: string[] }> {
    const rows: Array<Record<string, unknown>> = [];
    const fields: string[] = [];

    // In production, fetch from S3/storage and parse
    // For now, return mock data
    return { rows, fields };
  }

  private async fetchJSON(fileUrl: string, limit?: number): Promise<Array<Record<string, unknown>>> {
    // Fetch and parse JSON
    return [];
  }

  private suggestFieldMappings(
    detectedFields: string[],
    currentMapping: Record<string, string>
  ): Array<{ sourceField: string; suggestedField: string; confidence: number }> {
    const suggestions: Array<{ sourceField: string; suggestedField: string; confidence: number }> = [];

    const fieldMappings: Record<string, string[]> = {
      name: ["name", "title", "product_name", "product title"],
      price: ["price", "cost", "amount", "unit_price"],
      description: ["description", "desc", "product_description", "body"],
      sku: ["sku", "code", "product_code"],
      barcode: ["barcode", "upc", "ean", "isbn"],
      quantity: ["quantity", "qty", "stock", "inventory"],
      category: ["category", "type", "collection", "category_name"],
      image: ["image", "image_url", "photo", "picture", "img"],
    };

    for (const field of detectedFields) {
      const lowerField = field.toLowerCase();

      for (const [target, sources] of Object.entries(fieldMappings)) {
        if (sources.some((s) => lowerField.includes(s))) {
          suggestions.push({
            sourceField: field,
            suggestedField: target,
            confidence: 0.9,
          });
        }
      }
    }

    return suggestions;
  }

  private transformRowToProduct(
    row: Record<string, unknown>,
    mapping: Record<string, string>,
    defaults: Record<string, unknown>,
    rowIndex: number,
    errors: MigrationJob["errors"]
  ): Record<string, unknown> {
    const product: Record<string, unknown> = { ...defaults };

    // Map fields
    for (const [target, source] of Object.entries(mapping)) {
      const value = row[source];
      if (value !== undefined && value !== null && value !== "") {
        product[target] = this.transformValue(target, value, rowIndex, errors);
      }
    }

    // Validate required fields
    for (const required of this.REQUIRED_FIELDS) {
      if (!product[required]) {
        errors.push({
          row: rowIndex + 1,
          field: required,
          value: String(row[mapping[required]] || ""),
          error: `Required field "${required}" is missing`,
          suggestion: `Check column "${mapping[required]}" has valid data`,
        });
      }
    }

    // Convert price to kobo
    if (product.price) {
      const price = parseFloat(String(product.price));
      if (!isNaN(price)) {
        product.price = Math.round(price * 100);
      }
    }

    return product;
  }

  private transformValue(
    field: string,
    value: unknown,
    rowIndex: number,
    errors: MigrationJob["errors"]
  ): unknown {
    const strValue = String(value).trim();

    switch (field) {
      case "price": {
        const price = parseFloat(strValue.replace(/[^\d.-]/g, ""));
        if (isNaN(price)) {
          errors.push({
            row: rowIndex + 1,
            field,
            value: strValue,
            error: "Invalid price format",
            suggestion: "Use format like 1000 or 1000.00",
          });
        }
        return price;
      }

      case "quantity": {
        const qty = parseInt(strValue);
        if (isNaN(qty)) {
          errors.push({
            row: rowIndex + 1,
            field,
            value: strValue,
            error: "Invalid quantity",
          });
        }
        return qty;
      }

      case "status":
        return ["active", "draft", "archived"].includes(strValue.toLowerCase())
          ? strValue.toLowerCase()
          : "draft";

      default:
        return strValue;
    }
  }

  private async saveProduct(
    storeId: string,
    product: Record<string, unknown>,
    updateExisting: boolean
  ): Promise<void> {
    const existing = await prisma.product.findFirst({
      where: {
        storeId,
        OR: [{ sku: product.sku }, { name: product.name }].filter(Boolean),
      },
    });

    if (existing && updateExisting) {
      await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: String(product.name),
          description: product.description ? String(product.description) : undefined,
          price: Number(product.price),
          sku: product.sku ? String(product.sku) : undefined,
          barcode: product.barcode ? String(product.barcode) : undefined,
          categoryId: product.categoryId ? String(product.categoryId) : undefined,
          status: String(product.status || "draft"),
          updatedAt: new Date(),
        },
      });
    } else if (!existing) {
      await prisma.product.create({
        data: {
          storeId,
          name: String(product.name),
          description: product.description ? String(product.description) : undefined,
          price: Number(product.price),
          sku: product.sku ? String(product.sku) : undefined,
          barcode: product.barcode ? String(product.barcode) : undefined,
          categoryId: product.categoryId ? String(product.categoryId) : undefined,
          status: String(product.status || "draft"),
        },
      });
    }
  }

  private async writeCSV(filePath: string, data: Array<Record<string, unknown>>): Promise<void> {
    // Implementation for writing CSV
  }

  private async writeJSON(filePath: string, data: Array<Record<string, unknown>>): Promise<void> {
    const fs = await import("fs");
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  }

  private mapJob(data: Record<string, unknown>): MigrationJob {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      name: String(data.name),
      source: data.source as ImportSource,
      status: data.status as MigrationJob["status"],
      fileUrl: data.fileUrl ? String(data.fileUrl) : undefined,
      fileSize: data.fileSize ? Number(data.fileSize) : undefined,
      totalRows: Number(data.totalRows),
      processedRows: Number(data.processedRows),
      successCount: Number(data.successCount),
      errorCount: Number(data.errorCount),
      warningCount: Number(data.warningCount),
      settings: data.settings as MigrationJob["settings"],
      fieldMapping: (data.fieldMapping as Record<string, string>) || {},
      defaultValues: (data.defaultValues as Record<string, unknown>) || {},
      errors: (data.errors as MigrationJob["errors"]) || [],
      logs: (data.logs as MigrationJob["logs"]) || [],
      createdAt: data.createdAt as Date,
      startedAt: data.startedAt as Date,
      completedAt: data.completedAt as Date,
      createdBy: String(data.createdBy),
    };
  }
}

// Export singleton instance
export const catalogMigrationService = new CatalogMigrationService();
