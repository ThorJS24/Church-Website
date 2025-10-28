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

export async function PATCH(request: NextRequest) {
  if (!client) {
    return NextResponse.json({ success: false, message: 'CMS not configured' }, { status: 500 });
  }
  
  try {
    const { streamId, viewerCount, isLive } = await request.json();
    
    const updates: any = {};
    if (viewerCount !== undefined) updates.viewerCount = viewerCount;
    if (isLive !== undefined) updates.isLive = isLive;
    
    const result = await client
      .patch(streamId)
      .set(updates)
      .commit();

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Update failed' }, { status: 500 });
  }
}

export async function GET() {
  if (!client) {
    return NextResponse.json({ success: false, message: 'CMS not configured' }, { status: 500 });
  }
  
  try {
    const stream = await client.fetch(`*[_type == "livestream"] | order(_createdAt desc)[0] {
      _id,
      title,
      isLive,
      viewerCount,
      streamType,
      streamUrl,
      streamKey,
      chatEnabled,
      autoRefresh,
      refreshInterval
    }`);
    
    return NextResponse.json({ success: true, data: stream });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}