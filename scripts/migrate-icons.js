#!/usr/bin/env node
/**
 * Icon Migration Script: lucide-react → @phosphor-icons/react/ssr
 * Maps lucide icon names to phosphor equivalents
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icon mapping: lucideName → phosphorName
const ICON_MAP = {
  // Navigation
  'Menu': 'List',
  'X': 'X',
  'ArrowLeft': 'ArrowLeft',
  'ArrowRight': 'ArrowRight',
  'ArrowUp': 'ArrowUp',
  'ArrowDown': 'ArrowDown',
  'ChevronLeft': 'CaretLeft',
  'ChevronRight': 'CaretRight',
  'ChevronUp': 'CaretUp',
  'ChevronDown': 'CaretDown',
  'Home': 'House',
  'Search': 'MagnifyingGlass',
  'Filter': 'Funnel',
  'SortAsc': 'SortAscending',
  'SortDesc': 'SortDescending',
  'MoreHorizontal': 'DotsThree',
  'MoreVertical': 'DotsThreeVertical',

  // Actions
  'Plus': 'Plus',
  'Minus': 'Minus',
  'Trash': 'Trash',
  'Trash2': 'Trash',
  'Edit': 'PencilSimple',
  'Pencil': 'PencilSimple',
  'Save': 'FloppyDisk',
  'Copy': 'Copy',
  'Check': 'Check',
  'CheckCircle': 'CheckCircle',
  'XCircle': 'XCircle',
  'AlertCircle': 'WarningCircle',
  'AlertTriangle': 'WarningTriangle',
  'Info': 'Info',
  'HelpCircle': 'Question',

  // Commerce
  'ShoppingCart': 'ShoppingCart',
  'ShoppingBag': 'ShoppingBag',
  'CreditCard': 'CreditCard',
  'Wallet': 'Wallet',
  'DollarSign': 'CurrencyDollar',
  'Receipt': 'Receipt',
  'Package': 'Package',
  'Box': 'Package',
  'Gift': 'Gift',
  'Tag': 'Tag',
  'Percent': 'Percent',
  'Ticket': 'Ticket',
  'Star': 'Star',
  'Heart': 'Heart',
  'Share': 'ShareNetwork',
  'Share2': 'ShareNetwork',

  // User
  'User': 'User',
  'Users': 'Users',
  'UserPlus': 'UserPlus',
  'UserMinus': 'UserMinus',
  'LogIn': 'SignIn',
  'LogOut': 'SignOut',
  'Settings': 'Gear',
  'Cog': 'Gear',
  'Bell': 'Bell',
  'Mail': 'Envelope',
  'MessageCircle': 'ChatCircle',
  'MessageSquare': 'Chat',
  'Phone': 'Phone',

  // Content
  'Image': 'Image',
  'File': 'File',
  'FileText': 'FileText',
  'Folder': 'Folder',
  'Calendar': 'Calendar',
  'Clock': 'Clock',
  'MapPin': 'MapPin',
  'Map': 'MapTrifold',
  'Globe': 'Globe',
  'Link': 'Link',
  'Paperclip': 'Paperclip',
  'ExternalLink': 'ArrowSquareOut',
  'Download': 'DownloadSimple',
  'Upload': 'UploadSimple',
  'Eye': 'Eye',
  'EyeOff': 'EyeSlash',
  'Loader': 'Spinner',
  'Loader2': 'Spinner',
  'RefreshCw': 'ArrowCounterClockwise',
  'RotateCcw': 'ArrowCounterClockwise',
  'RotateCw': 'ArrowClockwise',

  // Status
  'Circle': 'Circle',
  'Square': 'Square',
  'CheckSquare': 'CheckSquare',
  'Play': 'Play',
  'Pause': 'Pause',
  'Stop': 'Stop',
  'SkipBack': 'SkipBack',
  'SkipForward': 'SkipForward',

  // Food/Travel specific
  'Utensils': 'ForkKnife',
  'Coffee': 'Coffee',
  'Wine': 'Wine',
  'Plane': 'Airplane',
  'Car': 'Car',
  'Truck': 'Truck',
  'Train': 'Train',
  'Bus': 'Bus',
  'Ship': 'Boat',
  'Hotel': 'Building',
  'Bed': 'Bed',

  // Media
  'Camera': 'Camera',
  'Video': 'VideoCamera',
  'Music': 'MusicNotes',
  'Mic': 'Microphone',
  'PlayCircle': 'PlayCircle',
  'PauseCircle': 'PauseCircle',

  // Common UI
  'LayoutGrid': 'SquaresFour',
  'List': 'List',
  'Grid': 'SquaresFour',
  'Columns': 'Columns',
  'Maximize': 'ArrowsOut',
  'Minimize': 'ArrowsIn',
  'ZoomIn': 'MagnifyingGlassPlus',
  'ZoomOut': 'MagnifyingGlassMinus',
  'Fullscreen': 'ArrowsOut',

  // Location/Store
  'Store': 'Storefront',
  'Building': 'Building',
  'Warehouse': 'Warehouse',
  'MapPin': 'MapPin',
  'Navigation': 'NavigationArrow',
  'Compass': 'Compass',
  'Flag': 'Flag',
  'Location': 'MapPin',

  // Misc commonly used
  'Hash': 'Hash',
  'AtSign': 'At',
  'Asterisk': 'Asterisk',
  'Quote': 'Quotes',
  'Code': 'Code',
  'Terminal': 'Terminal',
  'Monitor': 'Monitor',
  'Smartphone': 'DeviceMobile',
  'Tablet': 'DeviceTablet',
  'Laptop': 'Laptop',
  'Printer': 'Printer',
  'Wifi': 'WifiHigh',
  'Bluetooth': 'Bluetooth',
  'Battery': 'BatteryFull',
  'Zap': 'Lightning',
  'Sun': 'Sun',
  'Moon': 'Moon',
  'Cloud': 'Cloud',
  'Umbrella': 'Umbrella',
  'Thermometer': 'Thermometer',
  'Award': 'Trophy',
  'Trophy': 'Trophy',
  'Medal': 'Medal',
  'Crown': 'Crown',
  'Shield': 'Shield',
  'Lock': 'LockKey',
  'Unlock': 'LockKeyOpen',
  'Key': 'Key',
  'Fingerprint': 'Fingerprint',
};

// Track unmappable icons
const unmappable = new Set();

function migrateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Find lucide import statement
  const lucideImportRegex = /import\s+\{([^}]+)\}\s+from\s+["']lucide-react["'];?/;
  const match = content.match(lucideImportRegex);

  if (!match) return false;

  const importedIcons = match[1].split(',').map(s => s.trim()).filter(Boolean);
  const phosphorImports = [];
  const iconReplacements = {};

  for (const iconName of importedIcons) {
    // Handle 'as' aliases: "IconName as Alias"
    const parts = iconName.split(/\s+as\s+/);
    const originalName = parts[0];
    const alias = parts[1] || originalName;

    const phosphorName = ICON_MAP[originalName];
    if (phosphorName) {
      phosphorImports.push(phosphorName === alias ? phosphorName : `${phosphorName} as ${alias}`);
      if (originalName !== alias) {
        iconReplacements[alias] = alias; // Keep alias
      }
    } else {
      unmappable.add(originalName);
      phosphorImports.push(iconName); // Keep original if no mapping
    }
  }

  // Replace import statement
  const newImport = `import { ${phosphorImports.join(', ')} } from "@phosphor-icons/react/ssr";`;
  content = content.replace(lucideImportRegex, newImport);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }

  return false;
}

function findFiles(dir, extensions) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
      files.push(...findFiles(fullPath, extensions));
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      files.push(fullPath);
    }
  }

  return files;
}

// Main execution
const targetDir = process.argv[2] || '.';
console.log(`🔍 Scanning ${targetDir} for lucide-react imports...\n`);

const files = findFiles(targetDir, ['.tsx', '.ts']);
let migratedCount = 0;

for (const file of files) {
  try {
    if (migrateFile(file)) {
      console.log(`✅ Migrated: ${file}`);
      migratedCount++;
    }
  } catch (err) {
    console.error(`❌ Error in ${file}: ${err.message}`);
  }
}

console.log(`\n📊 Summary:`);
console.log(`   Migrated: ${migratedCount} files`);
console.log(`   Scanned: ${files.length} files`);

if (unmappable.size > 0) {
  console.log(`\n⚠️ Unmapped icons (need manual handling):`);
  for (const icon of unmappable) {
    console.log(`   - ${icon}`);
  }
}
