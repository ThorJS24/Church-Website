import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // In a real app, you'd get user data from database
    const userData = {
      profile: {
        name: "User Name",
        email: "user@example.com",
        joinDate: new Date().toISOString()
      },
      preferences: {
        notifications: true,
        newsletter: false
      },
      activity: {
        lastLogin: new Date().toISOString(),
        prayerRequests: [],
        eventAttendance: []
      },
      exportDate: new Date().toISOString()
    };

    const dataBlob = JSON.stringify(userData, null, 2);
    
    return new NextResponse(dataBlob, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="my-church-data.json"'
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 });
  }
}