#!/usr/bin/env tsx
/**
 * Automated TypeScript Error Fixer
 * Applies pragmatic `any` casts to common error patterns
 */

import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";
import { execSync } from "child_process";

interface Fix {
  pattern: RegExp;
  replacement: string;
  description: string;
}

// Common fix patterns following the pragmatic approach
const fixes: Fix[] = [
  // Fix 1: Implicit any parameters in arrow functions
  {
    pattern: /\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)\s*=>/g,
    replacement: "($1: any) =>",
    description: "Add any type to single arrow function parameters",
  },
  // Fix 2: Implicit any in function parameters
  {
    pattern:
      /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(([a-zA-Z_$][a-zA-Z0-9_$]*)\)/g,
    replacement: "function $1($2: any)",
    description: "Add any type to function parameters",
  },
  // Fix 3: Event handlers with unknown
  {
    pattern: /\(e:\s*unknown\)\s*=>/g,
    replacement: "(e: any) =>",
    description: "Change unknown to any in event handlers",
  },
  // Fix 4: Map/forEach with unknown
  {
    pattern: /\.map\(\(([a-zA-Z_$][a-zA-Z0-9_$]*):\s*unknown\)/g,
    replacement: ".map(($1: any)",
    description: "Change unknown to any in map callbacks",
  },
  // Fix 5: Object.entries implicit any
  {
    pattern:
      /Object\.entries\(([^)]+)\)\.forEach\(\(\[([a-zA-Z_$][a-zA-Z0-9_$]*),\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\]\)/g,
    replacement: "Object.entries($1).forEach(([$2, $3]: any)",
    description: "Add any type to Object.entries destructuring",
  },
];

async function getFilesWithErrors(): Promise<string[]> {
  try {
    const output = execSync("pnpm run typecheck 2>&1", {
      encoding: "utf-8",
      cwd: process.cwd(),
    });

    const errorLines = output
      .split("\n")
      .filter(
        (line) =>
          line.includes("error TS7006") || line.includes("error TS18046"),
      );
    const files = new Set<string>();

    errorLines.forEach((line) => {
      const match = line.match(/^([^(]+)\(/);
      if (match) {
        files.add(match[1]);
      }
    });

    return Array.from(files);
  } catch (error) {
    // typecheck will exit with error code, but we still get output
    return [];
  }
}

function applyFixes(content: string): {
  content: string;
  fixesApplied: number;
} {
  let fixedContent = content;
  let fixesApplied = 0;

  fixes.forEach((fix) => {
    const matches = fixedContent.match(fix.pattern);
    if (matches) {
      fixedContent = fixedContent.replace(fix.pattern, fix.replacement);
      fixesApplied += matches.length;
      console.log(`  ✓ ${fix.description}: ${matches.length} fixes`);
    }
  });

  return { content: fixedContent, fixesApplied };
}

async function main() {
  console.log("🔧 Automated TypeScript Error Fixer\n");

  // Get all TypeScript files in src
  const files = await glob("src/**/*.{ts,tsx}", {
    ignore: ["**/*.d.ts", "**/node_modules/**", "**/*.test.ts", "**/*.spec.ts"],
  });

  console.log(`Found ${files.length} TypeScript files\n`);

  let totalFilesFixed = 0;
  let totalFixesApplied = 0;

  for (const file of files) {
    try {
      const content = readFileSync(file, "utf-8");
      const { content: fixedContent, fixesApplied } = applyFixes(content);

      if (fixesApplied > 0) {
        writeFileSync(file, fixedContent, "utf-8");
        console.log(`\n📝 ${file}`);
        totalFilesFixed++;
        totalFixesApplied += fixesApplied;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error);
    }
  }

  console.log(`\n✅ Complete!`);
  console.log(`   Files fixed: ${totalFilesFixed}`);
  console.log(`   Total fixes: ${totalFixesApplied}`);
  console.log(`\nRun 'pnpm run typecheck' to verify results.`);
}

main().catch(console.error);
