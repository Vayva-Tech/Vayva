import { ToysService } from '@vayva/industry-specialized';

const service = new ToysService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const report = await service.getSafetyReport(params.id);
    return Response.json({ report });
  } catch (error) {
    console.error('Error fetching safety report:', error);
    return Response.json(
      { error: 'Failed to fetch safety report' },
      { status: 500 }
    );
  }
}