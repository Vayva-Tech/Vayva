import { CryptoService } from '@vayva/industry-specialized';

const service = new CryptoService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const days = parseInt(searchParams.get('days') || '30');
    
    if (!symbol) {
      return Response.json(
        { error: 'Symbol parameter required' },
        { status: 400 }
      );
    }
    
    const history = await service.getPriceHistory(symbol, days);
    return Response.json({ history });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return Response.json(
      { error: 'Failed to fetch price history' },
      { status: 500 }
    );
  }
}