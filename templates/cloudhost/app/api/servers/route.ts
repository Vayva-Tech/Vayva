import { NextRequest } from 'next/server';
import { CloudHostingService } from '@vayva/industry-specialized';

const service = new CloudHostingService();

export async function GET(request: NextRequest) {
  try {
    const servers = await service.findAll();
    return Response.json({ servers });
  } catch (error) {
    console.error('Error fetching servers:', error);
    return Response.json(
      { error: 'Failed to fetch servers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const server = await service.create(data);
    return Response.json({ server });
  } catch (error) {
    console.error('Error creating server:', error);
    return Response.json(
      { error: 'Failed to create server' },
      { status: 500 }
    );
  }
}