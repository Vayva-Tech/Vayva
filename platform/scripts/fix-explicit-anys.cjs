const fs = require("fs");
const path = require("path");

const ROOTS = ["services"];
const TARGET_FILES = [
  "index.ts",
  "routes.ts",
  "controller.ts",
  "server.ts",
];

function walk(dir) {
  return fs.readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return fs.statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const files = ROOTS.flatMap((r) => walk(r)).filter((f) =>
  TARGET_FILES.some((name) => f.endsWith(name))
);

for (const file of files) {
  let code = fs.readFileSync(file, "utf8");
  let changed = false;

  // Replace ": any" → ": unknown"
  if (code.includes(": any")) {
    code = code.replace(/:\s*any\b/g, ": unknown");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, code);
    console.log("✔ fixed:", file);
  }
}
