import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const userData = {
      profile: {
        email: 'user@example.com',
        name: 'Church Member',
        exportDate: new Date().toISOString()
      },
      prayerRequests: [],
      donations: [],
      eventRegistrations: [],
      preferences: {
        notifications: true,
        newsletter: true
      }
    };

    const jsonData = JSON.stringify(userData, null, 2);
    
    return new NextResponse(jsonData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="my-church-data.json"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}