-- CreateTable
CREATE TABLE "ops_invitation" (
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

    CONSTRAINT "ops_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ops_invitation_token_key" ON "ops_invitation"("token");

-- CreateIndex
CREATE INDEX "ops_invitation_email_idx" ON "ops_invitation"("email");

-- CreateIndex
CREATE INDEX "ops_invitation_status_expiresAt_idx" ON "ops_invitation"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "ops_invitation_token_idx" ON "ops_invitation"("token");

-- CreateIndex
CREATE INDEX "ops_invitation_invitedById_idx" ON "ops_invitation"("invitedById");

-- AddForeignKey
ALTER TABLE "ops_invitation" ADD CONSTRAINT "ops_invitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "OpsUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
