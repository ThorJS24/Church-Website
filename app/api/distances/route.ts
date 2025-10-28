import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { origins, destinations } = await request.json();
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Google Maps API key not found' }, { status: 500 });
    }

    const originsStr = origins.join('|');
    const destinationsStr = destinations.join('|');

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originsStr)}&destinations=${encodeURIComponent(destinationsStr)}&units=metric&key=${apiKey}&mode=driving`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    console.log('Google Maps API response:', data);

    if (data.status !== 'OK') {
      console.error('Distance Matrix API error:', data);
      return NextResponse.json({ error: 'Distance Matrix API error', details: data }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Distance API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}