import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlogMediaApiService } from '@vayva/industry-blog-media';
import { authenticateRequest } from '@/middleware/auth';

const blogService = new BlogMediaApiService(prisma);

// GET /api/blog/posts - List posts
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as any || undefined;
    const tags = searchParams.get('tags')?.split(',') || undefined;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const orderBy = searchParams.get('orderBy') as any || 'createdAt';
    const order = searchParams.get('order') as any || 'desc';

    const posts = await blogService.getPosts(auth.storeId, {
      status,
      tags,
      limit,
      offset,
      orderBy,
      order,
    });

    return NextResponse.json({ success: true, data: posts });
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}

// POST /api/blog/posts - Create post
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const post = await blogService.createPost({
      ...body,
      storeId: auth.storeId,
    });

    return NextResponse.json({ success: true, data: post }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json(
      { error: 'Failed to create blog post' },
      { status: 500 }
    );
  }
}
