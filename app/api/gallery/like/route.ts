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
    const { imageId } = await request.json();
    
    const result = await client
      .patch(imageId)
      .inc({ likes: 1 })
      .commit();

    return NextResponse.json({ success: true, likes: result.likes });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}