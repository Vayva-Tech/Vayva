import { SaaSService } from '@vayva/industry-specialized';

const service = new SaaSService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const product = await service.findById(params.id);
    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }
    return Response.json({ product });
  } catch (error) {
    console.error('Error fetching SaaS product:', error);
    return Response.json(
      { error: 'Failed to fetch product' },
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
    const product = await service.update(params.id, data);
    return Response.json({ product });
  } catch (error) {
    console.error('Error updating SaaS product:', error);
    return Response.json(
      { error: 'Failed to update product' },
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
    return Response.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting SaaS product:', error);
    return Response.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}