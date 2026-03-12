import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const createLearningMaterialSchema = z.object({
  courseId: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  type: z.enum(["document", "video", "audio", "image", "link"]),
  fileUrl: z.string().optional(),
  externalUrl: z.string().optional(),
  thumbnailUrl: z.string().optional(),
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
  accessLevel: z.enum(["all", "enrolled", "premium"]).default("all"),
  allowedAttempts: z.number().optional(),
  tags: z.array(z.string()).default([]),
});

export const GET = withVayvaAPI(
  PERMISSIONS.COURSES_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId") || undefined;
      const type = searchParams.get("type") || undefined;
      const search = searchParams.get("search") || "";
      const isPublished = searchParams.get("isPublished") === "true" || undefined;
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const skip = (page - 1) * limit;

      const where = {
        storeId,
        ...(courseId && { courseId }),
        ...(type && { type }),
        ...(isPublished !== undefined && { isPublished }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: "insensitive" as const } },
            { description: { contains: search, mode: "insensitive" as const } },
            { tags: { has: search } },
          ],
        }),
      };

      const [materials, total] = await Promise.all([
        prisma.learningMaterial.findMany({
          where,
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.learningMaterial.count({ where }),
      ]);

      return NextResponse.json({
        data: materials,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error("[LEARNING_MATERIALS_GET]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to fetch learning materials" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.COURSES_CREATE,
  async (req: NextRequest, { storeId, user }: APIContext) => {
    try {
      const body = await req.json();
      const validated = createLearningMaterialSchema.parse(body);

      const material = await prisma.learningMaterial.create({
        data: {
          storeId,
          ...validated,
          createdBy: user.id,
        },
      });

      return NextResponse.json({ data: material }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[LEARNING_MATERIALS_POST]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to create learning material" },
        { status: 500 },
      );
    }
  },
);
