import { NextRequest } from 'next/server';
import { BeautyServiceManager } from '@vayva/industry-specialized';

const service = new BeautyServiceManager();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    let services;
    if (query) {
      services = await service.search(query);
    } else {
      services = await service.findAll();
    }
    
    return Response.json({ services });
  } catch (error) {
    console.error('Error fetching beauty services:', error);
    return Response.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const serviceItem = await service.create(data);
    return Response.json({ service: serviceItem });
  } catch (error) {
    console.error('Error creating beauty service:', error);
    return Response.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
}