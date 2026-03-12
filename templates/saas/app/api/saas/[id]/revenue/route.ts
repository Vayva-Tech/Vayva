import { SaaSService } from '@vayva/industry-specialized';

const service = new SaaSService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const revenue = await service.calculateSubscriptionRevenue(params.id);
    return Response.json({ revenue });
  } catch (error) {
    console.error('Error calculating subscription revenue:', error);
    return Response.json(
      { error: 'Failed to calculate revenue' },
      { status: 500 }
    );
  }
}