import { FurnitureService } from '@vayva/industry-specialized';

const service = new FurnitureService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const instructions = await service.getAssemblyInstructions(params.id);
    return Response.json({ instructions });
  } catch (error) {
    console.error('Error fetching assembly instructions:', error);
    return Response.json(
      { error: 'Failed to fetch assembly instructions' },
      { status: 500 }
    );
  }
}