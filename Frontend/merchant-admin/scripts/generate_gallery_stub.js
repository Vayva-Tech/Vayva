
const fs = require('fs');
const path = require('path');

// We need to compile TS on the fly or shim the imports since we are running via node.
// For simplicity in this environment, we will mock the imports or use a simple transpile step if needed.
// Actually, since we are in a dev environment, we can use `tsx` if available or just read the files and regex/eval them (risky/messy).
// BETTER APPROACH: I will write a simple TS file and verify I can run it with `npx tsx`.
// The user prompt mentioned `tsx` failed earlier.
// So I will convert the relevant TS parts to a single JS script for the generator to be safe and dependency-free.

// To make this robust, I will create a `generate_previews.js` that has the core logic embedded or reads the TS files (too complex).
// I will create a `preview-generator.ts` and try `npx tsx` again (maybe I installed it or can use `npx -y tsx`).
// If `tsx` fails, I will use `ts-node` or just compile with `tsc`.
// Let's try `npx -y tsx` again. If it fails, I'll fallback to a self-contained JS file that duplicates the template logic for PREVIEW purposes 
// (or better: imports the transpiled files if I run `tsc`).

// Let's rely on the previous `generate_previews.js` approach but make it comprehensive for the registry.

// Wait, I can't duplicate 51 templates in a JS file.
// I should really try to get TS running.
// Let's try to compile the `src/lib/email` folder using `tsc`.

const { execSync } = require('child_process');

try {
    console.log('Compiling email templates...');
    // We only need to compile the email directory to a temp location to run it.
    // simpler: usage of `npx -y tsx` failed. 
    // Let's try `node --loader ts-node/esm` if available?
    // Let's try creating a small "tsconfig.preview.json" and running `tsc`.
} catch (e) {
    console.error(e);
}

// ... actually, screw the complexity. I'll write a `generate_gallery.ts` and try to run it. 
// If it fails, I'll guide the user or try `tsc`.

const htmlTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
    <title>Vayva Email Gallery</title>
    <style>
        body { font-family: -apple-system, sans-serif; background: #111; color: white; margin: 0; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(600px, 1fr)); gap: 40px; }
        .card { background: #222; border-radius: 12px; overflow: hidden; border: 1px solid #333; }
        .header { padding: 12px 20px; background: #000; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center; }
        .title { font-weight: bold; color: #22C55E; }
        .meta { font-size: 12px; color: #888; }
        iframe { width: 100%; height: 800px; border: none; background: white; }
    </style>
</head>
<body>
    <h1 style="margin-bottom: 40px;">Vayva Luxury Email System <span style="font-size: 14px; font-weight:normal; color: #666; margin-left: 20px;">Premium Templates</span></h1>
    <div class="grid" id="grid"></div>
    <script>
        const templates = window.TEMPLATES || [];
        const grid = document.getElementById('grid');
        
        templates.forEach(t => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = \`
                <div class="header">
                    <div class="title">\${t.key}</div>
                    <div class="meta">\${t.subject}</div>
                </div>
                <iframe srcdoc="\${t.html.replace(/"/g, '&quot;')}" loading="lazy"></iframe>
            \`;
            grid.appendChild(card);
        });
    </script>
</body>
</html>
`;

// EXPORT TO FILE

// I will create a robust verification script in TS and run it with `npx -y tsx` again.
// If that fails I will manually compile.
