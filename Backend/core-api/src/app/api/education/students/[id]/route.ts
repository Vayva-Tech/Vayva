import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const updateStudentSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  grade: z.string().optional(),
  status: z.enum(["active", "inactive", "graduated", "suspended"]).optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  guardianInfo: z.object({
    name: z.string(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const id = req.url.split("/").pop();
      if (!id) {
        return NextResponse.json(
          { error: "Student ID is required" },
          { status: 400 },
        );
      }

      const student = await prisma.student.findFirst({
        where: { id, storeId },
      });

      if (!student) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 },
        );
      }

      return NextResponse.json({ data: student });
    } catch (error) {
      logger.error("[STUDENT_GET]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to fetch student" },
        { status: 500 },
      );
    }
  },
);

export const PUT = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_UPDATE,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const id = req.url.split("/").pop();
      if (!id) {
        return NextResponse.json(
          { error: "Student ID is required" },
          { status: 400 },
        );
      }

      const body = await req.json();
      const validated = updateStudentSchema.parse(body);

      const existingStudent = await prisma.student.findFirst({
        where: { id, storeId },
      });

      if (!existingStudent) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 },
        );
      }

      const student = await prisma.student.update({
        where: { id },
        data: {
          ...validated,
          dateOfBirth: validated.dateOfBirth ? new Date(validated.dateOfBirth) : undefined,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({ data: student });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[STUDENT_PUT]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to update student" },
        { status: 500 },
      );
    }
  },
);

export const DELETE = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_DELETE,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const id = req.url.split("/").pop();
      if (!id) {
        return NextResponse.json(
          { error: "Student ID is required" },
          { status: 400 },
        );
      }

      const existingStudent = await prisma.student.findFirst({
        where: { id, storeId },
      });

      if (!existingStudent) {
        return NextResponse.json(
          { error: "Student not found" },
          { status: 404 },
        );
      }

      await prisma.student.delete({ where: { id } });

      return NextResponse.json({ success: true });
    } catch (error) {
      logger.error("[STUDENT_DELETE]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to delete student" },
        { status: 500 },
      );
    }
  },
);
