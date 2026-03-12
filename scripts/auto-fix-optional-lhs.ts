import { readFileSync, writeFileSync } from "fs";
import { sync as globSync } from "glob";
import path from "path";

const patterns = [
  "Frontend/**/*.{ts,tsx,js,jsx}",
  "Backend/**/*.{ts,tsx,js,jsx}",
];

const files = patterns.flatMap((p) => globSync(p, { absolute: true, nodir: true }));

for (const file of files) {
  let text = readFileSync(file, "utf8");
  const before = text;

  // Generic optional chaining assignment: obj?.prop = value;
  text = text.replace(/(\b[A-Za-z_$][\w$]*)\?\.(\b[A-Za-z_$][\w$]*)\s*=\s*([^;]+);/g, (_m, obj, prop, rhs) => {
    return `if (${obj} && ${obj}.${prop} !== undefined) { ${obj}.${prop} = ${rhs}; }`;
  });

  // window?.location?.href = ...
  text = text.replace(/window\?\.location\?\.href\s*=\s*([^;]+);/g, (_m, rhs) => {
    return `{
  const loc = typeof window !== "undefined" ? window.location : null;
  if (loc) loc.href = ${rhs};
}`;
  });

  if (text !== before) {
    writeFileSync(file, text, "utf8");
    console.log("patched", path.relative(process.cwd(), file));
  }
}
