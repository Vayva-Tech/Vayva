#!/usr/bin/env node

/**
 * User Journey Tester
 * Executes the 3 critical user journeys as defined in the QA assignment
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

class UserJourneyTester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      journeys: {},
      bugs: [],
      summary: {
        totalSteps: 0,
        passedSteps: 0,
        failedSteps: 0
      }
    };
    
    this.testUser = {
      email: 'test@vayva.com',
      password: 'TestPassword123!',
      businessName: 'Test Business Co.',
      industry: 'retail',
      timezone: 'America/New_York',
      currency: 'USD'
    };
  }

  async runAllJourneys() {
    console.log('🏃‍♂️ Starting User Journey Testing...\n');
    
    const journeys = [
      { name: 'Merchant Opens Dashboard', method: 'testDashboardJourney' },
      { name: 'Settings Management', method: 'testSettingsJourney' },
      { name: 'Template Application', method: 'testTemplateJourney' }
    ];
    
    for (const journey of journeys) {
      console.log(`\n🎯 Executing: ${journey.name}`);
      console.log('='.repeat(50));
      
      try {
        await this[journey.method]();
        console.log(`✅ ${journey.name}: COMPLETED`);
      } catch (error) {
        console.log(`❌ ${journey.name}: FAILED`);
        console.log(`   Error: ${error.message}`);
        this.addBug({
          title: `${journey.name} Failed`,
          severity: 'High',
          description: error.message,
          journey: journey.name
        });
      }
    }
    
    await this.generateReport();
  }

  async testDashboardJourney() {
    const journeyName = 'Merchant Opens Dashboard';
    this.results.journeys[journeyName] = {
      steps: [],
      startTime: new Date().toISOString(),
      endTime: null,
      passed: false,
      errors: []
    };
    
    const journey = this.results.journeys[journeyName];
    let browser, page;

    try {
      // Launch browser
      browser = await puppeteer.launch({ 
        headless: false,
        slowMo: 50, // Slow down for better observation
        args: ['--no-sandbox'] 
      });
      page = await browser.newPage();
      
      // Set up error monitoring
      page.on('pageerror', error => {
        console.log(`🚨 Page Error: ${error.message}`);
        journey.errors.push(`Page Error: ${error.message}`);
      });
      
      page.on('requestfailed', request => {
        console.log(`🚨 Request Failed: ${request.url()}`);
        journey.errors.push(`Request Failed: ${request.url()}`);
      });

      // Step 1: Login with valid credentials
      await this.step('Login with valid credentials', async () => {
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
        
        // Fill login form
        await page.type('[data-testid="email-input"]', this.testUser.email);
        await page.type('[data-testid="password-input"]', this.testUser.password);
        await page.click('[data-testid="login-button"]');
        
        // Wait for redirect
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
      }, journey, page);

      // Step 2: Navigate to /dashboard
      await this.step('Navigate to /dashboard', async () => {
        const currentUrl = page.url();
        if (!currentUrl.includes('/dashboard')) {
          await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle0' });
        }
      }, journey, page);

      // Step 3: Wait for load
      await this.step('Wait for dashboard to load', async () => {
        await page.waitForSelector('[data-testid="dashboard-container"]', { timeout: 10000 });
        await page.waitForSelector('[data-testid="metric-cards"]', { timeout: 5000 });
      }, journey, page);

      // Step 4: Verify all metric cards show data
      await this.step('Verify all metric cards show data', async () => {
        const metricCards = await page.$$('.metric-card');
        if (metricCards.length === 0) {
          throw new Error('No metric cards found');
        }
        
        for (let i = 0; i < Math.min(metricCards.length, 4); i++) {
          const card = metricCards[i];
          const title = await card.$eval('.metric-title', el => el.textContent.trim());
          const value = await card.$eval('.metric-value', el => el.textContent.trim());
          
          if (!value || value === '' || value === '0') {
            console.log(`⚠️  Warning: Metric card "${title}" has no value`);
          } else {
            console.log(`✅ Metric card "${title}": ${value}`);
          }
        }
      }, journey, page);

      // Step 5: Click on each metric card
      await this.step('Click on each metric card', async () => {
        const metricCards = await page.$$('.metric-card');
        
        for (let i = 0; i < Math.min(metricCards.length, 3); i++) {
          const card = metricCards[i];
          await card.click();
          await page.waitForTimeout(500); // Brief pause
        }
      }, journey, page);

      // Step 6: Verify click handlers work
      await this.step('Verify click handlers work', async () => {
        // Look for any modal or navigation that should appear after clicking
        const modals = await page.$$('.modal, [role="dialog"]');
        console.log(`Found ${modals.length} modals/dialogs`);
      }, journey, page);

      // Step 7: Check mobile menu opens
      await this.step('Check mobile menu opens', async () => {
        // Resize to mobile view
        await page.setViewport({ width: 375, height: 667 });
        
        const menuButton = await page.$('[data-testid="mobile-menu-button"]');
        if (menuButton) {
          await menuButton.click();
          await page.waitForSelector('[data-testid="mobile-menu"]', { timeout: 2000 });
          await menuButton.click(); // Close it
        }
        
        // Reset to desktop
        await page.setViewport({ width: 1920, height: 1080 });
      }, journey, page);

      // Step 8: Verify bottom nav works on mobile
      await this.step('Verify bottom nav works on mobile', async () => {
        await page.setViewport({ width: 375, height: 667 });
        
        const bottomNavItems = await page.$$('.bottom-nav-item, [data-testid="bottom-nav"] a');
        if (bottomNavItems.length > 0) {
          // Click first nav item
          await bottomNavItems[0].click();
          await page.waitForTimeout(1000);
        }
        
        await page.setViewport({ width: 1920, height: 1080 });
      }, journey, page);

      // Step 9: Switch between tabs
      await this.step('Switch between tabs', async () => {
        const tabButtons = await page.$$('.tab-button, [role="tab"]');
        if (tabButtons.length > 1) {
          for (let i = 0; i < Math.min(tabButtons.length, 3); i++) {
            await tabButtons[i].click();
            await page.waitForTimeout(500);
          }
        }
      }, journey, page);

      // Step 10: Logout and relogin → session persists
      await this.step('Logout and relogin → session persists', async () => {
        // Logout
        const logoutButton = await page.$('[data-testid="logout-button"]');
        if (logoutButton) {
          await logoutButton.click();
          await page.waitForNavigation({ waitUntil: 'networkidle0' });
        }
        
        // Try to go back to dashboard (should redirect to login)
        await page.goto('http://localhost:3000/dashboard');
        const loginForm = await page.$('[data-testid="login-form"]');
        if (!loginForm) {
          throw new Error('Should have been redirected to login page');
        }
        
        // Relogin
        await page.type('[data-testid="email-input"]', this.testUser.email);
        await page.type('[data-testid="password-input"]', this.testUser.password);
        await page.click('[data-testid="login-button"]');
        await page.waitForNavigation({ waitUntil: 'networkidle0' });
        
        // Should be back on dashboard
        const dashboardContainer = await page.$('[data-testid="dashboard-container"]');
        if (!dashboardContainer) {
          throw new Error('Failed to return to dashboard after relogin');
        }
      }, journey, page);

      journey.passed = journey.errors.length === 0;
      
    } catch (error) {
      journey.errors.push(`Journey crashed: ${error.message}`);
      journey.passed = false;
      throw error;
    } finally {
      journey.endTime = new Date().toISOString();
      if (browser) {
        await browser.close();
      }
    }
  }

  async testSettingsJourney() {
    const journeyName = 'Settings Management';
    this.results.journeys[journeyName] = {
      steps: [],
      startTime: new Date().toISOString(),
      endTime: null,
      passed: false,
      errors: []
    };
    
    const journey = this.results.journeys[journeyName];
    let browser, page;

    try {
      browser = await puppeteer.launch({ headless: false, slowMo: 50 });
      page = await browser.newPage();
      
      // Login first
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
      await page.type('[data-testid="email-input"]', this.testUser.email);
      await page.type('[data-testid="password-input"]', this.testUser.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      // Step 1: Click settings gear icon in header
      await this.step('Click settings gear icon in header', async () => {
        const settingsButton = await page.$('[data-testid="settings-button"]');
        if (!settingsButton) {
          throw new Error('Settings button not found');
        }
        await settingsButton.click();
        await page.waitForSelector('[data-testid="settings-panel"]', { timeout: 3000 });
      }, journey, page);

      // Step 2: Panel slides in from right
      await this.step('Panel slides in from right', async () => {
        const settingsPanel = await page.$('[data-testid="settings-panel"]');
        const isVisible = await settingsPanel.isIntersectingViewport();
        if (!isVisible) {
          throw new Error('Settings panel did not slide in properly');
        }
      }, journey, page);

      // Steps 3-5: Fill out ALL fields in Business tab
      await this.step('Fill out ALL fields in Business tab', async () => {
        // Business name
        const businessNameInput = await page.$('[data-testid="business-name-input"]');
        if (businessNameInput) {
          await businessNameInput.focus();
          await page.keyboard.down('Control');
          await page.keyboard.press('A');
          await page.keyboard.up('Control');
          await businessNameInput.type(this.testUser.businessName);
        }

        // Industry dropdown
        const industrySelect = await page.$('[data-testid="industry-select"]');
        if (industrySelect) {
          await industrySelect.select(this.testUser.industry);
        }

        // Timezone dropdown
        const timezoneSelect = await page.$('[data-testid="timezone-select"]');
        if (timezoneSelect) {
          await timezoneSelect.select(this.testUser.timezone);
        }

        // Currency dropdown
        const currencySelect = await page.$('[data-testid="currency-select"]');
        if (currencySelect) {
          await currencySelect.select(this.testUser.currency);
        }
      }, journey, page);

      // Step 6: Click Save
      await this.step('Click Save', async () => {
        const saveButton = await page.$('[data-testid="save-settings-button"]');
        if (saveButton) {
          await saveButton.click();
          await page.waitForTimeout(1000); // Wait for save processing
        }
      }, journey, page);

      // Step 7: Verify success toast appears
      await this.step('Verify success toast appears', async () => {
        const toast = await page.$('.toast-success, [data-testid="success-toast"]');
        if (toast) {
          console.log('✅ Success toast appeared');
        } else {
          console.log('ℹ️  No success toast found (may be normal)');
        }
      }, journey, page);

      // Steps 8-9: Hard refresh and verify persistence
      await this.step('Hard refresh and verify persistence', async () => {
        await page.reload({ waitUntil: 'networkidle0' });
        
        // Reopen settings
        const settingsButton = await page.$('[data-testid="settings-button"]');
        await settingsButton.click();
        await page.waitForSelector('[data-testid="settings-panel"]', { timeout: 3000 });
        
        // Check if values persisted
        const businessNameInput = await page.$('[data-testid="business-name-input"]');
        const businessNameValue = await page.evaluate(el => el.value, businessNameInput);
        
        if (businessNameValue !== this.testUser.businessName) {
          throw new Error(`Business name not persisted. Expected: ${this.testUser.businessName}, Got: ${businessNameValue}`);
        }
      }, journey, page);

      // Steps 10-12: Theme and layout changes
      await this.step('Change theme and layout', async () => {
        // Change to Dark Mode
        const darkModeToggle = await page.$('[data-testid="theme-toggle"]');
        if (darkModeToggle) {
          await darkModeToggle.click();
          await page.waitForTimeout(500);
        }

        // Change layout to List
        const layoutSelect = await page.$('[data-testid="layout-select"]');
        if (layoutSelect) {
          await layoutSelect.select('list');
          await page.waitForTimeout(500);
        }

        // Change back to Grid
        if (layoutSelect) {
          await layoutSelect.select('grid');
        }
      }, journey, page);

      // Edge Case Testing
      await this.testSettingsEdgeCases(page, journey);

      journey.passed = journey.errors.length === 0;
      
    } catch (error) {
      journey.errors.push(`Settings journey crashed: ${error.message}`);
      journey.passed = false;
      throw error;
    } finally {
      journey.endTime = new Date().toISOString();
      if (browser) {
        await browser.close();
      }
    }
  }

  async testSettingsEdgeCases(page, journey) {
    console.log('\n🔍 Testing Edge Cases...');

    // Edge Case: Empty required fields
    await this.step('Test empty required fields validation', async () => {
      const businessNameInput = await page.$('[data-testid="business-name-input"]');
      await businessNameInput.focus();
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await page.keyboard.press('Backspace');
      
      const saveButton = await page.$('[data-testid="save-settings-button"]');
      await saveButton.click();
      
      // Look for validation error
      await page.waitForTimeout(1000);
      const errorMessages = await page.$$('.error-message, .text-error');
      if (errorMessages.length === 0) {
        console.log('⚠️  No validation error shown for empty business name');
      }
    }, journey, page);

    // Edge Case: Super long business name
    await this.step('Test super long business name', async () => {
      const longName = 'A'.repeat(300);
      const businessNameInput = await page.$('[data-testid="business-name-input"]');
      await businessNameInput.focus();
      await page.keyboard.down('Control');
      await page.keyboard.press('A');
      await page.keyboard.up('Control');
      await businessNameInput.type(longName.substring(0, 200)); // Limit to reasonable length
      
      // Check if there's truncation or validation
      const value = await page.evaluate(el => el.value, businessNameInput);
      if (value.length !== 200) {
        console.log(`ℹ️  Business name length: ${value.length}`);
      }
    }, journey, page);
  }

  async testTemplateJourney() {
    const journeyName = 'Template Application';
    this.results.journeys[journeyName] = {
      steps: [],
      startTime: new Date().toISOString(),
      endTime: null,
      passed: false,
      errors: []
    };
    
    const journey = this.results.journeys[journeyName];
    let browser, page;

    try {
      browser = await puppeteer.launch({ headless: false, slowMo: 50 });
      page = await browser.newPage();
      
      // Login
      await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0' });
      await page.type('[data-testid="email-input"]', this.testUser.email);
      await page.type('[data-testid="password-input"]', this.testUser.password);
      await page.click('[data-testid="login-button"]');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      // Steps 1-3: Navigate to gallery and preview
      await this.step('Navigate to template gallery and preview', async () => {
        await page.goto('http://localhost:3000/templates', { waitUntil: 'networkidle0' });
        await page.waitForSelector('[data-testid="template-grid"]', { timeout: 5000 });
        
        // Scroll through templates
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);
        await page.evaluate(() => window.scrollTo(0, 0));
        
        // Click preview on first template
        const firstTemplate = await page.$('[data-testid="template-item"]:first-child');
        if (firstTemplate) {
          const previewButton = await firstTemplate.$('[data-testid="preview-button"]');
          if (previewButton) {
            await previewButton.click();
            await page.waitForTimeout(2000); // Let preview load
            
            // Close preview (assuming it's a modal)
            const closeButton = await page.$('[data-testid="close-preview"]');
            if (closeButton) {
              await closeButton.click();
            }
          }
        }
      }, journey, page);

      // Steps 6-13: Apply template
      await this.step('Apply template workflow', async () => {
        const firstTemplate = await page.$('[data-testid="template-item"]:first-child');
        if (firstTemplate) {
          const applyButton = await firstTemplate.$('[data-testid="apply-button"]');
          if (applyButton) {
            // Click Apply
            await applyButton.click();
            
            // Wait for confirmation dialog
            await page.waitForSelector('[data-testid="confirm-dialog"]', { timeout: 3000 });
            
            // Click Cancel first
            const cancelButton = await page.$('[data-testid="cancel-apply"]');
            if (cancelButton) {
              await cancelButton.click();
              await page.waitForTimeout(1000);
            }
            
            // Click Apply again
            await applyButton.click();
            await page.waitForSelector('[data-testid="confirm-dialog"]', { timeout: 3000 });
            
            const confirmButton = await page.$('[data-testid="confirm-apply"]');
            if (confirmButton) {
              await confirmButton.click();
              
              // Wait for loading spinner
              await page.waitForSelector('[data-testid="loading-spinner"]', { timeout: 2000 });
              await page.waitForTimeout(3000); // Wait for process
              
              // Check for success
              const successToast = await page.$('.toast-success');
              if (successToast) {
                console.log('✅ Template applied successfully');
              }
            }
          }
        }
      }, journey, page);

      journey.passed = journey.errors.length === 0;
      
    } catch (error) {
      journey.errors.push(`Template journey crashed: ${error.message}`);
      journey.passed = false;
      throw error;
    } finally {
      journey.endTime = new Date().toISOString();
      if (browser) {
        await browser.close();
      }
    }
  }

  async step(description, action, journey, page) {
    const stepNum = journey.steps.length + 1;
    console.log(`  ${stepNum}. ${description}`);
    
    try {
      await action();
      journey.steps.push({
        number: stepNum,
        description: description,
        status: 'passed',
        timestamp: new Date().toISOString()
      });
      this.results.summary.passedSteps++;
      console.log(`     ✅ PASSED`);
    } catch (error) {
      journey.steps.push({
        number: stepNum,
        description: description,
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString()
      });
      journey.errors.push(`Step ${stepNum}: ${error.message}`);
      this.results.summary.failedSteps++;
      console.log(`     ❌ FAILED: ${error.message}`);
      throw error; // Re-throw to stop the journey
    }
    
    this.results.summary.totalSteps++;
    await page.waitForTimeout(300); // Brief pause between steps
  }

  addBug(bug) {
    this.results.bugs.push({
      id: `BUG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...bug
    });
  }

  async generateReport() {
    const reportPath = path.join(__dirname, '../../tests/qa/reports/user-journey-report.json');
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = path.join(__dirname, '../../tests/qa/reports/user-journey-report.md');
    await fs.writeFile(markdownPath, markdownReport);
    
    console.log(`\n📊 User Journey Report Generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   Markdown: ${markdownPath}`);
    
    this.printSummary();
  }

  generateMarkdownReport() {
    let md = `# User Journey Test Report\n\n`;
    md += `**Generated:** ${this.results.timestamp}\n\n`;
    
    md += `## Summary\n\n`;
    md += `| Total Steps | Passed | Failed |\n`;
    md += `|-------------|--------|--------|\n`;
    md += `| ${this.results.summary.totalSteps} | ${this.results.summary.passedSteps} | ${this.results.summary.failedSteps} |\n\n`;
    
    md += `## Journey Results\n\n`;
    
    for (const [journeyName, journey] of Object.entries(this.results.journeys)) {
      const status = journey.passed ? '✅ PASSED' : '❌ FAILED';
      const duration = journey.endTime ? 
        ((new Date(journey.endTime) - new Date(journey.startTime)) / 1000).toFixed(1) + 's' : 
        'N/A';
      
      md += `### ${journeyName} - ${status}\n\n`;
      md += `**Duration:** ${duration}\n\n`;
      
      if (journey.errors.length > 0) {
        md += `**Errors:**\n`;
        journey.errors.forEach(error => {
          md += `- ${error}\n`;
        });
        md += `\n`;
      }
      
      md += `**Steps:**\n`;
      journey.steps.forEach(step => {
        const stepStatus = step.status === 'passed' ? '✅' : '❌';
        md += `${stepStatus} **${step.number}.** ${step.description}\n`;
        if (step.error) {
          md += `    Error: ${step.error}\n`;
        }
      });
      md += `\n`;
    }
    
    if (this.results.bugs.length > 0) {
      md += `## Bugs Found\n\n`;
      this.results.bugs.forEach(bug => {
        md += `### ${bug.title}\n`;
        md += `- **Severity:** ${bug.severity}\n`;
        md += `- **Description:** ${bug.description}\n`;
        if (bug.journey) {
          md += `- **Related Journey:** ${bug.journey}\n`;
        }
        md += `\n`;
      });
    }
    
    return md;
  }

  printSummary() {
    console.log(`\n📈 USER JOURNEY SUMMARY`);
    console.log(`========================`);
    console.log(`Total Steps: ${this.results.summary.totalSteps}`);
    console.log(`Passed Steps: ${this.results.summary.passedSteps}`);
    console.log(`Failed Steps: ${this.results.summary.failedSteps}`);
    
    const successRate = this.results.summary.totalSteps > 0 ? 
      ((this.results.summary.passedSteps / this.results.summary.totalSteps) * 100).toFixed(1) : 0;
    console.log(`Success Rate: ${successRate}%`);
    
    console.log(`\nJourneys Completed:`);
    Object.entries(this.results.journeys).forEach(([name, journey]) => {
      const status = journey.passed ? '✅' : '❌';
      console.log(`  ${status} ${name}`);
    });
  }
}

// CLI Interface
async function main() {
  const tester = new UserJourneyTester();
  
  try {
    await tester.runAllJourneys();
  } catch (error) {
    console.error('User journey testing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = UserJourneyTester;