import { BeautyServiceManager } from '@vayva/industry-specialized';

const service = new BeautyServiceManager();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skinType = searchParams.get('skinType');
    
    if (!skinType) {
      return Response.json(
        { error: 'Skin type parameter required' },
        { status: 400 }
      );
    }
    
    const recommendations = await service.getProductRecommendations(skinType);
    return Response.json({ products: recommendations });
  } catch (error) {
    console.error('Error fetching product recommendations:', error);
    return Response.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}