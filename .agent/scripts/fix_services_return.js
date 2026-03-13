const fs = require('fs');
const path = require('path');

const LINT_FILE = 'final_lint_admin.txt';

function parseLintFile(content) {
    const lines = content.split('\n');
    let currentFile = null;
    const errors = [];
    for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('/') || line.startsWith('apps/')) {
            // Fix absolute/relative path
            let p = line.trim();
            if (!p.startsWith('/')) p = path.resolve(process.cwd(), p);
            currentFile = p;
            continue;
        }
        // Match standard eslint output
        //   6:5  warning  Missing return type on function  @typescript-eslint/explicit-function-return-type
        const match = line.match(/^\s+(\d+):(\d+)\s+(error|warning)\s+(.+?)\s+(@?[\w\-\/]+)$/);
        if (match && currentFile) {
            errors.push({
                file: currentFile,
                line: parseInt(match[1]),
                col: parseInt(match[2]),
                ruleId: match[5]
            });
        }
    }
    return errors;
}

function hasReturn(body) {
    // Naive check for "return " or "return;" 
    // We want to skip if it has "return value".
    // "return;" is effectively void.
    // "return value" is NOT void.

    // Regex for return followed by something other than ; or }
    // return followed by space or newline, then NOT ;
    // We'll simplisticly check for `return` keyword.
    // If we find `return` followed by a non-whitespace character that isn't `;`, assume it returns value.
    const returnRegex = /\breturn\b\s*([^;\}])/;
    return returnRegex.test(body);
}

function getBody(lines, startLine) {
    let content = "";
    let braceBalance = 0;
    let inBody = false;

    for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];
        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '{') {
                braceBalance++;
                inBody = true;
            } else if (char === '}') {
                braceBalance--;
                if (inBody && braceBalance === 0) {
                    content += char;
                    return content;
                }
            }
            if (inBody) content += char;
        }
        content += '\n';
        if (i - startLine > 300) return null; // Safety
    }
    return null;
}

function processFiles() {
    if (!fs.existsSync(LINT_FILE)) {
        console.log('No lint file found');
        return;
    }
    const content = fs.readFileSync(LINT_FILE, 'utf8');
    const errors = parseLintFile(content).filter(e => e.ruleId === '@typescript-eslint/explicit-function-return-type');

    console.log(`Found ${errors.length} return type errors.`);

    const fileGroups = {};
    for (const e of errors) {
        if (!fileGroups[e.file]) fileGroups[e.file] = [];
        fileGroups[e.file].push(e);
    }

    let fixedCount = 0;

    for (const [filePath, fileErrors] of Object.entries(fileGroups)) {
        try {
            if (!fs.existsSync(filePath)) continue;
            let lines = fs.readFileSync(filePath, 'utf8').split('\n');
            let modified = false;

            // Sort reverse to keep line numbers valid
            fileErrors.sort((a, b) => b.line - a.line);

            for (const err of fileErrors) {
                const lineIdx = err.line - 1;
                const lineContent = lines[lineIdx];

                // Check for async
                const isAsync = /\basync\b/.test(lineContent);
                const type = isAsync ? ": Promise<void>" : ": void";

                // Check for existing return (heuristic)
                // We grab the body starting from this line
                const body = getBody(lines, lineIdx);
                if (body && !hasReturn(body)) {
                    // Safe to add void
                    // Find insertion point
                    // function foo() { 
                    // const foo = () => {
                    // class method: foo() {

                    let newLine = lineContent;

                    // Regex patterns
                    // 1. function foo(...) {
                    if (/\)\s*\{/.test(lineContent)) {
                        newLine = lineContent.replace(/\)\s*\{/, `)${type} {`);
                    }
                    // 2. arrow: ) => {
                    else if (/\)\s*=>/.test(lineContent)) {
                        newLine = lineContent.replace(/\)\s*=>/, `)${type} =>`);
                    }
                    // 3. arrow no parens? unlikely for lint error usually requires parens in args if explicit, but maybe `const f = arg =>`
                    else if (/=>\s*\{/.test(lineContent)) {
                        // try to find end of args
                        // Hard without parens.
                    }

                    if (newLine !== lineContent) {
                        lines[lineIdx] = newLine;
                        modified = true;
                        fixedCount++;
                    }
                }
            }

            if (modified) {
                fs.writeFileSync(filePath, lines.join('\n'));
                console.log(`Fixed ${filePath}`);
            }
        } catch (e) {
            console.error(`Error processing ${filePath}:`, e);
        }
    }
    console.log(`Total fixed: ${fixedCount}`);
}

processFiles();
