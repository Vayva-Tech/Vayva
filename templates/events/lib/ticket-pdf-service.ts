// Ticket PDF generation service
// This simulates PDF generation for event tickets

interface TicketData {
  ticketNumber: string;
  eventName: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  attendeeName: string;
  ticketType: string;
  qrCode: string;
  orderId: string;
}

class TicketPDFService {
  private static instance: TicketPDFService;
  
  private constructor() {}

  static getInstance(): TicketPDFService {
    if (!TicketPDFService.instance) {
      TicketPDFService.instance = new TicketPDFService();
    }
    return TicketPDFService.instance;
  }

  // Generate ticket PDF (simulated)
  async generateTicketPDF(ticketData: TicketData): Promise<Blob> {
    // In a real implementation, this would use a PDF library like pdf-lib or jsPDF
    // For demo purposes, we'll simulate PDF generation
    
    return new Promise((resolve) => {
      // Simulate PDF generation delay
      setTimeout(() => {
        // Create a mock PDF blob
        const pdfContent = this.createPDFTemplate(ticketData);
        const blob = new Blob([pdfContent], { type: 'application/pdf' });
        resolve(blob);
      }, 1000);
    });
  }

  // Create PDF template content
  private createPDFTemplate(ticketData: TicketData): string {
    // This would be actual PDF content in a real implementation
    return `Event Ticket
============
Event: ${ticketData.eventName}
Date: ${ticketData.eventDate}
Time: ${ticketData.eventTime}
Venue: ${ticketData.venue}
Attendee: ${ticketData.attendeeName}
Ticket Type: ${ticketData.ticketType}
Ticket #: ${ticketData.ticketNumber}
Order ID: ${ticketData.orderId}
QR Code: ${ticketData.qrCode.substring(0, 10)}...

This is a simulated ticket. In production, this would be a proper PDF with:
- Professional layout and branding
- Barcode/QR code rendering
- Event details and venue information
- Terms and conditions
- Security features
`;
  }

  // Download ticket PDF
  async downloadTicket(ticketData: TicketData): Promise<void> {
    try {
      const pdfBlob = await this.generateTicketPDF(ticketData);
      const url = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `ticket-${ticketData.ticketNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate ticket PDF:', error);
      throw new Error('Failed to generate ticket');
    }
  }

  // Generate multiple tickets
  async generateMultipleTickets(tickets: TicketData[]): Promise<Blob[]> {
    const pdfPromises = tickets.map(ticket => this.generateTicketPDF(ticket));
    return Promise.all(pdfPromises);
  }

  // Create ticket preview HTML (for displaying in browser)
  createTicketPreview(ticketData: TicketData): string {
    const eventDate = new Date(ticketData.eventDate);
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
      <div style="
        width: 350px;
        height: 500px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 20px;
        padding: 30px;
        font-family: Arial, sans-serif;
        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        position: relative;
        overflow: hidden;
      ">
        <!-- Decorative elements -->
        <div style="position: absolute; top: -50px; right: -50px; width: 150px; height: 150px; border-radius: 50%; background: rgba(255,255,255,0.1);"></div>
        <div style="position: absolute; bottom: -30px; left: -30px; width: 100px; height: 100px; border-radius: 50%; background: rgba(255,255,255,0.05);"></div>
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold;">EVENT TICKET</h1>
          <div style="width: 50px; height: 3px; background: white; margin: 10px auto; border-radius: 2px;"></div>
        </div>
        
        <!-- Event Info -->
        <div style="background: rgba(255,255,255,0.15); border-radius: 15px; padding: 20px; margin-bottom: 20px;">
          <h2 style="margin: 0 0 10px 0; font-size: 18px; font-weight: bold;">${ticketData.eventName}</h2>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="margin-right: 10px;">📅</span>
            <span>${formattedDate}</span>
          </div>
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <span style="margin-right: 10px;">⏰</span>
            <span>${formattedTime}</span>
          </div>
          <div style="display: flex; align-items: center;">
            <span style="margin-right: 10px;">📍</span>
            <span>${ticketData.venue}</span>
          </div>
        </div>
        
        <!-- Ticket Details -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 25px;">
          <div>
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">ATTENDEE</div>
            <div style="font-weight: bold; font-size: 16px;">${ticketData.attendeeName}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 12px; opacity: 0.8; margin-bottom: 5px;">TICKET TYPE</div>
            <div style="font-weight: bold; font-size: 16px;">${ticketData.ticketType}</div>
          </div>
        </div>
        
        <!-- QR Code Area -->
        <div style="background: white; border-radius: 10px; padding: 15px; text-align: center; margin-bottom: 20px;">
          <div style="width: 120px; height: 120px; background: black; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; color: white; font-family: monospace; font-size: 12px;">
            QR:${ticketData.qrCode.substring(0, 8)}...
          </div>
          <div style="color: #333; font-size: 12px; font-weight: bold;">SCAN TO ENTER</div>
        </div>
        
        <!-- Footer Info -->
        <div style="display: flex; justify-content: space-between; font-size: 11px; opacity: 0.9;">
          <div>
            <div>Ticket #${ticketData.ticketNumber}</div>
            <div>Order ${ticketData.orderId}</div>
          </div>
          <div style="text-align: right;">
            <div>EVENTHUB</div>
            <div>Verified Entry</div>
          </div>
        </div>
      </div>
    `;
  }

  // Print ticket directly
  printTicket(ticketData: TicketData): void {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const ticketHTML = this.createTicketPreview(ticketData);
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Ticket - ${ticketData.ticketNumber}</title>
          <style>
            body { 
              display: flex; 
              justify-content: center; 
              align-items: center; 
              min-height: 100vh; 
              margin: 0; 
              background: #f5f5f5;
            }
          </style>
        </head>
        <body>
          ${ticketHTML}
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  }
}

export default TicketPDFService.getInstance();