import { NextRequest } from 'next/server';
import { ToysService } from '@vayva/industry-specialized';

const service = new ToysService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const ageGroup = searchParams.get('age');
    
    let toys;
    if (query) {
      toys = await service.search(query);
    } else if (ageGroup) {
      toys = await service.findByAgeGroup(ageGroup);
    } else {
      toys = await service.findAll();
    }
    
    return Response.json({ toys });
  } catch (error) {
    console.error('Error fetching toys:', error);
    return Response.json(
      { error: 'Failed to fetch toys' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const toy = await service.create(data);
    return Response.json({ toy });
  } catch (error) {
    console.error('Error creating toy:', error);
    return Response.json(
      { error: 'Failed to create toy' },
      { status: 500 }
    );
  }
}