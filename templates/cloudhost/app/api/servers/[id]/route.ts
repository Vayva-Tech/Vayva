import { CloudHostingService } from '@vayva/industry-specialized';

const service = new CloudHostingService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const server = await service.findById(params.id);
    if (!server) {
      return Response.json({ error: 'Server not found' }, { status: 404 });
    }
    return Response.json({ server });
  } catch (error) {
    console.error('Error fetching server:', error);
    return Response.json(
      { error: 'Failed to fetch server' },
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
    const server = await service.update(params.id, data);
    return Response.json({ server });
  } catch (error) {
    console.error('Error updating server:', error);
    return Response.json(
      { error: 'Failed to update server' },
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
    return Response.json({ message: 'Server deleted successfully' });
  } catch (error) {
    console.error('Error deleting server:', error);
    return Response.json(
      { error: 'Failed to delete server' },
      { status: 500 }
    );
  }
}