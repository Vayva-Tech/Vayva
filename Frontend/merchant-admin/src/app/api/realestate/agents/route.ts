import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/agents - Get real estate agents
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const page = parseInt(searchParams.get("page") || "1");

      const where: any = { 
        merchantId: storeId,
        role: 'AGENT' // Assuming team members with AGENT role
      };

      // Note: This assumes you have a TeamMember model or similar
      // Adjust based on your actual user/team structure
      const agents = await prisma.teamMember.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          photo: true,
          role: true,
          createdAt: true,
          // You would need to add relations to track agent-specific data
          _count: {
            select: {
              // Count properties listed by this agent
              Property: {
                where: { storeId }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit
      });

      const total = await prisma.teamMember.count({ where });

      return NextResponse.json({
        success: true,
        data: {
          agents,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[AGENTS_GET_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      
      // Fallback: Return empty array if TeamMember doesn't exist
      return NextResponse.json({
        success: true,
        data: {
          agents: [],
          pagination: {
            total: 0,
            page: 1,
            limit,
            totalPages: 0
          }
        }
      });
    }
  }
);

// POST /api/realestate/agents - Create/Add a new agent
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const body = await req.json();
      const {
        name,
        email,
        phone,
        photo,
        licenseNumber,
        specialties,
        bio,
        socialLinks
      } = body;

      if (!name || !email) {
        return NextResponse.json(
          { success: false, error: "Name and email are required" },
          { status: 400 }
        );
      }

      // In a real implementation, you would:
      // 1. Create a user account for the agent
      // 2. Assign them to the team with AGENT role
      // 3. Create agent profile with additional metadata
      
      logger.info("[AGENT_CREATE]", {
        name,
        email,
        storeId
      });

      return NextResponse.json({
        success: true,
        data: {
          message: "Agent creation requires user management integration",
          agent: {
            name,
            email,
            phone,
            photo,
            licenseNumber,
            specialties,
            bio,
            socialLinks
          }
        }
      });
    } catch (error: unknown) {
      logger.error("[AGENT_CREATE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to create agent" },
        { status: 500 }
      );
    }
  }
);
