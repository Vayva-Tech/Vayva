import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS as _PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

/**
 * Base controller class for industry-specific APIs
 * Provides common functionality and standardized response handling
 */
export abstract class BaseIndustryController {
  protected industry: string;
  protected serviceName: string;

  constructor(industry: string, serviceName: string) {
    this.industry = industry;
    this.serviceName = serviceName;
  }

  /**
   * Standard success response format
   */
  protected success(data: unknown, meta?: Record<string, unknown>) {
    return NextResponse.json({
      success: true,
      data,
      meta: meta || null,
      error: null,
    });
  }

  /**
   * Standard error response format
   */
  protected error(message: string, code: string = "INTERNAL_ERROR", status: number = 500) {
    return NextResponse.json(
      {
        success: false,
        data: null,
        meta: null,
        error: {
          code,
          message,
        },
      },
      { status }
    );
  }

  /**
   * Pagination helper
   */
  protected paginate(items: unknown[], page: number = 1, limit: number = 20) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);
    
    return {
      items: paginatedItems,
      meta: {
        page,
        limit,
        total: items.length,
        totalPages: Math.ceil(items.length / limit),
      },
    };
  }

  /**
   * Extract query parameters with defaults
   */
  protected getQueryParams(req: NextRequest, defaults: Record<string, unknown> = {}) {
    const { searchParams } = new URL(req.url);
    const params: Record<string, unknown> = { ...defaults };

    for (const [key, value] of searchParams.entries()) {
      // Handle numeric values
      if (/^\d+$/.test(value)) {
        params[key] = parseInt(value, 10);
      } else if (value === "true" || value === "false") {
        params[key] = value === "true";
      } else {
        params[key] = value;
      }
    }

    return params;
  }

  /**
   * Validate required parameters
   */
  protected validateRequired(params: Record<string, unknown>, required: string[]) {
    const missing = required.filter(key => !(key in params) || params[key] === undefined || params[key] === null);
    if (missing.length > 0) {
      throw new Error(`Missing required parameters: ${missing.join(", ")}`);
    }
  }

  /**
   * Parse request body with validation
   */
  protected async parseBody(req: NextRequest, validator?: (data: unknown) => boolean) {
    try {
      const body = await req.json();
      
      if (validator && !validator(body)) {
        throw new Error("Invalid request body");
      }
      
      return body;
    } catch {
      throw new Error("Invalid JSON in request body");
    }
  }

  /**
   * Log API access with context
   */
  protected logAccess(context: APIContext, action: string, details?: Record<string, unknown>) {
    logger.info(`[${this.industry.toUpperCase()}_${action}]`, {
      userId: context.user.id,
      storeId: context.storeId,
      action,
      industry: this.industry,
      service: this.serviceName,
      ...details,
    });
  }

  /**
   * Handle common API operations with error handling
   */
  protected async handleOperation<T>(
    context: APIContext,
    operation: () => Promise<T>,
    action: string,
    successMessage?: string
  ): Promise<NextResponse> {
    try {
      this.logAccess(context, action);
      const result = await operation();
      
      logger.info(`[${this.industry.toUpperCase()}_${action}_SUCCESS]`, {
        userId: context.user.id,
        storeId: context.storeId,
        action,
      });
      
      return this.success(result, { message: successMessage });
    } catch (error: unknown) {
      const e =
        error instanceof Error ? error : new Error("Operation failed");
      const statusCode =
        typeof error === "object" && error !== null && "statusCode" in error
          ? Number((error as { statusCode?: unknown }).statusCode) || 500
          : 500;
      logger.error(`[${this.industry.toUpperCase()}_${action}_ERROR]`, {
        error: e.message,
        stack: e.stack,
        userId: context.user.id,
        storeId: context.storeId,
        action,
      });
      
      return this.error(
        e.message || "Operation failed",
        "OPERATION_FAILED",
        statusCode
      );
    }
  }
}

/**
 * Factory function to create industry API handlers with proper middleware
 */
export function createIndustryAPI(
  industry: string,
  permission: string | string[] | null,
  handler: (req: NextRequest, context: APIContext) => Promise<NextResponse>
) {
  return withVayvaAPI(permission, async (req, context) => {
    try {
      return await handler(req, context);
    } catch (error: unknown) {
      const e =
        error instanceof Error ? error : new Error("An unexpected error occurred");
      logger.error(`[${industry.toUpperCase()}_API_ERROR]`, {
        error: e.message,
        stack: e.stack,
        userId: context.user.id,
        storeId: context.storeId,
        url: req.url,
        method: req.method,
      });
      
      return NextResponse.json(
        {
          success: false,
          data: null,
          meta: null,
          error: {
            code: "INTERNAL_ERROR",
            message: "An unexpected error occurred",
          },
        },
        { status: 500 }
      );
    }
  });
}