# E2E Tests CI/CD Setup

**Status:** ✅ Configured and Ready  
**Workflow:** `.github/workflows/e2e-tests.yml`

---

## Overview

E2E Playwright tests run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual workflow dispatch

---

## Workflow Configuration

### Triggers

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
  workflow_dispatch:
```

### Test Environment

- **OS:** Ubuntu Latest
- **Node:** 20.x
- **Package Manager:** pnpm 8
- **Database:** PostgreSQL 15
- **Browser:** Chromium (Playwright)
- **Timeout:** 15 minutes

---

## Database Setup

### PostgreSQL Service

```yaml
services:
  postgres:
    image: postgres:15
    env:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: vayva_test
    ports:
      - 5432:5432
```

### Migrations & Seeding

```bash
pnpm --filter @vayva/db prisma migrate deploy
pnpm --filter @vayva/db prisma db seed
```

---

## Environment Variables

Required for CI:

```env
NODE_ENV=test
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vayva_test
NEXTAUTH_SECRET=test-secret-key-for-ci
NEXTAUTH_URL=http://localhost:3000
CI=true
```

### Adding Secrets

For production-like testing, add these secrets to GitHub:

1. Go to **Settings → Secrets and variables → Actions**
2. Add repository secrets:
   - `TEST_PAYSTACK_SECRET_KEY` (optional)
   - `TEST_PAYSTACK_PUBLIC_KEY` (optional)
   - `TEST_WHATSAPP_SERVICE_URL` (optional)

---

## Test Execution

### Steps

1. **Checkout code**
2. **Setup Node.js 20**
3. **Install pnpm**
4. **Install dependencies**
5. **Install Playwright browsers**
6. **Setup test database**
7. **Build merchant-admin**
8. **Run E2E tests**
9. **Upload artifacts**

### Command

```bash
pnpm --filter merchant-admin playwright test
```

---

## Artifacts & Reporting

### Test Report

- **Path:** `apps/merchant-admin/playwright-report/`
- **Retention:** 7 days
- **Access:** GitHub Actions → Run → Artifacts

### Test Videos (on failure)

- **Path:** `apps/merchant-admin/test-results/`
- **Retention:** 7 days
- **Contains:** Video recordings of failed tests

### PR Comments

On test failure, workflow automatically comments on PR with link to test report.

---

## Local Testing

To run tests locally matching CI environment:

```bash
# Install Playwright browsers
pnpm --filter merchant-admin exec playwright install chromium

# Run tests
pnpm --filter merchant-admin playwright test

# Run with UI
pnpm --filter merchant-admin playwright test --ui

# Run specific test
pnpm --filter merchant-admin playwright test e2e/onboarding.spec.ts
```

---

## Debugging Failed Tests

### 1. Check Workflow Logs

```
GitHub Actions → Workflow Run → E2E Tests → View logs
```

### 2. Download Artifacts

```
GitHub Actions → Workflow Run → Artifacts → playwright-report
```

### 3. View Test Videos

```
GitHub Actions → Workflow Run → Artifacts → playwright-videos
```

### 4. Run Locally

```bash
# Reproduce CI environment
export CI=true
export NODE_ENV=test
pnpm --filter merchant-admin playwright test --debug
```

---

## Performance Optimization

### Current Setup

- **Parallel:** Tests run in parallel (default)
- **Retries:** 2 retries on CI, 0 locally
- **Workers:** 1 on CI (to avoid flakiness)
- **Timeout:** 15 minutes total

### Future Improvements

- [ ] Cache Playwright browsers
- [ ] Shard tests across multiple jobs
- [ ] Add test result caching
- [ ] Implement visual regression testing

---

## Monitoring

### Success Metrics

- Test pass rate > 95%
- Average duration < 10 minutes
- Zero flaky tests

### Alerts

Set up GitHub notifications for:
- Failed workflow runs
- Flaky test detection
- Performance degradation

---

## Troubleshooting

### Issue: Tests timeout

**Solution:** Increase timeout in `playwright.config.ts` or workflow

### Issue: Database connection fails

**Solution:** Check PostgreSQL service health checks

### Issue: Playwright browsers not found

**Solution:** Ensure `playwright install` step runs successfully

### Issue: Tests pass locally but fail in CI

**Solution:** Check environment variables and database state

---

## Maintenance

### Regular Tasks

- [ ] Update Playwright version monthly
- [ ] Review and update test data seeds
- [ ] Monitor test execution time
- [ ] Remove flaky tests or fix root cause

### When to Update

- New critical user flows added
- Major feature releases
- Breaking changes to API contracts
- Database schema changes

---

## Integration with Other Workflows

### CI Workflow

E2E tests run separately from unit tests for:
- Faster feedback on unit tests
- Isolated test environments
- Better resource utilization

### Deployment Workflow

E2E tests can be required before deployment:

```yaml
deploy:
  needs: [e2e-merchant-admin]
  if: success()
```

---

## Cost Considerations

### GitHub Actions Minutes

- **Free tier:** 2,000 minutes/month
- **Estimated usage:** ~100 minutes/month (assuming 10 runs/day × 10 min/run)
- **Recommendation:** Monitor usage in billing dashboard

### Optimization Tips

- Run E2E tests only on main branches
- Skip E2E for documentation-only changes
- Use workflow path filters

---

## Security

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate test credentials regularly

### Test Data

- Use synthetic test data only
- No production data in tests
- Clean up test data after runs

---

## Future Enhancements

### Short Term

- [ ] Add test coverage reporting
- [ ] Implement visual regression tests
- [ ] Add performance benchmarks

### Long Term

- [ ] Cross-browser testing (Firefox, Safari)
- [ ] Mobile viewport testing
- [ ] Accessibility testing integration
- [ ] Load testing integration

---

## Support

For issues with CI/CD setup:

1. Check workflow logs
2. Review this documentation
3. Consult Playwright docs
4. Check GitHub Actions status page

---

**Last Updated:** January 31, 2026  
**Status:** ✅ Production Ready
