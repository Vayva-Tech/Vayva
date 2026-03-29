# Quick Installation Guide - Auth Backend Dependencies

## Step 1: Install New Dependencies

Navigate to the Fastify server directory and install the new dependencies:

```bash
cd Backend/fastify-server
pnpm install
```

This will install:
- `bcryptjs@2.4.3` - For secure password hashing
- `@types/bcryptjs@2.4.6` - TypeScript type definitions

## Step 2: Configure Environment Variables

Add these to your `.env` file (`.env.local`, `.env.development`, or `.env.production`):

```bash
# ============================================
# AUTHENTICATION CONFIGURATION
# ============================================

# JWT Secret (REQUIRED)
# Generate a random string of at least 32 characters
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# Resend Email API Key (REQUIRED for email delivery)
# Get your key from https://resend.com/api-keys
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxx

# Frontend URL (REQUIRED for password reset links)
FRONTEND_URL=https://merchant.vayva.ng

# Allowed CORS Origins (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,https://merchant.vayva.ng

# Optional: Override default email addresses
OTP_FROM_EMAIL=no-reply@vayva.ng
SUPPORT_FROM_EMAIL=support@vayva.ng

# Logging Level (debug, info, warn, error)
LOG_LEVEL=info
```

## Step 3: Set Up Resend (Email Service)

### 3.1 Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up with your email
3. Verify your email address

### 3.2 Create API Key

1. Navigate to **API Keys** in the Resend dashboard
2. Click "Create API Key"
3. Give it a name (e.g., "Vayva Merchant Auth")
4. Copy the API key (starts with `re_`)
5. Add it to your `.env` file as `RESEND_API_KEY`

### 3.3 Add Domain (Production Only)

For production email delivery:

1. Go to **Domains** in Resend dashboard
2. Click "Add Domain"
3. Enter `vayva.ng`
4. Add the DNS records provided by Resend to your domain's DNS settings:

**Example DNS Records**:
```
Type: TXT
Name: vayva.ng
Value: v=spf1 include:resend.dev ~all

Type: CNAME  
Name: resend._domainkey.vayva.ng
Value: resend._domainkey.resend.dev

Type: CNAME
Name: resend.forwarding._domainkey.vayva.ng  
Value: resend.forwarding._domainkey.resend.dev
```

5. Wait for DNS propagation (can take up to 48 hours, usually faster)
6. Once verified, set `vayva.ng` as your default sending domain

### 3.4 Test Email Delivery

After configuration, test that emails are working:

```bash
# Start the server
cd Backend/fastify-server
pnpm dev

# In another terminal, test registration endpoint
curl -X POST http://localhost:3001/api/auth/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@example.com",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User",
    "storeName": "Test Store",
    "otpMethod": "EMAIL"
  }'
```

Check your email inbox for the OTP verification email!

## Step 4: Verify Installation

### 4.1 Check Dependencies

Verify that bcryptjs is installed:

```bash
pnpm list bcryptjs
```

You should see:
```
bcryptjs@2.4.3
```

### 4.2 Test Password Hashing

Create a test file to verify bcrypt is working:

```typescript
// test-bcrypt.ts
import bcrypt from 'bcryptjs';

async function test() {
  const password = 'TestPassword123';
  const hash = await bcrypt.hash(password, 10);
  const isValid = await bcrypt.compare(password, hash);
  
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('Valid:', isValid);
}

test();
```

Run it:
```bash
npx tsx test-bcrypt.ts
```

Expected output:
```
Password: TestPassword123
Hash: $2a$10$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Valid: true
```

### 4.3 Check Server Starts

Start the Fastify server and check for any errors:

```bash
pnpm dev
```

Look for these log messages:
```
✅ Rate limiting configured successfully
Server listening on port 3001
```

No errors related to bcrypt or missing dependencies!

## Step 5: Database Setup (Optional - For Full Implementation)

If you want to implement the full database integration:

### 5.1 Install Prisma (if not already installed)

```bash
pnpm add -D prisma
pnpm add @prisma/client
```

### 5.2 Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema
- `.env` - Database connection string

### 5.3 Configure Database Connection

Add to your `.env`:

```bash
# PostgreSQL Database
DATABASE_URL=postgresql://username:password@localhost:5432/vayva_db?schema=public
```

Or for local development with Docker:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vayva_db?schema=public
```

### 5.4 Add Auth Models to schema.prisma

Copy the models from the documentation into `prisma/schema.prisma`:

```prisma
model User {
  id               String    @id @default(cuid())
  email            String    @unique
  passwordHash     String
  firstName        String?
  lastName         String?
  role             Role      @default(OWNER)
  emailVerified    Boolean   @default(false)
  phone            String?
  phoneVerified    Boolean   @default(false)
  twoFactorEnabled Boolean   @default(false)
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
  
  merchant         Merchant?
  
  @@index([email])
}

// ... (add all other models from the documentation)
```

### 5.5 Generate Migration

```bash
npx prisma migrate dev --name init_auth_models
```

### 5.6 Generate Prisma Client

```bash
npx prisma generate
```

### 5.7 Push Schema to Database

```bash
npx prisma db push
```

## Step 6: Testing Complete Flow

### Test Registration → OTP → Login Flow

```bash
# 1. Register new account
curl -X POST http://localhost:3001/api/auth/merchant/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe",
    "storeName": "My Test Store"
  }'

# Response should include userId and confirmation that OTP was sent

# 2. Check your email for the OTP code

# 3. Verify OTP
curl -X POST http://localhost:3001/api/auth/merchant/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456",
    "method": "EMAIL"
  }'

# Response should include JWT token and user data

# 4. Login with the verified account
curl -X POST http://localhost:3001/api/auth/merchant/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'

# Should return JWT token (may require OTP if enabled)
```

## Troubleshooting

### Issue: bcrypt module not found

**Solution**: Make sure you ran `pnpm install` in the `Backend/fastify-server` directory.

```bash
cd Backend/fastify-server
pnpm install bcryptjs @types/bcryptjs
```

### Issue: Resend API error - unauthorized

**Solution**: Check your RESEND_API_KEY is correct and starts with `re_`.

```bash
# Verify in your .env
echo $RESEND_API_KEY
```

### Issue: Emails not being delivered

**Solutions**:
1. Check Resend dashboard for delivery status
2. Verify domain DNS records are set up correctly
3. Check spam folder
4. Ensure RESEND_API_KEY is set in environment

### Issue: Database connection error

**Solution**: Verify your DATABASE_URL is correct and database is running.

```bash
# Test database connection
npx prisma studio
```

## Next Steps

After successful installation:

1. ✅ Test all authentication endpoints
2. ✅ Verify email delivery is working
3. ✅ Check password hashing with bcrypt
4. ✅ Review logs for any errors
5. ⏳ Proceed to frontend integration (Phase 1B)

---

**Need Help?**
- Check the main documentation: [`PHASE_1A_BACKEND_AUTHENTICATION_PRODUCTION_READY.md`](file:///Users/fredrick/Documents/Vayva-Tech/vayva/docs/PHASE_1A_BACKEND_AUTHENTICATION_PRODUCTION_READY.md)
- Review Resend docs: [https://resend.com/docs](https://resend.com/docs)
- Check server logs for detailed error messages
