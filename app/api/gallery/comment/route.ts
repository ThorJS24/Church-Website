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
    const { imageId, comment, author } = await request.json();
    
    const commentDoc = await client.create({
      _type: 'comment',
      text: comment,
      author: author || 'Anonymous',
      createdAt: new Date().toISOString(),
      image: { _type: 'reference', _ref: imageId }
    });

    return NextResponse.json({ success: true, comment: commentDoc });
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
    const imageId = searchParams.get('imageId');
    
    const comments = await client.fetch(
      `*[_type == "comment" && image._ref == $imageId] | order(createdAt desc)`,
      { imageId }
    );

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}