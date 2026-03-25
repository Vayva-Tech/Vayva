import { readFileSync } from "fs";
import { resolve } from "path";
import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { opsApiAuthErrorResponse } from "@/lib/ops-api-auth";

export async function GET() {
  try {
    const { user } = await OpsAuthService.requireSession();
    try {
      OpsAuthService.requireRole(user, "OPERATOR");
    } catch (roleErr) {
      const r = opsApiAuthErrorResponse(roleErr);
      if (r) return r;
      throw roleErr;
    }

    // Read the openapi.yaml from the project root (where the file is located)
    const yamlPath = resolve(process.cwd(), "openapi.yaml");
    const yamlContent = readFileSync(yamlPath, "utf-8");

    return new NextResponse(yamlContent, {
      headers: {
        "Content-Type": "text/yaml",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    const authRes = opsApiAuthErrorResponse(error);
    if (authRes) return authRes;
    console.error("[OPENAPI_GET] Failed to load spec:", error);
    return NextResponse.json(
      { error: "Failed to load OpenAPI specification" },
      { status: 500 }
    );
  }
}
