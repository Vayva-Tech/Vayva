import { NextRequest } from 'next/server';
import { CryptoService } from '@vayva/industry-specialized';

const service = new CryptoService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    let cryptocurrencies;
    if (query) {
      cryptocurrencies = await service.search(query);
    } else {
      cryptocurrencies = await service.findAll();
    }
    
    return Response.json({ cryptocurrencies });
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    return Response.json(
      { error: 'Failed to fetch cryptocurrencies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const cryptocurrency = await service.create(data);
    return Response.json({ cryptocurrency });
  } catch (error) {
    console.error('Error creating cryptocurrency:', error);
    return Response.json(
      { error: 'Failed to create cryptocurrency' },
      { status: 500 }
    );
  }
}