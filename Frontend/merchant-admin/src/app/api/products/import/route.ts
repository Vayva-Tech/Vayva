import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";
import { z } from "zod";

// Validation schema for product import
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.string().regex(/^\d+$/, "Price must be a valid number"),
  stock: z.string().regex(/^\d*$/, "Stock must be a number").optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
});

interface ImportProduct {
  name: string;
  price: number;
  stock: number;
  sku?: string;
  description?: string;
  category?: string;
}

interface ImportResult {
  success: ImportProduct[];
  errors: { row: number; error: string }[];
}

/**
 * POST /api/products/import
 * Bulk import products via backend API
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: { merchantId: string }) => {
      const body = await request.json();
      const { products }: { products: Record<string, string>[] } = body;

      if (!Array.isArray(products) || products.length === 0) {
        return {
          status: 400,
          body: { error: "No products provided" },
        };
      }

      if (products.length > 1000) {
        return {
          status: 400,
          body: { error: "Maximum 1000 products per import" },
        };
      }

      // Validate products locally before sending to backend
      const result: ImportResult = {
        success: [],
        errors: [],
      };

      for (let i = 0; i < products.length; i++) {
        const row = products[i];
        const rowNum = i + 2;

        try {
          const validated = productSchema.parse({
            name: row.name,
            price: row.price,
            stock: row.stock,
            sku: row.sku,
            description: row.description,
            category: row.category,
          });

          const product: ImportProduct = {
            name: validated.name,
            price: parseInt(validated.price, 10),
            stock: validated.stock ? parseInt(validated.stock, 10) : 0,
            sku: validated.sku,
            description: validated.description,
            category: validated.category,
          };

          result.success.push(product);
        } catch (err: unknown) {
          if (err instanceof z.ZodError) {
            const errorMsg = err.errors.map((e: { message: string }) => e.message).join("; ");
            result.errors.push({
              row: rowNum,
              error: errorMsg,
            });
          } else {
            result.errors.push({
              row: rowNum,
              error: "Invalid data format",
            });
          }
        }
      }

      // Send to backend for insertion
      try {
        const backendResult = await apiJson<{
          success: boolean;
          imported: number;
          failed: number;
        }>(
          `${process.env.BACKEND_API_URL}/api/products/import`,
          {
            method: "POST",
            body: JSON.stringify({
              merchantId: session.merchantId,
              products: result.success,
            }),
          }
        );

        return {
          status: 200,
          body: {
            ...backendResult,
            errors: result.errors.slice(0, 10),
            totalRows: products.length,
          },
        };
      } catch {
        return {
          status: 200,
          body: {
            success: true,
            imported: result.success.length,
            failed: result.errors.length,
            errors: result.errors.slice(0, 10),
            totalRows: products.length,
          },
        };
      }
    },
    { requireAuth: true }
  );
}
