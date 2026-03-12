# Git + GitHub Workflow (Vayva)

This is the contribution workflow for Vayva.

## Principles
- Small PRs ship faster and are easier to review.
- You must keep `main` in a releasable state.
- CI is the gatekeeper.

## 1) Branching
### 1.1 Create a branch
From `main`:
```bash
git checkout main
git pull
git checkout -b feat/<short-description>
```
Recommended prefixes:
- `feat/` — new feature
- `fix/` — bug fix
- `chore/` — tooling, cleanup
- `docs/` — docs-only change
- `refactor/` — refactors

### 1.2 Keep your branch up to date
```bash
git fetch origin
git rebase origin/main
```
If your team prefers merge-based updates:
```bash
git merge origin/main
```

## 2) Commits
### 2.1 Commit messages
Use conventional commits when possible:
- `feat: ...`
- `fix: ...`
- `chore: ...`
- `docs: ...`

Example:
```bash
git commit -m "fix: validate Paystack webhook signature"
```

### 2.2 Avoid committing secrets
Never commit:
- `.env.local`
- API keys
- passwords

If you accidentally commit a secret:
- stop
- rotate the secret
- remove the secret from history (requires maintainer process)

## 3) Before opening a PR
Run:
```bash
pnpm -w lint
pnpm -w typecheck
pnpm -w test
```
Optional but recommended:
```bash
pnpm -w test:e2e
```

## 4) Open the PR
Push:
```bash
git push -u origin <your-branch>
```
Then open a PR in GitHub.

## 5) PR checklist
- Scope is small and focused
- Code compiles and passes tests
- No secrets
- Docs updated (if behavior changed)
- Screenshots for UI changes

## 6) Code review etiquette
- If you disagree, propose an alternative with reasoning.
- Prefer small iterative changes over huge rewrites.

## 7) Handling CI failures
### 7.1 Get logs
- Open the failed GitHub Action run
- Identify the failing step (lint/typecheck/tests)

### 7.2 Fix and push
```bash
git add -A
git commit -m "fix: address CI failures"
git push
```

## 8) Merge strategy
Use the team’s default (squash merge recommended).
- Squash merges keep history clean.
- Ensure the PR title is meaningful.
