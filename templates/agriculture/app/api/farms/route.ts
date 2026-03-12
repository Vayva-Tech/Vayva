import { NextRequest } from 'next/server';
import { AgricultureService } from '@vayva/industry-specialized';

const service = new AgricultureService();

export async function GET(request: NextRequest) {
  try {
    const farms = await service.findAll();
    return Response.json({ farms });
  } catch (error) {
    console.error('Error fetching farms:', error);
    return Response.json(
      { error: 'Failed to fetch farms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const farm = await service.create(data);
    return Response.json({ farm });
  } catch (error) {
    console.error('Error creating farm:', error);
    return Response.json(
      { error: 'Failed to create farm' },
      { status: 500 }
    );
  }
}