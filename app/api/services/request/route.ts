import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const serviceRequest = {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'serviceRequests'), serviceRequest);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_EMAIL_USER,
        pass: process.env.CONTACT_EMAIL_PASS
      }
    });

    const serviceTypeTitle = data.serviceType === 'wedding' ? 'Wedding' : 'Baptism';
    
    await transporter.sendMail({
      from: process.env.CONTACT_EMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: `New ${serviceTypeTitle} Service Request`,
      html: `
        <h2>New ${serviceTypeTitle} Service Request</h2>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone}</p>
        ${data.partnerName ? `<p><strong>Partner:</strong> ${data.partnerName}</p>` : ''}
        <p><strong>Preferred Date:</strong> ${data.preferredDate}</p>
        ${data.alternateDate ? `<p><strong>Alternate Date:</strong> ${data.alternateDate}</p>` : ''}
        ${data.message ? `<p><strong>Message:</strong> ${data.message}</p>` : ''}
        <p><strong>Request ID:</strong> ${docRef.id}</p>
      `
    });

    await transporter.sendMail({
      from: process.env.CONTACT_EMAIL_USER,
      to: data.email,
      subject: `${serviceTypeTitle} Service Request Confirmation`,
      html: `
        <h2>Thank you for your ${serviceTypeTitle.toLowerCase()} service request</h2>
        <p>Dear ${data.firstName},</p>
        <p>We have received your request for ${serviceTypeTitle.toLowerCase()} services. Our pastoral team will contact you within 24-48 hours.</p>
        <p><strong>Request Details:</strong></p>
        <ul>
          <li>Service Type: ${serviceTypeTitle}</li>
          <li>Preferred Date: ${data.preferredDate}</li>
          ${data.alternateDate ? `<li>Alternate Date: ${data.alternateDate}</li>` : ''}
        </ul>
        <p>Blessings,<br>Salem Primitive Baptist Church</p>
      `
    });

    return NextResponse.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('Service request error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}