const fs = require('fs');

const LINT_FILE = 'final_lint.txt';

function parseLintFile(content) {
    const lines = content.split('\n');
    let currentFile = null;
    const errors = [];

    for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('/')) {
            currentFile = line.trim();
            continue;
        }
        const match = line.match(/^\s+(\d+):(\d+)\s+(\w+)\s+(.+?)\s+(@?[\w\-\/]+)$/);
        if (match && currentFile) {
            errors.push({
                file: currentFile,
                line: parseInt(match[1]),
                col: parseInt(match[2]),
                type: match[3],
                message: match[4],
                ruleId: match[5]
            });
        }
    }
    return errors;
}

async function applyFixes() {
    if (!fs.existsSync(LINT_FILE)) {
        console.log('Lint file not found');
        return;
    }

    const content = fs.readFileSync(LINT_FILE, 'utf8');
    const allErrors = parseLintFile(content);

    const consoleErrors = allErrors.filter(e => e.ruleId === 'no-console');
    console.log(`Found ${consoleErrors.length} console errors`);

    const fileGroups = {};
    for (const err of consoleErrors) {
        if (!fileGroups[err.file]) fileGroups[err.file] = [];
        fileGroups[err.file].push(err);
    }

    for (const [filePath, errors] of Object.entries(fileGroups)) {
        try {
            if (!fs.existsSync(filePath)) continue;

            let fileLines = fs.readFileSync(filePath, 'utf8').split('\n');
            let modified = false;

            // Sort descending to delete lines safely
            errors.sort((a, b) => b.line - a.line);

            for (const err of errors) {
                const lineIdx = err.line - 1;
                if (lineIdx >= fileLines.length) continue;

                const lineContent = fileLines[lineIdx];

                // Safety check: only remove if it looks like a single-line console statement
                // Regex: Start with optional whitespace, console, dot, word, (, anything, ), optional ;, optional whitespace, end
                // We also check for balanced parens as a heuristic
                if (/^\s*console\.[a-z]+\(.*\);?\s*$/.test(lineContent)) {
                    // Check paren balance
                    const open = (lineContent.match(/\(/g) || []).length;
                    const close = (lineContent.match(/\)/g) || []).length;

                    if (open === close) {
                        // Safe to delete
                        fileLines.splice(lineIdx, 1);
                        modified = true;
                    } else {
                        console.warn(`Skipping multi-line console log at ${filePath}:${err.line}`);
                    }
                } else {
                    console.warn(`Skipping complex console log at ${filePath}:${err.line}: ${lineContent.trim()}`);
                }
            }

            if (modified) {
                fs.writeFileSync(filePath, fileLines.join('\n'));
                console.log(`Updated ${filePath}`);
            }

        } catch (e) {
            console.error(`Failed to process ${filePath}:`, e);
        }
    }
}

applyFixes();
