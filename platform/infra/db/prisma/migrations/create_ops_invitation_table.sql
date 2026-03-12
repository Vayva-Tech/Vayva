-- Vayva Ops Invitation Table Setup
-- Run this SQL on your PostgreSQL database to create the ops_invitation table

-- Create the OpsInvitation table
CREATE TABLE IF NOT EXISTS "ops_invitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "invitedById" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "acceptedById" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ops_invitation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ops_invitation_token_key" UNIQUE ("token"),
    CONSTRAINT "ops_invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "OpsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "ops_invitation_email_idx" ON "ops_invitation"("email");
CREATE INDEX IF NOT EXISTS "ops_invitation_status_expiresAt_idx" ON "ops_invitation"("status", "expiresAt");
CREATE INDEX IF NOT EXISTS "ops_invitation_token_idx" ON "ops_invitation"("token");
CREATE INDEX IF NOT EXISTS "ops_invitation_invitedById_idx" ON "ops_invitation"("invitedById");

-- Verify the table was created
SELECT 'ops_invitation table created successfully' as status;
