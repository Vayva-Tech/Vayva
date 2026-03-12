import { NextRequest } from 'next/server';
import { BooksService } from '@vayva/industry-specialized';

const service = new BooksService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    let books;
    if (query) {
      books = await service.search(query);
    } else {
      books = await service.findAll();
    }
    
    return Response.json({ books });
  } catch (error) {
    console.error('Error fetching books:', error);
    return Response.json(
      { error: 'Failed to fetch books' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const book = await service.create(data);
    return Response.json({ book });
  } catch (error) {
    console.error('Error creating book:', error);
    return Response.json(
      { error: 'Failed to create book' },
      { status: 500 }
    );
  }
}