/**
 * Lab Results API Routes
 * GET /api/healthcare/labs - List lab results
 * POST /api/healthcare/labs - Create lab result
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Log lab access
function logLabAccess(userId: string, action: string, labId: string | null, storeId: string) {
  logger.info(`LAB_ACCESS: ${action}`, {
    userId,
    labId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
  });
}

// GET List Lab Results
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, user }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status"); // pending, preliminary, final, corrected
      const patientId = searchParams.get("patientId");
      const testName = searchParams.get("testName");
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");

      const labResults = await prisma.labResult.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(patientId ? { patientId } : {}),
          ...(testName ? { testName: { contains: testName, mode: "insensitive" } } : {}),
          ...(dateFrom || dateTo ? {
            performedAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            }
          } : {}),
        },
        include: {
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
        orderBy: { performedAt: "desc" },
        take: limit,
        skip: offset,
      });

      logLabAccess(user.id, "LIST_LAB_RESULTS", "MULTIPLE", storeId);

      const total = await prisma.labResult.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(patientId ? { patientId } : {}),
          ...(testName ? { testName: { contains: testName, mode: "insensitive" } } : {}),
          ...(dateFrom || dateTo ? {
            performedAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            }
          } : {}),
        },
      });

      // Add calculated fields and interpretations
      const labResultsWithCalcs = labResults.map(result => {
        const isCritical = result.interpretation === "critical";
        const isAbnormal = result.interpretation === "abnormal";
        const ageInDays = Math.floor((Date.now() - result.performedAt.getTime()) / (1000 * 60 * 60 * 24));
        const isRecent = ageInDays <= 30;
        
        return {
          ...result,
          patientName: `${result.patient.firstName} ${result.patient.lastName}`,
          providerName: result.provider?.name || "Lab Service",
          isCritical,
          isAbnormal,
          isRecent,
          turnaroundTime: result.resultedAt 
            ? Math.floor((result.resultedAt.getTime() - result.performedAt.getTime()) / (1000 * 60 * 60))
            : null, // hours
          ageInDays,
          resultDisplay: formatLabResult(result.testName, result.result, result.unit),
        };
      });

      return NextResponse.json({
        success: true,
        data: labResultsWithCalcs,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_LABS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// Helper function to format lab results
function formatLabResult(testName: string, result: string, unit: string | null): string {
  const numericValue = parseFloat(result);
  
  if (isNaN(numericValue)) {
    return result; // Non-numeric result
  }

  // Format based on test type
  if (testName.toLowerCase().includes("glucose")) {
    return `${numericValue.toFixed(1)} ${unit || "mg/dL"}`;
  } else if (testName.toLowerCase().includes("cholesterol")) {
    return `${Math.round(numericValue)} ${unit || "mg/dL"}`;
  } else if (testName.toLowerCase().includes("hemoglobin")) {
    return `${numericValue.toFixed(1)} ${unit || "g/dL"}`;
  } else {
    return `${result} ${unit || ""}`.trim();
  }
}

// POST Create Lab Result
export const POST = withVayvaAPI(
  PERMISSIONS.PRODUCTS_MANAGE,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const {
        patientId,
        providerId,
        testName,
        result,
        unit,
        normalRange,
        interpretation,
        performedAt,
        resultedAt,
        labReference,
        notes,
      } = body;

      // Validation
      if (!patientId || !testName || !result) {
        return NextResponse.json(
          { error: "Patient ID, test name, and result are required" },
          { status: 400 }
        );
      }

      // Verify patient exists
      const patient = await prisma.patient.findFirst({
        where: { id: patientId, merchantId: storeId },
      });

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }

      // Verify provider if provided
      let provider = null;
      if (providerId) {
        provider = await prisma.user.findFirst({
          where: { 
            id: providerId,
            storeMemberships: {
              some: { storeId, role: { in: ["PROVIDER", "ADMIN", "OWNER"] } }
            }
          },
        });

        if (!provider) {
          return NextResponse.json(
            { error: "Provider not found or unauthorized" },
            { status: 404 }
          );
        }
      }

      // Auto-determine interpretation if not provided
      const autoInterpretation = interpretation || determineInterpretation(testName, result, normalRange);

      // Create lab result
      const labResult = await prisma.labResult.create({
        data: {
          merchantId: storeId,
          patientId,
          providerId: provider?.id || null,
          testName,
          result,
          unit,
          normalRange,
          interpretation: autoInterpretation,
          status: "final",
          performedAt: performedAt ? new Date(performedAt) : new Date(),
          resultedAt: resultedAt ? new Date(resultedAt) : new Date(),
          labReference,
          notes,
        },
      });

      logLabAccess(user.id, "CREATE_LAB_RESULT", labResult.id, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId,
          userId: user.id,
          action: "LAB_RESULT_CREATED",
          details: {
            labResultId: labResult.id,
            testName,
            result,
            interpretation: autoInterpretation,
            normalRange,
          },
        },
      });

      // Flag critical results
      if (autoInterpretation === "critical") {
        logger.warn("CRITICAL_LAB_RESULT", {
          labResultId: labResult.id,
          patientId,
          testName,
          result,
          normalRange,
        });
        
        // In production, this would trigger immediate notification to provider
      }

      return NextResponse.json({
        success: true,
        data: {
          ...labResult,
          patientName: `${patient.firstName} ${patient.lastName}`,
          providerName: provider?.name || "Lab Service",
          resultDisplay: formatLabResult(testName, result, unit),
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_LABS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// Helper function to determine interpretation
function determineInterpretation(testName: string, result: string, normalRange: string | null): string {
  if (!normalRange) return "normal";
  
  const numericResult = parseFloat(result);
  if (isNaN(numericResult)) return "normal";

  // Parse normal range (e.g., "70-100" or "<140")
  if (normalRange.includes("-")) {
    const [min, max] = normalRange.split("-").map(Number);
    if (numericResult < min || numericResult > max) {
      return Math.abs(numericResult - (min + max) / 2) > (max - min) * 0.5 ? "critical" : "abnormal";
    }
  } else if (normalRange.startsWith("<")) {
    const maxValue = parseFloat(normalRange.substring(1));
    if (numericResult > maxValue) {
      return numericResult > maxValue * 1.5 ? "critical" : "abnormal";
    }
  } else if (normalRange.startsWith(">")) {
    const minValue = parseFloat(normalRange.substring(1));
    if (numericResult < minValue) {
      return numericResult < minValue * 0.5 ? "critical" : "abnormal";
    }
  }

  return "normal";
}