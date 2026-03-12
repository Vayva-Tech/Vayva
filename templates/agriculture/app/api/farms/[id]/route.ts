import { AgricultureService } from '@vayva/industry-specialized';

const service = new AgricultureService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const farm = await service.findById(params.id);
    if (!farm) {
      return Response.json({ error: 'Farm not found' }, { status: 404 });
    }
    return Response.json({ farm });
  } catch (error) {
    console.error('Error fetching farm:', error);
    return Response.json(
      { error: 'Failed to fetch farm' },
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
    const farm = await service.update(params.id, data);
    return Response.json({ farm });
  } catch (error) {
    console.error('Error updating farm:', error);
    return Response.json(
      { error: 'Failed to update farm' },
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
    return Response.json({ message: 'Farm deleted successfully' });
  } catch (error) {
    console.error('Error deleting farm:', error);
    return Response.json(
      { error: 'Failed to delete farm' },
      { status: 500 }
    );
  }
}