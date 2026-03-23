# Git Workflow

> Vayva Engineering — Last updated: March 2026
> Owner: Engineering

This document defines how the Vayva team uses Git: branch names, commit messages, pull request process, code review standards, and the release cycle.

---

## Table of Contents

1. [Branching Strategy](#branching-strategy)
2. [Commit Conventions](#commit-conventions)
3. [Pull Request Process](#pull-request-process)
4. [Code Review Requirements](#code-review-requirements)
5. [Release Process](#release-process)
6. [Vercel Auto-Deployments](#vercel-auto-deployments)

---

## Branching Strategy

### Permanent branches

| Branch | Purpose | Maps to |
|--------|---------|---------|
| `main` | Production-ready code. Every commit here is live. | Production (vayva.ng, merchant.vayva.ng, ops.vayva.ng) |
| `Vayva` | Staging / active development. Integration branch before promoting to `main`. | Staging / preview deployments |

**Never force-push to `main` or `Vayva`.** These branches are protected. If you accidentally commit something wrong, revert it with a new commit.

### Feature branches

All new work starts from a feature branch cut from `Vayva`:

```bash
git checkout Vayva
git pull origin Vayva
git checkout -b feat/your-feature-name
```

#### Naming conventions

| Prefix | When to use | Example |
|--------|-------------|---------|
| `feat/` | New feature or capability | `feat/merchant-analytics-dashboard` |
| `fix/` | Bug fix | `fix/storefront-cart-total-rounding` |
| `docs/` | Documentation-only change | `docs/update-local-setup-guide` |
| `chore/` | Tooling, dependencies, CI, no user impact | `chore/upgrade-next-to-16-1-6` |
| `refactor/` | Code restructure with no behaviour change | `refactor/extract-auth-middleware` |
| `test/` | Adding or fixing tests only | `test/merchant-checkout-e2e` |
| `hotfix/` | Emergency fix that must ship directly from `main` | `hotfix/payment-webhook-500` |

Branch names should be **lowercase, hyphen-separated, and concise**. Avoid including ticket numbers in the branch name itself — put them in the PR description instead.

---

## Commit Conventions

Vayva follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Every commit message must have a structured first line.

### Format

```
<type>(<optional scope>): <short description>

[optional body]

[optional footer(s)]
```

- The first line must be **72 characters or fewer**.
- Use the **imperative mood** for the description: "add", "fix", "update", not "added", "fixed", "updated".
- The body should explain **why**, not what (the diff explains what).

### Types

| Type | When to use |
|------|-------------|
| `feat` | A new feature visible to users or other services |
| `fix` | A bug fix |
| `docs` | Documentation changes only |
| `chore` | Maintenance: deps, tooling, CI, config — no production code change |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test` | Adding or correcting tests |
| `perf` | Performance improvement |
| `style` | Formatting, whitespace — no logic change |
| `revert` | Reverts a previous commit |
| `ci` | Changes to CI pipeline configuration |

### Examples

```
feat(merchant): add bulk product import via CSV

fix(storefront): correct cart total when applying a discount code

docs: add WhatsApp Evolution API integration guide

chore: upgrade pnpm to 10.2.0

feat(ops-console)!: require 2FA for ops login

BREAKING CHANGE: ops users must enrol in TOTP before next login
```

A `!` after the type/scope and a `BREAKING CHANGE:` footer signals a breaking change.

### Scope (optional but recommended)

Use the app or package name as the scope:

- `merchant`, `marketing`, `ops-console`, `storefront`
- `ui`, `shared`, `db`, `ai-agent`, `worker`
- `payments`, `whatsapp`, `auth`

---

## Pull Request Process

### Opening a PR

1. Push your branch to origin: `git push -u origin feat/your-feature-name`
2. Open a PR on GitHub targeting **`Vayva`** (not `main`).
3. Fill in the PR template:
   - **Summary** — what changed and why
   - **Test plan** — steps to verify the change works
   - **Screenshots** — for any UI change
   - **Related issues** — link any Notion ticket or GitHub issue
4. Assign yourself and request at least one reviewer.

### PR checklist before requesting review

- [ ] All CI checks pass (lint, typecheck, build, tests)
- [ ] No hardcoded secrets, domain names, or environment-specific values in committed code
- [ ] New UI components include basic accessibility attributes
- [ ] Environment variable additions are reflected in `.env.example`
- [ ] `pnpm ci:guards` passes locally (checks for hardcoded domains, missing auth wrappers, missing audit log calls)

### Draft PRs

Open a draft PR early to share work-in-progress and get early feedback. Mark it ready for review only when the checklist above is complete.

---

## Code Review Requirements

### Who reviews

- At least **one approval** from a team member before merging.
- For changes to auth, payments, or ops-console security surfaces, a second review from a senior engineer is required.

### Review expectations

**Reviewer:** Leave specific, actionable comments. If something is blocking, mark it `BLOCKING:`. If it is a suggestion, mark it `NIT:` or `SUGGESTION:`.

**Author:** Respond to every comment — either fix it, or explain why you are not fixing it. Resolve threads only after the reviewer has acknowledged.

**Both:** Keep reviews timely. Aim to review within one business day of being assigned.

### Merging

- Use **Squash and Merge** for feature and fix branches to keep `Vayva` history clean.
- Use **Merge Commit** only when merging `Vayva` into `main` for a release, to preserve the full history of what was released.
- Delete the branch after merging.

---

## Release Process

Releases happen by promoting `Vayva` into `main`.

### Standard release

1. Ensure `Vayva` is stable: all CI passes, no open blocking PRs.
2. Create a PR from `Vayva` → `main` titled `release: YYYY-MM-DD` or `release: vX.Y`.
3. Get at least one approval.
4. Merge with **Merge Commit** (not squash).
5. Vercel automatically deploys all four frontends to production within minutes (see below).
6. Tag the release on `main`:

   ```bash
   git tag -a v1.2.0 -m "release: v1.2.0"
   git push origin v1.2.0
   ```

### Hotfixes

For critical production bugs that cannot wait for the next standard release:

1. Cut a `hotfix/` branch from `main` (not `Vayva`):

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/fix-description
   ```

2. Apply the minimal fix. Get a review.
3. Merge into `main` via a PR.
4. Immediately back-merge `main` into `Vayva` to keep them in sync:

   ```bash
   git checkout Vayva
   git merge main
   git push origin Vayva
   ```

---

## Vercel Auto-Deployments

The Vayva team ("itsfredrick's projects") deploys all four Next.js frontends on Vercel. Each frontend has its own Vercel project.

### How branch deployments work

| Branch pushed | Deployment type | URL pattern |
|---------------|----------------|-------------|
| `main` | Production | `vayva.ng`, `merchant.vayva.ng`, `ops.vayva.ng`, `*.vayva.ng` |
| `Vayva` | Preview (staging) | `vayva-git-vayva-*.vercel.app` |
| Any other branch / PR | Preview | `vayva-git-<branch>-*.vercel.app` |

Every pushed commit and every opened PR automatically receives a unique preview URL. Use these URLs to validate UI changes before merging.

### Build command

All frontends use:

```
next build --webpack
```

This is set in each app's `package.json` and must not be changed to `next build` (without `--webpack`) until the Turbopack module resolution issues are resolved.

### Environment variables on Vercel

Production secrets are stored in the Vercel project settings, not in the repository. If you add a new environment variable:

1. Add it to `.env.example` with a placeholder value and a comment explaining where to get the real value.
2. Add it to the Vercel project settings for Production, Preview, and Development environments as appropriate.
3. Update `turbo.json`'s `globalPassThroughEnv` list so TurboRepo forwards it during builds.

### Monitoring deployments

Check deployment status in the Vercel dashboard or with the GitHub PR checks. A failed deployment does not automatically roll back — if a production deployment breaks, either merge a revert commit or trigger a manual redeploy of the previous commit from the Vercel dashboard.
