import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

let sanityClient: any = null;
if (projectId && dataset && token) {
  sanityClient = createClient({
    projectId,
    dataset,
    token,
    useCdn: false,
    apiVersion: '2023-05-03'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      formType,
      name,
      email,
      phone,
      subject,
      message,
      urgency = 'normal',
      preferredContact = 'email',
      ministry,
      availability,
      skills,
      eventType,
      eventDate,
      attendeeCount,
      donationType,
      amount,
      organizationType,
      organizationName,
      mediaType,
      submittedAt,
      ip
    } = body;

    if (!formType || !name || !email || !message) {
      return NextResponse.json(
        { success: false, message: 'Form type, name, email, and message are required' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toISOString();

    const contactData = {
      formType,
      name,
      email,
      phone: phone || '',
      subject: subject || '',
      message,
      urgency,
      preferredContact,
      ministry,
      availability,
      skills,
      eventType,
      eventDate: eventDate || null,
      attendeeCount: attendeeCount || null,
      donationType,
      amount: amount || null,
      organizationType,
      organizationName,
      mediaType,
      status: 'new',
      submittedAt: timestamp,
      ipAddress: ip,
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Save to Firebase
    const docRef = await addDoc(collection(db, 'enhanced_contacts'), contactData);

    // Save to Sanity CMS
    if (sanityClient) {
      try {
        const sanityData = {
          _type: 'contactForm',
          ...contactData,
          submittedAt: timestamp,
        };
        await sanityClient.create(sanityData);
      } catch (sanityError) {
        console.error('Sanity save error:', sanityError);
      }
    }

    // Send notification email
    try {
      await sendNotificationEmail(formType, contactData);
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      id: docRef.id
    });

  } catch (error) {
    console.error('Enhanced contact form error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}

async function sendNotificationEmail(formType: string, data: any) {
  const emailMap: { [key: string]: string } = {
    general: process.env.ADMIN_EMAIL || 'admin@yourchurch.com',
    pastoral: process.env.PASTORAL_EMAIL || 'pastor@yourchurch.com',
    prayer: process.env.PRAYER_EMAIL || 'prayer@yourchurch.com',
    baptism: process.env.PASTORAL_EMAIL || 'pastor@yourchurch.com',
    counseling: process.env.COUNSELING_EMAIL || 'counseling@yourchurch.com',
    volunteer: process.env.VOLUNTEER_EMAIL || 'volunteer@yourchurch.com',
    donations: process.env.FINANCE_EMAIL || 'finance@yourchurch.com',
    facility: process.env.FACILITY_EMAIL || 'facility@yourchurch.com',
    partnership: process.env.PARTNERSHIP_EMAIL || 'partnership@yourchurch.com',
    media: process.env.MEDIA_EMAIL || 'media@yourchurch.com',
    feedback: process.env.TECH_EMAIL || 'tech@yourchurch.com',
    press: process.env.PR_EMAIL || 'pr@yourchurch.com',
    mission: process.env.MISSION_EMAIL || 'mission@yourchurch.com',
    testimony: process.env.TESTIMONY_EMAIL || 'testimony@yourchurch.com'
  };

  const recipientEmail = emailMap[formType] || process.env.ADMIN_EMAIL;
  console.log(`Notification email should be sent to ${recipientEmail} for ${formType} form`);
}