# Docs Site (Rendered Documentation)

This repo stores documentation as Markdown under `docs/`. The plan is to render it as a docs website later.

## Goals
- Turn `docs/` into a browsable website
- Keep Markdown as the source of truth
- Keep CI guardrails (broken links + secret scan)

## Option A: Docusaurus (recommended for product docs)
### Pros
- Great navigation + search ecosystem
- Good for large doc sets

### Cons
- Adds a JS build system + dependencies

### Implementation plan (high level)
1. Create a new workspace package, e.g. `platform/docs-site/`.
2. Initialize Docusaurus.
3. Configure it to load docs from repo `docs/`.
4. Add a CI job to build the docs site.
5. Deploy (Vercel or static hosting).

## Option B: MkDocs (recommended for engineering runbooks)
### Pros
- Simple
- Fast
- Python-based

### Cons
- Less “app-like” than Docusaurus

### Implementation plan (high level)
1. Add `mkdocs.yml` at repo root or under `platform/docs-site/`.
2. Choose a theme (e.g. Material).
3. Configure nav from `docs/`.
4. Add CI build step.

## Current CI guardrails
Docs are validated by:
- `platform/scripts/ci/check-docs-links.js`
- `platform/scripts/ci/check-docs-secrets.js`

They run via:
- `pnpm -w ci:guards`

## Deployment
When ready, deploy the docs site:
- Vercel static build, or
- GitHub Pages, or
- VPS nginx static hosting
