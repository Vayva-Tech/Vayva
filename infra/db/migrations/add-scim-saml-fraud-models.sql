-- Migration: add-scim-saml-fraud-models
-- Created: 2024-01-XX
-- Description: Adds SCIM 2.0, SAML 2.0, and Fraud Detection models

-- Create SCIM tables (RFC 7643 compliant)
CREATE TABLE IF NOT EXISTS "scim_users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "externalId" TEXT,
    "userName" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "title" TEXT,
    "department" TEXT,
    "organization" TEXT,
    "rawData" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scim_users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scim_groups" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "externalId" TEXT,
    "displayName" TEXT NOT NULL,
    "members" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scim_groups_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "scim_tokens" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scim_tokens_pkey" PRIMARY KEY ("id")
);

-- Create SAML tables
CREATE TABLE "saml_identity_providers" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "ssoUrl" TEXT NOT NULL,
    "sloUrl" TEXT,
    "certificate" TEXT NOT NULL,
    "metadataUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saml_identity_providers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saml_service_providers" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "acsUrl" TEXT NOT NULL,
    "sloUrl" TEXT,
    "privateKey" TEXT NOT NULL,
    "certificate" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saml_service_providers_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saml_auth_requests" (
    "id" TEXT NOT NULL,
    "idpId" TEXT NOT NULL,
    "samlRequest" TEXT NOT NULL,
    "relayState" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saml_auth_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saml_sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idpId" TEXT NOT NULL,
    "sessionIndex" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saml_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saml_user_links" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "idpId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "saml_user_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saml_role_mappings" (
    "id" TEXT NOT NULL,
    "idpId" TEXT NOT NULL,
    "idpGroupName" TEXT NOT NULL,
    "vayvaRole" TEXT NOT NULL,
    "storeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "saml_role_mappings_pkey" PRIMARY KEY ("id")
);

-- Create Fraud Detection tables
CREATE TABLE "fraud_checks" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "customerId" TEXT,
    "email" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "billingCountry" TEXT NOT NULL,
    "shippingCountry" TEXT NOT NULL,
    "deviceFingerprint" TEXT,
    "riskScore" INTEGER,
    "riskLevel" TEXT,
    "recommendation" TEXT,
    "actionTaken" TEXT,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_checks_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "fraud_model_feedback" (
    "id" TEXT NOT NULL,
    "storeId" TEXT NOT NULL,
    "originalScore" INTEGER NOT NULL,
    "actualOutcome" TEXT NOT NULL,
    "features" JSONB NOT NULL DEFAULT '{}',
    "modelVersion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fraud_model_feedback_pkey" PRIMARY KEY ("id")
);

-- Create indexes for performance
CREATE INDEX "scim_users_userId_tenantId_idx" ON "scim_users"("userId", "tenantId");
CREATE INDEX "scim_users_tenantId_externalId_idx" ON "scim_users"("tenantId", "externalId");
CREATE INDEX "scim_users_userName_idx" ON "scim_users"("userName");

CREATE INDEX "scim_groups_tenantId_idx" ON "scim_groups"("tenantId");

CREATE UNIQUE INDEX "scim_tokens_tenantId_key" ON "scim_tokens"("tenantId");
CREATE INDEX "scim_tokens_token_idx" ON "scim_tokens"("token");

CREATE UNIQUE INDEX "saml_identity_providers_entityId_key" ON "saml_identity_providers"("entityId");
CREATE INDEX "saml_identity_providers_isActive_idx" ON "saml_identity_providers"("isActive");

CREATE UNIQUE INDEX "saml_service_providers_entityId_key" ON "saml_service_providers"("entityId");

CREATE INDEX "saml_auth_requests_idpId_createdAt_idx" ON "saml_auth_requests"("idpId", "createdAt");
CREATE INDEX "saml_auth_requests_expiresAt_idx" ON "saml_auth_requests"("expiresAt");

CREATE INDEX "saml_sessions_userId_expiresAt_idx" ON "saml_sessions"("userId", "expiresAt");
CREATE INDEX "saml_sessions_idpId_expiresAt_idx" ON "saml_sessions"("idpId", "expiresAt");

CREATE UNIQUE INDEX "saml_user_links_userId_idpId_key" ON "saml_user_links"("userId", "idpId");
CREATE INDEX "saml_user_links_idpId_idx" ON "saml_user_links"("idpId");

CREATE INDEX "saml_role_mappings_idpId_isActive_idx" ON "saml_role_mappings"("idpId", "isActive");
CREATE INDEX "saml_role_mappings_idpGroupName_idx" ON "saml_role_mappings"("idpGroupName");

CREATE INDEX "fraud_checks_storeId_email_checkedAt_idx" ON "fraud_checks"("storeId", "email", "checkedAt");
CREATE INDEX "fraud_checks_storeId_ipAddress_checkedAt_idx" ON "fraud_checks"("storeId", "ipAddress", "checkedAt");
CREATE INDEX "fraud_checks_storeId_customerId_checkedAt_idx" ON "fraud_checks"("storeId", "customerId", "checkedAt");

CREATE INDEX "fraud_model_feedback_storeId_createdAt_idx" ON "fraud_model_feedback"("storeId", "createdAt");

-- Add foreign key constraints
ALTER TABLE "scim_users" ADD CONSTRAINT "scim_users_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "saml_sessions" ADD CONSTRAINT "saml_sessions_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "saml_user_links" ADD CONSTRAINT "saml_user_links_userId_fkey" 
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;

ALTER TABLE "saml_auth_requests" ADD CONSTRAINT "saml_auth_requests_idpId_fkey" 
    FOREIGN KEY ("idpId") REFERENCES "saml_identity_providers"("id") ON DELETE CASCADE;

ALTER TABLE "saml_sessions" ADD CONSTRAINT "saml_sessions_idpId_fkey" 
    FOREIGN KEY ("idpId") REFERENCES "saml_identity_providers"("id") ON DELETE CASCADE;

ALTER TABLE "saml_user_links" ADD CONSTRAINT "saml_user_links_idpId_fkey" 
    FOREIGN KEY ("idpId") REFERENCES "saml_identity_providers"("id") ON DELETE CASCADE;

-- Add unique constraints
CREATE UNIQUE INDEX "scim_users_userId_tenantId_key" ON "scim_users"("userId", "tenantId");
CREATE UNIQUE INDEX "scim_groups_tenantId_externalId_key" ON "scim_groups"("tenantId", "externalId");
