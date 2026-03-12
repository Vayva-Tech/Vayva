# Troubleshooting (Onboarding)

This is a quick index of common problems and fixes.

## pnpm
### Install fails / lockfile issues
- Ensure you are using pnpm from Corepack:
```bash
corepack enable
pnpm -v
```

### “Unsupported engine”
- Use the repo Node version:
```bash
nvm install
nvm use
node -v
```

## Turbo
### Dev is running but an app is not starting
- Turbo runs many tasks concurrently.
- Look for the specific app logs in the terminal output.

## Prisma / DB
### “P1001: Can’t reach database server”
- Your `DATABASE_URL` points to a DB that is not running or blocked.
- Confirm host/port.

### “Client did not initialize yet”
- Run:
```bash
pnpm -w db:generate
```

## Next.js
### Port already in use
- Something is already running.
- Either stop it or change the app port.

## Git
### Merge conflicts during rebase
- Resolve conflicts in files
- Then:
```bash
git add -A
git rebase --continue
```

### Accidentally committed a secret
- Stop.
- Rotate the secret.
- Tell a maintainer.

## Docs issues
If any onboarding doc step doesn’t work on your machine:
- open a PR under `docs/`
- fix the step
- explain what was wrong and what the correct output is
