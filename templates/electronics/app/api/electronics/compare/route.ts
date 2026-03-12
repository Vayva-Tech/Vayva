import { ElectronicsService } from '@vayva/industry-specialized';

const service = new ElectronicsService();

export async function POST(request: NextRequest) {
  try {
    const { ids } = await request.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return Response.json(
        { error: 'Product IDs array required' },
        { status: 400 }
      );
    }
    
    const products = await service.compareProducts(ids);
    return Response.json({ products });
  } catch (error) {
    console.error('Error comparing products:', error);
    return Response.json(
      { error: 'Failed to compare products' },
      { status: 500 }
    );
  }
}