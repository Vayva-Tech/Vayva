import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface StoreSettings {
  description?: string;
  supportEmail?: string;
  supportPhone?: string;
  whatsappNumber?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    landmark?: string;
  };
  isActive?: boolean;
  operatingHours?: Record<string, { isClosed: boolean; open?: string; close?: string }>;
}

export const GET = withVayvaAPI(PERMISSIONS.ACCOUNT_VIEW, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            select: {
                name: true,
                slug: true,
                category: true,
                logoUrl: true,
                settings: true,
            },
        });

        if (!store) {
            return NextResponse.json({ error: "Store not found" }, { status: 404 });
        }

        const settings = (store.settings as StoreSettings | null) ?? {};

        const profile = {
            name: store.name || "",
            slug: store.slug || "",
            businessType: store.category || "general",
            description: settings.description || "",
            supportEmail: settings.supportEmail || "",
            supportPhone: settings.supportPhone || "",
            logoUrl: store.logoUrl || "",
            whatsappNumber: settings.whatsappNumber || "",
            address: {
                street: settings.address?.street || "",
                city: settings.address?.city || "",
                state: settings.address?.state || "",
                country: settings.address?.country || "Nigeria",
                landmark: settings.address?.landmark || "",
            },
            isActive: settings.isActive !== false,
            operatingHours: settings.operatingHours || {
                Monday: { isClosed: false, open: "08:00", close: "18:00" },
                Tuesday: { isClosed: false, open: "08:00", close: "18:00" },
                Wednesday: { isClosed: false, open: "08:00", close: "18:00" },
                Thursday: { isClosed: false, open: "08:00", close: "18:00" },
                Friday: { isClosed: false, open: "08:00", close: "18:00" },
                Saturday: { isClosed: false, open: "08:00", close: "18:00" },
                Sunday: { isClosed: true },
            },
        };

        return NextResponse.json(profile, {
            headers: {
                "Cache-Control": "no-store",
            },
        });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[STORE_PROFILE_GET] Failed to fetch store profile", { storeId, message: err.message });
        return NextResponse.json({ error: "Failed to fetch store profile" }, { status: 500, headers: { "Cache-Control": "no-store" } });
    }
});

export const POST = withVayvaAPI(PERMISSIONS.ACCOUNT_MANAGE, async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
        const body = await req.json().catch(() => ({}));

        const {
            name,
            businessType,
            description,
            supportEmail,
            supportPhone,
            whatsappNumber,
            address,
            isActive,
            operatingHours,
        } = body;

        // Validation
        if (!name || name.trim().length === 0) {
            return NextResponse.json({ error: "Store name is required" }, { status: 400 });
        }

        if (supportEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(supportEmail)) {
            return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
        }

        // Get current store to merge settings
        const currentStore = await prisma.store?.findUnique({
            where: { id: storeId },
            select: { settings: true },
        });

        const currentSettings = (currentStore?.settings as StoreSettings | null) ?? {};

        // Merge settings
        const updatedSettings = {
            ...currentSettings,
            description,
            supportEmail,
            supportPhone,
            whatsappNumber,
            address,
            isActive,
            operatingHours,
        };

        // Update store
        await prisma.store?.update({
            where: { id: storeId },
            data: {
                name: name.trim(),
                category: businessType,
                settings: updatedSettings,
            },
        });

        return NextResponse.json({ message: "Store profile updated successfully" });
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[STORE_PROFILE_PUT] Failed to update store profile", { storeId, message: err.message });
        return NextResponse.json({ error: "Failed to update store profile" }, { status: 500 });
    }
});
