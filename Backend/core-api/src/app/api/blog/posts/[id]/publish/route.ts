import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BlogMediaApiService } from '@vayva/industry-blog-media';
import { authenticateRequest } from '@/middleware/auth';

const blogService = new BlogMediaApiService(prisma);

// GET /api/blog/posts/:id/publish - Publish a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth?.storeId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const post = await blogService.publishPost(auth.storeId, params.id);

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error('Error publishing blog post:', error);
    return NextResponse.json(
      { error: 'Failed to publish blog post' },
      { status: 500 }
    );
  }
}
