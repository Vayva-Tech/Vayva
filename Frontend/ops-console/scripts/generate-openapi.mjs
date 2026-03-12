#!/usr/bin/env node
/**
 * OpenAPI Generator for Next.js App Router
 * Scans route.ts files and generates OpenAPI 3.1.0 spec
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve, relative, dirname, basename } from "path";
import { globSync } from "glob";
import yaml from "js-yaml";

// HTTP methods to detect
const HTTP_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];

// Route parameter pattern: [param] or [...catchall]
const PARAM_PATTERN = /\[(?:\.{3})?([^\]]+)\]/g;

// Generate OpenAPI path from file path
function generatePath(filePath) {
  // Remove route.ts and convert to API path
  const relativePath = relative("src/app/api", filePath);
  const pathWithoutRoute = relativePath.replace(/\/route\.ts$/, "");

  // Convert Next.js params to OpenAPI params
  let openApiPath = "/" + pathWithoutRoute.replace(PARAM_PATTERN, "{$1}");

  // Clean up ops prefix
  if (openApiPath.startsWith("/ops/")) {
    openApiPath = openApiPath.replace("/ops", "");
  }

  return openApiPath || "/";
}

// Extract exported methods from route file
function extractMethods(filePath) {
  const content = readFileSync(filePath, "utf-8");
  const methods = [];

  for (const method of HTTP_METHODS) {
    // Look for: export async function GET, export const GET, export { GET }, etc.
    const patterns = [
      new RegExp(`export\\s+(?:async\\s+)?function\\s+${method}\\b`, "i"),
      new RegExp(`export\\s+(?:const|let|var)\\s+${method}\\s*[=:]`, "i"),
      new RegExp(`export\\s*\\{[^}]*\\b${method}\\b[^}]*\\}`, "i"),
    ];

    if (patterns.some((p) => p.test(content))) {
      methods.push(method.toLowerCase());
    }
  }

  return methods;
}

// Infer tag from path
function inferTag(path) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "General";

  // Group by first segment
  const tag = parts[0];

  // Map common tags
  const tagMap = {
    auth: "Authentication",
    admin: "Admin",
    analytics: "Analytics",
    ai: "AI & Automation",
    alerts: "Alerts",
    audit: "Audit",
    "audit-logs": "Audit Logs",
    communications: "Communications",
    config: "Configuration",
    dashboard: "Dashboard",
    deliveries: "Deliveries",
    disputes: "Disputes",
    financials: "Financials",
    growth: "Growth",
    health: "Health",
    impersonate: "Authentication",
    invitations: "Invitations",
    jobs: "Jobs",
    kyc: "KYC",
    logistics: "Logistics",
    marketplace: "Marketplace",
    me: "Authentication",
    merchants: "Merchants",
    notifications: "Notifications",
    onboarding: "Onboarding",
    orders: "Orders",
    partners: "Partners",
    payments: "Payments",
    refunds: "Refunds",
    rescue: "Rescue",
    revenue: "Revenue",
    risk: "Risk",
    security: "Security",
    subscriptions: "Subscriptions",
    support: "Support",
    tools: "Tools",
    users: "Users",
    webhooks: "Webhooks",
  };

  return tagMap[tag] || tag.charAt(0).toUpperCase() + tag.slice(1);
}

// Generate operation summary from path
function generateSummary(path, method) {
  const parts = path.split("/").filter(Boolean);
  const action = method.toUpperCase();

  if (parts.length === 0) {
    return `${action} root`;
  }

  // Build descriptive summary
  let resource = parts[parts.length - 1];

  // Handle path parameters
  resource = resource.replace(/\{(\w+)\}/g, "by $1");

  // Handle common patterns
  if (method === "get") {
    if (path.includes("/stats")) return "Get statistics";
    if (path.includes("/health")) return "Health check";
    if (resource === "me") return "Get current user";
    if (path.includes("[id]")) return `Get ${parts[parts.length - 2]} details`;
    return `List ${resource}`;
  }

  if (method === "post") {
    if (path.includes("/bulk")) return `Bulk ${parts[parts.length - 2]} operations`;
    if (path.includes("/login")) return "Authenticate user";
    return `Create ${resource}`;
  }

  if (method === "patch") {
    return `Update ${resource}`;
  }

  if (method === "put") {
    return `Replace ${resource}`;
  }

  if (method === "delete") {
    if (resource === "mfa") return "Disable MFA";
    return `Delete ${resource}`;
  }

  return `${action} ${resource}`;
}

// Generate OpenAPI spec
function generateOpenAPISpec(routes) {
  const paths = {};
  const tags = new Set();

  for (const { path, methods } of routes) {
    if (!paths[path]) {
      paths[path] = {};
    }

    const tag = inferTag(path);
    tags.add(tag);

    for (const method of methods) {
      const summary = generateSummary(path, method);

      paths[path][method] = {
        summary,
        tags: [tag],
        responses: {
          "200": {
            description: "Success",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { type: "object" },
                  },
                },
              },
            },
          },
          "401": {
            $ref: "#/components/responses/Unauthorized",
          },
          "403": {
            $ref: "#/components/responses/Forbidden",
          },
        },
      };

      // Add requestBody for POST/PUT/PATCH
      if (["post", "put", "patch"].includes(method)) {
        paths[path][method].requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
              },
            },
          },
        };
      }

      // Add path parameters
      const pathParams = path.match(/\{(\w+)\}/g);
      if (pathParams) {
        paths[path][method].parameters = pathParams.map((param) => ({
          name: param.replace(/[{}]/g, ""),
          in: "path",
          required: true,
          schema: { type: "string" },
        }));
      }
    }
  }

  return {
    openapi: "3.0.3",
    info: {
      title: "Vayva Ops Console API",
      description: "Internal operations platform API for managing merchants, orders, KYC, disputes, and platform administration.\n\nAuto-generated from Next.js route files.",
      version: "1.0.0",
      contact: {
        name: "Vayva Engineering",
        email: "engineering@vayva.co",
      },
    },
    servers: [
      {
        url: "https://ops.vayva.co/api/ops",
        description: "Production server",
      },
      {
        url: "http://localhost:3002/api/ops",
        description: "Development server",
      },
    ],
    security: [{ cookieAuth: [] }],
    tags: Array.from(tags).sort().map((name) => ({ name })),
    paths,
    components: {
      responses: {
        Unauthorized: {
          description: "Authentication required",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        Forbidden: {
          description: "Insufficient permissions",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        BadRequest: {
          description: "Invalid request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
        NotFound: {
          description: "Resource not found",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        },
      },
      schemas: {
        ApiMeta: {
          type: "object",
          properties: {
            requestId: { type: "string" },
            timestamp: { type: "string", format: "date-time" },
          },
          required: ["requestId", "timestamp"],
        },
        PaginatedMeta: {
          allOf: [
            { $ref: "#/components/schemas/ApiMeta" },
            {
              type: "object",
              properties: {
                total: { type: "integer" },
                page: { type: "integer" },
                limit: { type: "integer" },
                totalPages: { type: "integer" },
              },
            },
          ],
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", enum: [false] },
            error: {
              type: "object",
              properties: {
                code: { type: "string" },
                message: { type: "string" },
                details: {
                  type: "object",
                  additionalProperties: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
              },
            },
            meta: { $ref: "#/components/schemas/ApiMeta" },
          },
        },
      },
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "vayva_ops_session",
        },
      },
    },
  };
}

// Main execution
function main() {
  const apiDir = resolve(process.cwd(), "src/app/api");

  // Find all route.ts files
  const routeFiles = globSync("**/route.ts", {
    cwd: apiDir,
    absolute: true,
  });

  console.log(`Found ${routeFiles.length} route files`);

  // Process each route file
  const routes = [];
  for (const file of routeFiles) {
    const path = generatePath(file);
    const methods = extractMethods(file);

    if (methods.length > 0) {
      routes.push({ path, methods });
      console.log(`  ${path}: ${methods.join(", ").toUpperCase()}`);
    }
  }

  // Sort routes by path
  routes.sort((a, b) => a.path.localeCompare(b.path));

  // Generate spec
  const spec = generateOpenAPISpec(routes);

  // Write to file
  const outputPath = resolve(process.cwd(), "openapi-generated.yaml");
  writeFileSync(outputPath, yaml.dump(spec, { lineWidth: 120 }));

  console.log(`\nGenerated OpenAPI spec: ${outputPath}`);
  console.log(`Total endpoints: ${routes.length}`);
  console.log(`Tags: ${spec.tags.map((t) => t.name).join(", ")}`);
}

main();
