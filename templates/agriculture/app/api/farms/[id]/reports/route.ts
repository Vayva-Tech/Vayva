import { AgricultureService } from '@vayva/industry-specialized';

const service = new AgricultureService();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'yield';
    
    let report;
    switch (reportType) {
      case 'yield':
        report = await service.getCropYieldReport(params.id);
        break;
      case 'maintenance':
        report = await service.getEquipmentMaintenanceSchedule(params.id);
        break;
      default:
        return Response.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }
    
    return Response.json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    return Response.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}