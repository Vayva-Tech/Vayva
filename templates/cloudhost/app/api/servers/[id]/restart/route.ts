import { CloudHostingService } from '@vayva/industry-specialized';

const service = new CloudHostingService();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await service.restartServer(params.id);
    return Response.json({ message: 'Server restarted successfully' });
  } catch (error) {
    console.error('Error restarting server:', error);
    return Response.json(
      { error: 'Failed to restart server' },
      { status: 500 }
    );
  }
}