#!/usr/bin/env node

/**
 * Browser Matrix Testing Runner
 * Tests dashboard functionality across multiple browsers and devices
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class BrowserMatrixTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      testMatrix: {},
      bugs: [],
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };
    
    this.browsers = [
      { name: 'chrome', executablePath: null },
      { name: 'firefox', executablePath: null }
    ];
    
    this.devices = [
      { name: 'desktop', width: 1920, height: 1080, userAgent: null },
      { name: 'mobile', width: 375, height: 667, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1' },
      { name: 'tablet', width: 768, height: 1024, userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1' }
    ];
  }

  async initialize() {
    console.log('🚀 Initializing Browser Matrix Tester...');
    
    // Check if browsers are available
    try {
      await puppeteer.launch({ headless: true });
      console.log('✅ Puppeteer ready');
    } catch (error) {
      console.error('❌ Puppeteer initialization failed:', error.message);
      throw error;
    }
  }

  async runTestSuite() {
    console.log('\n🧪 Running Browser Matrix Test Suite...\n');
    
    for (const browserConfig of this.browsers) {
      for (const device of this.devices) {
        await this.runSingleTest(browserConfig, device);
      }
    }
    
    await this.generateReport();
  }

  async runSingleTest(browserConfig, device) {
    const testName = `${browserConfig.name}-${device.name}`;
    console.log(`\n🔍 Testing: ${testName.toUpperCase()}`);
    
    let browser;
    let page;
    const testResult = {
      browser: browserConfig.name,
      device: device.name,
      timestamp: new Date().toISOString(),
      steps: [],
      passed: false,
      errors: []
    };

    try {
      // Launch browser
      browser = await puppeteer.launch({
        headless: false, // Set to true for CI
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      page = await browser.newPage();
      
      // Set viewport and user agent
      await page.setViewport({ 
        width: device.width, 
        height: device.height,
        isMobile: device.name === 'mobile'
      });
      
      if (device.userAgent) {
        await page.setUserAgent(device.userAgent);
      }
      
      testResult.steps.push('Browser launched successfully');

      // Test 1: Navigate to dashboard
      try {
        await page.goto('http://localhost:3000/dashboard', { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });
        testResult.steps.push('Navigated to dashboard');
      } catch (error) {
        testResult.errors.push(`Navigation failed: ${error.message}`);
        throw error;
      }

      // Test 2: Check for essential elements
      const essentialElements = [
        '[data-testid="dashboard-header"]',
        '[data-testid="metric-cards"]',
        '[data-testid="navigation-menu"]'
      ];

      for (const selector of essentialElements) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          testResult.steps.push(`Found element: ${selector}`);
        } catch (error) {
          testResult.errors.push(`Missing element: ${selector}`);
        }
      }

      // Test 3: Click metric cards
      try {
        const metricCards = await page.$$('.metric-card');
        if (metricCards.length > 0) {
          await metricCards[0].click();
          testResult.steps.push('Clicked first metric card');
        }
      } catch (error) {
        testResult.errors.push(`Metric card click failed: ${error.message}`);
      }

      // Test 4: Mobile menu functionality
      if (device.name === 'mobile') {
        try {
          const menuButton = await page.$('[data-testid="mobile-menu-button"]');
          if (menuButton) {
            await menuButton.click();
            await page.waitForSelector('[data-testid="mobile-menu"]', { timeout: 2000 });
            testResult.steps.push('Mobile menu opened successfully');
          }
        } catch (error) {
          testResult.errors.push(`Mobile menu test failed: ${error.message}`);
        }
      }

      // Test 5: Settings panel
      try {
        const settingsButton = await page.$('[data-testid="settings-button"]');
        if (settingsButton) {
          await settingsButton.click();
          await page.waitForSelector('[data-testid="settings-panel"]', { timeout: 3000 });
          testResult.steps.push('Settings panel opened');
          
          // Try to close settings
          const closeButton = await page.$('[data-testid="close-settings"]');
          if (closeButton) {
            await closeButton.click();
            testResult.steps.push('Settings panel closed');
          }
        }
      } catch (error) {
        testResult.errors.push(`Settings panel test failed: ${error.message}`);
      }

      // Take screenshot
      const screenshotPath = path.join(__dirname, `../../tests/qa/screenshots/${testName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      testResult.screenshot = screenshotPath;
      testResult.steps.push('Screenshot captured');

      // Determine test result
      testResult.passed = testResult.errors.length === 0;
      
      if (testResult.passed) {
        console.log(`✅ ${testName}: PASSED`);
        this.results.summary.passed++;
      } else {
        console.log(`❌ ${testName}: FAILED (${testResult.errors.length} errors)`);
        this.results.summary.failed++;
        
        // Log specific errors
        testResult.errors.forEach(error => {
          console.log(`   - ${error}`);
        });
      }

    } catch (error) {
      console.log(`💥 ${testName}: CRASHED`);
      console.log(`   Error: ${error.message}`);
      testResult.errors.push(`Test crashed: ${error.message}`);
      testResult.passed = false;
      this.results.summary.failed++;
    } finally {
      if (browser) {
        await browser.close();
      }
      
      // Store result
      if (!this.results.testMatrix[browserConfig.name]) {
        this.results.testMatrix[browserConfig.name] = {};
      }
      this.results.testMatrix[browserConfig.name][device.name] = testResult;
      this.results.summary.totalTests++;
    }
  }

  async generateReport() {
    const reportPath = path.join(__dirname, '../../tests/qa/reports/browser-matrix-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    // Also generate markdown report
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = path.join(__dirname, '../../tests/qa/reports/browser-matrix-report.md');
    await fs.writeFile(markdownPath, markdownReport);
    
    console.log(`\n📊 Test Report Generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   Markdown: ${markdownPath}`);
    
    this.printSummary();
  }

  generateMarkdownReport() {
    let md = `# Browser Matrix Test Report\n\n`;
    md += `**Generated:** ${this.results.timestamp}\n\n`;
    
    md += `## Summary\n\n`;
    md += `| Total Tests | Passed | Failed | Skipped |\n`;
    md += `|-------------|--------|--------|---------|\n`;
    md += `| ${this.results.summary.totalTests} | ${this.results.summary.passed} | ${this.results.summary.failed} | ${this.results.summary.skipped} |\n\n`;
    
    md += `## Detailed Results\n\n`;
    
    for (const [browser, devices] of Object.entries(this.results.testMatrix)) {
      md += `### ${browser.toUpperCase()}\n\n`;
      
      for (const [device, result] of Object.entries(devices)) {
        const status = result.passed ? '✅ PASSED' : '❌ FAILED';
        md += `#### ${device.toUpperCase()} - ${status}\n\n`;
        
        if (result.errors.length > 0) {
          md += `**Errors:**\n`;
          result.errors.forEach(error => {
            md += `- ${error}\n`;
          });
          md += `\n`;
        }
        
        md += `**Steps Completed:**\n`;
        result.steps.forEach(step => {
          md += `- ${step}\n`;
        });
        md += `\n`;
      }
    }
    
    if (this.results.bugs.length > 0) {
      md += `## Bugs Found\n\n`;
      this.results.bugs.forEach(bug => {
        md += `- **${bug.title}** (${bug.severity})\n`;
        md += `  ${bug.description}\n\n`;
      });
    }
    
    return md;
  }

  printSummary() {
    console.log(`\n📈 EXECUTION SUMMARY`);
    console.log(`====================`);
    console.log(`Total Tests: ${this.results.summary.totalTests}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Success Rate: ${((this.results.summary.passed / this.results.summary.totalTests) * 100).toFixed(1)}%`);
  }

  addBug(bug) {
    this.results.bugs.push({
      id: `BUG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      ...bug
    });
  }
}

// CLI Interface
async function main() {
  const tester = new BrowserMatrixTester();
  
  try {
    await tester.initialize();
    await tester.runTestSuite();
  } catch (error) {
    console.error('Test suite failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = BrowserMatrixTester;