const fs = require('fs');

const LINT_FILE = 'final_lint.txt';

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

// Naive function extraction to check for 'return' statement
// This obviously cannot fully parse nested functions or complex bodies without AST.
// BUT, if a function body has NO "return" keyword at all, it is definitely void (or implicit return in arrow func).
// Heavily heavily dependent on regex.
// Strategy: 
// 1. Identify start of function. 
// 2. Count braces to find end of function.
// 3. Scan content for `\breturn\b`.
// 4. If none, add `: void`.

function getFix(fileContent, lineIdx, colIdx) {
    // lineIdx is 0-based
    const lines = fileContent.split('\n');

    // Start scanning from the definition line.
    let startLine = lineIdx;
    let combined = lines[startLine];

    // Find opening brace {
    let braceBalance = 0;
    let inBody = false;
    let foundStart = false;

    // Helper to find function start from lint col
    // The lint error points to identifier usually.
    // e.g. function Foo(...)
    // or const Foo = (...) => 

    // We scan forward from startLine to find {
    // If it's an arrow function with implicit return `=> x` (no brace), we CANNOT infer void easily 
    // unless we know what x is. We skip implicit returns.

    let bodyContent = "";

    for (let i = startLine; i < lines.length; i++) {
        const line = lines[i];

        // Very simplistic parser
        for (let j = (i === startLine ? 0 : 0); j < line.length; j++) {
            const char = line[j];
            if (char === '{') {
                braceBalance++;
                if (!foundStart) {
                    foundStart = true;
                    inBody = true;
                }
            } else if (char === '}') {
                braceBalance--;
                if (inBody && braceBalance === 0) {
                    // unexpected end?
                    //Wait, braceBalance starts at 0.
                    // First { makes it 1. End } makes it 0.
                    // So we are done.

                    // Check bodyContent for 'return'
                    if (!/\breturn\b/.test(bodyContent)) {
                        // Candidate for void!
                        // Where to insert?
                        // Before the first { that started the body.
                        // Wait, we need the exact position or just string manipulation?
                        // We return an Instruction: Insert ": void" or ": Promise<void>" before first {

                        // Async check?
                        // Check previous lines/chars for `async`
                        // This is getting complex to grab context backward.
                        // Let's rely on the definition line for async keyword.

                        const definition = lines[startLine]; // Simplified: assumes async is on same line
                        const isAsync = /\basync\b/.test(definition);
                        const type = isAsync ? ": Promise<void>" : ": void";

                        // Insertion: we need to find the `)` before the `{` ?
                        // Or just before the `{`.
                        // `function Foo() {` -> `function Foo(): void {`
                        // `const F = () => {` -> `const F = (): void => {` -- wait, arrow func arrow is before {

                        // Re-eval:
                        // Top-level function: `function F() {` -> insert before `{`
                        // Arrow func: `const F = () => {` -> insert before `=>`, NOT `{`

                        // Let's return just "SAFE_TO_FIX" and handle insertion simply on the line
                        return { safe: true, type, lineIndex: startLine };
                    }
                    return null; // Has return, cannot infer void safely
                }
            }

            if (inBody) {
                bodyContent += char;
            }
        }

        // Safety Break: don't scan too many lines (e.g. 500) in case parsing fails
        if (i - startLine > 200) return null;
    }

    return null;
}

async function applyFixes() {
    if (!fs.existsSync(LINT_FILE)) return;
    const content = fs.readFileSync(LINT_FILE, 'utf8');
    const allErrors = parseLintFile(content);

    // Filter
    const voidErrors = allErrors.filter(e => e.ruleId === '@typescript-eslint/explicit-function-return-type');
    console.log(`Analyzing ${voidErrors.length} functions for void inference...`);

    const fileGroups = {};
    for (const err of voidErrors) {
        if (!fileGroups[err.file]) fileGroups[err.file] = [];
        fileGroups[err.file].push(err);
    }

    // Processing
    for (const [filePath, errors] of Object.entries(fileGroups)) {
        try {
            if (!fs.existsSync(filePath)) continue;
            let fileLines = fs.readFileSync(filePath, 'utf8').split('\n');
            let modified = false;

            // Sort Descending
            errors.sort((a, b) => b.line - a.line);

            for (const err of errors) {
                const lineIdx = err.line - 1;
                if (lineIdx >= fileLines.length) continue;
                const lineContent = fileLines[lineIdx];

                // 1. Check for `return` keyword presence (Scan forward)
                // We use a simplified check:
                // If it is a function declaration AND we can scan the body AND no 'return' is found -> Void.
                // NOTE: This runs risk of false negatives (nested functions, implicit arrows).
                // BUT usage of explicit `return` in a void function is rare (only for early exit).
                // If early exit exists `return;` -> that is still void!
                // So checking for `return <something>` is key. `return;` is fine.
                // Regex for return with value: `return\s+\S` (return followed by non-whitespace)
                // Wait, `return;` matches `return` word check in `getFix`.

                // Refined Logic in loop:
                // Just Regex check for explicit return value?
                // Too risky to parse body properly in a script.

                // LOW HANGING FRUIT: One-liners or empty functions.
                // `export function foo() {}`
                // `const foo = () => {}`

                if (lineContent.includes('{}') || lineContent.match(/\{\s*\}/)) {
                    // Empty body -> VOID.
                    // Insert : void
                    let newLine = lineContent;
                    if (lineContent.match(/function.*\{/)) {
                        // function foo() {} -> function foo(): void {}
                        newLine = lineContent.replace(/\)\s*\{/, '): void {');
                    } else if (lineContent.match(/=>\s*\{/)) {
                        // const foo = () => {} -> const foo = (): void => {}
                        // insert before =>
                        // need to ensure parens around args? `const foo = props => {}` -> `const foo = (props): void => {}`
                        // If it lacks parens, adding type is hard.
                        if (lineContent.includes(') =>')) {
                            newLine = lineContent.replace(/\)\s*=>/, '): void =>');
                        }
                    }

                    if (newLine !== lineContent) {
                        fileLines[lineIdx] = newLine;
                        modified = true;
                    }
                    continue;
                }

                // What about useEffect? usually returns void or cleanup (function).
                // Lint usually doesn't complain about useEffect arrow func unless configured strictly.
                // The error is explicit-function-return-type on named/exported functions usually.

                // Let's stick to the SAFE Empty Body check for now.
                // Expanding to multiline void inference without AST is extremely dangerous (brittle parsing).
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
