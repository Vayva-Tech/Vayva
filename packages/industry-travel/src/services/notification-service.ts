// @ts-nocheck
import type { NotificationPayload } from '../types';

export interface EmailService {
  send(to: string, subject: string, html: string, text?: string): Promise<void>;
}

export interface SMSService {
  send(to: string, message: string): Promise<void>;
}

export interface NotificationTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * NotificationService - Handles all communication for travel bookings
 */
export class NotificationService {
  private emailService: EmailService;
  private smsService: SMSService;

  constructor(emailService: EmailService, smsService: SMSService) {
    this.emailService = emailService;
    this.smsService = smsService;
  }

  /**
   * Send booking confirmation email/SMS
   */
  async sendBookingConfirmation(booking: any): Promise<void> {
    const template = this.getBookingConfirmationTemplate(booking);
    
    // Send email
    await this.emailService.send(
      booking.customerEmail,
      template.subject,
      template.html,
      template.text
    );

    // Send SMS
    await this.smsService.send(
      booking.customerPhone,
      this.getBookingConfirmationSMS(booking)
    );
  }

  /**
   * Send booking confirmed notification (after payment)
   */
  async sendBookingConfirmed(booking: any): Promise<void> {
    const template = this.getBookingConfirmedTemplate(booking);
    
    await this.emailService.send(
      booking.customerEmail,
      template.subject,
      template.html,
      template.text
    );

    await this.smsService.send(
      booking.customerPhone,
      this.getBookingConfirmedSMS(booking)
    );
  }

  /**
   * Send cancellation notice
   */
  async sendCancellationNotice(booking: any, reason: string): Promise<void> {
    const template = this.getCancellationTemplate(booking, reason);
    
    await this.emailService.send(
      booking.customerEmail,
      template.subject,
      template.html,
      template.text
    );

    await this.smsService.send(
      booking.customerPhone,
      this.getCancellationSMS(booking, reason)
    );
  }

  /**
   * Send pre-arrival reminder
   */
  async sendPreArrivalReminder(booking: any): Promise<void> {
    const template = this.getPreArrivalTemplate(booking);
    
    await this.emailService.send(
      booking.customerEmail,
      template.subject,
      template.html,
      template.text
    );

    await this.smsService.send(
      booking.customerPhone,
      this.getPreArrivalSMS(booking)
    );
  }

  /**
   * Send post-stay review request
   */
  async sendPostStayReviewRequest(booking: any): Promise<void> {
    const template = this.getReviewRequestTemplate(booking);
    
    await this.emailService.send(
      booking.customerEmail,
      template.subject,
      template.html,
      template.text
    );

    await this.smsService.send(
      booking.customerPhone,
      this.getReviewRequestSMS(booking)
    );
  }

  /**
   * Generic notification sender
   */
  async sendNotification(payload: NotificationPayload): Promise<void> {
    switch (payload.type) {
      case 'booking_confirmation':
        // Handle booking confirmation
        break;
      case 'booking_confirmed':
        // Handle booking confirmed
        break;
      case 'cancellation':
        // Handle cancellation
        break;
      case 'reminder':
        // Handle reminder
        break;
      case 'review_request':
        // Handle review request
        break;
      default:
        console.warn(`Unknown notification type: ${payload.type}`);
    }
  }

  /**
   * Get booking confirmation email template
   */
  private getBookingConfirmationTemplate(booking: any): NotificationTemplate {
    const checkInDate = new Date(booking.checkInDate).toLocaleDateString();
    const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString();
    const nights = Math.ceil(
      (new Date(booking.checkOutDate).getTime() - new Date(booking.checkInDate).getTime()) 
      / (1000 * 60 * 60 * 24)
    );

    const subject = `Booking Confirmation - ${booking.property?.name}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #0070f3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmation</h1>
            <p>Your reservation is pending payment</p>
          </div>
          
          <div class="content">
            <h2>Hello ${booking.customerName},</h2>
            <p>Thank you for choosing ${booking.property?.name}. Your booking details are below:</p>
            
            <div class="details">
              <h3>Booking Details</h3>
              <p><strong>Booking ID:</strong> ${booking.id}</p>
              <p><strong>Property:</strong> ${booking.property?.name}</p>
              <p><strong>Check-in:</strong> ${checkInDate}</p>
              <p><strong>Check-out:</strong> ${checkOutDate}</p>
              <p><strong>Duration:</strong> ${nights} night${nights > 1 ? 's' : ''}</p>
              <p><strong>Guests:</strong> ${booking.guests}</p>
              <p><strong>Total Amount:</strong> ₦${booking.totalPrice.toLocaleString()}</p>
              <p><strong>Amount Paid:</strong> ₦${booking.amountPaid.toLocaleString()}</p>
              <p><strong>Amount Due:</strong> ₦${(booking.totalPrice - booking.amountPaid).toLocaleString()}</p>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ol>
              <li>Complete your payment using the link provided</li>
              <li>You'll receive a confirmation email once payment is processed</li>
              <li>Bring a valid ID for check-in</li>
            </ol>
            
            <p>If you have any questions, please contact us at ${booking.property?.email || 'support@travelcompany.com'}.</p>
          </div>
          
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${booking.property?.name}. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Booking Confirmation - ${booking.property?.name}

Hello ${booking.customerName},

Thank you for choosing ${booking.property?.name}. Your booking is pending payment.

Booking Details:
- Booking ID: ${booking.id}
- Property: ${booking.property?.name}
- Check-in: ${checkInDate}
- Check-out: ${checkOutDate}
- Duration: ${nights} night${nights > 1 ? 's' : ''}
- Guests: ${booking.guests}
- Total Amount: ₦${booking.totalPrice.toLocaleString()}
- Amount Paid: ₦${booking.amountPaid.toLocaleString()}
- Amount Due: ₦${(booking.totalPrice - booking.amountPaid).toLocaleString()}

Next Steps:
1. Complete your payment using the link provided
2. You'll receive a confirmation email once payment is processed
3. Bring a valid ID for check-in

If you have any questions, please contact us at ${booking.property?.email || 'support@travelcompany.com'}.

© ${new Date().getFullYear()} ${booking.property?.name}. All rights reserved.
    `;

    return { subject, html, text };
  }

  /**
   * Get booking confirmation SMS
   */
  private getBookingConfirmationSMS(booking: any): string {
    const amountDue = booking.totalPrice - booking.amountPaid;
    return `Booking confirmation for ${booking.property?.name}. Pay ₦${amountDue.toLocaleString()} to confirm. Booking ID: ${booking.id}. Questions? Call ${booking.property?.phoneNumber || 'support'}.`;
  }

  /**
   * Get booking confirmed template
   */
  private getBookingConfirmedTemplate(booking: any): NotificationTemplate {
    const checkInDate = new Date(booking.checkInDate).toLocaleDateString();
    const checkOutDate = new Date(booking.checkOutDate).toLocaleDateString();

    const subject = `Booking Confirmed - ${booking.property?.name}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #28a745; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .confirmation-box { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
            <p>Your reservation is confirmed</p>
          </div>
          
          <div class="content">
            <h2>Hello ${booking.customerName},</h2>
            <p>Great news! Your booking at ${booking.property?.name} has been confirmed.</p>
            
            <div class="confirmation-box">
              <h3>✓ Booking Confirmed</h3>
              <p><strong>Confirmation Code:</strong> ${booking.confirmationCode}</p>
            </div>
            
            <div class="details">
              <h3>Booking Details</h3>
              <p><strong>Booking ID:</strong> ${booking.id}</p>
              <p><strong>Property:</strong> ${booking.property?.name}</p>
              <p><strong>Check-in:</strong> ${checkInDate} (${booking.property?.checkInTime})</p>
              <p><strong>Check-out:</strong> ${checkOutDate} (${booking.property?.checkOutTime})</p>
              <p><strong>Total Paid:</strong> ₦${booking.amountPaid.toLocaleString()}</p>
            </div>
            
            <h3>Important Information:</h3>
            <ul>
              <li>Check-in time: ${booking.property?.checkInTime}</li>
              <li>Check-out time: ${booking.property?.checkOutTime}</li>
              <li>Please bring a valid government-issued ID</li>
              <li>Contact property at ${booking.property?.phoneNumber} if needed</li>
            </ul>
            
            <p>We look forward to welcoming you!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Booking Confirmed - ${booking.property?.name}

Hello ${booking.customerName},

Great news! Your booking at ${booking.property?.name} has been confirmed.

✓ Booking Confirmed
Confirmation Code: ${booking.confirmationCode}

Booking Details:
- Booking ID: ${booking.id}
- Property: ${booking.property?.name}
- Check-in: ${checkInDate} (${booking.property?.checkInTime})
- Check-out: ${checkOutDate} (${booking.property?.checkOutTime})
- Total Paid: ₦${booking.amountPaid.toLocaleString()}

Important Information:
- Check-in time: ${booking.property?.checkInTime}
- Check-out time: ${booking.property?.checkOutTime}
- Please bring a valid government-issued ID
- Contact property at ${booking.property?.phoneNumber} if needed

We look forward to welcoming you!
    `;

    return { subject, html, text };
  }

  /**
   * Get booking confirmed SMS
   */
  private getBookingConfirmedSMS(booking: any): string {
    return `✓ Booking confirmed! Code: ${booking.confirmationCode}. Check-in: ${new Date(booking.checkInDate).toLocaleDateString()} ${booking.property?.checkInTime}. Questions? Call ${booking.property?.phoneNumber}.`;
  }

  /**
   * Get cancellation template
   */
  private getCancellationTemplate(booking: any, reason: string): NotificationTemplate {
    const subject = `Booking Cancellation - ${booking.property?.name}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .details { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .refund-info { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          
          <div class="content">
            <h2>Hello ${booking.customerName},</h2>
            <p>We regret to inform you that your booking has been cancelled.</p>
            
            <div class="details">
              <h3>Cancellation Details</h3>
              <p><strong>Reason:</strong> ${reason}</p>
              <p><strong>Booking ID:</strong> ${booking.id}</p>
              <p><strong>Property:</strong> ${booking.property?.name}</p>
              <p><strong>Original Dates:</strong> ${new Date(booking.checkInDate).toLocaleDateString()} - ${new Date(booking.checkOutDate).toLocaleDateString()}</p>
            </div>
            
            <div class="refund-info">
              <h3>Refund Information</h3>
              <p>A refund of ₦${booking.amountPaid.toLocaleString()} will be processed to your original payment method within 5-7 business days.</p>
            </div>
            
            <p>If you believe this cancellation was made in error, or if you have any questions, please contact us immediately.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Booking Cancellation - ${booking.property?.name}

Hello ${booking.customerName},

We regret to inform you that your booking has been cancelled.

Cancellation Details:
- Reason: ${reason}
- Booking ID: ${booking.id}
- Property: ${booking.property?.name}
- Original Dates: ${new Date(booking.checkInDate).toLocaleDateString()} - ${new Date(booking.checkOutDate).toLocaleDateString()}

Refund Information:
A refund of ₦${booking.amountPaid.toLocaleString()} will be processed to your original payment method within 5-7 business days.

If you believe this cancellation was made in error, or if you have any questions, please contact us immediately.
    `;

    return { subject, html, text };
  }

  /**
   * Get cancellation SMS
   */
  private getCancellationSMS(booking: any, reason: string): string {
    return `Booking cancelled. Reason: ${reason}. Refund of ₦${booking.amountPaid.toLocaleString()} processing. Contact ${booking.property?.phoneNumber} with questions.`;
  }

  /**
   * Get pre-arrival template
   */
  private getPreArrivalTemplate(booking: any): NotificationTemplate {
    const subject = `Your Stay at ${booking.property?.name} is Coming Up!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #17a2b8; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .checklist { background: white; padding: 20px; margin: 20px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>See You Soon!</h1>
            <p>Your stay is just around the corner</p>
          </div>
          
          <div class="content">
            <h2>Hello ${booking.customerName},</h2>
            <p>We're excited to welcome you to ${booking.property?.name}! Your check-in is coming up soon.</p>
            
            <div class="checklist">
              <h3>Pre-Arrival Checklist</h3>
              <ul>
                <li><strong>Check-in:</strong> ${new Date(booking.checkInDate).toLocaleDateString()} at ${booking.property?.checkInTime}</li>
                <li><strong>Check-out:</strong> ${new Date(booking.checkOutDate).toLocaleDateString()} at ${booking.property?.checkOutTime}</li>
                <li><strong>Bring:</strong> Valid government-issued ID</li>
                <li><strong>Contact:</strong> ${booking.property?.phoneNumber} (24/7 front desk)</li>
                <li><strong>Directions:</strong> ${booking.property?.address}</li>
              </ul>
            </div>
            
            <h3>Need Anything?</h3>
            <p>If you have special requests or need assistance, please don't hesitate to reach out to us.</p>
            
            <p>We can't wait to make your stay memorable!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Your Stay at ${booking.property?.name} is Coming Up!

Hello ${booking.customerName},

We're excited to welcome you to ${booking.property?.name}! Your check-in is coming up soon.

Pre-Arrival Checklist:
- Check-in: ${new Date(booking.checkInDate).toLocaleDateString()} at ${booking.property?.checkInTime}
- Check-out: ${new Date(booking.checkOutDate).toLocaleDateString()} at ${booking.property?.checkOutTime}
- Bring: Valid government-issued ID
- Contact: ${booking.property?.phoneNumber} (24/7 front desk)
- Directions: ${booking.property?.address}

Need anything? Contact us anytime!

We can't wait to make your stay memorable!
    `;

    return { subject, html, text };
  }

  /**
   * Get pre-arrival SMS
   */
  private getPreArrivalSMS(booking: any): string {
    const daysUntil = Math.ceil(
      (new Date(booking.checkInDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return `See you in ${daysUntil} day${daysUntil > 1 ? 's' : ''}! Check-in ${new Date(booking.checkInDate).toLocaleDateString()} ${booking.property?.checkInTime}. Bring ID. Questions? Call ${booking.property?.phoneNumber}.`;
  }

  /**
   * Get review request template
   */
  private getReviewRequestTemplate(booking: any): NotificationTemplate {
    const subject = `How Was Your Stay at ${booking.property?.name}?`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ffc107; color: #333; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .review-link { background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>We'd Love Your Feedback!</h1>
            <p>How was your stay with us?</p>
          </div>
          
          <div class="content">
            <h2>Hello ${booking.customerName},</h2>
            <p>We hope you enjoyed your stay at ${booking.property?.name}! Your feedback helps us improve and helps other travelers make informed decisions.</p>
            
            <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/review?bookingId=${booking.id}" class="review-link">Leave a Review</a></p>
            
            <p>Taking just 2 minutes to share your experience makes a big difference to us and future guests.</p>
            
            <p>Thank you for choosing ${booking.property?.name}!</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
How Was Your Stay at ${booking.property?.name}?

Hello ${booking.customerName},

We hope you enjoyed your stay at ${booking.property?.name}! Your feedback helps us improve and helps other travelers make informed decisions.

Leave a review: ${process.env.NEXT_PUBLIC_APP_URL}/review?bookingId=${booking.id}

Taking just 2 minutes to share your experience makes a big difference to us and future guests.

Thank you for choosing ${booking.property?.name}!
    `;

    return { subject, html, text };
  }

  /**
   * Get review request SMS
   */
  private getReviewRequestSMS(booking: any): string {
    return `Thanks for staying with us! Share your experience: ${process.env.NEXT_PUBLIC_APP_URL}/review?bookingId=${booking.id} - Takes just 2 mins!`;
  }
}