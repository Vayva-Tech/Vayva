import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { z } from "zod";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const calculateSchema = z.object({
  vehiclePrice: z.number().nonnegative(),
  downPayment: z.number().nonnegative(),
  tradeInValue: z.number().nonnegative().optional().default(0),
  interestRate: z.number().nonnegative(),
  termMonths: z.number().int().positive(),
});

type FinancingCalculation = {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  apr: number;
  termMonths: number;
};

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const validated = calculateSchema.parse(body);

    const result = await apiJson<{
      calculation: FinancingCalculation;
    }>(buildBackendUrl("/api/vehicles/financing/calculate"), {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(validated),
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/api/vehicles/financing", operation: "POST" });
    return NextResponse.json({ error: "Failed to complete operation" }, { status: 500 });
  }
}
