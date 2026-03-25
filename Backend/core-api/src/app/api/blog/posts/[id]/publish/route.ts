import { NextRequest, NextResponse } from 'next/server';

// GET /api/blog/posts/:id/publish - Publish a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { pathname } = new URL(request.url);
  return NextResponse.json(
    {
      error: "Blog publish API is not enabled on this deployment.",
      postId: params.id,
      path: pathname,
    },
    { status: 410 },
  );
}
