# ============================================
# VAYVA AI AGENT - Production Dockerfile
# ML-Enhanced AI Agent with zero external API costs
# ============================================

FROM node:20-slim AS base

# Install dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    wget \
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
COPY packages/ai-agent/package.json ./packages/ai-agent/
COPY packages/db/package.json ./packages/db/
COPY packages/shared/package.json ./packages/shared/

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

# Copy source code
COPY packages/ai-agent ./packages/ai-agent
COPY packages/db ./packages/db
COPY packages/shared ./packages/shared
COPY pnpm-workspace.yaml package.json tsconfig.json ./

# Build the packages
RUN pnpm --filter @vayva/db build
RUN pnpm --filter @vayva/ai-agent build

# ============================================
# Production Stage
# ============================================
FROM node:20-slim AS production

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Create app directory
WORKDIR /app

# Copy workspace files
COPY pnpm-workspace.yaml package.json ./

# Copy built packages
COPY --from=builder /app/packages/ai-agent/dist ./packages/ai-agent/dist
COPY --from=builder /app/packages/ai-agent/package.json ./packages/ai-agent/
COPY --from=builder /app/packages/db/dist ./packages/db/dist
COPY --from=builder /app/packages/db/package.json ./packages/db/
COPY --from=builder /app/packages/db/src/generated ./packages/db/src/generated
COPY --from=builder /app/packages/shared ./packages/shared

# Copy node_modules
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/ai-agent/node_modules ./packages/ai-agent/node_modules
COPY --from=builder /app/packages/db/node_modules ./packages/db/node_modules

# Create non-root user
RUN groupadd -r vayva && useradd -r -g vayva vayva
RUN chown -R vayva:vayva /app
USER vayva

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -q --spider http://localhost:3000/health || exit 1

# Start the service
CMD ["node", "packages/ai-agent/dist/index.js"]
