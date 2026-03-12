import { BeautyServiceManager } from '@vayva/industry-specialized';

const service = new BeautyServiceManager();

export async function POST(request: NextRequest) {
  try {
    const { serviceId, clientData } = await request.json();
    
    if (!serviceId) {
      return Response.json(
        { error: 'Service ID required' },
        { status: 400 }
      );
    }
    
    await service.bookAppointment(serviceId, clientData);
    return Response.json({ message: 'Appointment booked successfully' });
  } catch (error) {
    console.error('Error booking appointment:', error);
    return Response.json(
      { error: 'Failed to book appointment' },
      { status: 500 }
    );
  }
}