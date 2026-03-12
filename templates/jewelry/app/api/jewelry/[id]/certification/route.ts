import { JewelryService } from '@vayva/industry-specialized';

const service = new JewelryService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const isValid = await service.verifyCertification(params.id);
    return Response.json({ valid: isValid });
  } catch (error) {
    console.error('Error verifying certification:', error);
    return Response.json(
      { error: 'Failed to verify certification' },
      { status: 500 }
    );
  }
}