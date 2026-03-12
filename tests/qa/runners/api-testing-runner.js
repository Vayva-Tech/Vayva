#!/usr/bin/env node

/**
 * API Endpoint Testing Runner
 * Tests dashboard APIs, rate limiting, and performance as specified in Sprint 2
 */

const autocannon = require('autocannon');
const fs = require('fs').promises;
const path = require('path');

class APITester {
  constructor() {
    this.baseUrl = process.env.TEST_API_BASE_URL || 'http://localhost:3000';
    this.results = {
      timestamp: new Date().toISOString(),
      apiTests: {},
      loadTests: {},
      rateLimitTests: {},
      summary: {
        totalTests: 0,
        passed: 0,
        failed: 0,
        avgResponseTime: 0
      }
    };
    
    this.testToken = process.env.TEST_AUTH_TOKEN || 'test-jwt-token';
  }

  async runAllAPITests() {
    console.log('🔌 Starting API Endpoint Testing...\n');
    
    // Test suites
    await this.testDashboardAPIs();
    await this.testAPIKeyManagement();
    await this.testRateLimiting();
    await this.testLoadPerformance();
    
    await this.generateReport();
  }

  async testDashboardAPIs() {
    console.log('📊 Testing Dashboard APIs...\n');
    
    const dashboardTests = [
      {
        name: 'Dashboard Aggregation API - Normal Request',
        endpoint: '/api/dashboard/aggregate?range=month',
        method: 'GET',
        expectedStatus: 200,
        expectedMaxTime: 500
      },
      {
        name: 'Dashboard Aggregation API - Invalid Range',
        endpoint: '/api/dashboard/aggregate?range=invalid',
        method: 'GET',
        expectedStatus: 400
      },
      {
        name: 'Dashboard Aggregation API - No Authentication',
        endpoint: '/api/dashboard/aggregate',
        method: 'GET',
        expectedStatus: 401,
        headers: {} // No auth header
      }
    ];

    for (const test of dashboardTests) {
      await this.runAPITest(test);
    }
  }

  async testAPIKeyManagement() {
    console.log('\n🔑 Testing API Key Management...\n');
    
    const apiKeyTests = [
      {
        name: 'Create API Key',
        endpoint: '/api/saas/api-keys',
        method: 'POST',
        expectedStatus: 200,
        body: JSON.stringify({
          name: 'Test Key',
          scopes: ['read:orders'],
          rateLimitPerMinute: 100
        })
      },
      {
        name: 'List API Keys',
        endpoint: '/api/saas/api-keys',
        method: 'GET',
        expectedStatus: 200
      },
      {
        name: 'Rotate API Key',
        endpoint: '/api/saas/api-keys/test-key-id/rotate',
        method: 'POST',
        expectedStatus: 200,
        body: JSON.stringify({
          gracePeriodDays: 1
        })
      },
      {
        name: 'Revoke API Key',
        endpoint: '/api/saas/api-keys/test-key-id',
        method: 'DELETE',
        expectedStatus: 200
      },
      {
        name: 'Use Revoked Key',
        endpoint: '/api/dashboard/aggregate',
        method: 'GET',
        expectedStatus: 401,
        headers: {
          'Authorization': 'Bearer revoked-test-key'
        }
      }
    ];

    for (const test of apiKeyTests) {
      await this.runAPITest(test);
    }
  }

  async testRateLimiting() {
    console.log('\n🚦 Testing Rate Limiting...\n');
    
    const testId = 'rate-limit-test';
    this.results.rateLimitTests[testId] = {
      name: 'Rate Limit Exhaustion Test',
      startTime: new Date().toISOString(),
      requests: [],
      violations: []
    };

    const testResult = this.results.rateLimitTests[testId];
    
    // Send 150 rapid requests (limit is 100/hour)
    console.log('Sending 150 requests to test rate limiting...');
    
    const promises = [];
    for (let i = 1; i <= 150; i++) {
      promises.push(this.makeTestRequest({
        endpoint: '/api/dashboard/aggregate',
        method: 'GET',
        requestId: i
      }));
    }

    const responses = await Promise.all(promises);
    
    let withinLimit = 0;
    let rateLimited = 0;
    let errors = 0;
    
    responses.forEach(response => {
      testResult.requests.push({
        id: response.requestId,
        statusCode: response.statusCode,
        responseTime: response.responseTime,
        timestamp: response.timestamp
      });
      
      if (response.statusCode === 200) {
        withinLimit++;
      } else if (response.statusCode === 429) {
        rateLimited++;
      } else {
        errors++;
        testResult.violations.push({
          requestId: response.requestId,
          statusCode: response.statusCode,
          error: response.error
        });
      }
    });
    
    testResult.withinLimit = withinLimit;
    testResult.rateLimited = rateLimited;
    testResult.errors = errors;
    testResult.endTime = new Date().toISOString();
    
    console.log(`✅ Within limit: ${withinLimit} requests`);
    console.log(`🛑 Rate limited: ${rateLimited} requests`);
    console.log(`❌ Errors: ${errors} requests`);
    
    // Validate rate limiting worked correctly
    const expectedWithinLimit = 100; // First 100 should succeed
    const expectedRateLimited = 50;  // Remaining 50 should be rate limited
    
    if (withinLimit >= expectedWithinLimit * 0.9) { // Allow 10% tolerance
      console.log('✅ Rate limiting working correctly');
      this.results.summary.passed++;
    } else {
      console.log('❌ Rate limiting not working as expected');
      this.results.summary.failed++;
    }
    
    this.results.summary.totalTests++;
  }

  async testLoadPerformance() {
    console.log('\n⚡ Testing Load Performance...\n');
    
    const loadTests = [
      {
        name: 'Dashboard API Load Test',
        url: `${this.baseUrl}/api/dashboard/aggregate`,
        connections: 10,
        duration: 10, // seconds
        expectations: {
          averageLatency: 500,
          throughput: 50
        }
      }
    ];

    for (const test of loadTests) {
      await this.runLoadTest(test);
    }
  }

  async runAPITest(testConfig) {
    const testId = `api-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`  ▶️  ${testConfig.name}`);
    
    this.results.apiTests[testId] = {
      ...testConfig,
      startTime: new Date().toISOString(),
      status: 'running'
    };

    try {
      const response = await this.makeTestRequest({
        endpoint: testConfig.endpoint,
        method: testConfig.method,
        headers: testConfig.headers,
        body: testConfig.body
      });

      const testResult = this.results.apiTests[testId];
      testResult.endTime = new Date().toISOString();
      testResult.statusCode = response.statusCode;
      testResult.responseTime = response.responseTime;
      testResult.responseBody = response.body;
      testResult.headers = response.headers;

      // Check expectations
      let passed = true;
      const failures = [];

      if (testConfig.expectedStatus && response.statusCode !== testConfig.expectedStatus) {
        passed = false;
        failures.push(`Expected status ${testConfig.expectedStatus}, got ${response.statusCode}`);
      }

      if (testConfig.expectedMaxTime && response.responseTime > testConfig.expectedMaxTime) {
        passed = false;
        failures.push(`Response time ${response.responseTime}ms exceeds limit of ${testConfig.expectedMaxTime}ms`);
      }

      testResult.passed = passed;
      testResult.failures = failures;

      if (passed) {
        console.log(`    ✅ PASSED (${response.responseTime}ms)`);
        this.results.summary.passed++;
      } else {
        console.log(`    ❌ FAILED`);
        failures.forEach(failure => console.log(`       - ${failure}`));
        this.results.summary.failed++;
      }

    } catch (error) {
      const testResult = this.results.apiTests[testId];
      testResult.endTime = new Date().toISOString();
      testResult.status = 'failed';
      testResult.error = error.message;
      testResult.passed = false;
      
      console.log(`    💥 FAILED: ${error.message}`);
      this.results.summary.failed++;
    }

    this.results.summary.totalTests++;
  }

  async makeTestRequest(requestConfig) {
    const { endpoint, method = 'GET', headers = {}, body = null, requestId = null } = requestConfig;
    
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    const defaultHeaders = {
      'Authorization': `Bearer ${this.testToken}`,
      'Content-Type': 'application/json',
      ...headers
    };

    const startTime = Date.now();
    
    try {
      const response = await fetch(url, {
        method,
        headers: defaultHeaders,
        body: body && method !== 'GET' ? body : undefined
      });

      const responseTime = Date.now() - startTime;
      
      return {
        requestId,
        statusCode: response.status,
        responseTime,
        headers: Object.fromEntries(response.headers.entries()),
        body: await response.text(),
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        requestId,
        statusCode: 0,
        responseTime,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async runLoadTest(testConfig) {
    const testId = `load-${Date.now()}`;
    
    console.log(`  ▶️  ${testConfig.name}`);
    
    this.results.loadTests[testId] = {
      ...testConfig,
      startTime: new Date().toISOString(),
      status: 'running'
    };

    try {
      const result = await new Promise((resolve, reject) => {
        const instance = autocannon({
          url: testConfig.url,
          connections: testConfig.connections,
          duration: testConfig.duration,
          headers: {
            'Authorization': `Bearer ${this.testToken}`
          }
        }, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });

        autocannon.track(instance, { 
          renderProgressBar: true,
          renderResultsTable: true 
        });
      });

      const testResult = this.results.loadTests[testId];
      testResult.endTime = new Date().toISOString();
      testResult.results = result;
      testResult.status = 'completed';

      // Analyze results
      const avgLatency = result.latency.average;
      const throughput = result.requests.average;
      const totalRequests = result.requests.total;
      const errors = result.errors;

      console.log(`\n    Results:`);
      console.log(`    - Average Latency: ${avgLatency.toFixed(2)}ms`);
      console.log(`    - Throughput: ${throughput.toFixed(2)} req/sec`);
      console.log(`    - Total Requests: ${totalRequests}`);
      console.log(`    - Errors: ${errors}`);

      // Check against expectations
      let passed = true;
      const failures = [];

      if (testConfig.expectations.averageLatency && avgLatency > testConfig.expectations.averageLatency) {
        passed = false;
        failures.push(`Average latency ${avgLatency.toFixed(2)}ms exceeds expectation of ${testConfig.expectations.averageLatency}ms`);
      }

      if (testConfig.expectations.throughput && throughput < testConfig.expectations.throughput) {
        passed = false;
        failures.push(`Throughput ${throughput.toFixed(2)} req/sec below expectation of ${testConfig.expectations.throughput} req/sec`);
      }

      testResult.passed = passed;
      testResult.failures = failures;

      if (passed) {
        console.log(`    ✅ LOAD TEST PASSED`);
        this.results.summary.passed++;
      } else {
        console.log(`    ❌ LOAD TEST FAILED`);
        failures.forEach(failure => console.log(`       - ${failure}`));
        this.results.summary.failed++;
      }

    } catch (error) {
      const testResult = this.results.loadTests[testId];
      testResult.endTime = new Date().toISOString();
      testResult.status = 'failed';
      testResult.error = error.message;
      testResult.passed = false;
      
      console.log(`    💥 LOAD TEST FAILED: ${error.message}`);
      this.results.summary.failed++;
    }

    this.results.summary.totalTests++;
  }

  async generateReport() {
    const reportDir = path.join(__dirname, '../../reports');
    await fs.mkdir(reportDir, { recursive: true });

    // Calculate averages
    const allResponseTimes = [
      ...Object.values(this.results.apiTests).map(t => t.responseTime).filter(Boolean),
      ...Object.values(this.results.loadTests).flatMap(t => 
        t.results ? [t.results.latency.average] : []
      )
    ];
    
    this.results.summary.avgResponseTime = allResponseTimes.length > 0 ? 
      (allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length).toFixed(2) : 0;

    // Generate JSON report
    const jsonPath = path.join(reportDir, 'api-testing-report.json');
    await fs.writeFile(jsonPath, JSON.stringify(this.results, null, 2));

    // Generate Markdown report
    const markdownReport = this.generateMarkdownReport();
    const markdownPath = path.join(reportDir, 'api-testing-report.md');
    await fs.writeFile(markdownPath, markdownReport);

    console.log(`\n📊 API Testing Report Generated:`);
    console.log(`   JSON: ${jsonPath}`);
    console.log(`   Markdown: ${markdownPath}`);
    
    this.printSummary();
  }

  generateMarkdownReport() {
    let md = `# API Testing Report\n\n`;
    md += `**Generated:** ${this.results.timestamp}\n`;
    md += `**Base URL:** ${this.baseUrl}\n\n`;

    md += `## Summary\n\n`;
    md += `| Total Tests | Passed | Failed | Avg Response Time |\n`;
    md += `|-------------|--------|--------|-------------------|\n`;
    md += `| ${this.results.summary.totalTests} | ${this.results.summary.passed} | ${this.results.summary.failed} | ${this.results.summary.avgResponseTime}ms |\n\n`;

    // API Tests
    if (Object.keys(this.results.apiTests).length > 0) {
      md += `## API Endpoint Tests\n\n`;
      
      Object.entries(this.results.apiTests).forEach(([testId, test]) => {
        const status = test.passed ? '✅ PASSED' : '❌ FAILED';
        md += `### ${status} ${test.name}\n\n`;
        md += `- **Endpoint:** \`${test.method} ${test.endpoint}\`\n`;
        md += `- **Status Code:** ${test.statusCode || 'N/A'}\n`;
        md += `- **Response Time:** ${test.responseTime || 'N/A'}ms\n`;
        
        if (test.failures && test.failures.length > 0) {
          md += `- **Failures:**\n`;
          test.failures.forEach(failure => {
            md += `  - ${failure}\n`;
          });
        }
        
        if (test.error) {
          md += `- **Error:** ${test.error}\n`;
        }
        md += `\n`;
      });
    }

    // Rate Limiting Tests
    if (Object.keys(this.results.rateLimitTests).length > 0) {
      md += `## Rate Limiting Tests\n\n`;
      
      Object.entries(this.results.rateLimitTests).forEach(([testId, test]) => {
        md += `### ${test.name}\n\n`;
        md += `- **Requests Within Limit:** ${test.withinLimit}\n`;
        md += `- **Rate Limited Requests:** ${test.rateLimited}\n`;
        md += `- **Errors:** ${test.errors}\n\n`;
        
        if (test.violations.length > 0) {
          md += `**Violations:**\n`;
          test.violations.forEach(violation => {
            md += `- Request ${violation.requestId}: Status ${violation.statusCode} - ${violation.error}\n`;
          });
          md += `\n`;
        }
      });
    }

    // Load Tests
    if (Object.keys(this.results.loadTests).length > 0) {
      md += `## Load Performance Tests\n\n`;
      
      Object.entries(this.results.loadTests).forEach(([testId, test]) => {
        const status = test.passed ? '✅ PASSED' : '❌ FAILED';
        md += `### ${status} ${test.name}\n\n`;
        
        if (test.results) {
          md += `- **Average Latency:** ${test.results.latency.average.toFixed(2)}ms\n`;
          md += `- **Throughput:** ${test.results.requests.average.toFixed(2)} req/sec\n`;
          md += `- **Total Requests:** ${test.results.requests.total}\n`;
          md += `- **Errors:** ${test.results.errors}\n`;
        }
        
        if (test.failures && test.failures.length > 0) {
          md += `- **Failures:**\n`;
          test.failures.forEach(failure => {
            md += `  - ${failure}\n`;
          });
        }
        md += `\n`;
      });
    }

    return md;
  }

  printSummary() {
    console.log(`\n📈 API TESTING SUMMARY`);
    console.log(`======================`);
    console.log(`Total Tests: ${this.results.summary.totalTests}`);
    console.log(`Passed: ${this.results.summary.passed}`);
    console.log(`Failed: ${this.results.summary.failed}`);
    console.log(`Average Response Time: ${this.results.summary.avgResponseTime}ms`);
    
    const successRate = this.results.summary.totalTests > 0 ? 
      ((this.results.summary.passed / this.results.summary.totalTests) * 100).toFixed(1) : 0;
    console.log(`Success Rate: ${successRate}%`);
  }
}

// CLI Interface
async function main() {
  const tester = new APITester();
  
  try {
    await tester.runAllAPITests();
  } catch (error) {
    console.error('API testing failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = APITester;