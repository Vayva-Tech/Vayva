/**
 * Individual Lab Result API Route
 * GET /api/healthcare/labs/[id] - Get lab result details
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Log lab access
function logLabAccess(userId: string, action: string, labId: string, storeId: string) {
  logger.info(`LAB_ACCESS: ${action}`, {
    userId,
    labId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
  });
}

// GET Lab Result by ID
export const GET = withVayvaAPI(
  PERMISSIONS.PRODUCTS_VIEW,
  async (request, { storeId, params, user }) => {
    try {
      const { id: labId } = await params;
      
      if (!labId) {
        return NextResponse.json(
          { error: "Lab result ID required" },
          { status: 400 }
        );
      }

      const labResult = await prisma.labResult.findFirst({
        where: {
          id: labId,
          merchantId: storeId,
        },
        include: {
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              allergies: true,
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
      });

      if (!labResult) {
        return NextResponse.json(
          { error: "Lab result not found" },
          { status: 404 }
        );
      }

      logLabAccess(user.id, "VIEW_LAB_RESULT", labId, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: labResult.patientId,
          userId: user.id,
          action: "LAB_RESULT_VIEWED",
          details: { labId },
        },
      });

      // Get related lab results for trend analysis
      const relatedResults = await prisma.labResult.findMany({
        where: {
          patientId: labResult.patientId,
          testName: labResult.testName,
          id: { not: labId },
        },
        select: {
          id: true,
          result: true,
          performedAt: true,
          interpretation: true,
        },
        orderBy: { performedAt: "desc" },
        take: 5,
      });

      // Calculate trends
      const numericCurrent = parseFloat(labResult.result);
      const previousResults = relatedResults
        .map(r => ({ ...r, numericValue: parseFloat(r.result) }))
        .filter(r => !isNaN(r.numericValue));

      let trend: string | null = null;
      if (previousResults.length > 0 && !isNaN(numericCurrent)) {
        const previousAvg = previousResults.reduce((sum, r) => sum + r.numericValue, 0) / previousResults.length;
        const percentChange = ((numericCurrent - previousAvg) / previousAvg) * 100;
        
        if (percentChange > 10) trend = "increasing";
        else if (percentChange < -10) trend = "decreasing";
        else trend = "stable";
      }

      // Get reference ranges
      const referenceRanges = getReferenceRange(labResult.testName, labResult.patient);

      return NextResponse.json({
        success: true,
        data: {
          ...labResult,
          patientName: `${labResult.patient.firstName} ${labResult.patient.lastName}`,
          providerName: labResult.provider?.name || "Lab Service",
          resultDisplay: formatLabResult(labResult.testName, labResult.result, labResult.unit),
          relatedResults: relatedResults.map(r => ({
            ...r,
            resultDisplay: formatLabResult(labResult.testName, r.result, labResult.unit)
          })),
          trend,
          referenceRange: referenceRanges.normal,
          criticalRange: referenceRanges.critical,
          isWithinNormalRange: labResult.interpretation === "normal",
          isCritical: labResult.interpretation === "critical",
          turnaroundTime: labResult.resultedAt 
            ? Math.floor((labResult.resultedAt.getTime() - labResult.performedAt.getTime()) / (1000 * 60 * 60))
            : null, // hours
          ageInDays: Math.floor((Date.now() - labResult.performedAt.getTime()) / (1000 * 60 * 60 * 24)),
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_LAB_GET]", error, { storeId, labId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// Helper functions
function formatLabResult(testName: string, result: string, unit: string | null): string {
  const numericValue = parseFloat(result);
  
  if (isNaN(numericValue)) return result;

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

function getReferenceRange(testName: string, patient: any): { normal: string | null, critical: string | null } {
  const _age = new Date().getFullYear() - patient.dateOfBirth.getFullYear();
  const isMale = patient.gender === "male";

  // Simplified reference ranges
  const ranges: Record<string, { normal: string, critical: string }> = {
    "glucose": { normal: "70-100 mg/dL", critical: "<50 or >300 mg/dL" },
    "cholesterol_total": { normal: "<200 mg/dL", critical: ">300 mg/dL" },
    "hdl_cholesterol": { normal: isMale ? ">40 mg/dL" : ">50 mg/dL", critical: "<30 mg/dL" },
    "ldl_cholesterol": { normal: "<100 mg/dL", critical: ">190 mg/dL" },
    "hemoglobin": { 
      normal: isMale ? "14-18 g/dL" : "12-16 g/dL", 
      critical: isMale ? "<7 or >20 g/dL" : "<6 or >18 g/dL" 
    },
    "white_blood_cell_count": { normal: "4,500-11,000 cells/mcL", critical: "<2,000 or >50,000 cells/mcL" },
    "platelet_count": { normal: "150,000-450,000 cells/mcL", critical: "<50,000 or >1,000,000 cells/mcL" },
  };

  const key = Object.keys(ranges).find(k => testName.toLowerCase().includes(k.replace(/_/g, " ")));
  return key ? ranges[key] : { normal: null, critical: null };
}