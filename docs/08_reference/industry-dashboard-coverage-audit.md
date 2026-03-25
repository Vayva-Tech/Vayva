# Industry dashboard coverage audit

Date: 2026-03-25

This audit cross-checks the canonical industry list against:

- Backend industry config: `Backend/core-api/src/config/industry.ts` + `Backend/core-api/src/config/industry-additions.ts`
- Frontend merchant industry config: `Frontend/merchant/src/config/industry.ts`
- Industry-native dashboard registry: `Frontend/merchant/src/config/industry-dashboard-definitions.ts` (the `DEFINITIONS` map)
- Dashboard router handling: `Frontend/merchant/src/components/dashboard/IndustryDashboardRouter.tsx`
- Universal PRO+ inline industry branches: `Frontend/merchant/src/components/dashboard/UniversalProDashboard.tsx` (explicit `industry === '...'` branches)
- Route existence: all `/dashboard/...` paths referenced in `Frontend/merchant/src/config/industry.ts` exist as `Frontend/merchant/src/app/(dashboard)/dashboard/**/page.tsx` (0 missing at time of audit)

## Executive summary

- **Missing industry-native definitions (16)**: `analytics`, `catering`, `fitness`, `healthcare`, `hotel`, `jobs`, `legal`, `meal-kit`, `petcare`, `restaurant`, `saas`, `salon`, `spa`, `specialized`, `wellness`, `wholesale`.
- **Universal dashboard has explicit industry-specific PRO+ inline blocks for only 6 industries**: `events`, `automotive`, `travel_hospitality`, `nonprofit`, `education`, `food`.
- **Backend industry config is missing some frontend slugs**: backend includes all canonical slugs except `petcare`, `specialized`, `wellness` (frontend includes them).
- **Industry routes are broadly implemented**: all `/dashboard/...` routes declared in frontend industry configs have corresponding pages.

## Coverage table (canonical `IndustrySlug`)

Legend:
- **BE**: backend config includes slug
- **FE**: frontend config includes slug
- **NativeDef**: `industry-dashboard-definitions.ts` registry includes slug
- **RouterCase**: `IndustryDashboardRouter` has a `case 'slug':` branch (may map to an industry package dashboard OR universal fallback)
- **UniversalBranch**: `UniversalProDashboard.tsx` has explicit `industry === 'slug'` UI branch (currently PRO+ inline operations)

| Industry | BE | FE | NativeDef | RouterCase | UniversalBranch |
|---|---:|---:|---:|---:|---:|
| analytics | ✅ | ✅ | ❌ | ✅ | ❌ |
| automotive | ✅ | ✅ | ✅ | ✅ | ✅ |
| b2b | ✅ | ✅ | ✅ | ❌ | ❌ |
| beauty | ✅ | ✅ | ✅ | ❌ | ❌ |
| blog_media | ✅ | ✅ | ✅ | ✅ | ❌ |
| catering | ✅ | ✅ | ❌ | ❌ | ❌ |
| creative_portfolio | ✅ | ✅ | ✅ | ❌ | ❌ |
| digital | ✅ | ✅ | ✅ | ❌ | ❌ |
| education | ✅ | ✅ | ✅ | ❌ | ✅ |
| electronics | ✅ | ✅ | ✅ | ✅ | ❌ |
| events | ✅ | ✅ | ✅ | ✅ | ✅ |
| fashion | ✅ | ✅ | ✅ | ✅ | ❌ |
| fitness | ✅ | ✅ | ❌ | ✅ | ❌ |
| food | ✅ | ✅ | ✅ | ✅ | ✅ |
| grocery | ✅ | ✅ | ✅ | ✅ | ❌ |
| healthcare | ✅ | ✅ | ❌ | ❌ | ❌ |
| hotel | ✅ | ✅ | ❌ | ❌ | ❌ |
| jobs | ✅ | ✅ | ❌ | ❌ | ❌ |
| legal | ✅ | ✅ | ❌ | ✅ | ❌ |
| marketplace | ✅ | ✅ | ✅ | ❌ | ❌ |
| meal-kit | ✅ | ✅ | ❌ | ✅ | ❌ |
| nightlife | ✅ | ✅ | ✅ | ✅ | ❌ |
| nonprofit | ✅ | ✅ | ✅ | ✅ | ✅ |
| one_product | ✅ | ✅ | ✅ | ✅ | ❌ |
| petcare | ❌ | ✅ | ❌ | ✅ | ❌ |
| real_estate | ✅ | ✅ | ✅ | ✅ | ❌ |
| restaurant | ✅ | ✅ | ❌ | ✅ | ❌ |
| retail | ✅ | ✅ | ✅ | ✅ | ❌ |
| saas | ✅ | ✅ | ❌ | ✅ | ❌ |
| salon | ✅ | ✅ | ❌ | ❌ | ❌ |
| services | ✅ | ✅ | ✅ | ✅ | ❌ |
| specialized | ❌ | ✅ | ❌ | ✅ | ❌ |
| spa | ✅ | ✅ | ❌ | ✅ | ❌ |
| travel_hospitality | ✅ | ✅ | ✅ | ✅ | ✅ |
| wellness | ❌ | ✅ | ❌ | ✅ | ❌ |
| wholesale | ✅ | ✅ | ❌ | ✅ | ❌ |

## Notes on “not done / not well implemented”

Industries with **existing pages/routes but no industry-native dashboard definition** are the biggest “feels generic” cluster, because `generateDashboardConfig()` will throw or fall back and the dashboard layer lacks industry-specific thresholds/actions/labels.

Separately, even where industry-native definitions exist, the **Universal PRO+ inline operations** currently renders custom widgets for only a small subset (6 industries), so other industries will still feel generic inside `UniversalProDashboard` unless their industry package dashboard is used.

