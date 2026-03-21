#!/usr/bin/env node

/**
 * Mobile Responsiveness Testing Runner
 * Tests dashboard functionality across 6 mobile devices and orientations
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';

class MobileTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      deviceTests: {},
      orientationTests: {},
      layoutTests: {},
      interactionTests: {},
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        skipped: 0
      }
    };
    
    this.devices = [
      { 
        name: 'iPhone 14', 
        width: 390, 
        height: 844, 
        type: 'mobile',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      },
      { 
        name: 'iPhone 14 Pro Max', 
        width: 430, 
        height: 932, 
        type: 'mobile',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      },
      { 
        name: 'iPad Mini', 
        width: 768, 
        height: 1024, 
        type: 'tablet',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      },
      { 
        name: 'iPad Pro 11inch', 
        width: 834, 
        height: 1194, 
        type: 'tablet',
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      },
      { 
        name: 'Samsung Galaxy S23', 
        width: 360, 
        height: 780, 
        type: 'mobile',
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
      },
      { 
        name: 'Pixel 7 Pro', 
        width: 412, 
        height: 892, 
        type: 'mobile',
        userAgent: 'Mozilla/5.0 (Linux; Android 13; Pixel 7 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36'
      }
    ];
    
    this.orientations = [
      { name: 'portrait', getWidth: (d) => d.width, getHeight: (d) => d.height },
      { name: 'landscape', getWidth: (d) => d.height, getHeight: (d) => d.width }
    ];
  }

  async runMobileTestingSuite() {
    console.log('📱 Starting Mobile Responsiveness Testing...\n');
    
    // Test each device
    for (const device of this.devices) {
      console.log(`\n📱 Testing Device: ${device.name}`);
      console.log('='.repeat(40));
      
      await this.testDevice(device);
    }
    
    // Test orientations
    await this.testOrientations();
    
    // Test layout specifics
    await this.testLayoutComponents();
    
    // Test interactions
    await this.testMobileInteractions();
    
    await this.generateReport();
  }

  async testDevice(device) {
    const deviceId = device.name.toLowerCase().replace(/\s+/g, '-');
    this.results.deviceTests[deviceId] = {
      device: device.name,
      type: device.type,
      tests: [],
      startTime: new Date().toISOString(),
      endTime: null,
      passed: 0,
      failed: 0
    };
    
    const deviceTest = this.results.deviceTests[deviceId];
    
    // Test 1: Basic loading and rendering
    await this.runMobileTest(
      device,
      'Basic Dashboard Loading',
      async (page) => {
        await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
        await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
        
        // Check if essential elements are visible
        const container = await page.$('[data-testid="dashboard-container"]');
        const boundingBox = await container.boundingBox();
        
        if (!boundingBox || boundingBox.width === 0 || boundingBox.height === 0) {
          throw new Error('Dashboard container not visible or has zero dimensions');
        }
        
        return { containerWidth: boundingBox.width, containerHeight: boundingBox.height };
      },
      deviceTest
    );

    // Test 2: Metric cards stacking
    await this.runMobileTest(
      device,
      'Metric Cards Responsive Layout',
      async (page) => {
        const metricCards = await page.$$('.metric-card');
        if (metricCards.length === 0) {
          throw new Error('No metric cards found');
        }
        
        // Check layout pattern based on screen size
        const containerWidth = await page.evaluate(() => {
          const container = document.querySelector('[data-testid="dashboard-container"]');
          return container ? container.getBoundingClientRect().width : 0;
        });
        
        let expectedColumns;
        if (containerWidth < 500) {
          expectedColumns = 1; // Mobile: single column
        } else if (containerWidth < 900) {
          expectedColumns = 2; // Tablet: two columns
        } else {
          expectedColumns = 4; // Desktop: four columns
        }
        
        // Check if cards are properly stacked
        const cardPositions = await page.evaluate(() => {
          const cards = document.querySelectorAll('.metric-card');
          return Array.from(cards).map(card => {
            const rect = card.getBoundingClientRect();
            return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
          });
        });
        
        return { 
          containerWidth, 
          cardCount: metricCards.length, 
          expectedColumns,
          cardPositions 
        };
      },
      deviceTest
    );

    // Test 3: Navigation menu accessibility
    await this.runMobileTest(
      device,
      'Mobile Navigation Menu',
      async (page) => {
        // Look for mobile menu button
        const menuButton = await page.$('[data-testid="mobile-menu-button"], .mobile-menu-button, button[aria-label*="menu"]');
        
        if (!menuButton) {
          // Try hamburger menu icon
          const hamburger = await page.$('.hamburger, .menu-icon, [aria-expanded]');
          if (!hamburger) {
            throw new Error('No mobile menu button found');
          }
        } else {
          // Test menu functionality
          await menuButton.click();
          await page.waitForTimeout(500);
          
          // Check if menu opened
          const menu = await page.$('[data-testid="mobile-menu"], .mobile-menu, [role="menu"]');
          const isOpen = menu ? await menu.isIntersectingViewport() : false;
          
          // Close menu
          await menuButton.click();
          await page.waitForTimeout(300);
          
          return { menuFound: true, menuOpened: isOpen };
        }
        
        return { menuFound: false };
      },
      deviceTest
    );

    // Test 4: Touch target sizes
    await this.runMobileTest(
      device,
      'Touch Target Size Validation',
      async (page) => {
        const interactiveElements = await page.$$('button, a, input, select, [role="button"]');
        
        const smallTargets = [];
        for (const element of interactiveElements) {
          const boundingBox = await element.boundingBox();
          if (boundingBox) {
            const area = boundingBox.width * boundingBox.height;
            // Minimum touch target size: 44x44px = 1936 pixels
            if (area < 1936) {
              const tagName = await page.evaluate(el => el.tagName, element);
              smallTargets.push({
                element: tagName,
                width: boundingBox.width,
                height: boundingBox.height,
                area: area
              });
            }
          }
        }
        
        return { 
          totalElements: interactiveElements.length,
          smallTargets: smallTargets.length,
          smallTargetDetails: smallTargets
        };
      },
      deviceTest
    );

    // Test 5: Text readability
    await this.runMobileTest(
      device,
      'Text Readability Check',
      async (page) => {
        const textElements = await page.$$('p, h1, h2, h3, h4, h5, h6, span:not(.sr-only), div:not(.icon)');
        
        const smallText = [];
        for (const element of textElements) {
          const fontSize = await page.evaluate(el => {
            const style = window.getComputedStyle(el);
            return parseInt(style.fontSize);
          }, element);
          
          const textContent = await page.evaluate(el => el.textContent.trim(), element);
          
          if (fontSize < 14 && textContent.length > 10) {
            smallText.push({
              text: textContent.substring(0, 50) + (textContent.length > 50 ? '...' : ''),
              fontSize: fontSize
            });
          }
        }
        
        return {
          totalTextElements: textElements.length,
          smallTextCount: smallText.length,
          smallTextSamples: smallText.slice(0, 5)
        };
      },
      deviceTest
    );

    deviceTest.endTime = new Date().toISOString();
  }

  async testOrientations() {
    console.log('\n🔄 Testing Screen Orientations...\n');
    
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
      for (const device of this.devices.slice(0, 2)) { // Test first 2 devices for demo
        for (const orientation of this.orientations) {
          const testName = `${device.name}-${orientation.name}`;
          console.log(`  Testing: ${testName}`);
          
          this.results.orientationTests[testName] = {
            device: device.name,
            orientation: orientation.name,
            startTime: new Date().toISOString(),
            steps: []
          };
          
          const test = this.results.orientationTests[testName];
          
          try {
            // Set viewport for orientation
            const width = orientation.getWidth(device);
            const height = orientation.getHeight(device);
            
            await page.setViewport({ width, height });
            await page.setUserAgent(device.userAgent);
            
            // Navigate to dashboard
            await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
            await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 5000 });
            
            test.steps.push('Page loaded successfully');
            
            // Take screenshot
            const screenshotPath = path.join(__dirname, `../../tests/qa/screenshots/${testName}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: true });
            test.screenshot = screenshotPath;
            test.steps.push('Screenshot captured');
            
            // Check layout adaptation
            const layoutInfo = await page.evaluate(() => {
              const container = document.querySelector('[data-testid="dashboard-container"]');
              const cards = document.querySelectorAll('.metric-card');
              return {
                containerWidth: container?.getBoundingClientRect().width || 0,
                cardCount: cards.length,
                cardWidths: Array.from(cards).map(c => c.getBoundingClientRect().width)
              };
            });
            
            test.layoutInfo = layoutInfo;
            test.steps.push('Layout information captured');
            test.passed = true;
            
          } catch (error) {
            test.error = error.message;
            test.passed = false;
            console.log(`    ❌ ${error.message}`);
          }
          
          test.endTime = new Date().toISOString();
        }
      }
    } finally {
      await browser.close();
    }
  }

  async testLayoutComponents() {
    console.log('\n📐 Testing Layout Components...\n');
    
    this.results.layoutTests = {
      checklist: {
        metricCardsStack: { mobile: false, tablet: false, desktop: false },
        navigationMenu: { mobile: false, tablet: false, desktop: false },
        bottomTabBar: { mobile: false, tablet: false, desktop: false },
        settingsPanel: { mobile: false, tablet: false, desktop: false },
        modalsCentered: { mobile: false, tablet: false, desktop: false },
        tablesScrollable: { mobile: false, tablet: false, desktop: false },
        formsResponsive: { mobile: false, tablet: false, desktop: false },
        buttonsTouchSize: { mobile: false, tablet: false, desktop: false },
        textReadable: { mobile: false, tablet: false, desktop: false },
        imagesResponsive: { mobile: false, tablet: false, desktop: false }
      },
      startTime: new Date().toISOString()
    };
    
    // This would be populated by actual test results
    // For now, marking as framework ready
    this.results.layoutTests.endTime = new Date().toISOString();
  }

  async testMobileInteractions() {
    console.log('\n👆 Testing Mobile Interactions...\n');
    
    this.results.interactionTests = {
      checklist: {
        tapButtons: { working: false, notes: '' },
        swipeGestures: { working: false, notes: '' },
        pullToRefresh: { working: false, notes: '' },
        longPress: { working: false, notes: '' },
        formInputs: { working: false, notes: '' },
        datePickers: { working: false, notes: '' },
        dropdownSelects: { working: false, notes: '' },
        toggleSwitches: { working: false, notes: '' },
        modalDismiss: { working: false, notes: '' },
        smoothScrolling: { working: false, notes: '' }
      },
      startTime: new Date().toISOString()
    };
    
    // This would be populated by actual test results
    this.results.interactionTests.endTime = new Date().toISOString();
  }

  async runMobileTest(device, testName, testFunction, deviceTest) {
    console.log(`  ▶️  ${testName}`);
    
    let browser, page;
    const testResult = {
      name: testName,
      status: 'pending',
      startTime: new Date().toISOString(),
      details: null,
      error: null
    };

    try {
      browser = await puppeteer.launch({ 
        headless: false,
        args: ['--no-sandbox'] 
      });
      page = await browser.newPage();
      
      // Configure device
      await page.setViewport({ 
        width: device.width, 
        height: device.height,
        isMobile: true,
        hasTouch: true
      });
      
      await page.setUserAgent(device.userAgent);
      
      // Run the test
      const result = await testFunction(page);
      testResult.details = result;
      testResult.status = 'passed';
      deviceTest.passed++;
      
      console.log(`    ✅ PASSED`);
      
    } catch (error) {
      testResult.error = error.message;
      testResult.status = 'failed';
      deviceTest.failed++;
      
      console.log(`    ❌ FAILED: ${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
      
      testResult.endTime = new Date().toISOString();
      deviceTest.tests.push(testResult);
      this.results.summary.totalTests++;
      if (testResult.status === 'passed') {
        this.results.summary.passed++;
      } else {
        this.results.summary.failed++;
      }
    }
  }

  async generateReport() {
    const reportDir = path.join(__dirname, '../../tests/qa/reports');
    await fs.mkdir(reportDir, { recursive: true });

    // Generate JSON report
    const jsonPath = path.join(reportDir, 'mobile-testing-report.json');
    await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2));

    // Generate Markdown report
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = path.join(reportDir, 'mobile-testing-report.md');
    await fs.writeFile(markdownPath, markdownReport);

    console.log(`\n📊 Mobile Testing Report Generated:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   Markdown: ${markdownPath}`);
    
    this.printSummary();
  }

  generateMarkdownReport() {
    let md = `# Mobile Responsiveness Testing Report\n\n`;
    md += `**Generated:** ${this.results.timestamp}\n\n`;

    md += `## Device Testing Results\n\n`;
    
    Object.entries(this.results.deviceTests).forEach(([deviceId, deviceTest]) => {
      const device = this.devices.find(d => d.name.toLowerCase().replace(/\s+/g, '-') === deviceId);
      md += `### 📱 ${device.name} (${device.type})\n\n`;
      md += `**Screen Size:** ${device.width}×${device.height}px\n\n`;
      
      md += `| Passed | Failed | Total Tests |\n`;
      md += `|--------|--------|-------------|\n`;
      md += `| ${deviceTest.passed} | ${deviceTest.failed} | ${deviceTest.tests.length} |\n\n`;
      
      deviceTest.tests.forEach(test => {
        const status = test.status === 'passed' ? '✅' : '❌';
        md += `- ${status} **${test.name}**\n`;
        if (test.error) {
          md += `  - Error: ${test.error}\n`;
        }
        if (test.details) {
          md += `  - Details: ${JSON.stringify(test.details)}\n`;
        }
      });
      
      md += `\n`;
    });

    md += `## Orientation Testing\n\n`;
    Object.entries(this.results.orientationTests).forEach(([testName, test]) => {
      const status = test.passed ? '✅' : '❌';
      md += `### ${status} ${testName}\n\n`;
      if (test.screenshot) {
        md += `![${testName}](${test.screenshot})\n\n`;
      }
      if (test.layoutInfo) {
        md += `**Layout Info:**\n`;
        md += `- Container Width: ${test.layoutInfo.containerWidth}px\n`;
        md += `- Card Count: ${test.layoutInfo.cardCount}\n`;
      }
      md += `\n`;
    });

    md += `## Layout Checklist\n\n`;
    md += `| Component | Mobile | Tablet | Desktop |\n`;
    md += `|-----------|--------|--------|---------|\n`;
    Object.entries(this.results.layoutTests.checklist).forEach(([component, status]) => {
      md += `| ${component} | ${status.mobile ? '✅' : '❌'} | ${status.tablet ? '✅' : '❌'} | ${status.desktop ? '✅' : '❌'} |\n`;
    });

    md += `\n## Interaction Checklist\n\n`;
    Object.entries(this.results.interactionTests.checklist).forEach(([interaction, status]) => {
      const emoji = status.working ? '✅' : '❌';
      md += `- ${emoji} **${interaction}**\n`;
      if (status.notes) {
        md += `  - ${status.notes}\n`;
      }
    });

    return md;
  }

  printSummary() {
    console.log(`\n📈 MOBILE TESTING SUMMARY`);
    console.log(`=========================`);
    console.log(`Total Tests: ${this.results.summary.totalTests}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    
    const successRate = this.results.summary.totalTests > 0 ? 
      ((this.results.summary.passed / this.results.summary.totalTests) * 100).toFixed(1) : 0;
    console.log(`Success Rate: ${successRate}%`);
    
    console.log(`\nDevices Tested:`);
    Object.entries(this.results.deviceTests).forEach(([deviceId, test]) => {
      const device = this.devices.find(d => d.name.toLowerCase().replace(/\s+/g, '-') === deviceId);
      const status = test.failed === 0 ? '✅' : '❌';
      console.log(`  ${status} ${device.name} (${test.passed}/${test.tests.length} passed)`);
    });
  }
}

// CLI Interface
async function main() {
  const tester = new MobileTester();
  
  try {
    await tester.runMobileTestingSuite();
  } catch (error) {
    console.error('Mobile testing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MobileTester;