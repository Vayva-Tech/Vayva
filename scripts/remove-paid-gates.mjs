#!/usr/bin/env node
/**
 * Script to remove isPaidPlan checks from merchant admin
 * Makes all premium UI available to everyone
 */

import { readFileSync, writeFileSync } from 'fs';

const files = [
  'Frontend/merchant-admin/src/app/(dashboard)/dashboard/settings/profile/page.tsx',
  'Frontend/merchant-admin/src/app/(dashboard)/dashboard/check-in/page.tsx',
  'Frontend/merchant-admin/src/app/(dashboard)/dashboard/fulfillment/pickups/page.tsx',
  'Frontend/merchant-admin/src/app/(dashboard)/dashboard/extensions/page.tsx',
  'Frontend/merchant-admin/src/app/(dashboard)/dashboard/finance/statements/page.tsx',
  'Frontend/merchant-admin/src/app/(dashboard)/dashboard/account/edit/page.tsx',
  'Frontend/merchant-admin/src/app/(dashboard)/dashboard/autopilot/page.tsx',
  'Frontend/merchant-admin/src/components/admin-shell.tsx',
];

const isPaidPlanPattern = /const isPaidPlan = \(\(\) => \{[\s\S]*?\}\)\(\);/;

const conditionalBackgroundPattern = /\{isPaidPlan && \([\s\S]*?pointer-events-none[\s\S]*?\]\)\s*\}\)/;

const unconditionalBackground = `      {/* Green gradient blur background - now for everyone */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/[0.04] rounded-full blur-[120px]" />
        <div className="absolute bottom-40 right-20 w-[300px] h-[300px] bg-primary/[0.03] rounded-full blur-[100px]" />
      </div>`;

for (const file of files) {
  try {
    const fullPath = `/Users/fredrick/Documents/Vayva-Tech/vayva/${file}`;
    let content = readFileSync(fullPath, 'utf-8');
    
    // Remove isPaidPlan declaration
    content = content.replace(isPaidPlanPattern, '');
    
    // Replace conditional background with unconditional
    content = content.replace(conditionalBackgroundPattern, unconditionalBackground);
    
    writeFileSync(fullPath, content);
    console.log(`✓ Updated ${file}`);
  } catch (err) {
    console.error(`✗ Failed to update ${file}:`, err.message);
  }
}

console.log('\n✅ All files updated successfully!');
