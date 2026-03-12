import { BooksService } from '@vayva/industry-specialized';

const service = new BooksService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const book = await service.findById(params.id);
    if (!book) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }
    return Response.json({ book });
  } catch (error) {
    console.error('Error fetching book:', error);
    return Response.json(
      { error: 'Failed to fetch book' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const book = await service.update(params.id, data);
    return Response.json({ book });
  } catch (error) {
    console.error('Error updating book:', error);
    return Response.json(
      { error: 'Failed to update book' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await service.delete(params.id);
    return Response.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    return Response.json(
      { error: 'Failed to delete book' },
      { status: 500 }
    );
  }
}