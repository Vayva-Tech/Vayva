#!/usr/bin/env node

/**
 * Bug Reporting and Tracking System
 * Manages bug documentation, severity rating, and reporting
 */

const fs = require('fs').promises;
const path = require('path');

class BugReporter {
  constructor() {
    this.bugs = [];
    this.reportFilePath = path.join(__dirname, '../../tests/qa/reports/bugs-report.json');
    this.markdownReportPath = path.join(__dirname, '../../tests/qa/reports/bugs-report.md');
  }

  /**
   * Add a new bug to the tracking system
   */
  addBug(bugData) {
    const bug = {
      id: this.generateBugId(),
      timestamp: new Date().toISOString(),
      title: bugData.title,
      severity: bugData.severity || 'Medium',
      priority: bugData.priority || 'P2',
      environment: bugData.environment || this.getDefaultEnvironment(),
      stepsToReproduce: bugData.stepsToReproduce || [],
      expectedBehavior: bugData.expectedBehavior || '',
      actualBehavior: bugData.actualBehavior || '',
      screenshots: bugData.screenshots || [],
      consoleErrors: bugData.consoleErrors || [],
      workaround: bugData.workaround || 'None',
      status: 'Open',
      assignedTo: bugData.assignedTo || null,
      tags: bugData.tags || []
    };

    this.bugs.push(bug);
    console.log(`🐛 Bug reported: ${bug.title} (${bug.severity})`);
    return bug.id;
  }

  /**
   * Generate a unique bug ID
   */
  generateBugId() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `VAYVA-BUG-${timestamp}-${random}`;
  }

  /**
   * Get default environment information
   */
  getDefaultEnvironment() {
    return {
      os: process.platform,
      browser: 'Chrome',
      version: process.version,
      screen: '1920x1080',
      planTier: 'Pro'
    };
  }

  /**
   * Rate bug severity based on impact
   */
  rateSeverity(impactFactors) {
    const { 
      blocksFunctionality = false,
      dataLoss = false, 
      securityRisk = false,
      userExperience = 0, // 1-10 scale
      frequency = 'occasional' // 'constant', 'frequent', 'occasional', 'rare'
    } = impactFactors;

    if (blocksFunctionality && dataLoss) return 'Critical';
    if (securityRisk || (blocksFunctionality && frequency === 'constant')) return 'High';
    if (blocksFunctionality || dataLoss || userExperience <= 3) return 'Medium';
    if (userExperience <= 6) return 'Low';
    return 'Low';
  }

  /**
   * Set bug priority based on severity and business impact
   */
  setPriority(severity, businessImpact = 'medium') {
    const priorityMatrix = {
      'Critical': { 'high': 'P0', 'medium': 'P0', 'low': 'P1' },
      'High': { 'high': 'P1', 'medium': 'P1', 'low': 'P2' },
      'Medium': { 'high': 'P2', 'medium': 'P2', 'low': 'P3' },
      'Low': { 'high': 'P3', 'medium': 'P3', 'low': 'P3' }
    };
    
    return priorityMatrix[severity][businessImpact];
  }

  /**
   * Update bug status
   */
  updateBugStatus(bugId, status, notes = '') {
    const bug = this.bugs.find(b => b.id === bugId);
    if (bug) {
      bug.status = status;
      if (notes) {
        bug.statusNotes = notes;
        bug.statusUpdated = new Date().toISOString();
      }
      console.log(`🔄 Bug ${bugId} status updated to: ${status}`);
      return true;
    }
    return false;
  }

  /**
   * Assign bug to developer
   */
  assignBug(bugId, assignee) {
    const bug = this.bugs.find(b => b.id === bugId);
    if (bug) {
      bug.assignedTo = assignee;
      bug.assignedAt = new Date().toISOString();
      console.log(`👤 Bug ${bugId} assigned to: ${assignee}`);
      return true;
    }
    return false;
  }

  /**
   * Add screenshot to bug
   */
  addScreenshot(bugId, screenshotPath) {
    const bug = this.bugs.find(b => b.id === bugId);
    if (bug) {
      bug.screenshots.push(screenshotPath);
      return true;
    }
    return false;
  }

  /**
   * Get bugs by severity
   */
  getBugsBySeverity(severity) {
    return this.bugs.filter(bug => bug.severity === severity);
  }

  /**
   * Get bugs by status
   */
  getBugsByStatus(status) {
    return this.bugs.filter(bug => bug.status === status);
  }

  /**
   * Generate comprehensive bug report
   */
  async generateReport() {
    // Sort bugs by severity and priority
    const sortedBugs = [...this.bugs].sort((a, b) => {
      const severityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
      const priorityOrder = { 'P0': 0, 'P1': 1, 'P2': 2, 'P3': 3 };
      
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[a.severity] - severityOrder[b.severity];
      }
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

    // Generate JSON report
    const jsonReport = {
      generatedAt: new Date().toISOString(),
      summary: this.getSummary(),
      bugs: sortedBugs
    };

    await fs.writeFile(this.reportFilePath, JSON.stringify(jsonReport, null, 2));

    // Generate Markdown report
    const markdownReport = this.generateMarkdownReport(sortedBugs);
    await fs.writeFile(this.markdownReportPath, markdownReport);

    console.log(`\n🐛 Bug Report Generated:`);
    console.log(`   JSON: ${this.reportFilePath}`);
    console.log(`   Markdown: ${this.markdownReportPath}`);

    return jsonReport;
  }

  /**
   * Get summary statistics
   */
  getSummary() {
    const severityCounts = { 'Critical': 0, 'High': 0, 'Medium': 0, 'Low': 0 };
    const statusCounts = { 'Open': 0, 'In Progress': 0, 'Resolved': 0, 'Closed': 0 };
    const priorityCounts = { 'P0': 0, 'P1': 0, 'P2': 0, 'P3': 0 };

    this.bugs.forEach(bug => {
      severityCounts[bug.severity]++;
      statusCounts[bug.status]++;
      priorityCounts[bug.priority]++;
    });

    return {
      totalBugs: this.bugs.length,
      bySeverity: severityCounts,
      byStatus: statusCounts,
      byPriority: priorityCounts,
      criticalBugs: severityCounts.Critical,
      highPriorityBugs: priorityCounts.P0 + priorityCounts.P1
    };
  }

  /**
   * Generate markdown formatted report
   */
  generateMarkdownReport(bugs) {
    let md = `# QA Bug Report\n\n`;
    md += `**Generated:** ${new Date().toISOString()}\n\n`;

    // Summary section
    const summary = this.getSummary();
    md += `## Summary\n\n`;
    md += `| Total Bugs | Critical | High Priority | Open | Resolved |\n`;
    md += `|------------|----------|---------------|------|----------|\n`;
    md += `| ${summary.totalBugs} | ${summary.criticalBugs} | ${summary.highPriorityBugs} | ${summary.byStatus.Open} | ${summary.byStatus.Resolved} |\n\n`;

    // Severity breakdown
    md += `### By Severity\n\n`;
    md += `| Severity | Count | Percentage |\n`;
    md += `|----------|-------|------------|\n`;
    Object.entries(summary.bySeverity).forEach(([severity, count]) => {
      const percentage = summary.totalBugs > 0 ? ((count / summary.totalBugs) * 100).toFixed(1) : 0;
      md += `| ${severity} | ${count} | ${percentage}% |\n`;
    });
    md += `\n`;

    // Priority breakdown
    md += `### By Priority\n\n`;
    md += `| Priority | Count | Description |\n`;
    md += `|----------|-------|-------------|\n`;
    const priorityDescriptions = {
      'P0': 'BLOCKING - Must fix before release',
      'P1': 'HIGH - Should fix soon',
      'P2': 'MEDIUM - Fix when possible',
      'P3': 'LOW - Nice to have'
    };
    Object.entries(summary.byPriority).forEach(([priority, count]) => {
      md += `| ${priority} | ${count} | ${priorityDescriptions[priority]} |\n`;
    });
    md += `\n`;

    // Detailed bug listings
    if (bugs.length > 0) {
      md += `## Detailed Bug Reports\n\n`;

      // Group by severity
      const bugsBySeverity = {
        'Critical': bugs.filter(b => b.severity === 'Critical'),
        'High': bugs.filter(b => b.severity === 'High'),
        'Medium': bugs.filter(b => b.severity === 'Medium'),
        'Low': bugs.filter(b => b.severity === 'Low')
      };

      Object.entries(bugsBySeverity).forEach(([severity, severityBugs]) => {
        if (severityBugs.length > 0) {
          md += `### ${severity} Severity Bugs\n\n`;
          
          severityBugs.forEach(bug => {
            const priorityEmoji = bug.priority === 'P0' ? '🔴' : 
                                bug.priority === 'P1' ? '🟠' : 
                                bug.priority === 'P2' ? '🟡' : '🟢';
            
            md += `#### ${priorityEmoji} ${bug.id}: ${bug.title}\n\n`;
            md += `**Severity:** ${bug.severity} | **Priority:** ${bug.priority} | **Status:** ${bug.status}\n\n`;
            
            if (bug.assignedTo) {
              md += `**Assigned To:** ${bug.assignedTo}\n\n`;
            }

            md += `**Environment:**\n`;
            md += `- OS: ${bug.environment.os}\n`;
            md += `- Browser: ${bug.environment.browser} ${bug.environment.version}\n`;
            md += `- Screen: ${bug.environment.screen}\n`;
            md += `- Plan Tier: ${bug.environment.planTier}\n\n`;

            if (bug.stepsToReproduce && bug.stepsToReproduce.length > 0) {
              md += `**Steps to Reproduce:**\n`;
              bug.stepsToReproduce.forEach((step, index) => {
                md += `${index + 1}. ${step}\n`;
              });
              md += `\n`;
            }

            if (bug.expectedBehavior) {
              md += `**Expected Behavior:**\n${bug.expectedBehavior}\n\n`;
            }

            if (bug.actualBehavior) {
              md += `**Actual Behavior:**\n${bug.actualBehavior}\n\n`;
            }

            if (bug.consoleErrors && bug.consoleErrors.length > 0) {
              md += `**Console Errors:**\n`;
              md += '```\n';
              bug.consoleErrors.forEach(error => {
                md += `${error}\n`;
              });
              md += '```\n\n';
            }

            if (bug.screenshots && bug.screenshots.length > 0) {
              md += `**Screenshots:**\n`;
              bug.screenshots.forEach(screenshot => {
                md += `- ![Screenshot](${screenshot})\n`;
              });
              md += `\n`;
            }

            if (bug.workaround && bug.workaround !== 'None') {
              md += `**Workaround:**\n${bug.workaround}\n\n`;
            }

            md += `---\n\n`;
          });
        }
      });
    } else {
      md += `## No Bugs Reported\n\n`;
      md += `🎉 All tests passed! No bugs found during testing.\n`;
    }

    return md;
  }

  /**
   * Print summary to console
   */
  printSummary() {
    const summary = this.getSummary();
    
    console.log(`\n🐛 BUG REPORT SUMMARY`);
    console.log(`=====================`);
    console.log(`Total Bugs: ${summary.totalBugs}`);
    console.log(`Critical: ${summary.criticalBugs}`);
    console.log(`High Priority: ${summary.highPriorityBugs}`);
    console.log(`Open: ${summary.byStatus.Open}`);
    console.log(`Resolved: ${summary.byStatus.Resolved}`);
    
    if (summary.criticalBugs > 0) {
      console.log(`\n🚨 CRITICAL ALERT: ${summary.criticalBugs} critical bugs found!`);
    }
  }

  /**
   * Load existing bugs from file
   */
  async loadFromFile() {
    try {
      const data = await fs.readFile(this.reportFilePath, 'utf8');
      const report = JSON.parse(data);
      this.bugs = report.bugs || [];
      console.log(`Loaded ${this.bugs.length} existing bugs`);
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error('Error loading bug report:', error.message);
      }
      // File doesn't exist, start fresh
      this.bugs = [];
    }
  }

  /**
   * Export bugs to CSV for spreadsheet analysis
   */
  async exportToCSV() {
    const csvPath = path.join(__dirname, '../../tests/qa/reports/bugs-report.csv');
    
    let csv = 'ID,Title,Severity,Priority,Status,Assigned To,Created,Timestamp\n';
    
    this.bugs.forEach(bug => {
      csv += `"${bug.id}",`;
      csv += `"${bug.title.replace(/"/g, '""')}",`;
      csv += `"${bug.severity}",`;
      csv += `"${bug.priority}",`;
      csv += `"${bug.status}",`;
      csv += `"${bug.assignedTo || ''}",`;
      csv += `"${new Date(bug.timestamp).toLocaleDateString()}",`;
      csv += `"${bug.timestamp}"\n`;
    });

    await fs.writeFile(csvPath, csv);
    console.log(`CSV exported to: ${csvPath}`);
    return csvPath;
  }
}

// CLI Interface
async function main() {
  const reporter = new BugReporter();
  
  // Load existing bugs
  await reporter.loadFromFile();
  
  // Example usage (would be called by other test runners)
  /*
  reporter.addBug({
    title: 'Dashboard fails to load on mobile',
    severity: 'High',
    priority: 'P1',
    environment: {
      os: 'iOS',
      browser: 'Safari',
      version: '16.4',
      screen: '375x667',
      planTier: 'Pro'
    },
    stepsToReproduce: [
      'Open dashboard on iPhone',
      'Navigate to /dashboard',
      'Observe loading spinner indefinitely'
    ],
    expectedBehavior: 'Dashboard should load within 5 seconds',
    actualBehavior: 'Loading spinner continues indefinitely, no data loads',
    consoleErrors: [
      'TypeError: Cannot read property \'data\' of undefined at dashboard.js:142'
    ],
    screenshots: ['/tests/qa/screenshots/mobile-loading-error.png'],
    workaround: 'Use desktop browser instead'
  });
  */

  // Generate reports
  await reporter.generateReport();
  await reporter.exportToCSV();
  reporter.printSummary();
}

if (require.main === module) {
  main();
}

module.exports = BugReporter;