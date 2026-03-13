# Vayva Platform - Continuous Integration & Deployment Pipeline
# This file documents the CI/CD setup for production deployments

name: Vayva Production Deployment Pipeline

## TRIGGERS
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main]

## ENVIRONMENT VARIABLES
env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'
  REGISTRY: ghcr.io

## JOBS

### Job 1: Type Check & Lint
typecheck:
  name: Type Checking & Linting
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
    
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: ${{ env.PNPM_VERSION }}
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Generate Prisma Client
      run: pnpm turbo run db:generate
    
    - name: TypeScript Check (ops-console)
      run: cd Frontend/ops-console && pnpm typecheck
    
    - name: ESLint Check
      run: pnpm lint
    
    - name: Knip (Unused Dependencies)
      run: pnpm knip

### Job 2: Build & Test
build:
  name: Build & Test
  runs-on: ubuntu-latest
  needs: typecheck
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js & pnpm
      uses: actions/setup-node@v4
      with:
        node-version: ${{ env.NODE_VERSION }}
    
    - name: Setup pnpm
      uses: pnpm/action-setup@v2
      with:
        version: ${{ env.PNPM_VERSION }}
    
    - name: Install dependencies
      run: pnpm install --frozen-lockfile
    
    - name: Generate Prisma Client
      run: pnpm turbo run db:generate
    
    - name: Build Core Packages
      run: pnpm turbo run build --filter=@vayva/db --filter=@vayva/shared --filter=@vayva/ai-agent --filter=@vayva/worker
    
    - name: Build ops-console
      run: cd Frontend/ops-console && pnpm next build
    
    - name: Run Tests
      run: pnpm test
    
    - name: Upload Build Artifacts
      uses: actions/upload-artifact@v4
      with:
        name: ops-console-build
        path: Frontend/ops-console/.next

### Job 3: Security Scan
security:
  name: Security Scanning
  runs-on: ubuntu-latest
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Run npm audit
      run: npm audit --audit-level=high
    
    - name: Run Snyk Security Scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
    
    - name: Check for Secrets in Code
      run: |
        echo "Scanning for hardcoded secrets..."
        ! grep -r "sk_live_" --include="*.ts" --include="*.tsx" . || exit 1
        ! grep -r "password.*=" --include="*.env*" . || exit 1

### Job 4: Deploy to Staging
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  needs: [build, security]
  environment: staging
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Download Build Artifacts
      uses: actions/download-artifact@v4
      with:
        name: ops-console-build
        path: .next
    
    - name: Deploy to Vercel (Staging)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--env staging'
    
    - name: Smoke Tests
      run: |
        # Wait for deployment
        sleep 30
        
        # Test health endpoint
        curl -f https://staging.ops.yourdomain.com/api/ops/health/system
        
        # Test API endpoints
        curl -f https://staging.ops.yourdomain.com/api/health-score
        curl -f https://staging.ops.yourdomain.com/api/nps
        curl -f https://staging.ops.yourdomain.com/api/playbooks

### Job 5: Deploy to Production
deploy-production:
  name: Deploy to Production
  runs-on: ubuntu-latest
  needs: deploy-staging
  environment: production
  
  if: github.ref == 'refs/heads/main'
  
  steps:
    - uses: actions/checkout@v4
    
    - name: Deploy to Vercel (Production)
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        vercel-args: '--prod'
    
    - name: Post-Deployment Verification
      run: |
        # Wait for deployment to propagate
        sleep 60
        
        # Verify production health
        curl -f https://ops.yourdomain.com/api/ops/health/system
        
        # Create deployment record
        curl -X POST \
          -H "Authorization: Bearer ${{ secrets.DEPLOY_HOOK_TOKEN }}" \
          -d '{"status":"success","version":"${{ github.sha }}"}' \
          https://api.yourdomain.com/deployments

### Job 6: Notify
notify:
  name: Deployment Notification
  runs-on: ubuntu-latest
  needs: [deploy-production]
  if: always()
  
  steps:
    - name: Send Slack Notification
      uses: 8398a7/action-slack@v3
      with:
        status: ${{ job.status }}
        text: |
          Vayva Platform Deployment ${job.status}
          Commit: ${{ github.sha }}
          Environment: Production
          Author: ${{ github.actor }}
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}

## MANUAL WORKFLOWS

### Workflow A: Hotfix Deployment
To deploy an urgent hotfix:

```bash
# 1. Create hotfix branch
git checkout -b hotfix/issue-description main

# 2. Make changes and commit
git commit -m "fix: critical issue description"

# 3. Push and trigger CI
git push origin hotfix/issue-description

# 4. Create PR to main (expedited review)

# 5. Merge and deploy via CI pipeline
```

### Workflow B: Rollback Procedure
To rollback to previous deployment:

```bash
# 1. Identify last good commit
git log --oneline | grep "deployment successful"

# 2. Revert to that commit
git revert HEAD~n..HEAD

# 3. Force push to trigger rollback
git push origin main --force

# 4. Or use Vercel CLI
vercel rollback <deployment-id>
```

---

## MONITORING INTEGRATION

### Health Check Endpoints
The CI pipeline verifies these endpoints post-deployment:

- `/api/ops/health/system` - Overall system health
- `/api/health-score` - Health monitoring service
- `/api/nps` - NPS survey service
- `/api/playbooks` - Playbook execution engine

### Alert Thresholds
Configure alerts for:
- Build failures > 1 consecutive
- Deployment failures > 1 consecutive
- Health check failures > 3 consecutive
- Response time > 1 second average

---

## SECURITY BEST PRACTICES

### Secrets Management
- All secrets stored in GitHub Secrets
- No hardcoded credentials in codebase
- Regular secret rotation schedule
- Use of OIDC for cloud provider auth when possible

### Access Control
- Branch protection on main/master
- Required reviews for PRs
- Status checks must pass before merge
- Environment protection rules in Vercel

### Code Quality Gates
- TypeScript compilation: 0 errors required
- ESLint: 0 errors required
- Test coverage: >80% recommended
- No high/critical security vulnerabilities

---

## DEPLOYMENT SCHEDULE

### Regular Releases
- **Minor releases**: Weekly (Tuesdays)
- **Patch releases**: As needed
- **Major releases**: Monthly

### Release Windows
- **Primary**: Tuesday-Thursday, 10 AM - 2 PM UTC
- **Emergency**: Anytime with team notification
- **Freeze periods**: Fridays, weekends, holidays

---

## METRICS & REPORTING

### Key Metrics Tracked
- Build success rate (target: >95%)
- Deployment frequency (target: daily)
- Mean time to recovery (target: <1 hour)
- Change failure rate (target: <5%)

### Reporting
- Weekly deployment summary to team
- Monthly platform stability report
- Quarterly architecture review
- Incident reports within 24 hours

---

*Last Updated*: March 13, 2026  
*Version*: 1.0.0  
*Status*: PRODUCTION READY ✅
