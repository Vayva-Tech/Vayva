import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tourId = searchParams.get('tourId');
    const incidentType = searchParams.get('incidentType');

    // Mock safety data
    const safetyMetrics = {
      incidentRate: 0.0, // incidents per 1000 participant days
      safetyScore: 98.5, // percentage
      emergencyResponseTime: 12, // minutes
      certifiedGuides: 15,
      safetyEquipmentStatus: 'optimal',
      lastAudit: '2024-05-15',
      nextAudit: '2024-11-15'
    };

    // Mock incident reports
    const incidents = [
      {
        id: 'inc_1',
        tourId: 'tour_2',
        tourName: 'Patagonia Trekking Adventure',
        date: '2024-03-15',
        type: 'minor_injury',
        severity: 'low',
        description: 'Participant twisted ankle during hike',
        resolution: 'Provided first aid, participant continued with modified activities',
        reportedBy: 'Lead Guide Maria Rodriguez',
        status: 'resolved'
      },
      {
        id: 'inc_2',
        tourId: 'tour_3',
        tourName: 'Alaska Wilderness Canoe Journey',
        date: '2024-02-28',
        type: 'weather_related',
        severity: 'medium',
        description: 'Unexpected weather delay causing schedule adjustment',
        resolution: 'Alternative route planned, all participants safe',
        reportedBy: 'Chief Guide James Thompson',
        status: 'resolved'
      }
    ];

    // Mock safety protocols
    const protocols = [
      {
        id: 'prot_1',
        title: 'Emergency Response Protocol',
        category: 'emergency',
        lastReviewed: '2024-04-20',
        nextReview: '2024-10-20',
        compliance: 100,
        status: 'active'
      },
      {
        id: 'prot_2',
        title: 'Weather Monitoring System',
        category: 'environmental',
        lastReviewed: '2024-05-10',
        nextReview: '2024-11-10',
        compliance: 95,
        status: 'active'
      },
      {
        id: 'prot_3',
        title: 'First Aid and Medical Response',
        category: 'medical',
        lastReviewed: '2024-03-15',
        nextReview: '2024-09-15',
        compliance: 100,
        status: 'active'
      },
      {
        id: 'prot_4',
        title: 'Wildlife Encounter Protocol',
        category: 'environmental',
        lastReviewed: '2024-02-28',
        nextReview: '2024-08-28',
        compliance: 85,
        status: 'needs_update'
      }
    ];

    // Apply filters
    let filteredIncidents = incidents;
    let filteredProtocols = protocols;
    
    if (tourId) {
      filteredIncidents = filteredIncidents.filter(i => i.tourId === tourId);
    }
    
    if (incidentType) {
      filteredIncidents = filteredIncidents.filter(i => i.type === incidentType);
    }

    return NextResponse.json({
      success: true,
      safetyMetrics,
      incidents: filteredIncidents,
      protocols: filteredProtocols,
      summary: {
        totalIncidents: incidents.length,
        resolvedIncidents: incidents.filter(i => i.status === 'resolved').length,
        activeProtocols: protocols.filter(p => p.status === 'active').length,
        protocolsNeedingUpdate: protocols.filter(p => p.status === 'needs_update').length
      }
    });

  } catch (error) {
    console.error('Error fetching safety data:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch safety data',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, action } = body;

    if (type === 'incident') {
      // Handle incident reporting
      const newIncident = {
        id: `inc_${Date.now()}`,
        tourId: body.tourId,
        tourName: body.tourName,
        date: new Date().toISOString().split('T')[0],
        type: body.incidentType,
        severity: body.severity,
        description: body.description,
        resolution: body.resolution || 'Pending investigation',
        reportedBy: body.reportedBy,
        status: 'reported',
        createdAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        incident: newIncident,
        message: 'Incident reported successfully'
      });
    }

    if (type === 'protocol') {
      // Handle protocol updates
      const updatedProtocol = {
        id: body.protocolId,
        lastReviewed: new Date().toISOString().split('T')[0],
        nextReview: body.nextReview,
        compliance: body.compliance,
        status: body.compliance >= 90 ? 'active' : 'needs_update',
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json({
        success: true,
        protocol: updatedProtocol,
        message: 'Protocol updated successfully'
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid type specified' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error handling safety action:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process safety action',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}