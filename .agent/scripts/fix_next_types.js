const fs = require('fs');
const path = require('path');

const LINT_FILE = 'final_lint_admin.txt';

function parseLintFile(content) {
    const lines = content.split('\n');
    let currentFile = null;
    const errors = [];
    for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('/')) { currentFile = line.trim(); continue; }
        const match = line.match(/^\s+(\d+):(\d+)\s+(\w+)\s+(.+?)\s+(@?[\w\-\/]+)$/);
        if (match && currentFile) {
            errors.push({ file: currentFile, line: parseInt(match[1]), col: parseInt(match[2]), ruleId: match[5] });
        }
    }
    return errors;
}

// Ensure NextRequest import exists or add it
function ensureImport(lines, importName, fromPackage) {
    // Check if imported
    const importRegex = new RegExp(`import\\s+.*\\b${importName}\\b.*\\s+from\\s+['"]${fromPackage}['"]`);
    if (lines.some(l => importRegex.test(l))) return false;

    // Check for existing import from package to append
    const existingPkgImportIdx = lines.findIndex(l => new RegExp(`import\\s+.*\\s+from\\s+['"]${fromPackage}['"]`).test(l) && !l.includes('*'));

    if (existingPkgImportIdx !== -1) {
        // Append to named imports: import { A, B } from ...
        const line = lines[existingPkgImportIdx];
        if (line.includes('{')) {
            lines[existingPkgImportIdx] = line.replace('{', `{ ${importName}, `);
            return true;
        }
    }

    // New import
    lines.unshift(`import { ${importName} } from "${fromPackage}";`);
    return true;
}

async function applyFixes() {
    if (!fs.existsSync(LINT_FILE)) return;
    const content = fs.readFileSync(LINT_FILE, 'utf8');
    const allErrors = parseLintFile(content);

    // Filter for route.ts files and 'no-explicit-any'
    const routeErrors = allErrors.filter(e =>
        e.file.endsWith('route.ts') &&
        (e.ruleId === '@typescript-eslint/no-explicit-any' || e.ruleId === 'no-explicit-any')
    );

    console.log(`Found ${routeErrors.length} 'any' errors in route.ts files`);

    const fileGroups = {};
    for (const err of routeErrors) {
        if (!fileGroups[err.file]) fileGroups[err.file] = [];
        fileGroups[err.file].push(err);
    }

    for (const [filePath, errors] of Object.entries(fileGroups)) {
        try {
            if (!fs.existsSync(filePath)) continue;
            let fileLines = fs.readFileSync(filePath, 'utf8').split('\n');
            let modified = false;
            let importAdded = false;

            errors.sort((a, b) => b.line - a.line);

            for (const err of errors) {
                const lineIdx = err.line - 1;
                if (lineIdx >= fileLines.length) continue;
                const lineContent = fileLines[lineIdx];

                // Heuristic: Check if it's an export function like GET, POST, PUT, DELETE, PATCH
                // AND has an argument typed as any: (req: any) or (request: any)

                // Matches: export async function POST(req: any)
                const methodMatch = lineContent.match(/export\s+(async\s+)?function\s+(GET|POST|PUT|DELETE|PATCH)\s*\(\s*(\w+)\s*:\s*any\s*(,.*)?\)/);

                if (methodMatch) {
                    const argName = methodMatch[3]; // e.g. req

                    // Replace ': any' with ': NextRequest'
                    // Careful with regex replacement to only target the arg definition
                    const newLine = lineContent.replace(`${argName}: any`, `${argName}: NextRequest`);

                    if (newLine !== lineContent) {
                        fileLines[lineIdx] = newLine;
                        modified = true;

                        if (!importAdded) {
                            ensureImport(fileLines, 'NextRequest', 'next/server');
                            importAdded = true;
                        }
                    }
                }
            }

            if (modified) {
                fs.writeFileSync(filePath, fileLines.join('\n'));
                console.log(`Updated ${filePath}`);
            }
        } catch (e) {
            console.error(e);
        }
    }
}

applyFixes();
