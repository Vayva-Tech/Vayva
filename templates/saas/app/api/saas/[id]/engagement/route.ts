import { SaaSService } from '@vayva/industry-specialized';

const service = new SaaSService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const metrics = await service.getUserEngagementMetrics(params.id);
    return Response.json({ metrics });
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return Response.json(
      { error: 'Failed to fetch engagement metrics' },
      { status: 500 }
    );
  }
}