import { BooksService } from '@vayva/industry-specialized';

const service = new BooksService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isbn = searchParams.get('isbn');
    
    if (!isbn) {
      return Response.json(
        { error: 'ISBN parameter required' },
        { status: 400 }
      );
    }
    
    const book = await service.findByISBN(isbn);
    if (!book) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }
    
    return Response.json({ book });
  } catch (error) {
    console.error('Error fetching book by ISBN:', error);
    return Response.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}