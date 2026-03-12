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

function isHttp(href) {
  return href.startsWith('http://') || href.startsWith('https://');
}

function stripFragmentAndQuery(href) {
  const hashIdx = href.indexOf('#');
  const qIdx = href.indexOf('?');
  const cut = Math.min(hashIdx === -1 ? href.length : hashIdx, qIdx === -1 ? href.length : qIdx);
  return href.slice(0, cut);
}

function findMarkdownLinks(markdown) {
  const links = [];

  // Standard markdown links: [text](target)
  const re = /\[[^\]]*\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(markdown)) !== null) {
    links.push(m[1].trim());
  }

  // Also accept autolinks: <./path/to/file>
  const reAuto = /<([^>]+)>/g;
  while ((m = reAuto.exec(markdown)) !== null) {
    const v = m[1].trim();
    if (v.startsWith('./') || v.startsWith('../')) links.push(v);
  }

  return links;
}

function existsRelative(fromFile, href) {
  const cleaned = stripFragmentAndQuery(href);
  if (!cleaned) return true;

  const abs = path.resolve(path.dirname(fromFile), cleaned);

  // If it points to a directory, accept if index.md exists
  if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) {
    return fs.existsSync(path.join(abs, 'README.md')) || fs.existsSync(path.join(abs, 'index.md'));
  }

  return fs.existsSync(abs);
}

function main() {
  if (!fs.existsSync(DOCS_ROOT)) {
    console.log('✅ check-docs-links skipped (no docs directory)');
    return;
  }

  const mdFiles = walk(DOCS_ROOT).filter((f) => f.endsWith('.md'));
  const bad = [];

  for (const file of mdFiles) {
    const txt = fs.readFileSync(file, 'utf8');
    const links = findMarkdownLinks(txt);
    for (const hrefRaw of links) {
      const href = hrefRaw.replace(/^"|"$/g, '').replace(/^'|'$/g, '');
      if (isHttp(href) || href.startsWith('mailto:') || href.startsWith('#')) continue;
      if (!(href.startsWith('./') || href.startsWith('../'))) continue;

      if (!existsRelative(file, href)) {
        bad.push({ file: path.relative(ROOT, file), href });
      }
    }
  }

  if (bad.length) {
    console.error('❌ Broken relative doc links found:');
    for (const b of bad) console.error(`- ${b.file}: ${b.href}`);
    process.exit(1);
  }

  console.log('✅ check-docs-links passed');
}

main();
