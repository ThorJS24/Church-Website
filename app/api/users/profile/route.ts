import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  token: process.env.SANITY_API_TOKEN!,
  useCdn: false,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    const user = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email }
    );

    return NextResponse.json({ success: true, user });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json();
    
    const existingUser = await client.fetch(
      `*[_type == "user" && email == $email][0]`,
      { email: userData.email }
    );

    if (existingUser) {
      const updatedUser = await client
        .patch(existingUser._id)
        .set({ 
          displayName: userData.displayName,
          lastLogin: new Date().toISOString()
        })
        .commit();
      
      return NextResponse.json({ success: true, user: updatedUser });
    } else {
      const newUser = await client.create({
        _type: 'user',
        email: userData.email,
        displayName: userData.displayName,
        role: 'member',
        permissions: [],
        isActive: true,
        joinedAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      return NextResponse.json({ success: true, user: newUser });
    }
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}