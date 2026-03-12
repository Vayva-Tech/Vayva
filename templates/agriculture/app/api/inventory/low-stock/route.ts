import { InventoryService } from '@vayva/industry-specialized';

const service = new InventoryService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get('threshold') || '10');
    
    const lowStockItems = await service.getLowStockItems(threshold);
    return Response.json({ items: lowStockItems });
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    return Response.json(
      { error: 'Failed to fetch low stock items' },
      { status: 500 }
    );
  }
}