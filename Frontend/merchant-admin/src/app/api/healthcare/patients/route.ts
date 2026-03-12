import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/healthcare/patients - Get patients with filters
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const search = searchParams.get("search");
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const page = parseInt(searchParams.get("page") || "1");

      const where: any = { merchantId: storeId };

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { mrn: { contains: search, mode: 'insensitive' } }
        ];
      }

      if (status) {
        where.status = status;
      }

      const [patients, total] = await Promise.all([
        prisma.patient.findMany({
          where,
          select: {
            id: true,
            mrn: true,
            firstName: true,
            lastName: true,
            dateOfBirth: true,
            gender: true,
            email: true,
            phone: true,
            status: true,
            bloodGroup: true,
            primaryCarePhysician: true,
            insuranceProvider: true,
            emergencyContact: true,
            createdAt: true,
            _count: {
              select: {
                appointments: true,
                prescriptions: true,
                labResults: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: (page - 1) * limit
        }),
        prisma.patient.count({ where })
      ]);

      return NextResponse.json({
        success: true,
        data: {
          patients,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PATIENTS_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch patients" },
        { status: 500 }
      );
    }
  }
);

// POST /api/healthcare/patients - Create a new patient
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        mrn,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        email,
        phone,
        address,
        city,
        state,
        zipCode,
        bloodGroup,
        allergies,
        medications,
        medicalHistory,
        primaryCarePhysician,
        insuranceProvider,
        insurancePolicyNumber,
        emergencyContact
      } = body;

      // Validation
      if (!mrn || !firstName || !lastName || !dateOfBirth) {
        return NextResponse.json(
          { success: false, error: "Missing required fields" },
          { status: 400 }
        );
      }

      // Check for duplicate MRN
      const existing = await prisma.patient.findUnique({
        where: { mrn }
      });

      if (existing) {
        return NextResponse.json(
          { success: false, error: "Patient with this MRN already exists" },
          { status: 409 }
        );
      }

      const patient = await prisma.patient.create({
        data: {
          merchantId: storeId,
          mrn,
          firstName,
          lastName,
          dateOfBirth: new Date(dateOfBirth),
          gender,
          email,
          phone,
          address,
          city,
          state,
          zipCode,
          bloodGroup,
          allergies: allergies || [],
          medications: medications || [],
          medicalHistory: medicalHistory || [],
          primaryCarePhysician,
          insuranceProvider,
          insurancePolicyNumber,
          emergencyContact: emergencyContact ? JSON.stringify(emergencyContact) : null,
          status: 'active'
        }
      });

      return NextResponse.json({
        success: true,
        data: patient,
        message: "Patient registered successfully"
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_PATIENT_CREATE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to register patient" },
        { status: 500 }
      );
    }
  }
);
