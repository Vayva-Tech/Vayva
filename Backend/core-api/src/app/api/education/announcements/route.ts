import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const createAnnouncementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
  targetType: z.enum(["all", "students", "instructors", "courses", "specific"]).default("all"),
  targetIds: z.array(z.string()).default([]),
  attachmentUrls: z.array(z.string()).default([]),
  isPinned: z.boolean().default(false),
  publishAt: z.string().optional(),
  expireAt: z.string().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.ENROLLMENTS_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const isPublished = searchParams.get("isPublished") === "true" || undefined;
      const priority = searchParams.get("priority") || undefined;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const skip = (page - 1) * limit;

      const where = {
        storeId,
        ...(isPublished !== undefined && { isPublished }),
        ...(priority && { priority }),
      };

      const [announcements, total] = await Promise.all([
        prisma.announcement.findMany({
          where,
          orderBy: [
            { isPinned: "desc" },
            { createdAt: "desc" },
          ],
          skip,
          take: limit,
        }),
        prisma.announcement.count({ where }),
      ]);

      return NextResponse.json({
        data: announcements,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("[ANNOUNCEMENTS_GET]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to fetch announcements" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ENROLLMENTS_CREATE,
  async (req: NextRequest, { storeId, user }: APIContext) => {
    try {
      const body = await req.json();
      const validated = createAnnouncementSchema.parse(body);

      const announcement = await prisma.announcement.create({
        data: {
          storeId,
          ...validated,
          audience: validated.targetType,
          publishAt: validated.publishAt ? new Date(validated.publishAt) : new Date(),
          expireAt: validated.expireAt ? new Date(validated.expireAt) : null,
          isPublished: true,
          createdBy: user.id,
        },
      });

      return NextResponse.json({ data: announcement }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[ANNOUNCEMENTS_POST]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to create announcement" },
        { status: 500 },
      );
    }
  },
);
