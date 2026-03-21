# ============================================
# VAYVA CORE API - Production Dockerfile
# Multi-stage build with zero-trust security
# ============================================

FROM node:20-slim AS base

# Install dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# ============================================
# Dependencies Stage
# ============================================
FROM base AS dependencies

WORKDIR /app

# Copy workspace configuration
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY Backend/core-api/package.json ./Backend/core-api/
COPY packages/*/package.json ./packages/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================
# Build Stage
# ============================================
FROM base AS builder

WORKDIR /app

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages ./packages
COPY --from=dependencies /app/Backend/core-api ./Backend/core-api

# Copy source code
COPY Backend/core-api ./Backend/core-api
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared
COPY pnpm-workspace.yaml package.json tsconfig.json ./

# Generate Prisma Client
RUN pnpm turbo run db:generate

# Build the packages
RUN pnpm --filter @vayva/db build
RUN pnpm --filter @vayva/shared build
RUN pnpm --filter vayva-core-api build

# ============================================
# Production Stage
# ============================================
FROM node:20-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    dumb-init \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create app directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./

# Copy built packages
COPY --from=builder /app/Backend/core-api/dist ./Backend/core-api/dist
COPY --from=builder /app/Backend/core-api/package.json ./Backend/core-api/
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/db/src/generated ./packages/db/src/generated
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/

# Copy node_modules (production only)
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/db/node_modules ./packages/db/node_modules
COPY --from=builder /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=builder /app/Backend/core-api/node_modules ./Backend/core-api/node_modules

# Create non-root user
RUN groupadd -r vayva && useradd -r -g vayva vayva
RUN chown -R vayva:vayva /app
USER vayva

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:3000/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the service
CMD ["node", "Backend/core-api/dist/index.js"]
