import { NextResponse } from 'next/server';
import { 
  AdvancedBookingService, 
  TravelPaymentService,
  NotificationService 
} from '@vayva/industry-travel/services';
import { PrismaClient } from '../../../../platform/infra/db/src/generated/client';

// Initialize services
const prisma = new PrismaClient();
const bookingService = new AdvancedBookingService(prisma);
const paymentService = new TravelPaymentService({
  secretKey: process.env.PAYSTACK_SECRET_KEY || '',
  publicKey: process.env.PAYSTACK_PUBLIC_KEY || ''
});
const notificationService = new NotificationService();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const propertyId = searchParams.get('propertyId');
    const guestEmail = searchParams.get('guestEmail');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filters
    const filters: any = {};
    
    if (propertyId) filters.propertyId = propertyId;
    if (guestEmail) filters.guestEmail = guestEmail;
    if (status) filters.status = status;
    
    if (startDate || endDate) {
      filters.dateRange = {
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
      };
    }

    // Get bookings (this would call the booking service)
    const bookings = await getBookings(filters);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = bookings.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      bookings: paginatedBookings,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(bookings.length / limit),
        totalItems: bookings.length,
        hasNextPage: endIndex < bookings.length,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch bookings',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'propertyId', 'roomId', 'guestProfile', 
      'checkInDate', 'checkOutDate', 'adults'
    ];
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required field: ${field}` 
          },
          { status: 400 }
        );
      }
    }

    // Create booking with payment
    const result = await bookingService.createBookingWithPayment({
      propertyId: body.propertyId,
      roomId: body.roomId,
      guestProfile: {
        firstName: body.guestProfile.firstName,
        lastName: body.guestProfile.lastName,
        email: body.guestProfile.email,
        phone: body.guestProfile.phone,
        country: body.guestProfile.country,
        address: body.guestProfile.address
      },
      checkInDate: new Date(body.checkInDate),
      checkOutDate: new Date(body.checkOutDate),
      adults: body.adults,
      children: body.children || 0,
      infants: body.infants || 0,
      specialRequests: body.specialRequests,
      paymentMethod: body.paymentMethod,
      currency: body.currency || 'USD',
      source: body.source || 'website'
    });

    // Send confirmation notification
    if (result.success && result.booking) {
      await notificationService.sendBookingConfirmation(result.booking);
    }

    return NextResponse.json({
      success: true,
      booking: result.booking,
      paymentIntent: result.paymentIntent,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, action, ...updates } = body;

    if (!bookingId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID is required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'cancel':
        result = await bookingService.cancelBooking(bookingId, updates.reason);
        break;
      case 'modify':
        result = await bookingService.modifyBooking(bookingId, updates);
        break;
      case 'confirm':
        // This would typically be done by admin
        result = await confirmBooking(bookingId);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      message: `Booking ${action}ed successfully`
    });

  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Payment-related endpoints
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, paymentId, action } = body;

    if (!bookingId || !paymentId) {
      return NextResponse.json(
        { success: false, error: 'Booking ID and Payment ID are required' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'verify':
        result = await paymentService.verifyPayment(paymentId);
        break;
      case 'refund':
        result = await paymentService.refundPayment(bookingId, body.amount);
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid payment action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      result,
      message: `Payment ${action} successful`
    });

  } catch (error) {
    console.error('Error processing payment:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process payment',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Webhook handler for payment notifications
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature
    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 400 }
      );
    }

    // Process webhook payload
    await paymentService.handleWebhook({
      event: body.event,
      data: body.data,
      signature
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process webhook',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper functions
async function getBookings(filters: any) {
  // Mock implementation - in real scenario, this would query the database
  // using the booking service
  
  const mockBookings = [
    {
      id: 'booking_1',
      propertyId: 'property_1',
      propertyName: 'Grand Hotel',
      guestName: 'John Doe',
      guestEmail: 'john@example.com',
      checkInDate: new Date('2024-06-15'),
      checkOutDate: new Date('2024-06-18'),
      adults: 2,
      children: 1,
      status: 'confirmed',
      totalAmount: 450.00,
      currency: 'USD',
      createdAt: new Date('2024-05-20')
    },
    {
      id: 'booking_2',
      propertyId: 'property_2',
      propertyName: 'Seaside Resort',
      guestName: 'Jane Smith',
      guestEmail: 'jane@example.com',
      checkInDate: new Date('2024-07-01'),
      checkOutDate: new Date('2024-07-05'),
      adults: 2,
      children: 0,
      status: 'pending',
      totalAmount: 680.00,
      currency: 'USD',
      createdAt: new Date('2024-05-22')
    }
  ];

  // Apply filters
  let filtered = mockBookings;
  
  if (filters.propertyId) {
    filtered = filtered.filter(b => b.propertyId === filters.propertyId);
  }
  
  if (filters.guestEmail) {
    filtered = filtered.filter(b => b.guestEmail === filters.guestEmail);
  }
  
  if (filters.status) {
    filtered = filtered.filter(b => b.status === filters.status);
  }
  
  if (filters.dateRange) {
    filtered = filtered.filter(b => {
      const bookingDate = new Date(b.checkInDate);
      return (
        (!filters.dateRange.startDate || bookingDate >= filters.dateRange.startDate) &&
        (!filters.dateRange.endDate || bookingDate <= filters.dateRange.endDate)
      );
    });
  }

  return filtered;
}

async function confirmBooking(bookingId: string) {
  // Mock implementation
  console.log(`Confirming booking: ${bookingId}`);
  return { status: 'confirmed' };
}