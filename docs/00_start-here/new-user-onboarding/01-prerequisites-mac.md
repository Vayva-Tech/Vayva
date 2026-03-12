# New User Onboarding (macOS) — Prerequisites

This guide gets a brand new Mac set up to contribute to Vayva.

## Goal
At the end, you can:
- clone the repo
- install dependencies
- run the apps locally
- run typecheck/tests

## 0) Required accounts
- GitHub account
- Access to the Vayva GitHub org/repo (see `02-getting-access.md`)

## 1) Install Homebrew
### Install
Run:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Verify
```bash
brew --version
```
Expected: prints a Homebrew version.

## 2) Install Git
### Install
```bash
brew install git
```

### Verify
```bash
git --version
```

## 3) Install Node.js (match repo)
Vayva uses a pinned Node version via `.nvmrc`.

### Install nvm
```bash
brew install nvm
mkdir -p ~/.nvm
```

Add to your shell profile (`~/.zshrc`):
```bash
export NVM_DIR="$HOME/.nvm"
[ -s "$(brew --prefix nvm)/nvm.sh" ] && \. "$(brew --prefix nvm)/nvm.sh"
```

Restart your terminal.

### Install the repo Node version
From repo root:
```bash
nvm install
nvm use
node -v
```
Expected: version matches `.nvmrc`.

## 4) Install pnpm
Vayva uses pnpm workspaces.

### Install
```bash
corepack enable
corepack prepare pnpm@latest --activate
pnpm -v
```

## 5) Install Docker (recommended)
Some workflows may require Docker.

### Install
- Install Docker Desktop: https://www.docker.com/products/docker-desktop/

### Verify
```bash
docker --version
```

## 6) Install Postgres client tools (optional but useful)
```bash
brew install postgresql@16
psql --version
```

## 7) IDE setup
- Use your IDE (VS Code, WebStorm, etc.)
- Recommended VS Code extensions:
  - ESLint
  - Prettier
  - Prisma

## Common failures
### “command not found: brew”
- Homebrew install step did not add itself to PATH.
- Follow the Homebrew post-install instructions printed by the installer.

### “nvm: command not found”
- Ensure your `~/.zshrc` has the nvm snippet above.
- Restart terminal.
