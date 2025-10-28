import { NextResponse } from 'next/server';
import { sanityClient as client } from '@/lib/sanity';

export async function GET() {
  try {
    const ambientAudio = await client.fetch(`*[_type == "ambientAudio" && isActive == true][0] {
      _id,
      title,
      "audioUrl": audioFile.asset->url,
      volume,
      isActive
    }`);

    console.log('Direct Sanity result:', JSON.stringify(ambientAudio, null, 2));
    return NextResponse.json(ambientAudio || {});
  } catch (error) {
    console.error('Sanity fetch error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}