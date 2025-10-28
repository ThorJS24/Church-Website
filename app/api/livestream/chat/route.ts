import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@sanity/client';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_TOKEN;

let client: any = null;
if (projectId && dataset && token) {
  client = createClient({
    projectId,
    dataset,
    token,
    useCdn: false,
    apiVersion: '2023-05-03'
  });
}

export async function POST(request: NextRequest) {
  if (!client) {
    return NextResponse.json({ success: false, message: 'CMS not configured' }, { status: 500 });
  }
  
  try {
    const { livestreamId, message, author } = await request.json();
    
    const chatMessage = await client.create({
      _type: 'chatMessage',
      message,
      author,
      timestamp: new Date().toISOString(),
      livestream: { _type: 'reference', _ref: livestreamId },
      isVisible: true
    });

    return NextResponse.json({ success: true, message: chatMessage });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!client) {
    return NextResponse.json({ success: false, message: 'CMS not configured' }, { status: 500 });
  }
  
  try {
    const { searchParams } = new URL(request.url);
    const livestreamId = searchParams.get('livestreamId');
    
    const messages = await client.fetch(
      `*[_type == "chatMessage" && livestream._ref == $livestreamId && isVisible == true] | order(timestamp desc)[0...50] {
        _id,
        message,
        author,
        timestamp
      }`,
      { livestreamId }
    );

    return NextResponse.json({ success: true, messages: messages.reverse() });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}