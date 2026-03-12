import { NextRequest } from 'next/server';
import { ArtistryService } from '@vayva/industry-specialized';

const service = new ArtistryService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    let artworks;
    if (query) {
      artworks = await service.search(query);
    } else {
      artworks = await service.findAll();
    }
    
    return Response.json({ artworks });
  } catch (error) {
    console.error('Error fetching artworks:', error);
    return Response.json(
      { error: 'Failed to fetch artworks' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const artwork = await service.create(data);
    return Response.json({ artwork });
  } catch (error) {
    console.error('Error creating artwork:', error);
    return Response.json(
      { error: 'Failed to create artwork' },
      { status: 500 }
    );
  }
}