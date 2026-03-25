import { NextRequest, NextResponse } from 'next/server';

// GET /api/blog/newsletter/subscribers - Get subscribers
export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  return NextResponse.json(
    {
      error:
        "Blog newsletter subscribers API is not enabled on this deployment.",
      path: pathname,
    },
    { status: 410 },
  );
}

// POST /api/blog/newsletter/subscribers - Add subscriber
export async function POST(request: NextRequest) {
  const { pathname } = new URL(request.url);
  return NextResponse.json(
    {
      error:
        "Blog newsletter subscribers API is not enabled on this deployment.",
      path: pathname,
    },
    { status: 410 },
  );
}
