const fs = require('fs');

function cleanFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;
  
  // Remove dangling `\n*/\n` and `*/` at the very end
  content = content.replace(/\n\*\/\n$/g, '');
  content = content.replace(/\n\*\/\n\*\/\n$/g, '');
  
  // Actually fix the original problems by reading the lines and matching the unclosed /*
  const lines = content.split('\n');
  let openComments = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const opens = (line.match(/\/\*/g) || []).length;
    const closes = (line.match(/\*\//g) || []).length;
    openComments += opens - closes;
    
    // If we reach the end and still have open comments, append */
    if (i === lines.length - 1 && openComments > 0) {
      lines.push('*/');
    }
  }
  content = lines.join('\n');

  if (content !== orig) {
    fs.writeFileSync(file, content);
    console.log(`Cleaned ${file}`);
  }
}

const files = [
  '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/jobs/cleanupOrphanedUploads.ts',
  '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/lib/email/resend.ts',
  '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/lib/input-sanitization.ts'
];

for (const file of files) {
  cleanFile(file);
}
