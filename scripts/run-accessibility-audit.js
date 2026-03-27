#!/usr/bin/env node

/**
 * Accessibility Audit Script - Phase 3 Issue #9
 * 
 * Runs automated WCAG 2.1 AA compliance audits on all industry dashboards
 * using axe-core and generates detailed reports.
 * 
 * Usage:
 *   node scripts/run-accessibility-audit.js                    # Run all audits
 *   node scripts/run-accessibility-audit.js --dashboard retail # Run specific dashboard
 *   node scripts/run-accessibility-audit.js --report json      # Output as JSON
 */

const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');
const path = require('path');

// Configuration
const DASHBOARDS = [
  '/dashboard/retail',
  '/dashboard/fashion',
  '/dashboard/restaurant',
  '/dashboard/grocery',
  '/dashboard/healthcare-services',
  '/dashboard/legal',
  '/dashboard/nightlife',
  '/dashboard/nonprofit',
  '/dashboard/professional',
  '/dashboard/travel',
  '/dashboard/education',
  '/dashboard/wellness',
  '/dashboard/petcare',
  '/dashboard/blog-media',
  '/dashboard/wholesale',
  '/dashboard/creative',
  '/dashboard/automotive',
  '/dashboard/beauty',
  '/dashboard/saas',
  '/dashboard/realestate',
];

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

async function runAccessibilityAudit(dashboardPath, reportFormat = 'text') {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log(`\n${colors.cyan}Auditing:${colors.reset} ${dashboardPath}`);
    
    await page.goto(`${BASE_URL}${dashboardPath}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Run axe-core analysis with WCAG 2.1 AA tags
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    
    const criticalViolations = results.violations.filter(v => 
      ['critical', 'serious'].includes(v.impact)
    );
    
    const moderateViolations = results.violations.filter(v => 
      v.impact === 'moderate'
    );
    
    const minorViolations = results.violations.filter(v => 
      v.impact === 'minor'
    );
    
    if (reportFormat === 'json') {
      return {
        dashboard: dashboardPath,
        timestamp: new Date().toISOString(),
        passed: criticalViolations.length === 0,
        summary: {
          total: results.violations.length,
          critical: criticalViolations.length,
          moderate: moderateViolations.length,
          minor: minorViolations.length,
        },
        violations: results.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          helpUrl: v.helpUrl,
          nodes: v.nodes.length,
        })),
      };
    }
    
    // Text report
    if (criticalViolations.length === 0) {
      console.log(`${colors.green}✓ PASS:${colors.reset} No critical/serious violations`);
    } else {
      console.log(`${colors.red}✗ FAIL:${colors.reset} ${criticalViolations.length} critical/serious violations`);
      
      criticalViolations.forEach((violation, index) => {
        console.log(`\n  ${colors.red}[${index + 1}] ${violation.id}${colors.reset}`);
        console.log(`     Impact: ${violation.impact}`);
        console.log(`     Issue: ${violation.description}`);
        console.log(`     Help: ${violation.help}`);
        console.log(`     Affected elements: ${violation.nodes.length}`);
        console.log(`     More info: ${violation.helpUrl}`);
      });
    }
    
    if (moderateViolations.length > 0) {
      console.log(`\n  ${colors.yellow}⚠ ${moderateViolations.length} moderate issues${colors.reset}`);
    }
    
    if (minorViolations.length > 0) {
      console.log(`  ${colors.blue}ℹ ${minorViolations.length} minor warnings${colors.reset}`);
    }
    
    return {
      dashboard: dashboardPath,
      passed: criticalViolations.length === 0,
      criticalCount: criticalViolations.length,
      moderateCount: moderateViolations.length,
      minorCount: minorViolations.length,
    };
    
  } catch (error) {
    console.error(`${colors.red}Error auditing ${dashboardPath}:${colors.reset}`, error.message);
    return {
      dashboard: dashboardPath,
      error: error.message,
      passed: false,
    };
  } finally {
    await browser.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dashboardArg = args.find(arg => arg.startsWith('--dashboard='));
  const reportArg = args.find(arg => arg.startsWith('--report='));
  
  const specificDashboard = dashboardArg ? dashboardArg.split('=')[1] : null;
  const reportFormat = reportArg ? reportArg.split('=')[1] : 'text';
  
  const dashboardsToAudit = specificDashboard 
    ? (DASHBOARDS.find(d => d.includes(specificDashboard)) ? [specificDashboard] : [])
    : DASHBOARDS;
  
  console.log(`${colors.blue}╔════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.blue}║  Phase 3 Accessibility Audit (WCAG 2.1 AA) ║${colors.reset}`);
  console.log(`${colors.blue}╚════════════════════════════════════════════╝${colors.reset}`);
  console.log(`\nBase URL: ${BASE_URL}`);
  console.log(`Dashboards to audit: ${dashboardsToAudit.length}`);
  console.log(`Report format: ${reportFormat}`);
  
  const results = [];
  
  for (const dashboard of dashboardsToAudit) {
    const result = await runAccessibilityAudit(dashboard, reportFormat);
    results.push(result);
  }
  
  // Summary
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const totalCritical = results.reduce((sum, r) => sum + (r.criticalCount || 0), 0);
  
  console.log(`\n${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}AUDIT SUMMARY${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════════${colors.reset}`);
  console.log(`Total Dashboards: ${results.length}`);
  console.log(`${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`Critical Violations: ${totalCritical}`);
  
  const passRate = ((passed / results.length) * 100).toFixed(1);
  console.log(`Pass Rate: ${passRate}%`);
  
  // Generate HTML report
  if (reportFormat !== 'json') {
    generateHTMLReport(results);
  }
  
  // Exit with error code if any failures
  process.exit(failed > 0 ? 1 : 0);
}

function generateHTMLReport(results) {
  const reportPath = path.join(__dirname, '..', 'accessibility-report.html');
  const timestamp = new Date().toISOString();
  
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Accessibility Audit Report - ${timestamp}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    h1 { color: #1a1a1a; border-bottom: 3px solid #0066cc; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .stat { padding: 20px; border-radius: 8px; text-align: center; }
    .stat-pass { background: #d4edda; color: #155724; }
    .stat-fail { background: #f8d7da; color: #721c24; }
    .stat-total { background: #e2e3e5; color: #383d41; }
    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f8f9fa; font-weight: 600; }
    .pass { color: #28a745; font-weight: 600; }
    .fail { color: #dc3545; font-weight: 600; }
    .violation { background: #fff3cd; padding: 10px; margin: 10px 0; border-left: 4px solid #ffc107; }
    .critical { border-left-color: #dc3545; background: #f8d7da; }
  </style>
</head>
<body>
  <div class="container">
    <h1>♿ Accessibility Audit Report</h1>
    <p><strong>Date:</strong> ${timestamp}</p>
    <p><strong>Standard:</strong> WCAG 2.1 Level AA</p>
    
    <div class="summary">
      <div class="stat stat-total">
        <div style="font-size: 32px; font-weight: bold;">${results.length}</div>
        <div>Total Dashboards</div>
      </div>
      <div class="stat stat-pass">
        <div style="font-size: 32px; font-weight: bold;">${results.filter(r => r.passed).length}</div>
        <div>Passed</div>
      </div>
      <div class="stat stat-fail">
        <div style="font-size: 32px; font-weight: bold;">${results.filter(r => !r.passed).length}</div>
        <div>Failed</div>
      </div>
    </div>
    
    <h2>Detailed Results</h2>
    <table>
      <thead>
        <tr>
          <th>Dashboard</th>
          <th>Status</th>
          <th>Critical</th>
          <th>Moderate</th>
          <th>Minor</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => `
          <tr>
            <td>${r.dashboard}</td>
            <td class="${r.passed ? 'pass' : 'fail'}">${r.passed ? '✓ Pass' : '✗ Fail'}</td>
            <td>${r.criticalCount || 0}</td>
            <td>${r.moderateCount || 0}</td>
            <td>${r.minorCount || 0}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2>Violations Detail</h2>
    ${results.filter(r => !r.passed).map(r => `
      <div style="margin: 30px 0;">
        <h3 style="color: #dc3545;">${r.dashboard}</h3>
        ${r.violations ? r.violations.map(v => `
          <div class="violation ${v.impact === 'critical' || v.impact === 'serious' ? 'critical' : ''}">
            <strong>${v.id}</strong> (${v.impact})<br/>
            ${v.description}<br/>
            <small>Affected elements: ${v.nodes} | <a href="${v.helpUrl}" target="_blank">Learn more</a></small>
          </div>
        `).join('') : '<p>No detailed violation data available</p>'}
      </div>
    `).join('')}
  </div>
</body>
</html>
  `.trim();
  
  fs.writeFileSync(reportPath, html);
  console.log(`\n${colors.green}✓${colors.reset} HTML report generated: ${reportPath}`);
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runAccessibilityAudit };
