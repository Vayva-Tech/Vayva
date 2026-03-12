import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const MAX_BULK_IMPORT = 500;

const customerImportSchema = z.object({
  customers: z.array(z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().max(100).optional(),
    email: z.string().email().max(255).optional(),
    phone: z.string().min(10).max(20).optional(),
    notes: z.string().max(1000).optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),
  })).min(1).max(MAX_BULK_IMPORT),
});

export type BulkImportResult = {
  total: number;
  created: number;
  skipped: number;
  errors: Array<{ index: number; email?: string; phone?: string; reason: string }>;
};

// POST /api/customers/import - Bulk import customers
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const { customers } = customerImportSchema.parse(body);

      const result: BulkImportResult = {
        total: customers.length,
        created: 0,
        skipped: 0,
        errors: [],
      };

      // Get existing customers to avoid duplicates
      const emails = customers.map(c => c.email).filter(Boolean) as string[];
      const phones = customers.map(c => c.phone).filter(Boolean) as string[];

      const [existingByEmail, existingByPhone] = await Promise.all([
        emails.length > 0
          ? prisma.customer.findMany({
              where: { storeId, email: { in: emails } },
              select: { email: true },
            })
          : Promise.resolve([]),
        phones.length > 0
          ? prisma.customer.findMany({
              where: { storeId, phone: { in: phones } },
              select: { phone: true },
            })
          : Promise.resolve([]),
      ]);

      const existingEmails = new Set(existingByEmail.map(c => c.email));
      const existingPhones = new Set(existingByPhone.map(c => c.phone));

      // Process each customer
      const customersToCreate = [];
      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];

        // Check for duplicates
        if (customer.email && existingEmails.has(customer.email)) {
          result.skipped++;
          result.errors.push({
            index: i,
            email: customer.email,
            reason: "Customer with this email already exists",
          });
          continue;
        }

        if (customer.phone && existingPhones.has(customer.phone)) {
          result.skipped++;
          result.errors.push({
            index: i,
            phone: customer.phone,
            reason: "Customer with this phone already exists",
          });
          continue;
        }

        customersToCreate.push({
          ...customer,
          storeId,
          lastName: customer.lastName ?? null,
          email: customer.email ?? null,
          phone: customer.phone ?? null,
          notes: customer.notes ?? null,
          tags: customer.tags ?? [],
        });
      }

      // Bulk create
      if (customersToCreate.length > 0) {
        const created = await prisma.customer.createMany({
          data: customersToCreate,
          skipDuplicates: true,
        });
        result.created = created.count;
      }

      logger.info("[CUSTOMERS_BULK_IMPORT]", {
        storeId,
        total: result.total,
        created: result.created,
        skipped: result.skipped,
        errors: result.errors.length,
      });

      return NextResponse.json({
        success: true,
        data: result,
      }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 }
        );
      }
      logger.error("[CUSTOMERS_BULK_IMPORT]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to import customers" },
        { status: 500 }
      );
    }
  }
);
