#!/usr/bin/env node
/**
 * Fix implicit any errors in TypeScript files
 */

import { readFileSync, writeFileSync } from "fs";

const files = [
  "Frontend/merchant-admin/src/app/(dashboard)/dashboard/finance/page.tsx",
  "Frontend/merchant-admin/src/app/(dashboard)/dashboard/logistics/page.tsx",
  "Frontend/merchant-admin/src/app/(dashboard)/dashboard/marketing/bundles/page.tsx",
  "Frontend/merchant-admin/src/app/(dashboard)/dashboard/marketing/campaigns/page.tsx",
  "Frontend/merchant-admin/src/app/(dashboard)/dashboard/menu-items/new/page.tsx",
  "Frontend/merchant-admin/src/app/(dashboard)/dashboard/nightlife/events/[id]/page.tsx",
  "Frontend/merchant-admin/src/app/(dashboard)/dashboard/nightlife/events/new/page.tsx",
  "Frontend/merchant-admin/src/app/(dashboard)/dashboard/products/[id]/page.tsx",
  "Frontend/merchant-admin/src/app/(dashboard)/dashboard/settings/store/page.tsx",
];

let totalFixes = 0;

for (const file of files) {
  const path = `/Users/fredrick/Documents/Vayva-Tech/vayva/${file}`;
  try {
    let content = readFileSync(path, "utf-8");
    let original = content;

    // Fix common implicit any patterns
    // .map((url) => to .map((url: string) =>
    content = content.replace(/\.map\(\s*\(\s*url\s*\)\s*=>/g, ".map((url: string) =>");
    
    // .filter((url) => to .filter((url: string) =>
    content = content.replace(/\.filter\(\s*\(\s*url\s*\)\s*=>/g, ".filter((url: string) =>");

    // .map((o) => to .map((o: any) =>
    content = content.replace(/\.map\(\s*\(\s*o\s*\)\s*=>/g, ".map((o: any) =>");
    
    // .map((d) => to .map((d: any) =>
    content = content.replace(/\.map\(\s*\(\s*d\s*\)\s*=>/g, ".map((d: any) =>");
    
    // .map((val) => to .map((val: any) =>
    content = content.replace(/\.map\(\s*\(\s*val\s*\)\s*=>/g, ".map((val: any) =>");
    
    // .map((campaign) => to .map((campaign: any) =>
    content = content.replace(/\.map\(\s*\(\s*campaign\s*\)\s*=>/g, ".map((campaign: any) =>");

    if (content !== original) {
      writeFileSync(path, content, "utf-8");
      console.log(`✓ Fixed ${file}`);
      totalFixes++;
    }
  } catch (err) {
    console.error(`✗ Failed ${file}:`, (err as Error).message);
  }
}

console.log(`\nTotal files fixed: ${totalFixes}`);
