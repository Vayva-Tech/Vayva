-- Migration: Add Custom Domain and SSL Support
-- Created: 2025-03-07

-- Create enum types
CREATE TYPE "DomainStatus" AS ENUM ('PENDING', 'VERIFYING', 'ACTIVE', 'FAILED', 'SUSPENDED', 'EXPIRED');
CREATE TYPE "SSLType" AS ENUM ('AUTOMATIC', 'CUSTOM', 'ADVANCED');
CREATE TYPE "SSLStatus" AS ENUM ('PENDING', 'ISSUING', 'ACTIVE', 'EXPIRING', 'EXPIRED', 'FAILED', 'REVOKED');

-- Create StoreDomain table
CREATE TABLE "store_domains" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "subdomain" TEXT NOT NULL,
    "fullSubdomain" TEXT NOT NULL,
    "status" "DomainStatus" NOT NULL DEFAULT 'PENDING',
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "isCustomDomain" BOOLEAN NOT NULL DEFAULT false,
    "dnsVerified" BOOLEAN NOT NULL DEFAULT false,
    "dnsVerifiedAt" TIMESTAMP(3),
    "dnsRecords" JSONB,
    "sslId" TEXT,
    "isMasked" BOOLEAN NOT NULL DEFAULT false,
    "maskConfig" JSONB,
    "redirectWww" BOOLEAN NOT NULL DEFAULT true,
    "forceHttps" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_domains_pkey" PRIMARY KEY ("id")
);

-- Create StoreSSL table
CREATE TABLE "store_ssl" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "type" "SSLType" NOT NULL DEFAULT 'AUTOMATIC',
    "certificate" TEXT,
    "privateKey" TEXT,
    "chain" TEXT,
    "issuer" TEXT,
    "subject" TEXT,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "fingerprint" TEXT,
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "lastRenewedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "status" "SSLStatus" NOT NULL DEFAULT 'PENDING',
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "store_ssl_pkey" PRIMARY KEY ("id")
);

-- Add columns to Store table
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "defaultDomain" TEXT;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "customDomain" TEXT;
ALTER TABLE "Store" ADD COLUMN IF NOT EXISTS "templateId" TEXT DEFAULT 'standard';

-- Create unique indexes
CREATE UNIQUE INDEX "store_domains_domain_key" ON "store_domains"("domain");
CREATE UNIQUE INDEX "store_domains_subdomain_key" ON "store_domains"("subdomain");
CREATE UNIQUE INDEX "store_domains_fullSubdomain_key" ON "store_domains"("fullSubdomain");

-- Create indexes for performance
CREATE INDEX "store_domains_storeId_idx" ON "store_domains"("storeId");
CREATE INDEX "store_domains_status_idx" ON "store_domains"("status");
CREATE INDEX "store_domains_subdomain_idx" ON "store_domains"("subdomain");
CREATE INDEX "store_ssl_storeId_idx" ON "store_ssl"("storeId");
CREATE INDEX "store_ssl_status_idx" ON "store_ssl"("status");
CREATE INDEX "store_ssl_expiresAt_idx" ON "store_ssl"("expiresAt");

-- Add foreign keys
ALTER TABLE "store_domains" ADD CONSTRAINT "store_domains_storeId_fkey" 
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "store_domains" ADD CONSTRAINT "store_domains_sslId_fkey" 
    FOREIGN KEY ("sslId") REFERENCES "store_ssl"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "store_ssl" ADD CONSTRAINT "store_ssl_storeId_fkey" 
    FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE CASCADE ON UPDATE CASCADE;
