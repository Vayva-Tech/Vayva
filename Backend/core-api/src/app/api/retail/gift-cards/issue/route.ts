import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { v4 as _uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      businessId, 
      amount, 
      recipientName, 
      recipientEmail, 
      senderName,
      message,
      expiryDate,
      sendEmail 
    } = body;

    if (!businessId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Business ID and valid amount are required' },
        { status: 400 }
      );
    }

    // Generate unique gift card code
    const giftCardCode = generateGiftCardCode();

    // Check if code already exists (very unlikely but good practice)
    const existingCard = await prisma.giftCard.findUnique({
      where: { code: giftCardCode },
    });

    if (existingCard) {
      return NextResponse.json(
        { error: 'Failed to generate unique gift card code' },
        { status: 500 }
      );
    }

    // Create gift card
    const giftCard = await prisma.giftCard.create({
      data: {
        businessId,
        code: giftCardCode,
        initialBalance: amount,
        currentBalance: amount,
        recipientName,
        recipientEmail: recipientEmail || null,
        senderName: senderName || null,
        message: message || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        issuedBy: session.user.id,
      },
    });

    // Send email if requested (placeholder for email service)
    if (sendEmail && recipientEmail) {
      try {
        // In real implementation, integrate with email service
        console.warn(`Would send gift card email to ${recipientEmail}`);
        // await sendGiftCardEmail(giftCard);
      } catch (emailError) {
        console.error('Failed to send gift card email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        giftCard,
        code: giftCardCode,
      },
      message: 'Gift card issued successfully',
    });
  } catch (error) {
    console.error('Error issuing gift card:', error);
    return NextResponse.json(
      { error: 'Failed to issue gift card' },
      { status: 500 }
    );
  }
}

function generateGiftCardCode(): string {
  // Generate a 12-character alphanumeric code
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  // Add hyphens for readability: XXXX-XXXX-XXXX
  return result.replace(/(.{4})/g, '$1-').slice(0, -1);
}