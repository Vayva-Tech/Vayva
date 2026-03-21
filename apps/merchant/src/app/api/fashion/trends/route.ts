import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/fashion/trends
 * Returns trend forecasting data for fashion dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || 'all';

    // Mock trend data - TODO: Integrate with actual trend analysis service
    const trends = [
      {
        name: 'Pastel Colors',
        growth: 0.45,
        category: 'Color Trends',
        confidence: 0.87,
      },
      {
        name: 'Wide Leg Pants',
        growth: 0.38,
        category: 'Silhouettes',
        confidence: 0.82,
      },
      {
        name: 'Oversized Blazers',
        growth: 0.32,
        category: 'Outerwear',
        confidence: 0.79,
      },
      {
        name: 'Sustainable Fabrics',
        growth: 0.28,
        category: 'Materials',
        confidence: 0.91,
      },
    ];

    // Filter by category if specified
    const filteredTrends =
      category === 'all'
        ? trends
        : trends.filter((t) => t.category.toLowerCase() === category.toLowerCase());

    // Generate forecast data (6 months)
    const forecastData = Array.from({ length: 6 }, () =>
      Math.floor(Math.random() * 40) + 60
    );

    return NextResponse.json({
      trends: filteredTrends,
      forecastData,
    });
  } catch (error) {
    console.error('Error fetching trends:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trend data' },
      { status: 500 }
    );
  }
}
