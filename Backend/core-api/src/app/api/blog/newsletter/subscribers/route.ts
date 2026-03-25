import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlogMediaApiService } from '@vayva/industry-blog-media';
import { authenticateRequest } from '@/middleware/auth';

const blogService = new BlogMediaApiService(prisma);

// GET /api/blog/newsletter/subscribers - Get subscribers
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any || undefined;
    const tags = searchParams.get('tags')?.split(',') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    const subscribers = await blogService.getSubscribers(auth.storeId, {
      status,
      tags,
      limit,
      offset,
    });

    return NextResponse.json({ success: true, data: subscribers });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}

// POST /api/blog/newsletter/subscribers - Add subscriber
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const subscriber = await blogService.addSubscriber({
      ...body,
      storeId: auth.storeId,
    });

    return NextResponse.json({ success: true, data: subscriber }, { status: 201 });
  } catch (error) {
    console.error('Error adding subscriber:', error);
    return NextResponse.json(
      { error: 'Failed to add subscriber' },
      { status: 500 }
    );
  }
}
