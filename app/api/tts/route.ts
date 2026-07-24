import { NextRequest, NextResponse } from 'next/server';
import { PollyClient, SynthesizeSpeechCommand, DescribeVoicesCommand } from '@aws-sdk/client-polly';
import { z } from 'zod';
import { checkRateLimit, clientIpFrom } from '@/lib/rateLimit';

// Force Node.js runtime for AWS SDK
export const runtime = 'nodejs';

// 10/hour: AWS Polly bills per character, and neural voices cost more —
// this is a real per-request third-party cost (same class of concern as
// the gallery-submission route's Cloudinary usage), so it's kept tight.
// Each request can be up to 3000 characters (see requestSchema below).
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;

const requestSchema = z.object({
  text: z.string().min(1).max(3000),
  language: z.enum(['ta', 'ta_latn', 'en']).default('ta'),
  voice: z.string().optional(),
  speed: z.number().min(0.25).max(4.0).default(1.0).optional()
});

const pollyClient = new PollyClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

// Voice mapping for different languages
const VOICE_MAP = {
  ta: 'Kajal', // Tamil voice
  ta_latn: 'Kajal', // Use Tamil voice for romanized Tamil
  en: 'Joanna' // English voice
};

const LANGUAGE_CODE_MAP: Record<string, string> = {
  ta: 'ta-IN',
  ta_latn: 'ta-IN',
  en: 'en-US'
};

export async function POST(request: NextRequest) {
  try {
    const ip = clientIpFrom(request);
    const rateLimit = await checkRateLimit(`tts_${ip}`, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: { code: 'RATE_LIMITED', message: 'Too many text-to-speech requests. Please try again later.' },
          requestId: crypto.randomUUID(),
        },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimit.retryAfterMs || 0) / 1000)) } }
      );
    }

    const body = await request.json();
    const { text, language, voice, speed } = requestSchema.parse(body);

    // Check if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
      return NextResponse.json(
        {
          error: {
            code: 'TTS_NOT_CONFIGURED',
            message: language === 'ta' 
              ? 'உரை-க்கு-பேச்சு சேவை கிடைக்கவில்லை'
              : language === 'ta_latn'
              ? 'Urai-kku-Paeschu Saevai Kidaikkavіllai'
              : 'Text-to-speech service not configured',
            details: { service: 'aws-polly' }
          },
          requestId: crypto.randomUUID()
        },
        { status: 503 }
      );
    }

    // Get available voices to verify Tamil support
    let availableVoices: any[] = [];
    try {
      const voicesCommand = new DescribeVoicesCommand({
        LanguageCode: LANGUAGE_CODE_MAP[language] as any
      });
      const voicesResponse = await pollyClient.send(voicesCommand);
      availableVoices = voicesResponse.Voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      availableVoices = [];
    }

    // Select voice
    const selectedVoice = voice || VOICE_MAP[language];
    const voiceExists = availableVoices.some(v => v.Id === selectedVoice);
    
    if (!voiceExists && availableVoices.length > 0) {
      // Fallback to first available voice for the language
      const fallbackVoice = availableVoices[0];
      console.warn(`Voice ${selectedVoice} not available, using ${fallbackVoice.Id}`);
    }

    // Synthesize speech
    const synthesizeCommand = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: 'mp3',
      VoiceId: voiceExists ? selectedVoice : (availableVoices[0]?.Id || 'Joanna'),
      LanguageCode: LANGUAGE_CODE_MAP[language] as any,
      Engine: 'neural', // Use neural engine for better quality
      SpeechMarkTypes: undefined,
      SampleRate: '22050'
    });

    const response = await pollyClient.send(synthesizeCommand);
    
    if (!response.AudioStream) {
      throw new Error('No audio stream received from Polly');
    }

    // Convert stream to buffer
    const audioBuffer = await streamToBuffer(response.AudioStream);

    return new NextResponse(audioBuffer as any, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('TTS Error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: {
            code: 'INVALID_REQUEST',
            message: 'Invalid request parameters',
            details: error.errors
          },
          requestId: crypto.randomUUID()
        },
        { status: 400 }
      );
    }

    const language = (error as any).language || 'en';
    return NextResponse.json(
      {
        error: {
          code: 'TTS_ERROR',
          message: language === 'ta'
            ? 'உரை-க்கு-பேச்சு சேவையில் பிழை'
            : language === 'ta_latn'
            ? 'Urai-kku-Paeschu Saevaiyil Pizhai'
            : 'Text-to-speech service error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        requestId: crypto.randomUUID()
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Return available voices
    const voicesCommand = new DescribeVoicesCommand({});
    const response = await pollyClient.send(voicesCommand);
    
    const tamilVoices = response.Voices?.filter(voice => 
      voice.LanguageCode === 'ta-IN' as any
    ) || [];
    
    const englishVoices = response.Voices?.filter(voice => 
      voice.LanguageCode === 'en-US' as any
    ) || [];

    return NextResponse.json({
      voices: {
        ta: tamilVoices,
        ta_latn: tamilVoices,
        en: englishVoices
      },
      defaultVoices: VOICE_MAP,
      requestId: crypto.randomUUID()
    });

  } catch (error) {
    console.error('Error fetching voices:', error);
    return NextResponse.json(
      {
        error: {
          code: 'VOICES_ERROR',
          message: 'Error fetching available voices',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        },
        requestId: crypto.randomUUID()
      },
      { status: 500 }
    );
  }
}

// Helper function to convert stream to buffer
async function streamToBuffer(stream: any): Promise<Buffer> {
  const chunks: Uint8Array[] = [];
  
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  
  return Buffer.concat(chunks);
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}