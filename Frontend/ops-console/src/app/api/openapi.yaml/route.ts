import { readFileSync } from "fs";
import { resolve } from "path";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Read the openapi.yaml from the project root (where the file is located)
    const yamlPath = resolve(process.cwd(), "openapi.yaml");
    const yamlContent = readFileSync(yamlPath, "utf-8");

    return new NextResponse(yamlContent, {
      headers: {
        "Content-Type": "text/yaml",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("[OPENAPI_GET] Failed to load spec:", error);
    return NextResponse.json(
      { error: "Failed to load OpenAPI specification" },
      { status: 500 }
    );
  }
}
