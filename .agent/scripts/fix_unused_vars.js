const fs = require('fs');
const path = require('path');

const LINT_FILE = 'final_lint.txt';

function parseLintFile(content) {
    const lines = content.split('\n');
    let currentFile = null;
    const errors = [];

    for (const line of lines) {
        if (line.trim() === '') continue;

        // Check for file path (starts with /)
        if (line.startsWith('/')) {
            currentFile = line.trim();
            continue;
        }

        // Parse error line
        // Format:   line:col  type  message  rule-id
        // Example:   20:16  warning  Missing return type on function  @typescript-eslint/explicit-function-return-type
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

function extractVarName(message) {
    // Message examples: 
    // "'X' is defined but never used..."
    // "'X' is assigned a value but never used..."
    // "'err' is defined but never used"
    const match = message.match(/'([^']+)'/);
    return match ? match[1] : null;
}

async function applyFixes() {
    if (!fs.existsSync(LINT_FILE)) {
        console.log('Lint file not found');
        return;
    }

    const content = fs.readFileSync(LINT_FILE, 'utf8');
    const allErrors = parseLintFile(content);

    // Filter for no-unused-vars
    const unusedVarsErrors = allErrors.filter(e =>
        e.ruleId === '@typescript-eslint/no-unused-vars' ||
        e.ruleId === 'no-unused-vars'
    );

    console.log(`Found ${unusedVarsErrors.length} unused var errors`);

    // Group by file to apply edits efficiently
    const fileGroups = {};
    for (const err of unusedVarsErrors) {
        if (!fileGroups[err.file]) fileGroups[err.file] = [];
        fileGroups[err.file].push(err);
    }

    for (const [filePath, errors] of Object.entries(fileGroups)) {
        console.log(`Processing ${filePath}...`);

        try {
            if (!fs.existsSync(filePath)) {
                console.log(`Skipping ${filePath} (not found)`);
                continue;
            }

            let fileLines = fs.readFileSync(filePath, 'utf8').split('\n');
            let modified = false;

            // Sort errors descending by line/col to avoid offset issues if we were adding/removing (but we are replacing in place)
            // Actually, prefixing with '_' changes length, so offsets shift.
            // Using line-based approach is safer if we process distinct lines.
            // If multiple errors on same line, we need to be careful.
            // Right-to-left processing on the same line is best.
            errors.sort((a, b) => {
                if (a.line !== b.line) return b.line - a.line;
                return b.col - a.col;
            });

            for (const err of errors) {
                const varName = extractVarName(err.message);
                if (!varName) {
                    console.log(`Could not extract var name from: ${err.message}`);
                    continue;
                }

                const lineIdx = err.line - 1;
                // Col is 1-based usually in lint output, verify this.
                // Standard eslint format: line:col. Col is usually 1-based index of character.
                const colIdx = err.col - 1;

                if (lineIdx >= fileLines.length) continue;

                const lineContent = fileLines[lineIdx];

                // Verify we are at the right spot
                // The column usually points to the start of the identifier.
                // Let's check if the substring at colIdx matches the varName
                const substr = lineContent.substring(colIdx, colIdx + varName.length);

                if (substr !== varName) {
                    // Try to fuzzily find it nearby? 
                    // Sometimes lint col points to start of declaration usually.
                    // Let's log warning and skip to be safe.
                    console.warn(`Mismatch at ${filePath}:${err.line}:${err.col}. Expected '${varName}', found '${substr}'`);

                    // Fallback: search for the varName in the line.
                    // If it appears once, we can fix it.
                    // If multiple times, we assume the lint col is close.
                    continue;
                }

                // Apply fix: prefix with _
                const newLineContent = lineContent.slice(0, colIdx) + '_' + lineContent.slice(colIdx);
                fileLines[lineIdx] = newLineContent;
                modified = true;
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
