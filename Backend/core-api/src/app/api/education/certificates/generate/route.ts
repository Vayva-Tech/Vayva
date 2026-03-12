import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { generateCertificate } from "@vayva/industry-education/features";
import { z } from "zod";

const generateCertificateSchema = z.object({
  studentId: z.string(),
  courseId: z.string(),
  templateId: z.string().optional(),
});

/**
 * POST /api/education/certificates/generate
 * 
 * Generate certificate for course completion
 */
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_CREATE,
  async (req, { storeId }) => {
    try {
      const body = await req.json();
      const validated = generateCertificateSchema.parse(body);

      const result = await generateCertificate(
        prisma,
        storeId,
        validated.studentId,
        validated.courseId,
        validated.templateId
      );

      return NextResponse.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: "Validation error",
            details: error.errors,
          },
          { status: 400 }
        );
      }

      logger.error("[EDUCATION_CERTIFICATE_GENERATE_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate certificate",
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  },
);
