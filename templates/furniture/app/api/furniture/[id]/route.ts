import { FurnitureService } from '@vayva/industry-specialized';

const service = new FurnitureService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await service.findById(params.id);
    if (!item) {
      return Response.json({ error: 'Item not found' }, { status: 404 });
    }
    return Response.json({ item });
  } catch (error) {
    console.error('Error fetching furniture item:', error);
    return Response.json(
      { error: 'Failed to fetch item' },
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
    const item = await service.update(params.id, data);
    return Response.json({ item });
  } catch (error) {
    console.error('Error updating furniture item:', error);
    return Response.json(
      { error: 'Failed to update item' },
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
    return Response.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting furniture item:', error);
    return Response.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}