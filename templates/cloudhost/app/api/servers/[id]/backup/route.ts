import { CloudHostingService } from '@vayva/industry-specialized';

const service = new CloudHostingService();

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await service.createBackup(params.id);
    return Response.json({ message: 'Backup created successfully' });
  } catch (error) {
    console.error('Error creating backup:', error);
    return Response.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}