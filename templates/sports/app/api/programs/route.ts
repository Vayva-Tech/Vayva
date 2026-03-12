import { NextRequest } from 'next/server';
import { TrainingProgram } from '@vayva/industry-specialized';

// Mock training programs data
const trainingPrograms: TrainingProgram[] = [
  {
    id: 'tp1',
    name: 'Beginner Fitness Program',
    sport: 'fitness',
    duration: 8,
    difficulty: 'beginner',
    sessions: [],
    price: 199.99
  },
  {
    id: 'tp2',
    name: 'Advanced Basketball Training',
    sport: 'basketball',
    duration: 12,
    difficulty: 'advanced',
    sessions: [],
    price: 299.99
  }
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get('sport');
    const difficulty = searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced' | undefined;
    
    let programs = trainingPrograms;
    
    if (sport) {
      programs = programs.filter(p => p.sport.toLowerCase().includes(sport.toLowerCase()));
    }
    
    if (difficulty) {
      programs = programs.filter(p => p.difficulty === difficulty);
    }
    
    return Response.json({ programs });
  } catch (error) {
    console.error('Error fetching training programs:', error);
    return Response.json(
      { error: 'Failed to fetch training programs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const program: TrainingProgram = {
      id: Math.random().toString(36).substr(2, 9),
      ...data
    };
    return Response.json({ program });
  } catch (error) {
    console.error('Error creating training program:', error);
    return Response.json(
      { error: 'Failed to create training program' },
      { status: 500 }
    );
  }
}