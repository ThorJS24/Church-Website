'use client';

import { useState, useEffect } from 'react';
import { Play, Calendar, Clock, Loader2 } from 'lucide-react';
import { getLivestream, Livestream } from '@/lib/content';
import Image from 'next/image';

export default function DynamicLiveStream() {
  const [streamData, setStreamData] = useState<Livestream | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStreamData();
  }, []);

  const fetchStreamData = async () => {
    try {
      const data = await getLivestream();
      if (data) {
        setStreamData(data);
      }
    } catch (error) {
      console.error('Error fetching stream data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStreamUrl = () => {
    if (!streamData?.streamUrl) return null;

    if (streamData.streamUrl.includes('youtube.com/watch?v=')) {
      const videoId = streamData.streamUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (streamData.streamUrl.includes('youtu.be/')) {
      const videoId = streamData.streamUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (streamData.streamUrl.includes('youtube.com/live/')) {
      const videoId = streamData.streamUrl.split('/live/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    return streamData.streamUrl;
  };

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-background p-8 text-center shadow-lg">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-accent" />
        <p className="text-body-md text-foreground-muted">Loading stream...</p>
      </div>
    );
  }

  if (!streamData) {
    return (
      <div className="rounded-lg border border-border bg-background p-8 text-center shadow-lg">
        <Calendar className="mx-auto mb-4 h-16 w-16 text-foreground-subtle" />
        <h3 className="mb-2 font-serif text-title-lg text-foreground">No Stream Available</h3>
        <p className="text-body-md text-foreground-muted">Check back later for live streams and services.</p>
      </div>
    );
  }

  if (!streamData.isLive && streamData.scheduledStart) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-background shadow-lg">
        <div className="relative">
          {streamData.thumbnailUrl && (
            <Image
              src={streamData.thumbnailUrl}
              alt={streamData.title}
              width={800}
              height={450}
              className="h-64 w-full object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center text-white">
              <Clock className="mx-auto mb-4 h-16 w-16" />
              <h3 className="mb-2 font-serif text-headline-sm">{streamData.title}</h3>
              <p className="mb-4 text-body-lg">Scheduled for {new Date(streamData.scheduledStart).toLocaleString()}</p>
              <div className="inline-block rounded-lg bg-accent px-4 py-2">
                <span className="font-medium text-accent-foreground">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background shadow-lg">
      {streamData.isLive && (
        <div className="bg-danger p-4 text-white">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 animate-pulse rounded-full bg-white" />
            <span className="text-body-sm font-medium">LIVE</span>
            <h3 className="text-title-sm font-semibold">{streamData.title}</h3>
          </div>
        </div>
      )}

      <div className="aspect-video bg-black">
        {getStreamUrl() ? (
          <iframe
            src={getStreamUrl()!}
            className="h-full w-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white">
            <div className="text-center">
              <Play className="mx-auto mb-4 h-16 w-16" />
              <p>Stream URL not configured</p>
            </div>
          </div>
        )}
      </div>

      {streamData.description && (
        <div className="p-4">
          <p className="text-body-md text-foreground-muted">{streamData.description}</p>
        </div>
      )}
    </div>
  );
}
