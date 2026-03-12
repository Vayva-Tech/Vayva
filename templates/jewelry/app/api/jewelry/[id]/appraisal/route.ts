import { JewelryService } from '@vayva/industry-specialized';

const service = new JewelryService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const value = await service.getAppraisalValue(params.id);
    return Response.json({ value });
  } catch (error) {
    console.error('Error fetching appraisal value:', error);
    return Response.json(
      { error: 'Failed to fetch appraisal value' },
      { status: 500 }
    );
  }
}