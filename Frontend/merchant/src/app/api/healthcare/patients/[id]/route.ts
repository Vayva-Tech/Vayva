// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
// GET /api/healthcare/patients/[id] - Get patient details
export async function GET(request: NextRequest, { params }: { params: Promise<{ id?: string }> }) {
  try {
    const { id } = await params;

    const patient = await prisma.patient.findUnique({
      where: { id, merchantId: storeId },
      include: {
        appointments: {
          orderBy: { scheduledAt: 'desc' },
          take: 10
        },
        prescriptions: {
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        labResults: {
          orderBy: { testDate: 'desc' },
          take: 10
        },
        insuranceClaims: {
          orderBy: { submittedAt: 'desc' },
          take: 5
        }
      }
    });

    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: patient
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/healthcare/patients/[id]",
      operation: "GET_PATIENT_DETAILS",
    });
    return NextResponse.json(
      { error: "Failed to fetch patient details" },
      { status: 500 }
    );
  }
}
