#!/usr/bin/env node

/**
 * Smart Button Refactoring Tool
 * Hybrid approach: Automated for simple cases, manual review for complex
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const WORKSPACE_ROOT = '/Users/fredrick/Documents/GitHub/Vayva-platform';

// Get all files with raw buttons from lint output
function getFilesWithButtons() {
    try {
        const lintOutput = execSync('pnpm lint 2>&1 | grep "Use the <Button> component" | grep -oE "^[^:]+\\.tsx"', {
            cwd: WORKSPACE_ROOT,
            encoding: 'utf8',
            maxBuffer: 10 * 1024 * 1024
        });

        const files = [...new Set(lintOutput.trim().split('\n').filter(Boolean))];
        return files;
    } catch (error) {
        console.error('Error getting files:', error.message);
        return [];
    }
}

// Classify button complexity
function classifyButton(buttonMatch, context) {
    const complexPatterns = [
        /ref\s*=/, // Has ref
        /dangerouslySetInnerHTML/, // Dangerous HTML
        /\.map\(/, // Inside a map (might need key handling)
        /{\.\.\./, // Spread props
        /as\s+any/, // Type assertions
        /React\.forwardRef/, // Forward ref component
    ];

    for (const pattern of complexPatterns) {
        if (pattern.test(context)) {
            return 'complex';
        }
    }

    return 'simple';
}

// Determine appropriate variant
function determineVariant(className = '', content = '') {
    const combined = `${className} ${content}`.toLowerCase();

    if (/close|dismiss|×|x-icon|x\s+size/.test(combined)) {
        return { variant: 'ghost', size: 'icon' };
    }
    if (/delete|remove|destroy|danger|red/.test(combined)) {
        return { variant: 'destructive' };
    }
    if (/primary|submit|save|create|add|bg-primary|bg-green|bg-blue/.test(combined)) {
        return { variant: 'primary' };
    }
    if (/secondary|outline|border/.test(combined)) {
        return { variant: 'outline' };
    }
    if (/link|underline|text-/.test(combined)) {
        return { variant: 'link' };
    }
    if (/ghost|transparent/.test(combined)) {
        return { variant: 'ghost' };
    }

    return { variant: 'ghost' };
}

// Refactor a single file
function refactorFile(filePath) {
    const fullPath = path.join(WORKSPACE_ROOT, filePath);

    if (!fs.existsSync(fullPath)) {
        return { success: false, reason: 'not found' };
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Skip if it's a UI primitive (toast, switch, etc.)
    if (filePath.includes('/ui/toast.') || filePath.includes('/ui/Switch.') || filePath.includes('/ui/switch.')) {
        return { success: true, skipped: true, reason: 'UI primitive' };
    }

    // Check if Button is already imported
    const hasButtonImport = /import\s+{[^}]*\bButton\b[^}]*}\s+from\s+["']@vayva\/ui["']/.test(content);

    if (!hasButtonImport) {
        // Try to add to existing @vayva/ui import
        const vayvaImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+["']@vayva\/ui["'];?/);
        if (vayvaImportMatch) {
            const imports = vayvaImportMatch[1].split(',').map(s => s.trim()).filter(Boolean);
            if (!imports.includes('Button')) {
                imports.push('Button');
                const newImport = `import { ${imports.join(', ')} } from "@vayva/ui";`;
                content = content.replace(vayvaImportMatch[0], newImport);
            }
        } else {
            // Add new import after the last import
            const importMatches = content.match(/import[^;]+;/g);
            if (importMatches && importMatches.length > 0) {
                const lastImport = importMatches[importMatches.length - 1];
                const insertPos = content.indexOf(lastImport) + lastImport.length;
                content = content.slice(0, insertPos) + '\nimport { Button } from "@vayva/ui";' + content.slice(insertPos);
            }
        }
    }

    let simpleCount = 0;
    let complexCount = 0;
    const complexCases = [];

    // Find and replace buttons
    const buttonRegex = /<button\s+([^>]*?)>([\s\S]*?)<\/button>/g;
    let match;
    const replacements = [];

    while ((match = buttonRegex.exec(originalContent)) !== null) {
        const [fullMatch, attrs, innerContent] = match;
        const startPos = match.index;
        const endPos = startPos + fullMatch.length;

        // Get context (100 chars before and after)
        const contextStart = Math.max(0, startPos - 100);
        const contextEnd = Math.min(originalContent.length, endPos + 100);
        const context = originalContent.slice(contextStart, contextEnd);

        const complexity = classifyButton(fullMatch, context);

        if (complexity === 'complex') {
            complexCount++;
            complexCases.push({
                line: originalContent.slice(0, startPos).split('\n').length,
                content: fullMatch.slice(0, 100) + (fullMatch.length > 100 ? '...' : '')
            });
            continue; // Skip complex cases
        }

        // Extract className
        const classNameMatch = attrs.match(/className=(?:{cn\()?["']([^"']+)["']/);
        const className = classNameMatch ? classNameMatch[1] : '';

        // Determine variant
        const { variant, size } = determineVariant(className, innerContent);

        // Build new attributes
        let newAttrs = attrs;

        // Add variant if not present
        if (!attrs.includes('variant=')) {
            newAttrs += ` variant="${variant}"`;
        }

        // Add size if determined and not present
        if (size && !attrs.includes('size=')) {
            newAttrs += ` size="${size}"`;
        }

        const replacement = `<Button ${newAttrs}>${innerContent}</Button>`;
        replacements.push({ start: startPos, end: endPos, replacement });
        simpleCount++;
    }

    // Apply replacements in reverse order to maintain positions
    replacements.reverse().forEach(({ start, end, replacement }) => {
        content = content.slice(0, start) + replacement + content.slice(end);
    });

    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        return {
            success: true,
            simple: simpleCount,
            complex: complexCount,
            complexCases,
            modified: true
        };
    }

    return {
        success: true,
        simple: 0,
        complex: complexCount,
        complexCases,
        modified: false
    };
}

// Main execution
console.log('🚀 Smart Button Refactoring Tool\n');
console.log('📊 Analyzing codebase...\n');

const files = getFilesWithButtons();
console.log(`Found ${files.length} files with raw buttons\n`);

let totalSimple = 0;
let totalComplex = 0;
let filesModified = 0;
let filesSkipped = 0;
const allComplexCases = [];

console.log('🔧 Processing files...\n');

files.forEach((file, index) => {
    const result = refactorFile(file);

    if (result.skipped) {
        filesSkipped++;
        console.log(`⏭️  [${index + 1}/${files.length}] ${file} - Skipped (${result.reason})`);
    } else if (result.success) {
        if (result.modified) {
            filesModified++;
            totalSimple += result.simple || 0;
            totalComplex += result.complex || 0;

            if (result.complexCases && result.complexCases.length > 0) {
                allComplexCases.push({ file, cases: result.complexCases });
            }

            console.log(`✅ [${index + 1}/${files.length}] ${file} - ${result.simple} simple, ${result.complex} complex`);
        } else {
            console.log(`⏭️  [${index + 1}/${files.length}] ${file} - No changes needed`);
        }
    } else {
        console.log(`❌ [${index + 1}/${files.length}] ${file} - Error: ${result.reason}`);
    }
});

console.log('\n📊 Summary:');
console.log(`   Files processed: ${files.length}`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Files skipped: ${filesSkipped}`);
console.log(`   Simple buttons refactored: ${totalSimple}`);
console.log(`   Complex buttons (manual review needed): ${totalComplex}`);

if (allComplexCases.length > 0) {
    console.log('\n⚠️  Complex cases requiring manual review:');
    allComplexCases.forEach(({ file, cases }) => {
        console.log(`\n   ${file}:`);
        cases.forEach(({ line, content }) => {
            console.log(`      Line ${line}: ${content}`);
        });
    });
}

console.log('\n✅ Automated refactoring complete!');
console.log('⚠️  Please run: pnpm typecheck && pnpm lint');
