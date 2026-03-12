const fs = require("fs");
const path = require("path");

const ROOT = path.join(process.cwd(), "services");

function walk(dir) {
  return fs.readdirSync(dir).flatMap(f => {
    const p = path.join(dir, f);
    return fs.statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = walk(ROOT).filter(f =>
  f.endsWith(".ts") &&
  (f.endsWith("index.ts") || f.endsWith("routes.ts") || f.endsWith("controller.ts"))
);

for (const file of files) {
  let code = fs.readFileSync(file, "utf8");
  let changed = false;

  if (code.includes(": any")) {
    if (!code.includes("FastifyInstance")) {
      code = `import type { FastifyInstance } from "fastify";\n` + code;
      changed = true;
    }

    code = code.replace(/:\s*any/g, ": FastifyInstance");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, code);
    console.log


node scripts/fix-fastify-anys.cjs

pnpm lint

mkdir -p scripts
cat > scripts/fix-explicit-anys.cjs <<'EOF'
/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOTS = ["services"];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const p = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(p) : [p];
  });
}

const files = ROOTS
  .flatMap(walk)
  .filter(
    (f) =>
      f.endsWith(".ts") &&
      !f.endsWith(".d.ts") &&
      !f.includes("node_modules")
  );

let touched = 0;

for (const file of files) {
  let code = fs.readFileSync(file, "utf8");
  let original = code;

  // any[] -> unknown[]
  code = code.replace(/\bany\[\]/g, "unknown[]");

  // Record<string, any> -> Record<string, unknown>
  code = code.replace(
    /Record<\s*string\s*,\s*any\s*>/g,
    "Record<string, unknown>"
  );

  // : any -> : unknown
  code = code.replace(/:\s*any\b/g, ": unknown");

  if (code !== original) {
    fs.writeFileSync(file, code);
    touched++;
  }
}

console.log(`✅ Replaced explicit any in ${touched} files`);
