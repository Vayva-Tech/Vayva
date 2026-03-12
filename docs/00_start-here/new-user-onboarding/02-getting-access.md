# New User Onboarding — Getting Access (GitHub + Repo)

This guide is about access. It assumes you already installed prerequisites from `01-prerequisites-mac.md`.

## Goal
By the end you can:
- authenticate to GitHub
- clone the repo
- push a branch
- open a Pull Request

## 1) Get GitHub access
### 1.1 Join the GitHub org/repo
- Ask an existing maintainer to invite you to the Vayva GitHub org/repo.
- Accept the invite email.

### 1.2 Enable GitHub 2FA
- Go to GitHub: Settings → Password and authentication
- Enable 2-factor authentication

## 2) Set up SSH keys (recommended)
SSH avoids repeated password prompts and is the standard for engineering teams.

### 2.1 Check if you already have a key
```bash
ls -la ~/.ssh
```
Look for files like:
- `id_ed25519` and `id_ed25519.pub`

### 2.2 Create a new SSH key (ed25519)
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```
- When asked for a file location, press Enter to accept default
- Use a passphrase (recommended)

### 2.3 Add key to SSH agent
```bash
eval "$(ssh-agent -s)"
ssh-add --apple-use-keychain ~/.ssh/id_ed25519
```

### 2.4 Add your public key to GitHub
Copy the public key:
```bash
pbcopy < ~/.ssh/id_ed25519.pub
```
Then:
- GitHub → Settings → SSH and GPG keys → New SSH key
- Paste the key

### 2.5 Verify GitHub SSH auth
```bash
ssh -T git@github.com
```
Expected: a success message.

## 3) Clone the repo
### 3.1 Choose a working folder
Example:
```bash
mkdir -p ~/code
cd ~/code
```

### 3.2 Clone
Use the repo SSH URL.
```bash
git clone <REPO_SSH_URL>
cd vayva
```

## 4) Configure Git identity
```bash
git config --global user.name "Your Name"
git config --global user.email "your_email@example.com"
```

## 5) First push test (optional but recommended)
This validates you can push.

```bash
git checkout -b chore/onboarding-test
mkdir -p .tmp
printf "ok\n" > .tmp/onboarding-test.txt
git add .tmp/onboarding-test.txt
git commit -m "chore: onboarding push test"
git push -u origin chore/onboarding-test
```

If the repo blocks direct pushes, you will still be able to push branches and open PRs (normal).

## Rollback / cleanup
Remove the test branch:
```bash
git checkout main
# delete local branch
git branch -D chore/onboarding-test
# delete remote branch
git push origin --delete chore/onboarding-test
```

## Common failures
### “Permission denied (publickey)”
- SSH key not added to GitHub
- Wrong key loaded in agent

Fix:
- Re-run SSH steps above
- Confirm `ssh -T git@github.com` works

### “Repository not found”
- You don’t have access to the repo/org yet
- You cloned the wrong URL
