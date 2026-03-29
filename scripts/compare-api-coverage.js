const fs = require('fs');
const path = require('path');

// Core-API routes to check
const CORE_API_ROUTES = [
  // Health
  { name: 'health.routes.ts', path: 'Backend/core-api/src/routes/health.routes.ts', category: 'core' },
  
  // Rentals (specialized)
  { name: 'rental.routes.ts', path: 'Backend/core-api/src/routes/api/v1/rentals/rental.routes.ts', category: 'rentals' },
  
  // POS (Point of Sale)
  { name: 'pos.routes.ts', path: 'Backend/core-api/src/routes/api/v1/pos/pos.routes.ts', category: 'pos' },
  
  // Fashion
  { name: 'style-quiz.routes.ts', path: 'Backend/core-api/src/routes/api/v1/fashion/style-quiz.routes.ts', category: 'fashion' },
  
  // Education
  { name: 'courses.routes.ts', path: 'Backend/core-api/src/routes/api/v1/education/courses.routes.ts', category: 'education' },
  
  // Meal Kit
  { name: 'recipes.routes.ts', path: 'Backend/core-api/src/routes/api/v1/meal-kit/recipes.routes.ts', category: 'meal-kit' },
];

const FASTIFY_ROUTES_DIR = 'Backend/fastify-server/src/routes';

console.log('🔍 Comparing API Coverage: Core-API vs Fastify-Server\n');
console.log('═'.repeat(70));

const results = {
  exists: [],
  missing: [],
  partial: []
};

CORE_API_ROUTES.forEach(route => {
  const corePath = path.join(process.cwd(), route.path);
  const fastifyPath = path.join(process.cwd(), FASTIFY_ROUTES_DIR, '**', route.name);
  
  // Check if core-api route exists
  const coreExists = fs.existsSync(corePath);
  
  if (!coreExists) {
    console.log(`⚠️  ${route.name} - Core-API file not found`);
    return;
  }
  
  // Search for corresponding fastify route
  function findFastifyRoute(dir, fileName) {
    const results = [];
    function search(currentDir) {
      const files = fs.readdirSync(currentDir);
      files.forEach(file => {
        const filePath = path.join(currentDir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          search(filePath);
        } else if (file === fileName) {
          results.push(filePath);
        }
      });
    }
    try {
      search(dir);
    } catch (error) {
      // Ignore errors
    }
    return results;
  }
  
  const fastifyRoutes = findFastifyRoute(path.join(process.cwd(), FASTIFY_ROUTES_DIR), route.name);
  
  if (fastifyRoutes.length > 0) {
    results.exists.push({ ...route, fastifyPaths: fastifyRoutes });
    console.log(`✅ ${route.name.padEnd(25)} - EXISTS in fastify-server`);
    console.log(`   �� ${fastifyRoutes[0].replace(process.cwd() + '/', '')}`);
  } else {
    // Check if similar route exists
    const similarName = route.name.replace('.routes.ts', '');
    const allFastifyRoutes = findFastifyRoute(path.join(process.cwd(), FASTIFY_ROUTES_DIR), '*.ts');
    const hasSimilar = allFastifyRoutes.some(f => 
      f.toLowerCase().includes(similarName.toLowerCase())
    );
    
    if (hasSimilar) {
      results.partial.push(route);
      console.log(`⚠️  ${route.name.padEnd(25)} - PARTIAL (similar route exists)`);
    } else {
      results.missing.push(route);
      console.log(`❌ ${route.name.padEnd(25)} - MISSING in fastify-server`);
    }
  }
});

console.log('\n' + '═'.repeat(70));
console.log('\n📊 SUMMARY:');
console.log(`Total checked: ${CORE_API_ROUTES.length}`);
console.log(`✅ Exists: ${results.exists.length}`);
console.log(`⚠️  Partial: ${results.partial.length}`);
console.log(`❌ Missing: ${results.missing.length}`);

if (results.missing.length > 0) {
  console.log('\n❌ MISSING ROUTES:');
  results.missing.forEach((route, i) => {
    console.log(`${i + 1}. ${route.name} (${route.category})`);
  });
}

// Save report
const report = `# Missing API Routes Report

## Summary
- Total checked: ${CORE_API_ROUTES.length}
- Exists: ${results.exists.length}
- Partial: ${results.partial.length}
- Missing: ${results.missing.length}

${results.missing.length > 0 ? `## Missing Routes\n\n${results.missing.map(r => `- ${r.name} (${r.category})`).join('\n')}` : '## Status: ALL ROUTES COVERED ✅'}
`;

fs.writeFileSync(
  path.join(process.cwd(), 'MISSING_API_ROUTES_REPORT.md'),
  report
);
console.log('\n📄 Full report saved to MISSING_API_ROUTES_REPORT.md');
