# Vayva Merchant Admin

This is the primary application for the Vayva platform, serving as the seller dashboard, marketing site, and onboarding flow.

## 🚀 Consolidation Status

As of December 2025, several legacy apps have been consolidated into this project for better maintenance and unified user experience:

- **Marketing Landing Page**: Integrated at `src/app/(marketing)/page.tsx`
- **Merchant Onboarding**: Integrated into the main dashboard flow.
- **Authentication**: Unified logic using JWT sessions and NextAuth.

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS & @vayva/ui (Radix based)
- **Database**: Prisma (PostgreSQL)
- **Auth**: Custom JWT sessions + NextAuth (Fallback)
- **API**: Axios with centralized `apiClient`

## 📦 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- A running PostgreSQL database

### Development

```bash
# From the root directory
pnpm run dev --filter merchant-admin
```

The app will be available at `http://localhost:3000`.

## 🧪 Testing

End-to-end tests are located in the root `tests/e2e` directory and cover:

- Login/Signup flows
- Onboarding wizard
- Product management
- Order lifecycle
- Billing & Pricing guardrails

## 🚀 Deployment

This project is configured for seamless deployment on Vercel.
Refer to `VERCEL_MASTER_SETUP.md` in the root for environment variable requirements.
