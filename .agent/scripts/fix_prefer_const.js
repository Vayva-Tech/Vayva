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

    // Support both standard rule name and typescript-eslint version if exists
    const preferConstErrors = allErrors.filter(e => e.ruleId === 'prefer-const');
    console.log(`Found ${preferConstErrors.length} prefer-const errors`);

    const fileGroups = {};
    for (const err of preferConstErrors) {
        if (!fileGroups[err.file]) fileGroups[err.file] = [];
        fileGroups[err.file].push(err);
    }

    for (const [filePath, errors] of Object.entries(fileGroups)) {
        try {
            if (!fs.existsSync(filePath)) continue;

            let fileLines = fs.readFileSync(filePath, 'utf8').split('\n');
            let modified = false;

            // Sort descending by line/col
            errors.sort((a, b) => {
                if (a.line !== b.line) return b.line - a.line;
                return b.col - a.col;
            });

            for (const err of errors) {
                const lineIdx = err.line - 1;
                const colIdx = err.col - 1; // 0-based

                if (lineIdx >= fileLines.length) continue;

                const lineContent = fileLines[lineIdx];

                // Verify 'let' is at the column
                // Note: col usually points to 'let'.
                // Check if 'let' exists at colIdx
                if (lineContent.substring(colIdx, colIdx + 3) === 'let') {
                    // Replace with 'const'
                    const newLineContent = lineContent.slice(0, colIdx) + 'const' + lineContent.slice(colIdx + 3);
                    fileLines[lineIdx] = newLineContent;
                    modified = true;
                } else {
                    console.warn(`Mismatch at ${filePath}:${err.line}:${err.col}. Expected 'let'`);
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
