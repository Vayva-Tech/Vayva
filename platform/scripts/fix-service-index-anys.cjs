const fs = require("fs");
const path = require("path");

const ROOT = "services";

function walk(dir) {
  return fs.readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return fs.statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(ROOT).filter((f) => f.endsWith("/src/index.ts"));

for (const file of files) {
  let code = fs.readFileSync(file, "utf8");
  let changed = false;

  // FastifyPluginAsync<any> → FastifyPluginAsync
  if (code.includes("FastifyPluginAsync<any>")) {
    code = code.replace(/FastifyPluginAsync<any>/g, "FastifyPluginAsync");
    changed = true;
  }

  // (app: any) → (app: FastifyInstance)
  if (code.match(/\(\s*app:\s*any\s*\)/)) {
    if (!code.includes("FastifyInstance")) {
      code =
        'import type { FastifyInstance } from "fastify";\n' + code;
    }
    code = code.replace(/\(\s*app:\s*any\s*\)/g, "(app: FastifyInstance)");
    changed = true;
  }

  // config: any → Record<string, unknown>
  if (code.includes(": any")) {
    code = code.replace(/:\s*any\b/g, ": Record<string, unknown>");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, code);
    console.log("✔ fixed:", file);
  }
}
