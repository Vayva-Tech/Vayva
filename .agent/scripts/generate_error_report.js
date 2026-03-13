const fs = require('fs');
const path = require('path');

const LINT_FILE = 'final_lint_v2.txt';
const OUTPUT_FILE = 'remaining_errors_report.md';

const SOLUTIONS = {
    '@typescript-eslint/explicit-function-return-type': 'Add explicit return type (e.g. `: void`, `: string`, `: Promise<void>`).',
    '@typescript-eslint/no-explicit-any': 'Replace `any` with a specific type, interface, or `unknown`.',
    '@typescript-eslint/no-unused-vars': 'Remove variable or prefix with `_`.',
    'no-console': 'Remove console statement or use a logger service.',
};

function parseLintFile(content) {
    const lines = content.split('\n');
    let currentFile = null;
    const errors = [];
    for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('/')) { currentFile = line.trim(); continue; }
        const match = line.match(/^\s+(\d+):(\d+)\s+(\w+)\s+(.+?)\s+(@?[\w\-\/]+)$/);
        if (match && currentFile) {
            errors.push({
                file: currentFile,
                line: match[1],
                ruleId: match[5],
                message: match[4]
            });
        }
    }
    return errors;
}

function generateReport() {
    if (!fs.existsSync(LINT_FILE)) {
        console.error(`${LINT_FILE} not found.`);
        return;
    }

    const content = fs.readFileSync(LINT_FILE, 'utf8');
    const errors = parseLintFile(content);

    let md = `# Remaining Lint Errors Report\n\n`;
    md += `**Total Remaining Errors:** ${errors.length}\n\n`;
    md += `## Common Solutions\n`;
    for (const [rule, sol] of Object.entries(SOLUTIONS)) {
        md += `*   **${rule}**: ${sol}\n`;
    }
    md += `\n---\n\n`;

    // Group by Directory/App for readability
    const files = {};
    for (const err of errors) {
        if (!files[err.file]) files[err.file] = [];
        files[err.file].push(err);
    }

    // Sort files alphabetically
    const sortedFiles = Object.keys(files).sort();

    for (const filePath of sortedFiles) {
        const fileErrors = files[filePath];
        // Make path relative for brevity
        const relPath = filePath.replace(process.cwd(), '');

        md += `### \`${relPath}\` (${fileErrors.length})\n`;
        md += `| Line | Rule | Solution |\n`;
        md += `| :--- | :--- | :--- |\n`;

        for (const err of fileErrors) {
            const solution = SOLUTIONS[err.ruleId] || 'Check rule documentation.';
            md += `| ${err.line} | \`${err.ruleId}\` | ${solution} |\n`;
        }
        md += `\n`;
    }

    // Write to absolute path in artifacts dir to be safe and accessible
    const artifactPath = path.join(process.cwd(), OUTPUT_FILE);
    fs.writeFileSync(artifactPath, md);
    console.log(`Report generated at ${artifactPath}`);
}

generateReport();
