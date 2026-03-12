import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { kycService, IdType } from "@/services/kyc";
import { checkRateLimitCustom } from "@/lib/ratelimit";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

const VALID_ID_TYPES: IdType[] = ["NIN", "DRIVERS_LICENSE", "VOTERS_CARD", "PASSPORT", "CAC"];

function isValidIdType(value: unknown): value is IdType {
  return typeof value === "string" && VALID_ID_TYPES.includes(value as IdType);
}

export const dynamic = "force-dynamic";

export const POST = withVayvaAPI(
  PERMISSIONS.KYC_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const userId = user.id;

      await checkRateLimitCustom(userId, "kyc_submit", 5, 3600);

      // Support flexible ID types
      const idType = isValidIdType(body.idType) ? body.idType : "NIN";
      const idNumber = getString(body.idNumber) || getString(body.nin);
      const cacNumber = getString(body.cacNumber);
      const proofOfAddressUrl = getString(body.proofOfAddressUrl);
      const idImageUrl = getString(body.idImageUrl);
      const cacDocumentUrl = getString(body.cacDocumentUrl);
      const consent = !!body.consent;
      const skip = !!body.skip;
      const ip = req.headers.get("x-forwarded-for") || "unknown";

      // Handle skip option
      if (skip) {
        const result = await kycService.skipForNow(storeId, userId, ip);
        return NextResponse.json(result);
      }

      if (!idNumber || !consent) {
        return NextResponse.json(
          { error: "ID number and consent are required" },
          { status: 400 },
        );
      }

      const trimmedId = idNumber.trim();

      // Validate based on ID type
      if (idType === "NIN") {
        if (!/^\d{11}$/.test(trimmedId)) {
          return NextResponse.json(
            { error: "NIN must be exactly 11 digits" },
            { status: 400 },
          );
        }
      } else if (idType === "DRIVERS_LICENSE") {
        // Nigerian driver's license format: 3 letters followed by numbers
        if (!/^[A-Z]{3}[0-9]{6,12}$/i.test(trimmedId)) {
          return NextResponse.json(
            { error: "Invalid driver's license format" },
            { status: 400 },
          );
        }
      } else if (idType === "VOTERS_CARD") {
        // VIN (Voter Identification Number) format
        if (!/^\d{10,20}$/.test(trimmedId)) {
          return NextResponse.json(
            { error: "Invalid voter's card number format" },
            { status: 400 },
          );
        }
      } else if (idType === "PASSPORT") {
        // Nigerian passport: A followed by 8 digits
        if (!/^A\d{8}$/i.test(trimmedId)) {
          return NextResponse.json(
            { error: "Invalid passport number format (e.g., A12345678)" },
            { status: 400 },
          );
        }
      } else if (idType === "CAC") {
        // CAC registration number
        if (!/^(RC|BN)?\d{5,8}$/i.test(trimmedId)) {
          return NextResponse.json(
            { error: "Invalid CAC registration number format" },
            { status: 400 },
          );
        }
      }

      // Validate CAC if provided
      if (cacNumber) {
        const trimmedCac = cacNumber.trim();
        if (!/^(RC|BN)?\d{5,8}$/i.test(trimmedCac)) {
          return NextResponse.json(
            { error: "Invalid CAC registration number format" },
            { status: 400 },
          );
        }
      }

      const result = await kycService.submitForReview(storeId, {
        idType,
        idNumber: trimmedId,
        idImageUrl: idImageUrl || undefined,
        cacNumber: cacNumber?.trim() || undefined,
        cacDocumentUrl: cacDocumentUrl || undefined,
        proofOfAddressUrl: proofOfAddressUrl || undefined,
        consent,
        ipAddress: ip,
        actorUserId: userId,
      });

      return NextResponse.json(result);
    } catch (error) {
      logger.error("[KYC_SUBMIT_POST]", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 },
      );
    }
  },
);
