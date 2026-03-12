import { ToysService } from '@vayva/industry-specialized';

const service = new ToysService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const toy = await service.findById(params.id);
    if (!toy) {
      return Response.json({ error: 'Toy not found' }, { status: 404 });
    }
    return Response.json({ toy });
  } catch (error) {
    console.error('Error fetching toy:', error);
    return Response.json(
      { error: 'Failed to fetch toy' },
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
    const toy = await service.update(params.id, data);
    return Response.json({ toy });
  } catch (error) {
    console.error('Error updating toy:', error);
    return Response.json(
      { error: 'Failed to update toy' },
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
    return Response.json({ message: 'Toy deleted successfully' });
  } catch (error) {
    console.error('Error deleting toy:', error);
    return Response.json(
      { error: 'Failed to delete toy' },
      { status: 500 }
    );
  }
}