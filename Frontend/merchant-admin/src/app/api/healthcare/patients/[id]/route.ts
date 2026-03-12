import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/healthcare/patients/[id] - Get patient details
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
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
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PATIENT_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch patient" },
        { status: 500 }
      );
    }
  }
);

// PUT /api/healthcare/patients/[id] - Update patient
export const PUT = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await req.json();

      const existing = await prisma.patient.findUnique({
        where: { id, merchantId: storeId }
      });

      if (!existing) {
        return NextResponse.json(
          { success: false, error: "Patient not found" },
          { status: 404 }
        );
      }

      // Check for duplicate MRN if changed
      if (body.mrn && body.mrn !== existing.mrn) {
        const duplicate = await prisma.patient.findUnique({
          where: { mrn: body.mrn }
        });
        
        if (duplicate) {
          return NextResponse.json(
            { success: false, error: "MRN already exists" },
            { status: 409 }
          );
        }
      }

      const updated = await prisma.patient.update({
        where: { id, merchantId: storeId },
        data: {
          ...body,
          dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
          emergencyContact: body.emergencyContact ? JSON.stringify(body.emergencyContact) : undefined,
          updatedAt: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        data: updated,
        message: "Patient updated successfully"
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PATIENT_UPDATE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to update patient" },
        { status: 500 }
      );
    }
  }
);
