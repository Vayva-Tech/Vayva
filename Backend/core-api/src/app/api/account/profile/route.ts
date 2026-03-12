import { NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma, prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getContacts(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

export const GET = withVayvaAPI(
  PERMISSIONS.ACCOUNT_VIEW,
  async (_req, { storeId, user }: APIContext) => {
    try {
      const [dbUser, store] = await Promise.all([
        prisma.user.findUnique({
          where: { id: user.id },
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        }),
        prisma.store.findUnique({
          where: { id: storeId },
          select: {
            name: true,
            category: true,
            contacts: true,
          },
        }),
      ]);

      if (!dbUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const contacts = getContacts(store?.contacts);

      return NextResponse.json(
        {
          firstName: dbUser.firstName || "",
          lastName: dbUser.lastName || "",
          email: dbUser.email || "",
          phone: dbUser.phone || "",
          businessName: store?.name || "",
          businessAddress: getString(contacts.address) || "",
          businessPhone: getString(contacts.phone) || "",
          industry: store?.category || "",
          taxId: getString(contacts.taxId) || "",
        },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    } catch (error) {
      logger.error("[ACCOUNT_PROFILE_GET]", error);
      return NextResponse.json(
        { error: "Failed to load profile" },
        { status: 500 },
      );
    }
  },
);

export const PATCH = withVayvaAPI(
  PERMISSIONS.ACCOUNT_MANAGE,
  async (req, { storeId, user }: APIContext) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const {
        firstName,
        lastName,
        businessName,
        businessAddress,
        industry,
        taxId,
      } = body;

      const updates: Array<Prisma.PrismaPromise<unknown>> = [];

      // Update user fields (non-sensitive only — email/phone require OTP)
      if (firstName !== undefined || lastName !== undefined) {
        updates.push(
          prisma.user.update({
            where: { id: user.id },
            data: {
              ...(firstName !== undefined
                ? { firstName: String(firstName).trim() }
                : {}),
              ...(lastName !== undefined
                ? { lastName: String(lastName).trim() }
                : {}),
            },
          }),
        );
      }

      // Update store fields
      if (
        businessName !== undefined ||
        businessAddress !== undefined ||
        industry !== undefined ||
        taxId !== undefined
      ) {
        const store = await prisma.store.findUnique({
          where: { id: storeId },
          select: { contacts: true },
        });
        const contacts = getContacts(store?.contacts);

        updates.push(
          prisma.store.update({
            where: { id: storeId },
            data: {
              ...(businessName !== undefined
                ? { name: String(businessName).trim() }
                : {}),
              ...(industry !== undefined
                ? { category: String(industry).trim() }
                : {}),
              contacts: {
                ...contacts,
                ...(businessAddress !== undefined
                  ? { address: String(businessAddress).trim() }
                  : {}),
                ...(taxId !== undefined ? { taxId: String(taxId).trim() } : {}),
              },
            },
          }),
        );
      }

      await Promise.all(updates);

      return NextResponse.json(
        { success: true },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    } catch (error) {
      logger.error("[ACCOUNT_PROFILE_PATCH]", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }
  },
);
