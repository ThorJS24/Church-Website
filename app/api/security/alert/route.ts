import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SECURITY_EMAIL_USER,
    pass: process.env.SECURITY_EMAIL_PASS
  }
});

export async function POST(request: NextRequest) {
  try {
    const securityEvent = await request.json();
    
    const mailOptions = {
      from: process.env.SECURITY_EMAIL_USER,
      to: process.env.ADMIN_EMAIL || 'admin@salempbc.com',
      subject: `🚨 Security Alert - ${securityEvent.type}`,
      html: `
        <h2>Security Alert</h2>
        <p><strong>Type:</strong> ${securityEvent.type}</p>
        <p><strong>Severity:</strong> ${securityEvent.severity}</p>
        <p><strong>IP Address:</strong> ${securityEvent.ip}</p>
        <p><strong>User Agent:</strong> ${securityEvent.userAgent}</p>
        <p><strong>Details:</strong> ${securityEvent.details}</p>
        <p><strong>Timestamp:</strong> ${securityEvent.timestamp}</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Security alert error:', error);
    return NextResponse.json({ error: 'Failed to send security alert' }, { status: 500 });
  }
}