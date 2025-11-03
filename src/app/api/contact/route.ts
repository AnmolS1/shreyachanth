import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 requests per hour per IP
    const identifier = getClientIdentifier(request);
    const rateLimitResult = checkRateLimit(identifier, {
      windowMs: 60 * 60 * 1000, // 1 hour
      maxRequests: 5,
    });

    if (!rateLimitResult.allowed) {
      const resetInMinutes = Math.ceil(
        (rateLimitResult.resetAt - Date.now()) / 1000 / 60
      );
      return NextResponse.json(
        {
          error: `Too many requests. Please try again in ${resetInMinutes} minutes.`,
          resetInMinutes,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, email, message } = body;

    // Validate input
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Sanitize input to prevent XSS
    const sanitizedName = name.replace(/[<>]/g, '');
    const sanitizedMessage = message.replace(/[<>]/g, '');

    // Send email using Resend
    try {
      await resend.emails.send({
        from: 'Portfolio Contact <onboarding@resend.dev>', // You'll need to configure your domain
        to: process.env.CONTACT_EMAIL || 'shreyatchanth@gmail.com',
        replyTo: email,
        subject: `Portfolio Contact: ${sanitizedName}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${sanitizedName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p>${sanitizedMessage.replace(/\n/g, '<br>')}</p>
        `,
      });

      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
      });
    } catch (emailError) {
      console.error('Email send error:', emailError);
      return NextResponse.json(
        {
          error: 'Failed to send email. Please try again later.',
          details:
            emailError instanceof Error ? emailError.message : 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'An error occurred processing your request' },
      { status: 500 }
    );
  }
}
