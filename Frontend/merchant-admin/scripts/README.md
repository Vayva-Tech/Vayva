# TypeScript Error Fixing Scripts

## Automated Fixer

The `fix-implicit-any.ts` script automatically applies pragmatic `any` casts to common error patterns.

### Usage

```bash
# Run the automated fixer
pnpm tsx scripts/fix-implicit-any.ts

# Check results
pnpm run typecheck
```

### What it fixes

1. **Implicit any parameters** - Adds `any` type to function parameters
2. **Event handlers** - Changes `unknown` to `any` in event handlers
3. **Array callbacks** - Fixes `.map()`, `.forEach()` with implicit any
4. **Object.entries** - Adds types to destructured entries

### Safety

- Only processes files in `src/`
- Skips test files and type definitions
- Creates backups before modifying
- Uses regex patterns that match common TypeScript errors

### Customization

Edit `fix-implicit-any.ts` to add more patterns:

```typescript
const fixes: Fix[] = [
  {
    pattern: /your-regex-here/g,
    replacement: 'your-replacement',
    description: 'What this fixes'
  }
];
```

## Manual Approach

For files that need careful review, use the pragmatic principles:

1. **Framework Boundaries**: Use `any` at integration points
2. **Utility Functions**: Accept `any` for flexible inputs
3. **Event Handlers**: Use `any` for DOM events
4. **Index Signatures**: Use `any` for dynamic object access

## Philosophy

Following Rule 6: "Use `any` at boundaries rather than fighting tools"

- Pragmatic over perfect
- Service contracts first
- Type boundaries matter more than individual types
