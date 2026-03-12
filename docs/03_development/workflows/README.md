# Development Workflows

**Owner:** Nyamsi Fredrick, Founder  
**Last Updated:** March 2026

---

## Overview

This document describes the development workflows for the Vayva team, including Git workflow, code review process, and deployment procedures.

## Git Workflow

### Branch Strategy

We use a trunk-based development workflow:

```
main (production)
  ↑
feature/user-auth  ← Your feature branch
  ↑
  git checkout -b feature/user-auth
```

### Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/whatsapp-ai` |
| Bug Fix | `fix/description` | `fix/checkout-error` |
| Hotfix | `hotfix/description` | `hotfix/payment-webhook` |
| Release | `release/version` | `release/v1.2.0` |

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Code style (formatting) |
| `refactor` | Code refactoring |
| `test` | Adding/updating tests |
| `chore` | Maintenance tasks |

**Examples:**

```bash
feat(orders): add AI order capture from WhatsApp

fix(payments): resolve Paystack webhook signature validation

docs(api): update authentication endpoints

refactor(db): optimize order queries with indexes
```

## Development Workflow

### 1. Start New Work

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature
```

### 2. Make Changes

```bash
# Make your changes
# ...

# Run checks
pnpm typecheck
pnpm lint
pnpm test

# Commit changes
git add .
git commit -m "feat(feature): description"
```

### 3. Push and Create PR

```bash
# Push branch
git push -u origin feature/your-feature

# Create PR via GitHub CLI or web
gh pr create --title "feat: your feature" --body "Description"
```

### 4. Code Review

**Reviewer Checklist:**
- [ ] Code follows style guidelines
- [ ] Tests included and passing
- [ ] No security issues
- [ ] Performance considerations
- [ ] Documentation updated

**Author Checklist:**
- [ ] Self-reviewed
- [ ] Tests added/updated
- [ ] Type checking passes
- [ ] Linting passes
- [ ] PR description is clear

### 5. Merge

```bash
# After approval
git checkout main
git pull origin main
git merge --no-ff feature/your-feature
git push origin main

# Delete branch
git branch -d feature/your-feature
git push origin --delete feature/your-feature
```

## Code Review Process

### Review Guidelines

**For Reviewers:**
1. Review within 24 hours
2. Be constructive and specific
3. Approve if minor issues only
4. Request changes if significant
5. Test locally if complex changes

**For Authors:**
1. Keep PRs focused and small (< 500 lines)
2. Provide context in description
3. Respond to feedback promptly
4. Resolve conversations after fixing
5. Re-request review when ready

### Review Comments

Use these prefixes:

| Prefix | Meaning | Action Required |
|--------|---------|-----------------|
| `nit:` | Nitpick | Optional |
| `question:` | Need clarification | Required |
| `suggestion:` | Recommended change | Optional |
| `blocking:` | Must fix | Required |

## Release Workflow

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH

1.2.3
↑ ↑ ↑
│ │ └── Patch: Bug fixes
│ └──── Minor: New features (backward compatible)
└────── Major: Breaking changes
```

### Release Process

1. **Prepare Release**
   ```bash
   git checkout -b release/v1.2.0
   # Update version numbers
   # Update changelog
   ```

2. **Testing**
   - Run full test suite
   - QA verification
   - Staging deployment

3. **Deploy**
   ```bash
   git checkout main
   git merge --no-ff release/v1.2.0
   git tag v1.2.0
   git push origin main --tags
   ```

4. **Post-Release**
   - Monitor error rates
   - Check performance metrics
   - Announce release

## Hotfix Workflow

For critical production issues:

```bash
# Create hotfix from main
git checkout main
git checkout -b hotfix/critical-fix

# Make fix
# ...

# Fast-track review and merge
git checkout main
git merge --no-ff hotfix/critical-fix
git push origin main

# Deploy immediately
```

## CI/CD Pipeline

### Automated Checks

Every PR triggers:

1. **Type Check** - TypeScript validation
2. **Lint** - ESLint checks
3. **Unit Tests** - Vitest tests
4. **Build** - Production build
5. **E2E Tests** - Playwright tests (on main)

### Deployment Stages

```
PR → Build → Test → Merge → Staging → Production
```

| Stage | Trigger | Environment |
|-------|---------|-------------|
| Preview | PR created | Vercel Preview |
| Staging | Merge to main | staging.vayva.ng |
| Production | Tag push | vayva.ng |

## Environment Management

### Environments

| Environment | URL | Purpose |
|-------------|-----|---------|
| Local | localhost | Development |
| Preview | *.vercel.app | PR previews |
| Staging | staging.vayva.ng | Pre-production |
| Production | vayva.ng | Live |

### Environment Variables

```bash
# Local (.env.local)
NODE_ENV=development
DATABASE_URL=postgresql://localhost/vayva_dev

# Staging (.env.staging)
NODE_ENV=staging
DATABASE_URL=postgresql://staging/...

# Production (.env.production)
NODE_ENV=production
DATABASE_URL=postgresql://prod/...
```

## Communication

### Daily Standup

**Format:**
- What did you work on yesterday?
- What are you working on today?
- Any blockers?

### Sprint Planning

**Bi-weekly:**
- Review backlog
- Estimate tasks
- Assign owners
- Set sprint goals

### Documentation

- Update docs with code changes
- Document decisions in ADRs
- Keep README files current

## Best Practices

### DO

- Write clear commit messages
- Keep PRs small and focused
- Test before requesting review
- Update documentation
- Communicate blockers early

### DON'T

- Push directly to main
- Merge without review
- Skip tests
- Leave commented code
- Break the build

---

**Questions?** Contact dev-ops@vayva.ng
