import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";
import { callAI } from "@/lib/ai/ai-client";

const remixSchema = z.object({
  courseId: z.string().min(1),
  originalText: z.string().min(1, "Original text is required"),
  prompt: z.string().min(1, "Remix prompt is required"),
  aiModel: z.string().default("gpt-4o-mini"),
});

export const POST = withVayvaAPI(
  PERMISSIONS.AI_ASSISTANT_USE,
  async (req: NextRequest, { storeId, user }: APIContext) => {
    try {
      const body = await req.json();
      const validated = remixSchema.parse(body);

      // Call AI to remix the content
      const aiResponse = await callAI({
        model: validated.aiModel,
        messages: [
          {
            role: "system",
            content: "You are an educational content assistant. Remix the provided content based on the user's prompt while maintaining educational value.",
          },
          {
            role: "user",
            content: `Original content: ${validated.originalText}\n\nRemix instructions: ${validated.prompt}`,
          },
        ],
        temperature: 0.7,
      });

      const remixedText = aiResponse.choices[0]?.message?.content || "";

      // Store the remix
      const remix = await prisma.assignmentRemix.create({
        data: {
          storeId,
          courseId: validated.courseId,
          instructorId: user.id,
          originalText: validated.originalText,
          remixedText,
          aiModel: validated.aiModel,
          promptUsed: validated.prompt,
        },
      });

      return NextResponse.json({
        data: {
          ...remix,
          remixedText,
        },
      }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[ASSIGNMENT_REMIX_POST]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to remix assignment" },
        { status: 500 },
      );
    }
  },
);
