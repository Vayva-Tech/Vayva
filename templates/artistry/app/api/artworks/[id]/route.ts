import { ArtistryService } from '@vayva/industry-specialized';

const service = new ArtistryService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const artwork = await service.findById(params.id);
    if (!artwork) {
      return Response.json({ error: 'Artwork not found' }, { status: 404 });
    }
    return Response.json({ artwork });
  } catch (error) {
    console.error('Error fetching artwork:', error);
    return Response.json(
      { error: 'Failed to fetch artwork' },
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
    const artwork = await service.update(params.id, data);
    return Response.json({ artwork });
  } catch (error) {
    console.error('Error updating artwork:', error);
    return Response.json(
      { error: 'Failed to update artwork' },
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
    return Response.json({ message: 'Artwork deleted successfully' });
  } catch (error) {
    console.error('Error deleting artwork:', error);
    return Response.json(
      { error: 'Failed to delete artwork' },
      { status: 500 }
    );
  }
}