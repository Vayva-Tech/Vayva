import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    const invoice = await prisma.creativeInvoice.findFirst({
      where: { id, storeId },
      include: {
        client: {
          select: {
            id: true,
            companyName: true,
            contactName: true,
            contactEmail: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
          },
        },
        items: {
          select: {
            id: true,
            description: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
            task: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            paymentDate: true,
            paymentMethod: true,
            status: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Calculate payment status
    const totalPayments = invoice.payments
      .filter(payment => payment.status === "completed")
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const balanceDue = invoice.totalAmount - totalPayments;
    const isOverdue = balanceDue > 0 && new Date() > invoice.dueDate;

    const invoiceWithDetails = {
      ...invoice,
      paymentStatus: {
        totalPayments,
        balanceDue,
        isOverdue,
        paidInFull: balanceDue <= 0,
        paymentPercentage: invoice.totalAmount > 0 
          ? (totalPayments / invoice.totalAmount) * 100
          : 0,
      },
    };

    return NextResponse.json(
      { data: invoiceWithDetails },
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[CREATIVE_INVOICE_GET]", { error, invoiceId: params.id });
    return NextResponse.json(
      { error: "Failed to fetch invoice" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}