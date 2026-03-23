// @ts-nocheck
import type { 
  BookingData, 
  PaymentMethod, 
  NotificationPayload 
} from '../types';
import { TravelBookingService } from './travel-booking-service';
import { AvailabilityService } from './availability-service';

export interface BookingResult {
  bookingId: string;
  status: 'pending' | 'confirmed' | 'failed';
  paymentIntent?: PaymentIntent;
  errorMessage?: string;
}

export interface PaymentIntent {
  id: string;
  authorizationUrl: string;
  reference: string;
  amount: number;
  status: 'initialized' | 'pending' | 'success' | 'failed';
}

export interface PaymentResult {
  status: 'success' | 'failed' | 'pending';
  transactionId?: string;
  errorMessage?: string;
}

export interface BookingChanges {
  checkInDate?: Date;
  checkOutDate?: Date;
  guests?: number;
  specialRequests?: string;
}

/**
 * AdvancedBookingService - Handles complete booking lifecycle with payment integration
 */
export class AdvancedBookingService {
  private bookingService: TravelBookingService;
  private availabilityService: AvailabilityService;
  private paymentService: any; // Will integrate with Paystack
  private notificationService: any;

  constructor(
    db: any,
    paymentService: any,
    notificationService: any
  ) {
    this.bookingService = new TravelBookingService(db);
    this.availabilityService = new AvailabilityService(db);
    this.paymentService = paymentService;
    this.notificationService = notificationService;
  }

  /**
   * Create a booking with payment processing
   */
  async createBookingWithPayment(data: BookingData): Promise<BookingResult> {
    try {
      // 1. Validate availability
      const availabilityCheck = await this.availabilityService.checkAvailability(
        data.roomId,
        { startDate: data.checkInDate, endDate: data.checkOutDate }
      );

      if (!availabilityCheck.isAvailable) {
        return {
          bookingId: '',
          status: 'failed',
          errorMessage: availabilityCheck.reason || 'Room not available for selected dates'
        };
      }

      // 2. Create pending booking
      const booking = await this.bookingService.createBooking({
        tenantId: 'travel-tenant',
        packageId: data.propertyId,
        customerId: data.guestId,
        customerName: 'Guest',
        customerEmail: 'guest@example.com',
        customerPhone: '0000000000',
        status: 'pending',
        travelDate: data.checkInDate,
        returnDate: data.checkOutDate,
        adults: data.guests,
        children: 0,
        infants: 0,
        totalPrice: availabilityCheck.price || data.totalPrice,
        specialRequests: data.specialRequests,
        passports: []
      });

      // 3. Initialize payment
      const paymentIntent = await this.initializePayment(
        availabilityCheck.price || data.totalPrice,
        booking.id,
        {
          propertyId: data.propertyId,
          roomId: data.roomId,
          checkInDate: data.checkInDate,
          checkOutDate: data.checkOutDate,
          guests: data.guests
        }
      );

      // 4. Update booking with payment reference
      await this.bookingService.updateBookingStatus(booking.id, 'pending');

      // 5. Send confirmation (pending payment)
      await this.sendBookingConfirmation(booking);

      return {
        bookingId: booking.id,
        status: 'pending',
        paymentIntent
      };

    } catch (error) {
      console.error('Booking creation failed:', error);
      return {
        bookingId: '',
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Initialize payment with Paystack
   */
  private async initializePayment(
    amount: number,
    bookingId: string,
    metadata: Record<string, unknown>
  ): Promise<PaymentIntent> {
    try {
      // Convert to kobo (Paystack uses kobo for NGN transactions)
      const amountKobo = Math.round(amount * 100);
      
      const result = await this.paymentService.initializeTransaction({
        email: metadata.guestEmail as string || 'guest@example.com',
        amountKobo,
        reference: `booking_${bookingId}_${Date.now()}`,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/${bookingId}/verify`,
        metadata: {
          bookingId,
          ...metadata
        }
      });

      return {
        id: result.reference,
        authorizationUrl: result.authorizationUrl,
        reference: result.reference,
        amount,
        status: 'initialized'
      };

    } catch (error) {
      console.error('Payment initialization failed:', error);
      throw new Error('Failed to initialize payment');
    }
  }

  /**
   * Process payment verification
   */
  async processPayment(bookingId: string, reference: string): Promise<PaymentResult> {
    try {
      // Verify payment with Paystack
      const verification = await this.paymentService.verifyTransaction(reference);
      
      if (verification.status === 'success') {
        // Update booking status
        await this.bookingService.updateBookingStatus(bookingId, 'confirmed');
        
        // Record payment
        await this.bookingService.recordPayment(bookingId, verification.amountKobo ? verification.amountKobo / 100 : 0);
        
        // Send confirmation - get booking by ID
        const booking = await this.bookingService.getBookingById(bookingId);
        if (booking) {
          await this.sendBookingConfirmed(booking);
        }

        return {
          status: 'success',
          transactionId: reference
        };
      } else {
        // Mark booking as failed
        await this.bookingService.updateBookingStatus(bookingId, 'cancelled');
        
        return {
          status: 'failed',
          errorMessage: 'Payment verification failed'
        };
      }

    } catch (error) {
      console.error('Payment processing failed:', error);
      return {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Payment processing error'
      };
    }
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, reason: string): Promise<void> {
    try {
      const booking = await this.bookingService.getBookings({ customerId: 'temp-id' }); // This needs proper implementation
      if (booking.length === 0) {
        throw new Error('Booking not found');
      }

      const currentBooking = booking[0];
      
      // Update status
      await this.bookingService.updateBookingStatus(bookingId, 'cancelled');
      
      // Send cancellation notice
      await this.sendCancellationNotice(currentBooking, reason);
      
      // Process refund if needed (simplified logic)
      if (currentBooking.amountPaid > 0 && this.shouldRefund(currentBooking)) {
        await this.processRefund(bookingId, currentBooking.amountPaid);
      }

    } catch (error) {
      console.error('Booking cancellation failed:', error);
      throw error;
    }
  }

  /**
   * Modify an existing booking
   */
  async modifyBooking(bookingId: string, changes: BookingChanges): Promise<any> {
    // Implementation for modifying bookings
    // This would handle date changes, guest count adjustments, etc.
    throw new Error('Not implemented');
  }

  /**
   * Send booking confirmation (pending payment)
   */
  async sendBookingConfirmation(booking: any): Promise<void> {
    const payload: NotificationPayload = {
      type: 'booking_confirmation',
      recipient: booking.customerEmail,
      data: {
        bookingId: booking.id,
        property: booking.property?.name,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalPrice: booking.totalPrice,
        paymentDue: booking.totalPrice - booking.amountPaid
      }
    };

    await this.notificationService.sendEmail(payload);
    await this.notificationService.sendSMS(payload);
  }

  /**
   * Send booking confirmed notification
   */
  async sendBookingConfirmed(booking: any): Promise<void> {
    const payload: NotificationPayload = {
      type: 'booking_confirmed',
      recipient: booking.customerEmail,
      data: {
        bookingId: booking.id,
        confirmationCode: booking.confirmationCode,
        property: booking.property?.name,
        checkInDate: booking.checkInDate,
        checkOutDate: booking.checkOutDate,
        totalPrice: booking.totalPrice
      }
    };

    await this.notificationService.sendEmail(payload);
    await this.notificationService.sendSMS(payload);
  }

  /**
   * Send cancellation notice
   */
  async sendCancellationNotice(booking: any, reason: string): Promise<void> {
    const payload: NotificationPayload = {
      type: 'cancellation',
      recipient: booking.customerEmail,
      data: {
        bookingId: booking.id,
        property: booking.property?.name,
        reason,
        refundAmount: this.calculateRefundAmount(booking)
      }
    };

    await this.notificationService.sendEmail(payload);
    await this.notificationService.sendSMS(payload);
  }

  /**
   * Send pre-arrival reminder
   */
  async sendPreArrivalReminder(booking: any): Promise<void> {
    const payload: NotificationPayload = {
      type: 'reminder',
      recipient: booking.customerEmail,
      data: {
        bookingId: booking.id,
        property: booking.property?.name,
        checkInDate: booking.checkInDate,
        checkInTime: booking.property?.checkInTime,
        checkOutTime: booking.property?.checkOutTime
      }
    };

    await this.notificationService.sendEmail(payload);
    await this.notificationService.sendSMS(payload);
  }

  /**
   * Determine if refund should be processed
   */
  private shouldRefund(booking: any): boolean {
    // Simplified refund logic - in reality this would be more complex
    // considering cancellation policies, timeframes, etc.
    const checkInDate = new Date(booking.checkInDate);
    const daysUntilCheckIn = Math.ceil(
      (checkInDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    
    return daysUntilCheckIn > 2; // Refund if more than 2 days before check-in
  }

  /**
   * Calculate refund amount
   */
  private calculateRefundAmount(booking: any): number {
    // Simplified calculation - real implementation would consider:
    // - Cancellation policy
    // - Time of cancellation
    // - Partial stays
    // - Service fees
    if (this.shouldRefund(booking)) {
      return booking.amountPaid * 0.9; // 90% refund
    }
    return 0;
  }

  /**
   * Process refund through Paystack
   */
  private async processRefund(bookingId: string, amount: number): Promise<void> {
    try {
      // In a real implementation, this would call Paystack's refund API
      console.log(`Processing refund for booking ${bookingId}: ₦${amount}`);
      
      // await this.paymentService.createRefund({
      //   transaction: booking.paymentReference,
      //   amount: Math.round(amount * 100) // Convert to kobo
      // });
      
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw error;
    }
  }
}