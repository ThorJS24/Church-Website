import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, html, type, userId } = await request.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.CONTACT_EMAIL_USER,
        pass: process.env.CONTACT_EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.CONTACT_EMAIL_USER,
      to,
      subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);

    try {
      await addDoc(collection(db, 'emailNotifications'), {
        to,
        subject,
        type,
        userId,
        messageId: result.messageId,
        status: 'sent',
        sentAt: new Date().toISOString()
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');

    const notificationsRef = collection(db, 'emailNotifications');
    let q = query(notificationsRef, orderBy('sentAt', 'desc'), limit(50));

    if (userId) {
      q = query(notificationsRef, where('userId', '==', userId), orderBy('sentAt', 'desc'), limit(50));
    }
    if (type) {
      q = query(notificationsRef, where('type', '==', type), orderBy('sentAt', 'desc'), limit(50));
    }

    const querySnapshot = await getDocs(q);
    const notifications = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching email notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}