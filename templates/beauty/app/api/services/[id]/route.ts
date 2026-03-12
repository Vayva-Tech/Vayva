import { BeautyServiceManager } from '@vayva/industry-specialized';

const service = new BeautyServiceManager();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const serviceItem = await service.findById(params.id);
    if (!serviceItem) {
      return Response.json({ error: 'Service not found' }, { status: 404 });
    }
    return Response.json({ service: serviceItem });
  } catch (error) {
    console.error('Error fetching beauty service:', error);
    return Response.json(
      { error: 'Failed to fetch service' },
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
    const serviceItem = await service.update(params.id, data);
    return Response.json({ service: serviceItem });
  } catch (error) {
    console.error('Error updating beauty service:', error);
    return Response.json(
      { error: 'Failed to update service' },
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
    return Response.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting beauty service:', error);
    return Response.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
}