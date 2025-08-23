import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

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
    
    const { name, email, subject, message } = await request.json();
    console.log('Form data received:', { name, email, subject, messageLength: message?.length });

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

    // Send email using Resend (plain text only for now)
    const { data, error } = await resend.emails.send({
      from: 'SenScript Contact Form <onboarding@resend.dev>',
      to: [process.env.CONTACT_EMAIL || 'dev@sen.studio'],
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
      return NextResponse.json(
        { error: 'Failed to send message. Please try again.' },
        { status: 500 }
      );
    }

    console.log('Email sent successfully:', data);
    
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