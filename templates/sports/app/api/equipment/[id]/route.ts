import { SportsService } from '@vayva/industry-specialized';

const service = new SportsService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await service.findById(params.id);
    if (!item) {
      return Response.json({ error: 'Equipment not found' }, { status: 404 });
    }
    return Response.json({ item });
  } catch (error) {
    console.error('Error fetching sports equipment:', error);
    return Response.json(
      { error: 'Failed to fetch equipment' },
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
    console.error('Error updating sports equipment:', error);
    return Response.json(
      { error: 'Failed to update equipment' },
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
    return Response.json({ message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting sports equipment:', error);
    return Response.json(
      { error: 'Failed to delete equipment' },
      { status: 500 }
    );
  }
}