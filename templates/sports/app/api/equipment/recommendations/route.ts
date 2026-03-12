import { SportsService } from '@vayva/industry-specialized';

const service = new SportsService();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const skillLevel = searchParams.get('skill');
    const sport = searchParams.get('sport');
    
    if (!skillLevel || !sport) {
      return Response.json(
        { error: 'Skill level and sport parameters required' },
        { status: 400 }
      );
    }
    
    const recommendations = await service.recommendEquipment(skillLevel, sport);
    return Response.json({ equipment: recommendations });
  } catch (error) {
    console.error('Error fetching equipment recommendations:', error);
    return Response.json(
      { error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}