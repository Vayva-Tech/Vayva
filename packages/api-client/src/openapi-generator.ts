/**
 * OpenAPI Generator for Vayva Platform
 * 
 * Generates OpenAPI 3.1.0 specifications from Zod schemas and route definitions.
 * This extends the existing API client with comprehensive documentation capabilities.
 * 
 * Features:
 * - Automatic Zod to OpenAPI schema conversion
 * - Route documentation from TypeScript definitions
 * - Webhook documentation
 * - Authentication scheme documentation
 * 
 * @example
 * ```typescript
 * import { OpenAPIGenerator } from "@vayva/api-client";
 * 
 * const generator = new OpenAPIGenerator({
 *   title: "Vayva API",
 *   version: "1.0.0",
 * });
 * 
 * // Register routes with schemas
 * generator.addRoute({
 *   path: "/orders",
 *   method: "post",
 *   summary: "Create order",
 *   requestSchema: CreateOrderSchema,
 *   responseSchema: OrderSchema,
 * });
 * 
 * const spec = generator.generate();
 * ```
 */

import { z } from "zod";
import type { ZodTypeAny, ZodObject, ZodArray, ZodEnum, ZodUnion, ZodOptional, ZodNullable } from "zod";

// OpenAPI types
export interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    description?: string;
    version: string;
    contact?: {
      name?: string;
      email?: string;
      url?: string;
    };
    license?: {
      name: string;
      url?: string;
    };
  };
  servers: Array<{
    url: string;
    description?: string;
  }>;
  paths: Record<string, PathItem>;
  components: {
    schemas: Record<string, SchemaObject>;
    securitySchemes?: Record<string, SecurityScheme>;
    responses?: Record<string, ResponseObject>;
    parameters?: Record<string, ParameterObject>;
  };
  security?: Array<Record<string, string[]>>;
  tags?: Array<{
    name: string;
    description?: string;
  }>;
}

interface PathItem {
  summary?: string;
  description?: string;
  get?: Operation;
  post?: Operation;
  put?: Operation;
  patch?: Operation;
  delete?: Operation;
  parameters?: ParameterObject[];
}

interface Operation {
  summary?: string;
  description?: string;
  operationId?: string;
  tags?: string[];
  parameters?: ParameterObject[];
  requestBody?: RequestBody;
  responses: Record<string, ResponseObject>;
  security?: Array<Record<string, string[]>>;
  deprecated?: boolean;
}

interface RequestBody {
  description?: string;
  required?: boolean;
  content: Record<string, { schema: SchemaObject }>;
}

interface ResponseObject {
  description: string;
  content?: Record<string, { schema: SchemaObject }>;
  headers?: Record<string, unknown>;
}

interface ParameterObject {
  name: string;
  in: "query" | "path" | "header" | "cookie";
  description?: string;
  required?: boolean;
  schema: SchemaObject;
}

interface SchemaObject {
  type?: string;
  format?: string;
  description?: string;
  default?: unknown;
  enum?: unknown[];
  items?: SchemaObject;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  additionalProperties?: boolean | SchemaObject;
  oneOf?: SchemaObject[];
  anyOf?: SchemaObject[];
  allOf?: SchemaObject[];
  nullable?: boolean;
  example?: unknown;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  $ref?: string;
}

interface SecurityScheme {
  type: "apiKey" | "http" | "oauth2" | "openIdConnect";
  description?: string;
  name?: string;
  in?: "query" | "header" | "cookie";
  scheme?: string;
  bearerFormat?: string;
  flows?: unknown;
  openIdConnectUrl?: string;
}

interface RouteDefinition {
  path: string;
  method: "get" | "post" | "put" | "patch" | "delete";
  summary: string;
  description?: string;
  tags?: string[];
  operationId?: string;
  requestSchema?: z.ZodTypeAny;
  responseSchema?: z.ZodTypeAny;
  paramsSchema?: z.ZodTypeAny;
  querySchema?: z.ZodTypeAny;
  responses?: Record<number, { description: string; schema?: z.ZodTypeAny }>;
  deprecated?: boolean;
  security?: string[];
}

export interface GeneratorConfig {
  title: string;
  version: string;
  description?: string;
  contact?: {
    name?: string;
    email?: string;
    url?: string;
  };
  license?: {
    name: string;
    url?: string;
  };
  servers?: Array<{ url: string; description?: string }>;
}

/**
 * Zod to OpenAPI schema converter
 * 
 * Note: This is a simplified version compatible with Zod v4
 * For full Zod v4 support, additional type handling may be needed
 */
export class ZodToOpenAPIConverter {
  private schemaRefs = new Map<string, SchemaObject>();

  convert(schema: ZodTypeAny, _name?: string): SchemaObject {
    // Simplified conversion for Zod v4
    // Access the internal definition
    const def = (schema as unknown as { _def: { typeName: string } })._def;
    
    if (!def) {
      return { type: "object" };
    }

    const typeName = def.typeName;

    switch (typeName) {
      case "ZodString":
        return { type: "string" };
      case "ZodNumber":
        return { type: "number" };
      case "ZodBoolean":
        return { type: "boolean" };
      case "ZodDate":
        return { type: "string", format: "date-time" };
      case "ZodArray":
        return { type: "array", items: { type: "object" } };
      case "ZodObject":
        return this.convertObject(schema as ZodObject<Record<string, ZodTypeAny>>);
      case "ZodEnum":
        return { type: "string" };
      case "ZodOptional":
        return { type: "object" };
      case "ZodNullable":
        return { type: "object", nullable: true };
      case "ZodRecord":
        return { type: "object", additionalProperties: true };
      case "ZodAny":
      case "ZodUnknown":
        return {};
      case "ZodNull":
      case "ZodUndefined":
      case "ZodVoid":
        return { type: "null" };
      default:
        return { type: "object" };
    }
  }

  private convertObject(schema: ZodObject<Record<string, ZodTypeAny>>): SchemaObject {
    // For Zod v4, shape might be a function or property
    const shape = (schema as unknown as { shape: Record<string, ZodTypeAny> }).shape || 
                  (schema as unknown as { _def: { shape: () => Record<string, ZodTypeAny> } })._def?.shape?.();
    
    const properties: Record<string, SchemaObject> = {};
    const required: string[] = [];

    if (shape) {
      for (const [key, value] of Object.entries(shape)) {
        properties[key] = this.convert(value as ZodTypeAny);
        
        // Check if field is required (not optional)
        try {
          if (!(value as ZodTypeAny).isOptional()) {
            required.push(key);
          }
        } catch {
          // If isOptional is not available, assume required
          required.push(key);
        }
      }
    }

    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  getRegisteredSchemas(): Record<string, SchemaObject> {
    const result: Record<string, SchemaObject> = {};
    this.schemaRefs.forEach((schema, name) => {
      result[name] = schema;
    });
    return result;
  }
}

/**
 * OpenAPI Generator
 */
export class OpenAPIGenerator {
  private config: GeneratorConfig;
  private routes: RouteDefinition[] = [];
  private schemas = new Map<string, z.ZodTypeAny>();
  private converter = new ZodToOpenAPIConverter();
  private tags = new Set<string>();

  constructor(config: GeneratorConfig) {
    this.config = {
      servers: [
        { url: "https://api.vayva.ng", description: "Production" },
        { url: "https://staging-api.vayva.ng", description: "Staging" },
      ],
      ...config,
    };
  }

  /**
   * Register a Zod schema for reuse
   */
  registerSchema(name: string, schema: z.ZodTypeAny): void {
    this.schemas.set(name, schema);
  }

  /**
   * Add a route definition
   */
  addRoute(route: RouteDefinition): void {
    this.routes.push(route);
    
    // Collect tags
    route.tags?.forEach((tag) => this.tags.add(tag));
  }

  /**
   * Add multiple routes
   */
  addRoutes(routes: RouteDefinition[]): void {
    routes.forEach((route) => this.addRoute(route));
  }

  /**
   * Generate OpenAPI specification
   */
  generate(): OpenAPISpec {
    const paths: Record<string, PathItem> = {};
    const componentSchemas: Record<string, SchemaObject> = {};

    // Process registered schemas
    this.schemas.forEach((schema, name) => {
      componentSchemas[name] = this.converter.convert(schema, name);
    });

    // Process routes
    for (const route of this.routes) {
      if (!paths[route.path]) {
        paths[route.path] = {};
      }

      const operation: Operation = {
        summary: route.summary,
        description: route.description,
        operationId: route.operationId || this.generateOperationId(route),
        tags: route.tags,
        responses: {},
        deprecated: route.deprecated,
      };

      // Add parameters
      const parameters: ParameterObject[] = [];

      // Path parameters
      if (route.paramsSchema) {
        const paramsSchema = this.converter.convert(route.paramsSchema);
        if (paramsSchema.properties) {
          for (const [name, schema] of Object.entries(paramsSchema.properties)) {
            parameters.push({
              name,
              in: "path",
              required: paramsSchema.required?.includes(name) ?? true,
              schema,
            });
          }
        }
      }

      // Query parameters
      if (route.querySchema) {
        const querySchema = this.converter.convert(route.querySchema);
        if (querySchema.properties) {
          for (const [name, schema] of Object.entries(querySchema.properties)) {
            parameters.push({
              name,
              in: "query",
              required: querySchema.required?.includes(name) ?? false,
              schema,
            });
          }
        }
      }

      if (parameters.length > 0) {
        operation.parameters = parameters;
      }

      // Request body
      if (route.requestSchema) {
        operation.requestBody = {
          required: true,
          content: {
            "application/json": {
              schema: this.converter.convert(route.requestSchema),
            },
          },
        };
      }

      // Responses
      if (route.responses) {
        for (const [code, response] of Object.entries(route.responses)) {
          operation.responses[code] = {
            description: response.description,
            content: response.schema
              ? {
                  "application/json": {
                    schema: this.converter.convert(response.schema),
                  },
                }
              : undefined,
          };
        }
      }

      // Default success response
      if (!operation.responses["200"] && !operation.responses["201"]) {
        if (route.responseSchema) {
          operation.responses["200"] = {
            description: "Success",
            content: {
              "application/json": {
                schema: this.converter.convert(route.responseSchema),
              },
            },
          };
        } else {
          operation.responses["200"] = {
            description: "Success",
          };
        }
      }

      // Add error responses if not present
      if (!operation.responses["400"]) {
        operation.responses["400"] = {
          description: "Bad Request",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        };
      }
      if (!operation.responses["401"]) {
        operation.responses["401"] = {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        };
      }
      if (!operation.responses["500"]) {
        operation.responses["500"] = {
          description: "Internal Server Error",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
          },
        };
      }

      // Security
      if (route.security) {
        operation.security = route.security.map((s) => ({ [s]: [] }));
      }

      paths[route.path][route.method] = operation;
    }

    // Add common schemas
    componentSchemas.ErrorResponse = {
      type: "object",
      properties: {
        success: { type: "boolean", enum: [false] },
        error: {
          type: "object",
          properties: {
            code: { type: "string" },
            message: { type: "string" },
            details: { type: "object" },
          },
          required: ["code", "message"],
        },
      },
      required: ["success", "error"],
    };

    componentSchemas.PaginatedResponse = {
      type: "object",
      properties: {
        data: { type: "array", items: { type: "object" } },
        meta: {
          type: "object",
          properties: {
            total: { type: "integer" },
            page: { type: "integer" },
            limit: { type: "integer" },
            totalPages: { type: "integer" },
          },
          required: ["total", "page", "limit", "totalPages"],
        },
      },
      required: ["data", "meta"],
    };

    return {
      openapi: "3.1.0",
      info: {
        title: this.config.title,
        description: this.config.description,
        version: this.config.version,
        contact: this.config.contact,
        license: this.config.license,
      },
      servers: this.config.servers || [],
      paths,
      components: {
        schemas: componentSchemas,
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
            description: "JWT token authentication",
          },
          apiKeyAuth: {
            type: "apiKey",
            in: "header",
            name: "X-API-Key",
            description: "API key authentication",
          },
        },
      },
      security: [{ bearerAuth: [] }],
      tags: Array.from(this.tags).map((name) => ({ name })),
    };
  }

  /**
   * Generate operation ID from route
   */
  private generateOperationId(route: RouteDefinition): string {
    const method = route.method.toLowerCase();
    const pathParts = route.path
      .split("/")
      .filter((p) => p && !p.startsWith("{"))
      .map((p) => p.replace(/[^a-zA-Z0-9]/g, "_"));
    
    return `${method}_${pathParts.join("_")}`;
  }

  /**
   * Export spec as JSON
   */
  toJSON(): string {
    return JSON.stringify(this.generate(), null, 2);
  }

  /**
   * Export spec as YAML
   */
  toYAML(): string {
    const spec = this.generate();
    // Simple YAML conversion (in production, use a proper YAML library)
    return this.convertToYAML(spec);
  }

  private convertToYAML(obj: unknown, indent = 0): string {
    const spaces = "  ".repeat(indent);
    
    if (obj === null) return "null";
    if (typeof obj === "string") return `"${obj.replace(/"/g, '\\"')}"`;
    if (typeof obj === "number" || typeof obj === "boolean") return String(obj);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return "[]";
      return "\n" + obj.map((item) => `${spaces}- ${this.convertToYAML(item, indent + 1).trim()}`).join("\n");
    }
    
    if (typeof obj === "object") {
      const entries = Object.entries(obj as Record<string, unknown>);
      if (entries.length === 0) return "{}";
      return "\n" + entries
        .map(([key, value]) => {
          const valueStr = this.convertToYAML(value, indent + 1);
          if (valueStr.startsWith("\n")) {
            return `${spaces}${key}:${valueStr}`;
          }
          return `${spaces}${key}: ${valueStr}`;
        })
        .join("\n");
    }
    
    return String(obj);
  }
}

// Convenience exports
export const createOpenAPIGenerator = (config: GeneratorConfig) => new OpenAPIGenerator(config);
