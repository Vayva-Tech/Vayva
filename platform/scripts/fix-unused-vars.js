/* eslint-disable */
const fs = require('fs');
const path = require('path');

/**
 * Fix Unused Variables Script
 * Prefixes unused variables with '_' based on ESLint output
 * Example: 'error' is defined but never used -> '_error'
 */

function processLintLine(line) {
  // Pattern: /path/to/file.ts:line:col  warning  'varName' is defined but never used  @typescript-eslint/no-unused-vars
  const match = line.match(/^(.+?):(\d+):(\d+)\s+(warning|error)\s+'(.+?)' is (defined but never used|assigned a value but never used)/);
  if (!match) return null;

  return {
    file: match[1].trim(),
    line: parseInt(match[2]),
    col: parseInt(match[3]),
    varName: match[5]
  };
}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  terminal: false
});

const fileEdits = {};

rl.on('line', (line) => {
  const info = processLintLine(line);
  if (!info) return;

  if (!fileEdits[info.file]) fileEdits[info.file] = [];
  fileEdits[info.file].push(info);
});

rl.on('close', () => {
  Object.keys(fileEdits).forEach(filePath => {
    if (!fs.existsSync(filePath)) return;

    let lines = fs.readFileSync(filePath, 'utf8').split('\n');
    const edits = fileEdits[filePath].sort((a, b) => b.line - a.line || b.col - a.col);

    edits.forEach(edit => {
      const lineIdx = edit.line - 1;
      const currentLine = lines[lineIdx];

      // Basic replacement check: ensure the variable name exists at or near the column
      // We look for the variable name as a whole word
      const regex = new RegExp(`\\b${edit.varName}\\b`);
      if (regex.test(currentLine)) {
        lines[lineIdx] = currentLine.replace(regex, `_${edit.varName}`);
      }
    });

    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`[PREFIXED] ${filePath} (${edits.length} vars)`);
  });
});
