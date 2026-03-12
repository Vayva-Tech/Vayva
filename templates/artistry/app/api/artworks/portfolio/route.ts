import { ArtistryService } from '@vayva/industry-specialized';

const service = new ArtistryService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const artist = searchParams.get('artist');
    
    if (!artist) {
      return Response.json(
        { error: 'Artist parameter required' },
        { status: 400 }
      );
    }
    
    const portfolio = await service.getArtistPortfolio(artist);
    return Response.json({ artworks: portfolio });
  } catch (error) {
    console.error('Error fetching artist portfolio:', error);
    return Response.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    );
  }
}