import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { requireAuthFromRequest } from "@/lib/session.server";
import { handleApiError } from "@/lib/api-error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = (searchParams.get("search") || "").trim();
    const status = (searchParams.get("status") || "").trim();

    const students = await prisma.student.findMany({
      where: {
        storeId: user.storeId,
        ...(status ? { status } : {}),
        ...(search
          ? {
              OR: [
                { firstName: { contains: search, mode: "insensitive" } },
                { lastName: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { studentId: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 200,
    });

    return NextResponse.json(
      {
        data: students,
        pagination: { page: 1, limit: 200, total: students.length, pages: 1 },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    handleApiError(error, { endpoint: "/api/education/students", operation: "GET" });
    return NextResponse.json({ error: "Failed to load students" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthFromRequest(request);
    if (!user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : null;
    const grade = typeof body.grade === "string" ? body.grade.trim() : null;
    const studentId =
      typeof body.studentId === "string" && body.studentId.trim()
        ? body.studentId.trim()
        : `STU-${Date.now()}`;

    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "firstName, lastName, and email are required" },
        { status: 400 },
      );
    }

    const created = await prisma.student.create({
      data: {
        storeId: user.storeId,
        // userId is required & unique in schema; for now, we set it to the current user.
        // This keeps the API functional for stores that treat "student" as an internal record.
        userId: user.id,
        studentId,
        firstName,
        lastName,
        email,
        phone,
        grade,
        status: "active",
      },
    });

    return NextResponse.json({ success: true, student: created }, { status: 201 });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/education/students", operation: "POST" });
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}

