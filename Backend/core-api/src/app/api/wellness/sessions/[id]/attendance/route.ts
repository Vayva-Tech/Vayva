import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const AttendanceSchema = z.object({
  clientId: z.string(),
  status: z.enum(["registered", "attended", "no_show", "late"]),
  checkedInAt: z.string().datetime().optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify session exists
    const session = await prisma.wellnessSession.findFirst({
      where: { id, storeId },
    });

    if (!session) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    const attendance = await prisma.wellnessSessionAttendance.findMany({
      where: { sessionId: id },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Calculate attendance statistics
    const stats = attendance.reduce((acc, record) => {
      acc.total++;
      if (record.status === "attended") acc.attended++;
      if (record.status === "no_show") acc.noShow++;
      if (record.status === "late") acc.late++;
      return acc;
    }, { total: 0, attended: 0, noShow: 0, late: 0 });

    return NextResponse.json(
      {
        data: {
          sessionId: id,
          sessionInfo: {
            classType: session.classType,
            startTime: session.startTime,
            endTime: session.endTime,
            location: session.location,
            instructor: `${session.instructorId}`, // Would join with instructor table
          },
          attendance: attendance.map(record => ({
            ...record,
            clientName: `${record.client.firstName} ${record.client.lastName}`,
          })),
          statistics: {
            ...stats,
            attendanceRate: stats.total > 0 
              ? Math.round((stats.attended / stats.total) * 10000) / 100
              : 0,
            noShowRate: stats.total > 0 
              ? Math.round((stats.noShow / stats.total) * 10000) / 100
              : 0,
          },
        },
      },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WELLNESS_SESSION_ATTENDANCE_GET]", { error, sessionId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}

export const POST = withVayvaAPI(
  PERMISSIONS.SESSIONS_MANAGE,
  async (req: NextRequest, { params, storeId, user, correlationId }: APIContext & { params: { id: string } }) => {
    const requestId = correlationId;
    try {
      const { id } = params;
      const json = await req.json().catch(() => ({}));
      const parseResult = AttendanceSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid attendance data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const body = parseResult.data;

      // Verify session exists
      const session = await prisma.wellnessSession.findFirst({
        where: { id, storeId },
      });

      if (!session) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Verify client exists
      const client = await prisma.user.findFirst({
        where: { id: body.clientId, storeId },
      });

      if (!client) {
        return NextResponse.json(
          { error: "Client not found" },
          { status: 404, headers: standardHeaders(requestId) }
        );
      }

      // Check if client is already registered
      const existingAttendance = await prisma.wellnessSessionAttendance.findFirst({
        where: { sessionId: id, clientId: body.clientId },
      });

      if (existingAttendance) {
        return NextResponse.json(
          { error: "Client already registered for this session" },
          { status: 409, headers: standardHeaders(requestId) }
        );
      }

      // Check capacity
      const currentAttendance = await prisma.wellnessSessionAttendance.count({
        where: { sessionId: id },
      });

      if (currentAttendance >= session.capacity) {
        return NextResponse.json(
          { error: "Session is at full capacity" },
          { status: 400, headers: standardHeaders(requestId) }
        );
      }

      const attendanceRecord = await prisma.wellnessSessionAttendance.create({
        data: {
          storeId,
          sessionId: id,
          clientId: body.clientId,
          status: body.status,
          checkedInAt: body.checkedInAt ? new Date(body.checkedInAt) : null,
          notes: body.notes,
        },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      });

      return NextResponse.json(attendanceRecord, {
        status: 201,
        headers: standardHeaders(requestId),
      });
    } catch (error: unknown) {
      logger.error("[WELLNESS_SESSION_ATTENDANCE_POST]", { error, sessionId: params.id, storeId, userId: user?.id });
      return NextResponse.json(
        { error: "Failed to register attendance" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);