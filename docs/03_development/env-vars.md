# Environment Variables (Canonical)

**Owner:** Nyamsi Fredrick, Founder
**Last updated:** 2026-03-04

## Rules
- Never commit secrets.
- Local dev uses `.env.local`.
- `.env.example` provides placeholders.

## 1) Database
- `DATABASE_URL`
  - PostgreSQL connection string

## 2) Redis
- `REDIS_URL`
  - Used for caching and BullMQ

## 3) Auth
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `JWT_SECRET`

## 4) Payments (Paystack)
- `PAYSTACK_SECRET_KEY`
- `NEXT_PUBLIC_PAYSTACK_KEY`
- `PAYSTACK_MOCK`

## 5) Email (Resend)
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`

## 6) AI
- `GROQ_API_KEY`
- `GROQ_ADMIN_KEY`
- `GROQ_MARKETING_KEY`
- `GROQ_WHATSAPP_KEY`
- `GROQ_API_KEY_RESCUE`
- `OPENAI_API_KEY`

## 7) Delivery (Kwik)
- `KWIK_BASE_URL`
- `KWIK_EMAIL`
- `KWIK_PASSWORD`
- `KWIK_DOMAIN_NAME`

## 8) File storage
- `MINIO_ENDPOINT`
- `MINIO_PORT`
- `MINIO_ACCESS_KEY`
- `MINIO_SECRET_KEY`
- `MINIO_BUCKET`
- `MINIO_USE_SSL`
- `MINIO_PUBLIC_BASE_URL`

## 9) WhatsApp / Evolution
- `EVOLUTION_API_URL`
- `EVOLUTION_API_KEY`
- `EVOLUTION_INSTANCE_NAME`

## 10) Canonical URLs
- `MARKETING_BASE_URL`
- `MERCHANT_BASE_URL`
- `OPS_BASE_URL`
- `STOREFRONT_ROOT_DOMAIN`
- `STOREFRONT_PROTOCOL`
- `PUBLIC_ASSETS_BASE_URL`

## 11) App URLs (legacy)
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_STOREFRONT_URL`
- `NEXT_PUBLIC_OPS_URL`
- `NEXT_PUBLIC_MARKETING_URL`

## 12) Internal
- `INTERNAL_API_SECRET`

## Notes
The repo contains legacy `SERVICE_URL_*` variables for an api-gateway pattern. Document usage only if those services are confirmed active.
