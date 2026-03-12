import { NextRequest } from 'next/server';
import { ElectronicsService } from '@vayva/industry-specialized';

const service = new ElectronicsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    let products;
    if (query) {
      products = await service.search(query);
    } else {
      products = await service.findAll();
    }
    
    return Response.json({ products });
  } catch (error) {
    console.error('Error fetching electronics:', error);
    return Response.json(
      { error: 'Failed to fetch electronics' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const product = await service.create(data);
    return Response.json({ product });
  } catch (error) {
    console.error('Error creating electronic product:', error);
    return Response.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}