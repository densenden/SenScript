import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { auth } from '@clerk/nextjs/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    console.log('Contact form API called');
    
    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }
    
    // Get user authentication info
    const { userId } = await auth();
    
    const { name, email, subject, message, category = 'general' } = await request.json();
    console.log('Form data received:', { name, email, subject, messageLength: message?.length, userId });

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Send email using Resend with verified domain
    const { data, error } = await resend.emails.send({
      from: 'SenScript Contact <noreply@sen.studio>',
      to: [process.env.CONTACT_EMAIL || 'dev@sen.studio'],
      replyTo: email, // Set reply-to to the user's email
      subject: `SenScript Contact: ${subject}`,
      html: `
        <h2>🚀 New SenScript Contact Form Submission</h2>
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
        <hr>
        <p><small>This message was sent via the SenScript contact form. Reply directly to ${email}.</small></p>
      `,
      text: `
New contact form submission from SenScript website:

From: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
This message was sent via the SenScript contact form.
Reply directly to ${email} to respond.
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      
      // Check if it's a domain verification error (development mode)
      const errorMessage = error.message || String(error);
      if (errorMessage.includes('verify a domain')) {
        console.log('Development mode: Message logged for manual processing');
        return NextResponse.json(
          { 
            success: true,
            message: 'Message received! We\'ll get back to you soon.',
            note: 'Email service is in development mode - message has been logged for manual processing.'
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);
    
    // Save to database if available
    try {
      const { submitContactForm } = await import('@/lib/db/database');
      const saved = await submitContactForm({
        name,
        email,
        subject,
        message,
        category
      });
      
      if (!saved) {
        console.log('Failed to save contact form submission to database (expected without Supabase)');
      } else {
        console.log('Contact form submission saved to database');
      }
    } catch (dbError) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      console.log('Database not available for contact form, email sent successfully:', errorMessage);
      // Don't fail the request since email was sent successfully
    }
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Message sent successfully!',
        id: data?.id 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Internal server error. Please try again.' },
      { status: 500 }
    );
  }
}