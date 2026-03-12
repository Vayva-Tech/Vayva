import { NextRequest } from 'next/server';
import { JewelryService } from '@vayva/industry-specialized';

const service = new JewelryService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    let items;
    if (query) {
      items = await service.search(query);
    } else {
      items = await service.findAll();
    }
    
    return Response.json({ items });
  } catch (error) {
    console.error('Error fetching jewelry:', error);
    return Response.json(
      { error: 'Failed to fetch jewelry' },
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
    console.error('Error creating jewelry item:', error);
    return Response.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}