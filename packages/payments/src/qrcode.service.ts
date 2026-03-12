import QRCode from "qrcode";
import { prisma } from "@vayva/db";
import crypto from "crypto";

export interface QRCodeConfig {
  storeId: string;
  type: "menu" | "product" | "order" | "payment" | "table" | "collection";
  targetId?: string; // productId, orderId, tableId, etc
  metadata?: Record<string, unknown>;
  expiresAt?: Date;
  maxScans?: number;
  style?: {
    color?: string;
    backgroundColor?: string;
    size?: number;
    logoUrl?: string;
  };
}

export interface QRCodeData {
  id: string;
  code: string;
  url: string;
  imageUrl: string;
  type: string;
  status: "active" | "inactive" | "expired";
  scanCount: number;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface QRScanResult {
  valid: boolean;
  type?: string;
  storeId?: string;
  targetId?: string;
  data?: Record<string, unknown>;
  error?: string;
}

export class QRCodeService {
  private readonly BASE_URL: string;
  private readonly CDN_URL: string;

  constructor() {
    this.BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://vayva.ng";
    this.CDN_URL = process.env.CDN_URL || "https://storage.vayva.ng";
  }

  /**
   * Generate a new QR code for a store
   */
  async generate(config: QRCodeConfig): Promise<QRCodeData> {
    const code = this.generateUniqueCode();
    
    // Build the target URL based on type
    const url = this.buildTargetUrl(config, code);
    
    // Generate QR code image
    const qrImageBuffer = await this.generateQRImage(url, config.style);
    
    // Upload to storage
    const imageUrl = await this.uploadQRImage(code, qrImageBuffer, config.storeId);
    
    // Save to database
    const qr = await prisma.qRCode.create({
      data: {
        code,
        storeId: config.storeId,
        type: config.type,
        targetId: config.targetId,
        url,
        imageUrl,
        metadata: config.metadata || {},
        expiresAt: config.expiresAt,
        maxScans: config.maxScans,
        status: "active",
        scanCount: 0,
      },
    });

    return {
      id: qr.id,
      code: qr.code,
      url: qr.url,
      imageUrl: qr.imageUrl,
      type: qr.type,
      status: qr.status as "active" | "inactive" | "expired",
      scanCount: qr.scanCount,
      createdAt: qr.createdAt,
      metadata: qr.metadata as Record<string, unknown>,
    };
  }

  /**
   * Validate and process a scanned QR code
   */
  async scan(code: string, scannerLocation?: { lat: number; lng: number }): Promise<QRScanResult> {
    const qr = await prisma.qRCode.findUnique({
      where: { code },
    });

    if (!qr) {
      return { valid: false, error: "Invalid QR code" };
    }

    // Check status
    if (qr.status !== "active") {
      return { valid: false, error: `QR code is ${qr.status}` };
    }

    // Check expiration
    if (qr.expiresAt && new Date() > qr.expiresAt) {
      await this.updateStatus(qr.id, "expired");
      return { valid: false, error: "QR code has expired" };
    }

    // Check max scans
    if (qr.maxScans && qr.scanCount >= qr.maxScans) {
      await this.updateStatus(qr.id, "inactive");
      return { valid: false, error: "QR code scan limit reached" };
    }

    // Increment scan count
    await prisma.qRCode.update({
      where: { id: qr.id },
      data: {
        scanCount: { increment: 1 },
        lastScannedAt: new Date(),
        scanLocations: {
          push: scannerLocation || {},
        },
      },
    });

    return {
      valid: true,
      type: qr.type,
      storeId: qr.storeId,
      targetId: qr.targetId || undefined,
      data: qr.metadata as Record<string, unknown>,
    };
  }

  /**
   * Get QR codes for a store
   */
  async getStoreQRCodes(
    storeId: string,
    options?: { type?: string; status?: string; limit?: number; offset?: number }
  ): Promise<{ codes: QRCodeData[]; total: number }> {
    const where: Record<string, unknown> = { storeId };
    
    if (options?.type) where.type = options.type;
    if (options?.status) where.status = options.status;

    const [codes, total] = await Promise.all([
      prisma.qRCode.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: options?.limit || 50,
        skip: options?.offset || 0,
      }),
      prisma.qRCode.count({ where }),
    ]);

    return {
      codes: codes.map((qr) => ({
        id: qr.id,
        code: qr.code,
        url: qr.url,
        imageUrl: qr.imageUrl,
        type: qr.type,
        status: qr.status as "active" | "inactive" | "expired",
        scanCount: qr.scanCount,
        createdAt: qr.createdAt,
        metadata: qr.metadata as Record<string, unknown>,
      })),
      total,
    };
  }

  /**
   * Get QR code statistics
   */
  async getStats(storeId: string): Promise<{
    total: number;
    active: number;
    totalScans: number;
    scansByType: Record<string, number>;
  }> {
    const stats = await prisma.qRCode.groupBy({
      by: ["type", "status"],
      where: { storeId },
      _count: { id: true },
      _sum: { scanCount: true },
    });

    const result = {
      total: 0,
      active: 0,
      totalScans: 0,
      scansByType: {} as Record<string, number>,
    };

    for (const stat of stats) {
      const count = stat._count.id;
      const scans = stat._sum.scanCount || 0;

      result.total += count;
      if (stat.status === "active") result.active += count;
      result.totalScans += scans;

      result.scansByType[stat.type] = (result.scansByType[stat.type] || 0) + scans;
    }

    return result;
  }

  /**
   * Regenerate a QR code image
   */
  async regenerate(code: string, style?: QRCodeConfig["style"]): Promise<QRCodeData | null> {
    const qr = await prisma.qRCode.findUnique({ where: { code } });
    if (!qr) return null;

    const qrImageBuffer = await this.generateQRImage(qr.url, style);
    const imageUrl = await this.uploadQRImage(code, qrImageBuffer, qr.storeId);

    const updated = await prisma.qRCode.update({
      where: { id: qr.id },
      data: { imageUrl },
    });

    return {
      id: updated.id,
      code: updated.code,
      url: updated.url,
      imageUrl: updated.imageUrl,
      type: updated.type,
      status: updated.status as "active" | "inactive" | "expired",
      scanCount: updated.scanCount,
      createdAt: updated.createdAt,
      metadata: updated.metadata as Record<string, unknown>,
    };
  }

  /**
   * Update QR code status
   */
  async updateStatus(codeId: string, status: "active" | "inactive" | "expired"): Promise<void> {
    await prisma.qRCode.update({
      where: { id: codeId },
      data: { status },
    });
  }

  /**
   * Delete a QR code
   */
  async delete(codeId: string): Promise<void> {
    await prisma.qRCode.delete({
      where: { id: codeId },
    });
  }

  /**
   * Generate unique code
   */
  private generateUniqueCode(): string {
    const timestamp = Date.now().toString(36);
    const random = crypto.randomBytes(4).toString("hex").toUpperCase();
    return `VAY${timestamp}${random}`.slice(0, 16);
  }

  /**
   * Build target URL based on QR type
   */
  private buildTargetUrl(config: QRCodeConfig, code: string): string {
    const { storeId, type, targetId, metadata } = config;
    
    const baseUrl = `${this.BASE_URL}/qr`;
    const params = new URLSearchParams();
    params.append("c", code);
    params.append("s", storeId);

    switch (type) {
      case "menu":
        return `${this.BASE_URL}/s/${storeId}?qr=menu`;
      
      case "product":
        if (targetId) {
          return `${this.BASE_URL}/s/${storeId}/p/${targetId}?qr=${code}`;
        }
        return `${baseUrl}?${params.toString()}`;
      
      case "order":
        if (targetId) {
          return `${this.BASE_URL}/track/${targetId}?qr=${code}`;
        }
        return `${baseUrl}?${params.toString()}`;
      
      case "payment":
        params.append("a", String(metadata?.amount || 0));
        params.append("d", String(metadata?.description || ""));
        return `${baseUrl}/pay?${params.toString()}`;
      
      case "table":
        if (targetId) {
          return `${this.BASE_URL}/s/${storeId}?table=${targetId}&qr=${code}`;
        }
        return `${baseUrl}?${params.toString()}`;
      
      case "collection":
        if (targetId) {
          return `${this.BASE_URL}/s/${storeId}/c/${targetId}?qr=${code}`;
        }
        return `${baseUrl}?${params.toString()}`;
      
      default:
        return `${baseUrl}?${params.toString()}`;
    }
  }

  /**
   * Generate QR code image buffer
   */
  private async generateQRImage(
    url: string,
    style?: QRCodeConfig["style"]
  ): Promise<Buffer> {
    const options: QRCode.QRCodeToBufferOptions = {
      type: "png",
      width: style?.size || 512,
      margin: 2,
      color: {
        dark: style?.color || "#000000",
        light: style?.backgroundColor || "#FFFFFF",
      },
    };

    return QRCode.toBuffer(url, options);
  }

  /**
   * Upload QR image to storage
   */
  private async uploadQRImage(code: string, buffer: Buffer, storeId: string): Promise<string> {
    // In production, this uploads to MinIO/S3
    // For now, we'll return a data URL for the image
    const base64 = buffer.toString("base64");
    return `data:image/png;base64,${base64}`;
  }
}

// Export singleton instance
export const qrCodeService = new QRCodeService();
