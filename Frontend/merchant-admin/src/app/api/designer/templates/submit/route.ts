import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@vayva/db";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, description, category, thumbnail, files } = body;

        if (!name || !description || !category) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if designerTemplate model exists
        if (!(prisma as unknown as Record<string, unknown>).designerTemplate) {
            return NextResponse.json({ error: "Designer templates not yet available" }, { status: 503 });
        }

        const template = await (prisma as unknown as { designerTemplate: { create: (args: unknown) => Promise<unknown> } }).designerTemplate.create({
            data: {
                name,
                description,
                category,
                thumbnail: thumbnail || null,
                files: files || [],
                designerId: session.user.id,
                status: "pending",
            },
        });

        return NextResponse.json({ success: true, template });
    } catch (error) {
        return NextResponse.json({ error: "Failed to submit template" }, { status: 500 });
    }
}
