import { CloudHostingService } from '@vayva/industry-specialized';

const service = new CloudHostingService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const metrics = await service.getServerMetrics(params.id);
    return Response.json({ metrics });
  } catch (error) {
    console.error('Error fetching server metrics:', error);
    return Response.json(
      { error: 'Failed to fetch server metrics' },
      { status: 500 }
    );
  }
}