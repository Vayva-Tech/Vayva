import { ElectronicsService } from '@vayva/industry-specialized';

const service = new ElectronicsService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const warranty = await service.getWarrantyStatus(params.id);
    return Response.json({ warranty });
  } catch (error) {
    console.error('Error fetching warranty status:', error);
    return Response.json(
      { error: 'Failed to fetch warranty status' },
      { status: 500 }
    );
  }
}