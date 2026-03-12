#!/usr/bin/env node
/**
 * Postman Collection Generator
 * Converts OpenAPI spec to Postman Collection v2.1
 */

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import yaml from "js-yaml";

// Load OpenAPI spec
const specPath = resolve(process.cwd(), "openapi.yaml");
const spec = yaml.load(readFileSync(specPath, "utf-8"));

// Convert OpenAPI path params {id} to Postman {{id}}
function convertPath(path) {
  return path.replace(/\{(\w+)\}/g, "{{$1}}");
}

// Generate Postman URL object
function generateUrl(path, method, parameters = []) {
  const convertedPath = convertPath(path);
  const pathParts = convertedPath.split("/").filter(Boolean);

  // Extract path variables
  const pathVars = [];
  const cleanPath = pathParts.map((part) => {
    if (part.startsWith("{{") && part.endsWith("}}")) {
      const varName = part.slice(2, -2);
      pathVars.push({ key: varName, value: "" });
      return part;
    }
    return part;
  });

  return {
    raw: "{{baseUrl}}/api/ops" + convertedPath,
    host: ["{{baseUrl}}"],
    path: ["api", "ops", ...cleanPath],
    variable: pathVars,
  };
}

// Generate request body
function generateBody(method, spec) {
  if (!["post", "put", "patch"].includes(method)) {
    return null;
  }

  if (!spec.requestBody?.content?.["application/json"]) {
    return null;
  }

  return {
    mode: "raw",
    raw: JSON.stringify({ /* TODO: Add example based on schema */ }, null, 2),
    options: {
      raw: {
        language: "json",
      },
    },
  };
}

// Generate headers
function generateHeaders(method) {
  const headers = [
    {
      key: "Content-Type",
      value: "application/json",
      type: "text",
    },
    {
      key: "Accept",
      value: "application/json",
      type: "text",
    },
  ];

  return headers;
}

// Generate description from spec
function generateDescription(operation) {
  let desc = operation.summary || "";
  if (operation.description) {
    desc += "\n\n" + operation.description;
  }
  return desc;
}

// Build Postman collection
function buildCollection(spec) {
  // Group endpoints by tag
  const folders = {};

  for (const [path, methods] of Object.entries(spec.paths)) {
    for (const [method, operation] of Object.entries(methods)) {
      if (typeof operation !== "object") continue;

      const tag = operation.tags?.[0] || "General";

      if (!folders[tag]) {
        folders[tag] = {
          name: tag,
          item: [],
        };
      }

      const request = {
        name: operation.summary || `${method.toUpperCase()} ${path}`,
        request: {
          method: method.toUpperCase(),
          header: generateHeaders(method),
          url: generateUrl(path, method, operation.parameters),
          body: generateBody(method, operation),
          description: generateDescription(operation),
        },
        response: [],
      };

      folders[tag].item.push(request);
    }
  }

  return {
    info: {
      name: spec.info.title || "Vayva Ops Console API",
      description: spec.info.description || "API Collection",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
      _postman_id: `vayva-ops-${Date.now()}`,
      version: {
        name: spec.info.version || "1.0.0",
      },
    },
    variable: [
      {
        key: "baseUrl",
        value: "https://ops.vayva.co",
        type: "string",
        description: "API Base URL",
      },
      {
        key: "id",
        value: "",
        type: "string",
        description: "Resource ID (for path params)",
      },
    ],
    item: Object.values(folders).sort((a, b) => a.name.localeCompare(b.name)),
  };
}

// Generate and save
const collection = buildCollection(spec);
const outputPath = resolve(process.cwd(), "postman-collection.json");
writeFileSync(outputPath, JSON.stringify(collection, null, 2));

console.log(`Generated Postman Collection: ${outputPath}`);
console.log(`Total folders: ${collection.item.length}`);
console.log(`Total requests: ${collection.item.reduce((sum, folder) => sum + folder.item.length, 0)}`);
console.log(`\nFolders:`);
collection.item.forEach((folder) => {
  console.log(`  📁 ${folder.name} (${folder.item.length} requests)`);
});
