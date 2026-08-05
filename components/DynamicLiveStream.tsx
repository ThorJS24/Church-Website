'use client';

import { useState, useEffect } from 'react';
import { Play, Calendar, Clock } from 'lucide-react';
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
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-300">Loading stream...</p>
      </div>
    );
  }

  if (!streamData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Stream Available</h3>
        <p className="text-gray-600 dark:text-gray-300">Check back later for live streams and services.</p>
      </div>
    );
  }

  if (!streamData.isLive && streamData.scheduledStart) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        <div className="relative">
          {streamData.thumbnailUrl && (
            <Image
              src={streamData.thumbnailUrl}
              alt={streamData.title}
              width={800}
              height={450}
              className="w-full h-64 object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 800px"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <Clock className="w-16 h-16 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">{streamData.title}</h3>
              <p className="text-lg mb-4">Scheduled for {new Date(streamData.scheduledStart).toLocaleString()}</p>
              <div className="bg-blue-600 px-4 py-2 rounded-lg inline-block">
                <span className="font-medium">Coming Soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      {streamData.isLive && (
        <div className="bg-linear-to-r from-red-600 to-red-700 text-white p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
            <h3 className="text-lg font-semibold">{streamData.title}</h3>
          </div>
        </div>
      )}

      <div className="aspect-video bg-black">
        {getStreamUrl() ? (
          <iframe
            src={getStreamUrl()!}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          ></iframe>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white">
            <div className="text-center">
              <Play className="w-16 h-16 mx-auto mb-4" />
              <p>Stream URL not configured</p>
            </div>
          </div>
        )}
      </div>
      
      {streamData.description && (
        <div className="p-4">
          <p className="text-gray-600 dark:text-gray-300">{streamData.description}</p>
        </div>
      )}
    </div>
  );
}