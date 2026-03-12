import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const EnrollmentSchema = z.object({
  clientId: z.string(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }),
  medicalConditions: z.string().optional(),
  fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
  goals: z.array(z.string()).default([]),
  paymentMethod: z.enum(["credit_card", "debit_card", "cash", "check"]).optional(),
  waiverSigned: z.boolean().default(false),
  notes: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const json = await req.json().catch(() => ({}));
    const parseResult = EnrollmentSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid enrollment data",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    const { clientId, emergencyContact, medicalConditions, fitnessLevel, goals, paymentMethod, waiverSigned, notes } = parseResult.data;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify program exists
    const program = await prisma.wellnessProgram.findFirst({
      where: { id, storeId },
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Verify client exists
    const client = await prisma.user.findFirst({
      where: { id: clientId, storeId },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Client not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Check if program is full
    const currentEnrollments = await prisma.wellnessProgramEnrollment.count({
      where: { programId: id, status: { not: "dropped" } },
    });

    if (currentEnrollments >= program.maxParticipants) {
      return NextResponse.json(
        { error: "Program is at full capacity" },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Check for existing enrollment
    const existingEnrollment = await prisma.wellnessProgramEnrollment.findFirst({
      where: { programId: id, clientId },
    });

    if (existingEnrollment) {
      return NextResponse.json(
        { error: "Client already enrolled in this program" },
        { status: 409, headers: standardHeaders(requestId) }
      );
    }

    const enrollment = await prisma.wellnessProgramEnrollment.create({
      data: {
        storeId,
        programId: id,
        clientId,
        emergencyContact: JSON.stringify(emergencyContact),
        medicalConditions,
        fitnessLevel,
        goals: JSON.stringify(goals),
        paymentMethod,
        waiverSigned,
        notes,
        status: "active",
        progress: 0,
      },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        program: {
          select: {
            name: true,
            startDate: true,
          },
        },
      },
    });

    return NextResponse.json(enrollment, {
      status: 201,
      headers: standardHeaders(requestId),
    });
  } catch (error: unknown) {
    logger.error("[WELLNESS_PROGRAM_ENROLLMENT_POST]", { error, programId: params.id });
    return NextResponse.json(
      { error: "Failed to enroll client" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}