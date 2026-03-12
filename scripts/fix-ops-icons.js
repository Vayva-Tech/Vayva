#!/usr/bin/env node
/**
 * Fix remaining ops-console icon imports
 */

const fs = require('fs');
const path = require('path');

const REPLACEMENTS = {
  'BadgeCheck': 'CheckCircle as BadgeCheck',
  'BarChart3': 'ChartBar',
  'Bot': 'Robot',
  'BrainCircuit': 'Brain',
  'Building2': 'Building',
  'CheckCircle2': 'CheckCircle',
  'FileSignature': 'FileText',
  'Frown': 'SmileySad as Frown',
  'History': 'ClockCounterClockwise as History',
  'LayoutDashboard': 'SquaresFour as LayoutDashboard',
  'LayoutTemplate': 'Layout',
  'LifeBuoy': 'Lifebuoy as LifeBuoy',
  'Link2': 'Link',
  'Meh': 'SmileyMeh as Meh',
  'Scale': 'Scales',
  'Send': 'PaperPlane as Send',
  'ShieldAlert': 'ShieldWarning as ShieldAlert',
  'Smile': 'Smiley as Smile',
  'Sparkles': 'Sparkle as Sparkles',
  'TrendingUp': 'TrendUp as TrendingUp',
  'TrendingDown': 'TrendDown as TrendingDown',
  'WarningTriangle': 'Warning as WarningTriangle',
  'Webhook': 'WebhookLogo as Webhook',
  'Activity': 'Pulse as Activity',
  'ShieldX': 'ShieldWarning',
};

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Only process files with @phosphor-icons/react/ssr imports
  if (!content.includes('@phosphor-icons/react/ssr')) return false;

  // Replace each icon name
  for (const [oldName, newName] of Object.entries(REPLACEMENTS)) {
    // Use word boundary to avoid partial matches
    const regex = new RegExp(`\\b${oldName}\\b`, 'g');
    content = content.replace(regex, newName);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  return false;
}

function findFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
      files.push(...findFiles(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
      files.push(fullPath);
    }
  }

  return files;
}

const targetDir = process.argv[2] || 'Frontend/ops-console/src';
console.log(`🔍 Fixing icons in ${targetDir}...\n`);

const files = findFiles(targetDir);
let fixed = 0;

for (const file of files) {
  try {
    if (fixFile(file)) fixed++;
  } catch (err) {
    console.error(`❌ Error: ${file}: ${err.message}`);
  }
}

console.log(`\n📊 Fixed: ${fixed} files`);
