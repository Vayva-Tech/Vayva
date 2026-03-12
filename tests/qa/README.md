# 🧪 VAYVA QA Testing Framework

Comprehensive automated testing suite implementing the **TEAM_ASSIGNMENT_QA_ENGINEER_TESTING.md** requirements for 24-hour crisis mode testing.

## 🚀 Quick Start

```bash
# 1. Set up testing environment
./scripts/qa-testing-setup.sh

# 2. Start development servers
pnpm dev

# 3. Run full QA test suite (all 5 sprints)
node tests/qa/runners/master-qa-tester.js

# 4. View results
open tests/qa/reports/
```

## 📋 Test Coverage

### Sprint 1: Dashboard Functionality ✅
- **Cross-browser testing** (Chrome, Firefox, Safari, Edge)
- **User journey testing** (3 critical workflows)
- **Responsive design validation**
- **Bug reporting with severity ratings**

### Sprint 2: API Endpoint Testing ✅
- **Dashboard API performance** testing
- **API key management** CRUD operations
- **Rate limiting** validation (100 req/hour)
- **Load testing** with autocannon/k6

### Sprint 3: Mobile Responsiveness (Coming Soon)
- Device testing matrix (6 devices)
- Layout and interaction validation
- Orientation testing

### Sprint 4: Edge Cases (Coming Soon)
- Offline mode testing
- Form validation edge cases
- Security testing
- Permission gating

### Sprint 5: Performance & Accessibility (Coming Soon)
- Lighthouse audits
- Keyboard navigation
- Screen reader compatibility
- Color contrast verification

## 🛠️ Installation

### Prerequisites
```bash
# Install Node.js 20+
node --version  # Should be >=20

# Install pnpm
npm install -g pnpm

# Install testing dependencies
pnpm install
```

### Testing Tools Setup
```bash
# Run setup script
./scripts/qa-testing-setup.sh

# Or install manually:
npm install -g autocannon
brew install k6  # macOS
```

## 🏃‍♂️ Running Tests

### Full Test Suite
```bash
# Execute all 5 sprints sequentially
node tests/qa/runners/master-qa-tester.js
```

### Individual Sprints

**Sprint 1 - Browser Matrix & User Journeys:**
```bash
node tests/qa/runners/browser-matrix-tester.js
node tests/qa/runners/user-journey-tester.js
```

**Sprint 2 - API Testing:**
```bash
node tests/qa/runners/api-testing-runner.js
```

**Sprint 3 - Mobile Testing:**
```bash
node tests/qa/runners/mobile-testing-runner.js
```

**Sprint 4 - Edge Cases:**
```bash
node tests/qa/runners/edge-case-tester.js
```

**Sprint 5 - Performance & Accessibility:**
```bash
node tests/qa/runners/performance-a11y-tester.js
```

## 📊 Test Reports

All reports are generated in `tests/qa/reports/`:

```
tests/qa/reports/
├── qa-executive-summary.md      # High-level overview
├── qa-full-test-report.json     # Complete JSON data
├── browser-matrix-report.md     # Browser compatibility results
├── user-journey-report.md       # User flow testing results
├── api-testing-report.md        # API performance results
├── bugs-report.md               # All bugs found
├── bugs-report.json             # Bug data (JSON)
├── bugs-report.csv              # Bug data (CSV)
└── deliverables-checklist.md    # Completion checklist
```

## 🐛 Bug Reporting

### Automatic Bug Detection
Tests automatically detect and categorize bugs:
- **Severity Levels:** Critical, High, Medium, Low
- **Priority Levels:** P0 (Blocker), P1 (High), P2 (Medium), P3 (Low)
- **Auto-tagging** based on impact analysis

### Manual Bug Submission
```javascript
const BugReporter = require('./tests/qa/runners/bug-reporter');

const reporter = new BugReporter();

reporter.addBug({
  title: 'Dashboard fails to load on mobile Safari',
  severity: 'High',
  priority: 'P1',
  environment: {
    os: 'iOS 16.4',
    browser: 'Safari',
    screen: '390x844'
  },
  stepsToReproduce: [
    'Open dashboard on iPhone',
    'Navigate to /dashboard',
    'Observe infinite loading spinner'
  ],
  expectedBehavior: 'Dashboard loads within 3 seconds',
  actualBehavior: 'Loading spinner continues indefinitely',
  screenshots: ['screenshots/mobile-error.png']
});
```

## ⚙️ Configuration

### Environment Variables
Create `.env.test`:
```bash
# Test environment
TEST_API_BASE_URL=http://localhost:3000
TEST_AUTH_TOKEN=your-test-jwt-token

# Browser testing
TEST_BROWSER_CHROME=true
TEST_BROWSER_FIREFOX=true
TEST_BROWSER_SAFARI=true
TEST_BROWSER_EDGE=true

# Test user credentials
TEST_USER_EMAIL=test@vayva.com
TEST_USER_PASSWORD=TestPassword123!

# Performance targets
TEST_LCP_TARGET=2500  # ms
TEST_FID_TARGET=100   # ms
TEST_CLS_TARGET=0.1   # Cumulative Layout Shift
```

### Test Data Fixtures
Located in `tests/qa/fixtures/`:
- `test-users.json` - User account data
- `test-scenarios.json` - Testing scenarios
- `device-matrix.json` - Mobile device specifications

## 🎯 Quality Gates

### Pass Criteria
- ✅ Zero critical bugs in production
- ✅ Lighthouse scores ≥ 90 (Performance)
- ✅ Lighthouse scores ≥ 95 (Accessibility)
- ✅ API response time < 500ms
- ✅ Mobile responsive across all devices
- ✅ Keyboard navigation fully functional

### Failure Triggers
- 🚨 Any P0 priority bugs
- 🚨 Lighthouse score < 80 in any category
- 🚨 API response time > 1000ms
- 🚨 Critical user journeys failing

## 🤖 Automation Integration

### CI/CD Pipeline
```yaml
# .github/workflows/qa-testing.yml
name: QA Testing
on: [push, pull_request]

jobs:
  qa-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: pnpm install
      - run: pnpm dev &
      - run: sleep 30  # Wait for servers
      - run: node tests/qa/runners/master-qa-tester.js
      - uses: actions/upload-artifact@v3
        with:
          name: qa-reports
          path: tests/qa/reports/
```

### Scheduled Testing
```bash
# Daily regression testing
0 2 * * * cd /path/to/vayva && node tests/qa/runners/master-qa-tester.js

# Weekly full suite
0 3 * * 1 cd /path/to/vayva && node tests/qa/runners/master-qa-tester.js
```

## 📱 Mobile Device Testing Matrix

Currently supports testing on:
- **iPhone 14** (390×844)
- **iPhone 14 Pro Max** (430×932)
- **iPad Mini** (768×1024)
- **iPad Pro 11"** (834×1194)
- **Samsung Galaxy S23** (360×780)
- **Pixel 7 Pro** (412×892)

## 🔒 Security Testing

Built-in security validation:
- XSS attack simulation
- SQL injection testing
- CSRF protection verification
- Authentication bypass attempts
- Rate limiting effectiveness

## 🆘 Troubleshooting

### Common Issues

**Puppeteer fails to launch:**
```bash
# Install system dependencies
sudo apt-get install libnss3-dev libatk-bridge2.0-dev libdrm-dev libxcomposite1 libxdamage1 libxrandr2 libgbm-dev libxss1 libasound2
```

**API tests failing:**
```bash
# Check if backend is running
curl http://localhost:3000/api/health
```

**Permission errors:**
```bash
# Fix file permissions
chmod +x tests/qa/runners/*.js
chmod +x scripts/qa-testing-setup.sh
```

### Debug Mode
```bash
# Run with verbose logging
DEBUG=qa:* node tests/qa/runners/master-qa-tester.js

# Run single test with debug
DEBUG=puppeteer node tests/qa/runners/browser-matrix-tester.js
```

## 📈 Monitoring & Analytics

### Test Metrics Collected
- Test execution time
- Success/failure rates
- Performance benchmarks
- Bug detection rates
- Coverage statistics

### Dashboard Integration
Reports can be integrated with:
- **GitHub Actions** - Test results in PRs
- **Slack** - Real-time notifications
- **Datadog** - Performance monitoring
- **New Relic** - Error tracking

## 🤝 Contributing

### Adding New Tests
1. Create test runner in `tests/qa/runners/`
2. Follow existing patterns for reporting
3. Add to master tester orchestration
4. Update documentation

### Test Structure
```
tests/qa/
├── runners/           # Test execution scripts
├── fixtures/          # Test data
├── screenshots/       # Visual evidence
├── videos/           # Recording evidence
└── reports/          # Generated reports
```

## 📄 License

This testing framework is proprietary to VAYVA and intended for internal use only.

---

**Need help?** Contact the QA team or check the [TEAM_ASSIGNMENT_QA_ENGINEER_TESTING.md](../TEAM_ASSIGNMENT_QA_ENGINEER_TESTING.md) specification.