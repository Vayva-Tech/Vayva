/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const DOCS_ROOT = path.join(ROOT, 'docs');

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === '.turbo') continue;
    if (entry.name === '_archive') continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const RULES = [
  { name: 'openai-key', re: /\bsk-(?:proj-)?[A-Za-z0-9_-]{16,}\b/g },
  { name: 'paystack-secret', re: /\bsk_(?:test|live)_[A-Za-z0-9]{10,}\b/g },
  { name: 'paystack-public', re: /\bpk_(?:test|live)_[A-Za-z0-9]{10,}\b/g },
  { name: 'resend-key', re: /\bre_[A-Za-z0-9]{10,}\b/g },
  { name: 'groq-key', re: /\bgsk_[A-Za-z0-9]{10,}\b/g },
  { name: 'jwt-like', re: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g },
  { name: 'private-key-block', re: /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/g },
];

function isPlaceholderHit(ruleName, match) {
  const m = String(match).toLowerCase();
  if (m.includes('your_') || m.includes('your-') || m.includes('<') || m.includes('example')) return true;
  if (ruleName === 'jwt-like' && (m.includes('example') || m.includes('placeholder'))) return true;
  return false;
}

function main() {
  if (!fs.existsSync(DOCS_ROOT)) {
    console.log('✅ check-docs-secrets skipped (no docs directory)');
    return;
  }

  const mdFiles = walk(DOCS_ROOT).filter((f) => f.endsWith('.md'));
  const findings = [];

  for (const file of mdFiles) {
    const txt = fs.readFileSync(file, 'utf8');
    for (const rule of RULES) {
      const matches = txt.match(rule.re) || [];
      for (const hit of matches) {
        if (isPlaceholderHit(rule.name, hit)) continue;
        findings.push({ file: path.relative(ROOT, file), rule: rule.name, hit: String(hit).slice(0, 80) });
      }
    }

    // Naive password patterns (avoid false positives by requiring a strong-ish signal)
    if (/OPS_OWNER_PASSWORD\s*=\s*"[^"]{6,}"/g.test(txt) || /Password\s*:\s*`[^`]{6,}`/g.test(txt)) {
      findings.push({ file: path.relative(ROOT, file), rule: 'possible-password', hit: 'possible password in docs' });
    }
  }

  if (findings.length) {
    console.error('❌ Possible secrets found in docs (remove or replace with placeholders):');
    for (const f of findings) console.error(`- ${f.rule}: ${f.file} (${f.hit})`);
    process.exit(1);
  }

  console.log('✅ check-docs-secrets passed');
}

main();
