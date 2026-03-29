-- AlterTable: Add per-check KYC status fields to KycRecord
ALTER TABLE "KycRecord" ADD COLUMN "ninStatus" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE "KycRecord" ADD COLUMN "bvnStatus" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE "KycRecord" ADD COLUMN "cacStatus" "KycStatus" NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE "KycRecord" ADD COLUMN "ninProviderRef" TEXT;
ALTER TABLE "KycRecord" ADD COLUMN "bvnProviderRef" TEXT;
ALTER TABLE "KycRecord" ADD COLUMN "cacReviewedAt" TIMESTAMP(3);
ALTER TABLE "KycRecord" ADD COLUMN "cacReviewedBy" TEXT;

-- AlterTable: Add businessType to Store, fix kycStatus default from PENDING to NOT_STARTED
ALTER TABLE "Store" ADD COLUMN "businessType" TEXT;
ALTER TABLE "Store" ALTER COLUMN "kycStatus" SET DEFAULT 'NOT_STARTED';

-- Backfill: Set existing stores with kycStatus=PENDING to NOT_STARTED if they have no KYC record
UPDATE "Store" SET "kycStatus" = 'NOT_STARTED'
WHERE "kycStatus" = 'PENDING'
AND "id" NOT IN (SELECT "storeId" FROM "KycRecord" WHERE "status" != 'NOT_STARTED');

-- Backfill: For existing KycRecords, derive per-check statuses from existing data
-- If fullNinEncrypted exists and overall status is VERIFIED, mark ninStatus as VERIFIED
UPDATE "KycRecord" SET "ninStatus" = 'VERIFIED'
WHERE "fullNinEncrypted" IS NOT NULL AND "status" = 'VERIFIED';

UPDATE "KycRecord" SET "bvnStatus" = 'VERIFIED'
WHERE "fullBvnEncrypted" IS NOT NULL AND "status" = 'VERIFIED';

-- If overall status is REJECTED and NIN was provided, mark ninStatus as REJECTED
UPDATE "KycRecord" SET "ninStatus" = 'REJECTED'
WHERE "fullNinEncrypted" IS NOT NULL AND "status" = 'REJECTED' AND "ninStatus" = 'NOT_STARTED';

UPDATE "KycRecord" SET "bvnStatus" = 'REJECTED'
WHERE "fullBvnEncrypted" IS NOT NULL AND "status" = 'REJECTED' AND "bvnStatus" = 'NOT_STARTED';

-- If CAC was provided and overall status is VERIFIED, mark cacStatus as VERIFIED
UPDATE "KycRecord" SET "cacStatus" = 'VERIFIED'
WHERE "cacNumberEncrypted" IS NOT NULL AND "status" = 'VERIFIED';

-- If CAC was provided but not yet verified, mark as PENDING
UPDATE "KycRecord" SET "cacStatus" = 'PENDING'
WHERE "cacNumberEncrypted" IS NOT NULL AND "status" != 'VERIFIED' AND "status" != 'REJECTED' AND "cacStatus" = 'NOT_STARTED';
