import { CryptoService } from '@vayva/industry-specialized';

const service = new CryptoService();

export async function POST(request: NextRequest) {
  try {
    const { from, to, amount } = await request.json();
    
    if (!from || !to || !amount) {
      return Response.json(
        { error: 'from, to, and amount parameters required' },
        { status: 400 }
      );
    }
    
    const convertedAmount = await service.convertCurrency(from, to, amount);
    return Response.json({ 
      from,
      to, 
      amount,
      convertedAmount,
      rate: convertedAmount / amount
    });
  } catch (error) {
    console.error('Error converting currency:', error);
    return Response.json(
      { error: 'Failed to convert currency' },
      { status: 500 }
    );
  }
}