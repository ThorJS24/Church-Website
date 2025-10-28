import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');
    
    const response = await fetch(`https://www.youtube.com/live_chat?v=${videoId}&embed_domain=localhost:3000`);
    const html = await response.text();
    
    // Extract chat messages from YouTube's live chat HTML
    const messageRegex = /"text":"([^"]+)","authorName":{"simpleText":"([^"]+)"}/g;
    const messages = [];
    let match;
    
    while ((match = messageRegex.exec(html)) !== null) {
      messages.push({
        id: Date.now() + Math.random(),
        author: match[2],
        message: match[1],
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true, messages: messages.slice(-20) });
  } catch (error) {
    return NextResponse.json({ success: false, messages: [] });
  }
}