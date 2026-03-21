#!/usr/bin/env node

/**
 * Master QA Test Runner
 * Orchestrates all 5 sprints of the QA testing assignment
 */

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

class MasterQATester {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      sprints: {},
      overallSummary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        bugsFound: 0,
        totalTime: 0
      }
    };
    this.startTime = Date.now();
  }

  async runFullTestSuite() {
    console.log('🏁 STARTING FULL QA TEST SUITE');
    console.log('================================');
    console.log('Executing all 5 sprints as defined in TEAM_ASSIGNMENT_QA_ENGINEER_TESTING.md\n');

    const sprints = [
      { 
        id: 'sprint1', 
        name: 'Dashboard Functionality Testing',
        runner: './tests/qa/runners/browser-matrix-tester.js',
        journeyRunner: './tests/qa/runners/user-journey-tester.js'
      },
      { 
        id: 'sprint2', 
        name: 'API Endpoint Testing',
        runner: './tests/qa/runners/api-testing-runner.js'
      },
      { 
        id: 'sprint3', 
        name: 'Mobile Responsiveness Testing',
        runner: './tests/qa/runners/mobile-testing-runner.js'
      },
      { 
        id: 'sprint4', 
        name: 'Edge Cases & Error Handling',
        runner: './tests/qa/runners/edge-case-tester.js'
      },
      { 
        id: 'sprint5', 
        name: 'Performance & Accessibility Testing',
        runner: './tests/qa/runners/performance-a11y-tester.js'
      }
    ];

    for (const [index, sprint] of sprints.entries()) {
      const sprintNum = index + 1;
      console.log(`\n📍 EXECUTING SPRINT ${sprintNum}: ${sprint.name}`);
      console.log('--------------------------------------------------');
      
      const sprintStartTime = Date.now();
      
      try {
        await this.executeSprint(sprint);
        const sprintTime = Date.now() - sprintStartTime;
        console.log(`✅ Sprint ${sprintNum} completed in ${(sprintTime/1000).toFixed(1)} seconds`);
      } catch (error) {
        console.log(`❌ Sprint ${sprintNum} failed: ${error.message}`);
        this.results.sprints[sprint.id] = {
          status: 'failed',
          error: error.message,
          duration: Date.now() - sprintStartTime
        };
      }
    }

    this.results.overallSummary.totalTime = Date.now() - this.startTime;
    await this.generateFinalReport();
    this.printFinalSummary();
  }

  async executeSprint(sprint) {
    const sprintResults = {
      status: 'running',
      startTime: new Date().toISOString(),
      tests: [],
      bugs: []
    };

    try {
      // Execute main sprint runner
      if (await this.fileExists(sprint.runner)) {
        console.log(`  ▶️  Running: ${path.basename(sprint.runner)}`);
        const testResult = await this.runTestScript(sprint.runner);
        sprintResults.tests.push(testResult);
      }

      // Execute additional runners if they exist
      if (sprint.journeyRunner && await this.fileExists(sprint.journeyRunner)) {
        console.log(`  ▶️  Running: ${path.basename(sprint.journeyRunner)}`);
        const journeyResult = await this.runTestScript(sprint.journeyRunner);
        sprintResults.tests.push(journeyResult);
      }

      sprintResults.status = 'completed';
      sprintResults.endTime = new Date().toISOString();
      sprintResults.duration = new Date(sprintResults.endTime) - new Date(sprintResults.startTime);

    } catch (error) {
      sprintResults.status = 'failed';
      sprintResults.error = error.message;
      sprintResults.endTime = new Date().toISOString();
      throw error;
    } finally {
      this.results.sprints[sprint.id] = sprintResults;
    }
  }

  async runTestScript(scriptPath) {
    return new Promise((resolve, reject) => {
      console.log(`    Executing ${scriptPath}...`);
      
      const child = spawn('node', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        cwd: process.cwd()
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data) => {
        stdout += data.toString();
        // Echo output in real-time
        process.stdout.write(data.toString());
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data.toString());
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve({
            script: scriptPath,
            status: 'passed',
            stdout: stdout,
            stderr: stderr,
            exitCode: code
          });
        } else {
          reject(new Error(`Script failed with exit code ${code}: ${stderr}`));
        }
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to start script: ${error.message}`));
      });
    });
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async generateFinalReport() {
    const reportDir = path.join(__dirname, '../../tests/qa/reports');
    
    // Ensure reports directory exists
    await fs.mkdir(reportDir, { recursive: true });

    // Generate JSON report
    const jsonReportPath = path.join(reportDir, 'qa-full-test-report.json');
    await fs.writeFile(jsonReportPath, JSON.stringify(this.results, null, 2));

    // Generate Markdown executive summary
    const markdownReport = this.generateExecutiveSummary();
    const markdownPath = path.join(reportDir, 'qa-executive-summary.md');
    await fs.writeFile(markdownPath, markdownReport);

    // Generate deliverables checklist
    const checklist = this.generateDeliverablesChecklist();
    const checklistPath = path.join(reportDir, 'deliverables-checklist.md');
    await fs.writeFile(checklistPath, checklist);

    console.log(`\n📋 FINAL REPORTS GENERATED:`);
    console.log(`   Executive Summary: ${markdownPath}`);
    console.log(`   Full JSON Report: ${jsonReportPath}`);
    console.log(`   Deliverables Checklist: ${checklistPath}`);
  }

  generateExecutiveSummary() {
    let md = `# QA Testing Executive Summary\n\n`;
    md += `**Test Execution Period:** 24 Hours Crisis Mode\n`;
    md += `**Completion Time:** ${this.results.timestamp}\n`;
    md += `**Total Duration:** ${(this.results.overallSummary.totalTime/1000/60/60).toFixed(1)} hours\n\n`;

    md += `## Overall Results\n\n`;
    md += `| Metric | Value |\n`;
    md += `|--------|-------|\n`;
    md += `| Total Tests Executed | ${this.results.overallSummary.totalTests} |\n`;
    md += `| Tests Passed | ${this.results.overallSummary.passed} |\n`;
    md += `| Tests Failed | ${this.results.overallSummary.failed} |\n`;
    md += `| Success Rate | ${this.results.overallSummary.totalTests > 0 ? ((this.results.overallSummary.passed / this.results.overallSummary.totalTests) * 100).toFixed(1) : 0}% |\n`;
    md += `| Bugs Found | ${this.results.overallSummary.bugsFound} |\n\n`;

    md += `## Sprint-by-Sprint Breakdown\n\n`;

    const sprintNames = {
      'sprint1': 'Dashboard Functionality',
      'sprint2': 'API Endpoint Testing',
      'sprint3': 'Mobile Responsiveness',
      'sprint4': 'Edge Cases & Error Handling',
      'sprint5': 'Performance & Accessibility'
    };

    Object.entries(this.results.sprints).forEach(([sprintId, sprint]) => {
      const statusEmoji = sprint.status === 'completed' ? '✅' : 
                         sprint.status === 'failed' ? '❌' : '⏳';
      const duration = sprint.duration ? (sprint.duration/1000).toFixed(1) + 's' : 'N/A';
      
      md += `### ${statusEmoji} Sprint ${sprintId.replace('sprint', '')}: ${sprintNames[sprintId]}\n`;
      md += `**Status:** ${sprint.status}\n`;
      md += `**Duration:** ${duration}\n`;
      
      if (sprint.error) {
        md += `**Error:** ${sprint.error}\n`;
      }
      
      if (sprint.tests && sprint.tests.length > 0) {
        md += `**Tests Executed:** ${sprint.tests.length}\n`;
      }
      
      md += `\n`;
    });

    md += `## Critical Findings\n\n`;
    
    // Check for critical bugs
    const bugReportPath = path.join(__dirname, '../../tests/qa/reports/bugs-report.json');
    try {
      const bugData = JSON.parse(await fs.readFile(bugReportPath, 'utf8'));
      const criticalBugs = bugData.bugs.filter(bug => bug.severity === 'Critical');
      
      if (criticalBugs.length > 0) {
        md += `### 🚨 Critical Issues Found\n\n`;
        criticalBugs.forEach(bug => {
          md += `- **${bug.id}**: ${bug.title}\n`;
          md += `  - Priority: ${bug.priority}\n`;
          md += `  - Status: ${bug.status}\n\n`;
        });
      } else {
        md += `✅ No critical bugs found during testing.\n\n`;
      }
    } catch (error) {
      md += `ℹ️ Bug report not available.\n\n`;
    }

    md += `## Recommendations\n\n`;
    md += `1. **Immediate Action Items:**\n`;
    md += `   - Address all P0 and P1 priority bugs before production release\n`;
    md += `   - Verify fixes with regression testing\n\n`;
    
    md += `2. **Quality Improvements:**\n`;
    md += `   - Implement automated testing in CI/CD pipeline\n`;
    md += `   - Add performance monitoring for API endpoints\n`;
    md += `   - Enhance error handling and user feedback\n\n`;
    
    md += `3. **Process Improvements:**\n`;
    md += `   - Establish regular QA testing schedule\n`;
    md += `   - Create bug bounty program for security testing\n`;
    md += `   - Implement accessibility testing automation\n\n`;

    return md;
  }

  generateDeliverablesChecklist() {
    const checklist = `
# QA Testing Deliverables Checklist

**Project:** VAYVA Platform QA Testing
**Based on:** TEAM_ASSIGNMENT_QA_ENGINEER_TESTING.md
**Status:** [ ] In Progress / [X] Complete

## 📋 REQUIRED DELIVERABLES

### Phase 1: Dashboard Testing (Hours 0-4)
- [ ] Test on 4 browsers × 3 devices = 12 combinations
- [ ] Complete 3 critical user journeys:
  - [ ] Merchant Opens Dashboard
  - [ ] Settings Management  
  - [ ] Template Application
- [ ] Document all bugs found with severity ratings
- [ ] Record Loom video of major issues

### Phase 2: API Testing (Hours 4-8)
- [ ] Load test dashboard API (autocannon/k6)
- [ ] Test API key CRUD operations
- [ ] Verify rate limiting works correctly
- [ ] Document response times and performance metrics

### Phase 3: Mobile Testing (Hours 8-11)
- [ ] Test on 6 different devices:
  - [ ] iPhone 14 (390x844)
  - [ ] iPhone 14 Pro Max (430x932)
  - [ ] iPad Mini (768x1024)
  - [ ] iPad Pro 11" (834x1194)
  - [ ] Samsung Galaxy S23 (360x780)
  - [ ] Pixel 7 Pro (412x892)
- [ ] Complete layout checklist
- [ ] Complete interaction checklist
- [ ] Test portrait + landscape orientations

### Phase 4: Edge Cases (Hours 11-14)
- [ ] Test offline mode functionality
- [ ] Test form validation edge cases
- [ ] Test permission gating for user tiers:
  - [ ] Free tier limitations
  - [ ] Pro tier features
  - [ ] Enterprise tier capabilities
- [ ] Test error handling scenarios

### Phase 5: Performance/A11y (Hours 14-17)
- [ ] Run Lighthouse audits on key pages:
  - [ ] Dashboard page
  - [ ] Settings page
  - [ ] Template gallery
- [ ] Test keyboard navigation compliance
- [ ] Test screen reader compatibility
- [ ] Verify color contrast meets WCAG standards

## 📊 TESTING ARTIFACTS

### Generated Reports
- [ ] Browser Matrix Report (JSON & Markdown)
- [ ] User Journey Test Report (JSON & Markdown)
- [ ] API Performance Report
- [ ] Mobile Testing Report
- [ ] Bug Report with Severity Ratings
- [ ] Executive Summary
- [ ] Deliverables Checklist (this document)

### Supporting Materials
- [ ] Test Screenshots Directory
- [ ] Test Videos/Loom Recordings
- [ ] Console Error Logs
- [ ] Network Performance Data
- [ ] Accessibility Audit Results

## ✅ COMPLETION CRITERIA

**SUCCESS METRICS:**
- [ ] Zero critical bugs in production-ready state
- [ ] Lighthouse scores ≥ 90 for Performance
- [ ] Lighthouse scores ≥ 95 for Accessibility
- [ ] All user journeys documented and tested
- [ ] Mobile responsive across all target devices
- [ ] API responds in <500ms under load
- [ ] Keyboard navigation works perfectly
- [ ] Screen reader compatibility verified

**QUALITY GATES:**
- [ ] All P0 bugs resolved
- [ ] Documentation complete and accurate
- [ ] Test artifacts organized and accessible
- [ ] Stakeholder review completed
- [ ] Final sign-off obtained

---

**Prepared by:** QA Engineer
**Date:** ${new Date().toLocaleDateString()}
**Version:** 1.0
`;

    return checklist;
  }

  printFinalSummary() {
    console.log(`\n🏆 QA TESTING COMPLETE`);
    console.log(`======================`);
    console.log(`Total Duration: ${(this.results.overallSummary.totalTime/1000/60).toFixed(1)} minutes`);
    console.log(`Sprints Completed: ${Object.values(this.results.sprints).filter(s => s.status === 'completed').length}/5`);
    
    // Try to read bug report for final stats
    const bugReportPath = path.join(__dirname, '../../tests/qa/reports/bugs-report.json');
    fs.readFile(bugReportPath, 'utf8')
      .then(data => {
        const bugData = JSON.parse(data);
        console.log(`Bugs Reported: ${bugData.bugs.length}`);
        console.log(`Critical Bugs: ${bugData.summary.criticalBugs}`);
        console.log(`High Priority: ${bugData.summary.highPriorityBugs}`);
      })
      .catch(() => {
        console.log('Bug report not available for final stats');
      });
    
    console.log(`\n📁 All reports saved in: tests/qa/reports/`);
    console.log(`\nNext steps:`);
    console.log(`1. Review executive summary`);
    console.log(`2. Address critical bugs immediately`);
    console.log(`3. Schedule stakeholder review`);
    console.log(`4. Prepare for production release`);
  }
}

// CLI Interface
async function main() {
  const tester = new MasterQATester();
  
  try {
    await tester.runFullTestSuite();
    process.exit(0);
  } catch (error) {
    console.error('QA testing suite failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MasterQATester;