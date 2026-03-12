import { CryptoService } from '@vayva/industry-specialized';

const service = new CryptoService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const cryptocurrency = await service.findById(params.id);
    if (!cryptocurrency) {
      return Response.json({ error: 'Cryptocurrency not found' }, { status: 404 });
    }
    return Response.json({ cryptocurrency });
  } catch (error) {
    console.error('Error fetching cryptocurrency:', error);
    return Response.json(
      { error: 'Failed to fetch cryptocurrency' },
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
    const cryptocurrency = await service.update(params.id, data);
    return Response.json({ cryptocurrency });
  } catch (error) {
    console.error('Error updating cryptocurrency:', error);
    return Response.json(
      { error: 'Failed to update cryptocurrency' },
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
    return Response.json({ message: 'Cryptocurrency deleted successfully' });
  } catch (error) {
    console.error('Error deleting cryptocurrency:', error);
    return Response.json(
      { error: 'Failed to delete cryptocurrency' },
      { status: 500 }
    );
  }
}