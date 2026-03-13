const fs = require('fs');
const path = require('path');

const LINT_FILE = 'final_lint.txt'; // or final_lint_v2.txt? using original for now but best to use current state if possible. 
// Actually, better to just scan the codebase for .tsx files and fix them blindly? 
// No, that's risky. But the lint report tells us which files.
// Let's rely on the file list from the user's manual list if possible, or just parse all .tsx files in apps/marketing/src/components?
// To be safe, we'll stick to error report if valid, or just scan directories. 
// Given the user wants "fix apps/marketing", scanning *all* .tsx in apps/marketing is acceptable if we are conservative.
// But let's stick to the lint-driven approach if we can parse the report.
// Actually, the previous script parsed "final_lint.txt". I'll stick to that but maybe I should have used "final_lint_v2.txt"?
// I'll update it to check both or just 'final_lint_v2.txt' if exists.

const SEARCH_DIRS = ['apps/merchant-admin/src']; // Target directory

function isPascalCase(str) {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

function findClosingParenIndex(content, startIndex) {
    let balance = 0;
    let inString = false;
    let stringChar = '';

    for (let i = startIndex; i < content.length; i++) {
        const char = content[i];

        if (inString) {
            if (char === stringChar && content[i - 1] !== '\\') {
                inString = false;
            }
            continue;
        }

        if (char === '"' || char === "'" || char === '`') {
            inString = true;
            stringChar = char;
            continue;
        }

        if (char === '(') {
            balance++;
        } else if (char === ')') {
            balance--;
            if (balance === 0) {
                return i;
            }
        }
    }
    return -1;
}

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return 0;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let fixedCount = 0;

    // Regex for Function Declaration (export function Name...)
    // const funcRegex = /(export\s+)?(default\s+)?(async\s+)?function\s+([A-Z][\w\d]*)\s*(<[^>]+>)?\s*\(/g;
    // We match "function Name" then search for closing paren manually to handle multi-line.

    // Pattern: `function Name`
    const functionPattern = /(?:export\s+)?(?:default\s+)?(?:async\s+)?function\s+([A-Z][\w\d]*)/g;

    let match;
    // We need to loop carefully because modifying content changes indices.
    // Easier to build a list of replacements.
    // OR just loop and if we modify, restart or adjust.
    // Let's do a simple approach: find all patches, apply from bottom up.

    const replacements = [];

    // 1. Function Declarations
    while ((match = functionPattern.exec(content)) !== null) {
        const funcName = match[1];
        const startIdx = match.index;

        // Find the opening paren after the name
        const openParenIdx = content.indexOf('(', startIdx);
        if (openParenIdx === -1) continue;

        // Ensure no braces before open paren (e.g. function Name<T> (...) )
        // Check for opening brace of body?
        // Actually `indexOf` might find a paren inside a comment or generic default?
        // Let's assume standard formatting.

        const closingParenIdx = findClosingParenIndex(content, openParenIdx);
        if (closingParenIdx !== -1) {
            // Check what follows
            const afterParen = content.slice(closingParenIdx + 1);
            // It should look like `): Type` or `) {` or `) =>`? (function decl is `) {`)

            // Skip whitespace
            const nextCharMatch = afterParen.match(/^\s*([:{=])/);
            if (nextCharMatch) {
                if (nextCharMatch[1] === ':') {
                    // Already typed
                    continue;
                }
            }

            // Determine return type
            // Check if async
            const prelude = content.slice(startIdx, openParenIdx);
            const isAsync = /\basync\s/.test(prelude);
            const returnType = isAsync ? ": Promise<JSX.Element>" : ": JSX.Element";

            replacements.push({
                index: closingParenIdx + 1,
                text: returnType
            });
        }
    }

    // 2. Arrow Functions: const Name = (...) => 
    // const arrowPattern = /const\s+([A-Z][\w\d]*)\s*=\s*(?:async\s+)?(?:<[^>]+>)?\s*\(/g;
    const arrowPattern = /const\s+([A-Z][\w\d]*)\s*=\s*(?:async\s+)?/g;

    while ((match = arrowPattern.exec(content)) !== null) {
        const funcName = match[1];
        const startIdx = match.index + match[0].length;

        // Look for '('
        // It might be `const Foo = (props)` or `const Foo = props =>`
        // We only handle `(` style for safety.

        // Find next non-whitespace char
        let cursor = startIdx;
        while (cursor < content.length && /\s/.test(content[cursor])) cursor++;

        if (content[cursor] === '(') {
            const closingParenIdx = findClosingParenIndex(content, cursor);
            if (closingParenIdx !== -1) {
                // Check if followed by `=>` or `:`
                const after = content.slice(closingParenIdx + 1);
                // Regex for optional whitespace then `=>` or `:`
                const nextThing = after.match(/^\s*(:|=>)/);

                if (nextThing) {
                    if (nextThing[1] === ':') continue; // Already typed

                    // It is `=>`, so we insert type before it.
                    // Or rather, insert at closingParenIdx + 1

                    // Check if async
                    const prelude = content.slice(match.index, cursor);
                    const isAsync = /\basync\s/.test(prelude);
                    const returnType = isAsync ? ": Promise<JSX.Element>" : ": JSX.Element";

                    replacements.push({
                        index: closingParenIdx + 1,
                        text: returnType
                    });
                }
            }
        }
    }

    // Apply replacements safely (backwards)
    replacements.sort((a, b) => b.index - a.index);

    // Removing duplicates/overlaps (naive)
    let lastIndex = Infinity;
    for (const rep of replacements) {
        if (rep.index < lastIndex) {
            content = content.slice(0, rep.index) + rep.text + content.slice(rep.index);
            lastIndex = rep.index;
            fixedCount++;
        }
    }

    if (fixedCount > 0) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${fixedCount} functions in ${filePath}`);
    }
    return fixedCount;
}

function traverse(dir) {
    let count = 0;
    if (!fs.existsSync(dir)) return 0;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            count += traverse(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
            count += processFile(fullPath);
        }
    }
    return count;
}

console.log('Starting improved React return type fix...');
let total = 0;
for (const dir of SEARCH_DIRS) {
    total += traverse(dir);
}
console.log(`Total fixes applied: ${total}`);

