const fs = require("fs");
const path = require("path");

const ROOTS = ["services"];

function walk(dir) {
  return fs.readdirSync(dir).flatMap((f) => {
    const p = path.join(dir, f);
    return fs.statSync(p).isDirectory() ? walk(p) : [p];
  });
}

for (const root of ROOTS) {
  const files = walk(root).filter(
    (f) =>
      f.endsWith(".ts") &&
      !f.endsWith(".d.ts")
  );

  for (const file of files) {
    let code = fs.readFileSync(file, "utf8");
    if (!code.includes(": any")) continue;

    // Do NOT touch Fastify generics yet
    const updated = code.replace(
      /:\s*any\b/g,
      ": unknown"
    );

    if (updated !== code) {
      fs.writeFileSync(file, updated);
      console.log("✔ replaced any → unknown:", file);
    }
  }
}
