const fs = require('fs');
const path = require('path');

const ROUTES_DIR = path.join(__dirname, '../Backend/fastify-server/src/routes');
const SERVICES_DIR = path.join(__dirname, '../Backend/fastify-server/src/services');

// Migrated services and their expected route files
const SERVICE_ROUTE_MAPPING = {
  'booking.service.ts': ['bookings.routes.ts'],
  'wallet.service.ts': ['wallet.routes.ts', 'wallet-ops.routes.ts'],
  'inventory.service.ts': ['inventory.routes.ts'],
  'discount.service.ts': ['discount-rules.routes.ts', 'coupons.routes.ts'],
  'order-state.service.ts': ['order-state.routes.ts'],
  'paystack-webhook.service.ts': ['payments.routes.ts', 'webhooks.routes.ts'],
  'deletion.service.ts': ['account-deletion.routes.ts'],
  'kyc.service.ts': ['kyc.routes.ts', 'compliance.routes.ts'],
  'referral.service.ts': ['referrals.routes.ts'],
  'email-automation.service.ts': ['marketing.routes.ts', 'campaigns.routes.ts'],
  'dashboard-actions.service.ts': ['dashboard.routes.ts'],
  'dashboard-alerts.service.ts': ['dashboard.routes.ts', 'health-score.routes.ts'],
};

console.log('�� Verifying Fastify API Endpoints Against Migrated Services\n');

let totalChecks = 0;
let passedChecks = 0;
const issues = [];

// Check if service is used in routes
Object.entries(SERVICE_ROUTE_MAPPING).forEach(([service, routeFiles]) => {
  const servicePath = path.join(SERVICES_DIR, service);
  
  // Check if service exists
  totalChecks++;
  if (fs.existsSync(servicePath)) {
    passedChecks++;
    console.log(`✅ Service: ${service}`);
  } else {
    issues.push(`Missing service: ${service}`);
    console.log(`❌ Service: ${service} - NOT FOUND`);
    return;
  }

  // Check if corresponding routes exist
  routeFiles.forEach(routeFile => {
    const routePath = path.join(ROUTES_DIR, '**', routeFile);
    const foundRoutes = [];
    
    // Search for route file
    function searchDir(dir) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          searchDir(filePath);
        } else if (file === routeFile) {
          foundRoutes.push(filePath);
        }
      });
    }
    
    try {
      searchDir(ROUTES_DIR);
      
      totalChecks++;
      if (foundRoutes.length > 0) {
        passedChecks++;
        console.log(`   ✅ Route: ${routeFile}`);
        
        // Check if route imports the service
        foundRoutes.forEach(route => {
          const content = fs.readFileSync(route, 'utf8');
          const serviceImport = service.replace('.ts', '');
          
          if (!content.includes(serviceImport)) {
            issues.push(`Route ${routeFile} doesn't import service ${service}`);
            console.log(`   ⚠️  ${routeFile} may not use ${service}`);
          }
        });
      } else {
        issues.push(`Missing route file: ${routeFile}`);
        console.log(`   ❌ Route: ${routeFile} - NOT FOUND`);
      }
    } catch (error) {
      issues.push(`Error searching for ${routeFile}: ${error.message}`);
      console.log(`   ❌ Error searching ${routeFile}`);
    }
  });
  
  console.log('');
});

// Summary
console.log('═'.repeat(60));
console.log(`\n📊 VERIFICATION SUMMARY`);
console.log(`Total checks: ${totalChecks}`);
console.log(`Passed: ${passedChecks}`);
console.log(`Failed: ${totalChecks - passedChecks}`);
console.log(`Success rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%`);

if (issues.length > 0) {
  console.log(`\n⚠️  ISSUES FOUND: ${issues.length}\n`);
  issues.forEach((issue, i) => {
    console.log(`${i + 1}. ${issue}`);
  });
} else {
  console.log('\n✅ ALL CHECKS PASSED!');
}

// Save report
const report = `# API Endpoint Verification Report

## Summary
- Total checks: ${totalChecks}
- Passed: ${passedChecks}
- Failed: ${totalChecks - passedChecks}
- Success rate: ${((passedChecks / totalChecks) * 100).toFixed(1)}%

${issues.length > 0 ? `## Issues\n\n${issues.map((issue, i) => `${i + 1}. ${issue}`).join('\n')}` : '## Status: ALL CHECKS PASSED ✅'}
`;

fs.writeFileSync(path.join(__dirname, '../API_ENDPOINT_VERIFICATION.md'), report);
console.log('\n📄 Full report saved to API_ENDPOINT_VERIFICATION.md');
