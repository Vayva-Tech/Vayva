import { NextRequest } from 'next/server';
import { FurnitureService } from '@vayva/industry-specialized';

const service = new FurnitureService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const room = searchParams.get('room');
    
    let items;
    if (query) {
      items = await service.search(query);
    } else if (room) {
      items = await service.findByRoomType(room);
    } else {
      items = await service.findAll();
    }
    
    return Response.json({ items });
  } catch (error) {
    console.error('Error fetching furniture:', error);
    return Response.json(
      { error: 'Failed to fetch furniture' },
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
    console.error('Error creating furniture item:', error);
    return Response.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}