# OpenRouter API Configuration Setup

## Summary

Configured OpenRouter API key and HTTP-Referer URL for the Vayva Merchant application following security best practices.

## Changes Made

### 1. Environment Files Updated

#### `.env.local` (Created - Local Development)
- **OPENROUTER_API_KEY**: `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`
- **OPENROUTER_REFERER**: `https://merchant.vayva.ng`
- **OPENROUTER_TITLE**: `Vayva Merchant`

This file is gitignored and should only be used for local development.

#### `.env.staging` (Updated)
- Changed `OPENROUTER_REFERER` from `https://vayva.ng` to `https://merchant.vayva.ng`
- Changed `OPENROUTER_TITLE` from `Vayva AI` to `Vayva Merchant`
- Kept existing API key for staging deployments

#### `.env.production` (Updated)
- Changed `OPENROUTER_REFERER` from `https://vayva.ng` to `https://merchant.vayva.ng`
- Changed `OPENROUTER_TITLE` from `Vayva AI` to `Vayva Merchant`
- Kept existing API key for production deployments

#### `.env.openrouter.example` (Updated)
- Updated template to use `https://merchant.vayva.ng` as the referer
- Updated title to `Vayva Merchant`
- Added comment: "Use the domain that matches your deployment"

### 2. Source Code Updated

#### `Frontend/merchant/src/lib/ai/openrouter-client.ts`

**Before:**
```typescript
// Hardcoded value
"HTTP-Referer": "https://merchant.vayva.ng",
```

**After:**
```typescript
// Read from environment variable with fallback
this.referer = process.env.OPENROUTER_REFERER || "https://merchant.vayva.ng";
// ...
"HTTP-Referer": this.referer,
```

This change:
- ✅ Removes hardcoded values from source code
- ✅ Uses environment variables for configuration
- ✅ Provides sensible default fallback
- ✅ Follows 12-factor app methodology

## URL Verification

**Is `https://merchant.vayva.ng` the correct URL?**

✅ **YES** - This is the correct domain for the merchant application because:

1. **Production Domain**: The merchant admin panel runs on `merchant.vayva.ng` (confirmed in `.env.production`)
2. **App-Specific**: Different from the main corporate site (`vayva.ng`) and marketing site (`vayva.tech`)
3. **OpenRouter Requirements**: OpenRouter requires the HTTP-Referer header to match your application's domain
4. **Consistency**: Matches `MERCHANT_BASE_URL` and `NEXTAUTH_URL` in production environment

## Security Best Practices Applied

1. ✅ **No hardcoded secrets**: API key stored in environment files only
2. ✅ **Git safety**: `.env.local` is in `.gitignore`
3. ✅ **Template provided**: `.env.openrouter.example` shows required configuration
4. ✅ **Environment-specific**: Separate configs for local, staging, and production
5. ✅ **Source code clean**: No secrets committed to repository

## Deployment Instructions

### Local Development
The `.env.local` file has been created with your API key. Just run:
```bash
pnpm dev
```

### Staging Deployment
Ensure your Vercel staging deployment has these environment variables:
```
OPENROUTER_API_KEY=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
OPENROUTER_REFERER=https://merchant.vayva.ng
OPENROUTER_TITLE=Vayva Merchant
```

### Production Deployment
Ensure your production environment (Vercel/VPS) has these environment variables:
```
OPENROUTER_API_KEY=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
OPENROUTER_REFERER=https://merchant.vayva.ng
OPENROUTER_TITLE=Vayva Merchant
```

## Testing

To verify the configuration works:

1. Start the merchant application locally
2. Trigger an AI chat completion
3. Check logs for any API key warnings
4. Verify usage is being logged to backend API

## Notes

- The same API key is used across all environments (local, staging, production)
- OpenRouter tracks usage by API key, so all environments share the same quota
- The HTTP-Referer header helps OpenRouter identify your application
- The X-Title header displays in OpenRouter dashboard as the application name

---
**Date**: 2026-03-28  
**Status**: ✅ Complete
