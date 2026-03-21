import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const TemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  category: z.string().optional(),
  isSystem: z.boolean().default(false),
  config: z.record(z.any()).optional(),
});

/**
 * GET /api/templates
 * List all available templates (system + merchant custom)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const includeSystem = searchParams.get("includeSystem") !== "false";

    // Build query params
    const queryParams = new URLSearchParams();
    if (category) queryParams.set("category", category);
    queryParams.set("includeSystem", includeSystem.toString());

    // Forward to Backend API
    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/templates?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch templates');
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/templates',
        operation: 'GET_TEMPLATES',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/templates
 * Create a new template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = TemplateSchema.parse(body);

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validated),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create template');
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/templates',
        operation: 'CREATE_TEMPLATE',
      }
    );
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}
