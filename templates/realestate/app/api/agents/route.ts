import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const location = searchParams.get('location');

    // Build where clause for agents
    const where: any = {
      storeId: process.env.STORE_ID || 'default-real-estate-store',
    };

    // Fetch agents with property counts
    const [agents, total] = await Promise.all([
      prisma.realEstateVendor.findMany({
        where,
        include: {
          properties: {
            where: {
              status: 'available',
            },
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.realEstateVendor.count({ where }),
    ]);

    // Transform to match template expectations
    const transformedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      licenseNumber: agent.licenseNumber,
      company: agent.company,
      bio: agent.bio,
      avatar: agent.avatar,
      specialties: agent.specialties,
      rating: agent.rating ? Number(agent.rating) : null,
      yearsExperience: agent.yearsExperience,
      propertiesCount: agent.properties.length,
      isVerified: agent.isVerified,
      createdAt: agent.createdAt,
    }));

    return Response.json({
      agents: transformedAgents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Agents API error:', error);
    return Response.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}