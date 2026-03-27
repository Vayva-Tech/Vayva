import { formatCurrency } from "./utils";

interface ReceiptData {
  donationId: string;
  donorName: string;
  donorEmail: string;
  amount: number;
  currency: string;
  donationDate: string;
  paymentMethod: string;
  isAnonymous: boolean;
  campaignName?: string;
  taxReceiptNumber: string;
  nonprofitName: string;
  nonprofitAddress?: string;
  nonprofitEIN?: string;
}

export function generateReceiptHTML(receipt: ReceiptData): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Donation Receipt - ${receipt.taxReceiptNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #22c55e;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #22c55e;
      margin-bottom: 10px;
    }
    .receipt-title {
      font-size: 28px;
      font-weight: bold;
      color: #1f2937;
    }
    .receipt-number {
      color: #6b7280;
      font-size: 14px;
      margin-top: 5px;
    }
    .section {
      margin-bottom: 25px;
    }
    .section-title {
      font-size: 16px;
      font-weight: bold;
      color: #374151;
      margin-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      margin-bottom: 8px;
    }
    .label {
      font-weight: bold;
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
    }
    .value {
      font-size: 14px;
      color: #1f2937;
    }
    .amount-section {
      background-color: #f0fdf4;
      border: 2px solid #22c55e;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 25px 0;
    }
    .amount-label {
      font-size: 14px;
      color: #166534;
      margin-bottom: 5px;
    }
    .amount-value {
      font-size: 36px;
      font-weight: bold;
      color: #15803d;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
      text-align: center;
    }
    .thank-you {
      font-size: 18px;
      color: #22c55e;
      font-weight: bold;
      text-align: center;
      margin: 25px 0;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">${receipt.nonprofitName}</div>
    <div class="receipt-title">Donation Receipt</div>
    <div class="receipt-number">Receipt #${receipt.taxReceiptNumber}</div>
  </div>

  <div class="section">
    <div class="section-title">Donor Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">Donor Name</div>
        <div class="value">${receipt.isAnonymous ? "Anonymous" : receipt.donorName}</div>
      </div>
      <div class="info-item">
        <div class="label">Email Address</div>
        <div class="value">${receipt.donorEmail}</div>
      </div>
      ${receipt.nonprofitEIN ? `
      <div class="info-item">
        <div class="label">Tax ID (EIN)</div>
        <div class="value">${receipt.nonprofitEIN}</div>
      </div>
      ` : ''}
    </div>
  </div>

  <div class="amount-section">
    <div class="amount-label">Total Donation Amount</div>
    <div class="amount-value">${formatCurrency(receipt.amount)}</div>
    <div style="margin-top: 10px; font-size: 14px; color: #166534;">
      ${receipt.currency}
    </div>
  </div>

  <div class="section">
    <div class="section-title">Donation Details</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">Receipt Number</div>
        <div class="value">${receipt.taxReceiptNumber}</div>
      </div>
      <div class="info-item">
        <div class="label">Donation Date</div>
        <div class="value">${new Date(receipt.donationDate).toLocaleDateString()}</div>
      </div>
      <div class="info-item">
        <div class="label">Payment Method</div>
        <div class="value">${receipt.paymentMethod}</div>
      </div>
      <div class="info-item">
        <div class="label">Campaign</div>
        <div class="value">${receipt.campaignName || "General Donation"}</div>
      </div>
    </div>
  </div>

  ${receipt.nonprofitAddress ? `
  <div class="section">
    <div class="section-title">Organization Information</div>
    <div class="info-grid">
      <div class="info-item">
        <div class="label">Organization Name</div>
        <div class="value">${receipt.nonprofitName}</div>
      </div>
      <div class="info-item">
        <div class="label">Address</div>
        <div class="value">${receipt.nonprofitAddress}</div>
      </div>
    </div>
  </div>
  ` : ''}

  <div class="thank-you">
    Thank you for your generous support! 🎉
  </div>

  <div class="footer">
    <p>This receipt serves as proof of your charitable contribution to ${receipt.nonprofitName}.</p>
    <p>${receipt.nonprofitName} is a registered 501(c)(3) nonprofit organization.</p>
    <p>For tax purposes, please retain this receipt with your records.</p>
    <p style="margin-top: 15px;">Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
  `;
}

export function generateReceiptPDF(receipt: ReceiptData): Blob {
  const html = generateReceiptHTML(receipt);
  return new Blob([html], { type: "text/html" });
}

export function downloadReceipt(receipt: ReceiptData): void {
  const html = generateReceiptHTML(receipt);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt_${receipt.taxReceiptNumber}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function printReceipt(receipt: ReceiptData): void {
  const html = generateReceiptHTML(receipt);
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  }
}

export function emailReceipt(receipt: ReceiptData): void {
  const subject = `Your Donation Receipt from ${receipt.nonprofitName}`;
  const body = `
Dear ${receipt.isAnonymous ? "Supporter" : receipt.donorName},

Thank you for your generous donation of ${formatCurrency(receipt.amount)} to ${receipt.nonprofitName}!

Your contribution makes a real difference in our community. We've attached your tax receipt for this donation.

Receipt Details:
- Receipt Number: ${receipt.taxReceiptNumber}
- Donation Amount: ${formatCurrency(receipt.amount)}
- Donation Date: ${new Date(receipt.donationDate).toLocaleDateString()}
- Campaign: ${receipt.campaignName || "General Donation"}

This receipt serves as proof of your charitable contribution. Please retain it with your tax records.

${receipt.nonprofitEIN ? `Our Tax ID (EIN): ${receipt.nonprofitEIN}` : ""}

With gratitude,
The ${receipt.nonprofitName} Team

---
${receipt.nonprofitAddress ? `${receipt.nonprofitName}\n${receipt.nonprofitAddress}` : ""}
  `.trim();

  window.open(`mailto:${receipt.donorEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
}
