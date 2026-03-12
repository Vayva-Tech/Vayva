import { ArtistryService } from '@vayva/industry-specialized';

const service = new ArtistryService();

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    await service.submitCommissionRequest(data);
    return Response.json({ message: 'Commission request submitted successfully' });
  } catch (error) {
    console.error('Error submitting commission request:', error);
    return Response.json(
      { error: 'Failed to submit commission request' },
      { status: 500 }
    );
  }
}