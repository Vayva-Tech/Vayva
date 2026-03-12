import { NextRequest } from 'next/server';
import { SportsService } from '@vayva/industry-specialized';

const service = new SportsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const sport = searchParams.get('sport');
    
    let equipment;
    if (query) {
      equipment = await service.search(query);
    } else if (sport) {
      equipment = await service.getEquipmentBySport(sport);
    } else {
      equipment = await service.findAll();
    }
    
    return Response.json({ equipment });
  } catch (error) {
    console.error('Error fetching sports equipment:', error);
    return Response.json(
      { error: 'Failed to fetch equipment' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const item = await service.create(data);
    return Response.json({ item });
  } catch (error) {
    console.error('Error creating sports equipment:', error);
    return Response.json(
      { error: 'Failed to create equipment' },
      { status: 500 }
    );
  }
}