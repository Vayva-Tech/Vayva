import { BooksService } from '@vayva/industry-specialized';

const service = new BooksService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const genre = searchParams.get('genre');
    
    const bestsellers = await service.getBestsellers(genre || undefined);
    return Response.json({ books: bestsellers });
  } catch (error) {
    console.error('Error fetching bestsellers:', error);
    return Response.json(
      { error: 'Failed to fetch bestsellers' },
      { status: 500 }
    );
  }
}