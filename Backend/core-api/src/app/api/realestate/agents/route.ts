/**
 * Real Estate Agents API Routes
 * GET /api/realestate/agents - List agents
 * POST /api/realestate/agents - Create agent
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET List Agents
export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status"); // active, inactive
      const licenseState = searchParams.get("licenseState");

      const agents = await prisma.user.findMany({
        where: {
          storeMemberships: {
            some: {
              storeId,
              role: {
                in: ["AGENT", "ADMIN", "OWNER"]
              },
              ...(status ? { status: status.toUpperCase() } : {})
            }
          },
          ...(licenseState ? { 
            metadata: {
              path: ["licenseState"],
              equals: licenseState
            }
          } : {})
        },
        include: {
          storeMemberships: {
            where: { storeId },
            select: {
              role: true,
              status: true,
              permissions: true,
            }
          }
        },
        take: limit,
        skip: offset,
      });

      // Get performance data for each agent
      const agentsWithPerformance = await Promise.all(
        agents.map(async (agent) => {
          // Get lead statistics
          const leadStats = await prisma.realEstateLead.groupBy({
            by: ["status"],
            where: {
              merchantId: storeId,
              agentId: agent.id,
            },
            _count: { id: true }
          });

          // Get conversion data
          const conversions = await prisma.leadConversion.count({
            where: {
              merchantId: storeId,
              convertedBy: agent.id,
            }
          });

          // Get commission earnings
          const commissions = await prisma.commission.aggregate({
            where: {
              merchantId: storeId,
              agentId: agent.id,
              status: "paid",
            },
            _sum: {
              commissionAmount: true
            }
          });

          return {
            ...agent,
            performance: {
              totalLeads: leadStats.reduce((sum, stat) => sum + stat._count.id, 0),
              convertedLeads: leadStats.find(s => s.status === "converted")?._count.id || 0,
              conversionRate: leadStats.reduce((sum, stat) => sum + stat._count.id, 0) > 0 
                ? ((leadStats.find(s => s.status === "converted")?._count.id || 0) / 
                   leadStats.reduce((sum, stat) => sum + stat._count.id, 0)) * 100
                : 0,
              totalConversions: conversions,
              totalCommission: commissions._sum.commissionAmount || 0,
              activeListings: 0, // Production: Query @vayva/industry-realestate listings API for count
              avgDaysToClose: 0 // Production: Calculate average from converted leads closedDate - createdDate
            }
          };
        })
      );

      const total = await prisma.user.count({
        where: {
          storeMemberships: {
            some: {
              storeId,
              role: {
                in: ["AGENT", "ADMIN", "OWNER"]
              },
              ...(status ? { status: status.toUpperCase() } : {})
            }
          }
        }
      });

      return NextResponse.json({
        success: true,
        data: agentsWithPerformance,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[AGENTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Agent
export const POST = withVayvaAPI(
  PERMISSIONS.TEAM_MANAGE,
  async (request, { storeId }) => {
    try {
      const body = await request.json();
      const {
        firstName,
        lastName,
        email,
        phone,
        licenseNumber,
        licenseState,
        brokerName,
        yearsExperience,
        specialties,
        bio,
        profileImage,
      } = body;

      if (!firstName || !lastName || !email) {
        return NextResponse.json(
          { error: "First name, last name, and email are required" },
          { status: 400 }
        );
      }

      // Check if user already exists
      let user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email,
            name: `${firstName} ${lastName}`,
            metadata: {
              firstName,
              lastName,
              phone,
              licenseNumber,
              licenseState,
              brokerName,
              yearsExperience,
              specialties: specialties || [],
              bio,
              profileImage,
              userType: "AGENT"
            }
          }
        });
      }

      // Add user to store as agent
      await prisma.storeMembership.upsert({
        where: {
          userId_storeId: {
            userId: user.id,
            storeId,
          }
        },
        update: {
          role: "AGENT",
          status: "ACTIVE",
        },
        create: {
          userId: user.id,
          storeId,
          role: "AGENT",
          status: "ACTIVE",
        }
      });

      return NextResponse.json({
        success: true,
        data: user,
        message: "Agent created successfully"
      });
    } catch (error: unknown) {
      logger.error("[AGENTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);