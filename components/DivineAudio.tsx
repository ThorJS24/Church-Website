'use client';

import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'framer-motion';

interface DivineAudioProps {
  autoPlay?: boolean;
  showControls?: boolean;
}

export default function DivineAudio({ showControls = true }: DivineAudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);



  const startAmbientSound = async () => {
    try {
      const response = await fetch('/api/ambient-audio');
      const ambientData = await response.json();
      console.log('Ambient data:', ambientData);
      
      if (ambientData?.audioUrl) {
        audioRef.current = new Audio(ambientData.audioUrl);
        audioRef.current.loop = true;
        audioRef.current.volume = (ambientData.volume || 20) / 100;
        
        audioRef.current.addEventListener('canplaythrough', () => {
          audioRef.current?.play().catch(e => console.log('Play error:', e));
        });
        
        audioRef.current.load();
      } else {
        console.log('No audio URL found');
      }
    } catch (error) {
      console.log('Could not start ambient sound:', error);
    }
  };

  const stopAmbientSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  };

  const togglePlay = async () => {
    if (isPlaying) {
      stopAmbientSound();
      setIsPlaying(false);
    } else {
      try {
        const response = await fetch('/api/ambient-audio');
        const ambientData = await response.json();
        console.log('API Response:', JSON.stringify(ambientData, null, 2));
        
        if (ambientData?.audioUrl) {
          await startAmbientSound();
          setIsPlaying(true);
        } else {
          console.log('No audioUrl found in response');
          alert('Please upload an ambient audio file in Sanity CMS and mark it as active');
        }
      } catch (error) {
        console.error('API Error:', error);
        alert('Error loading ambient audio');
      }
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  };

  if (!showControls) return null;

  return (
    <motion.div 
      className="fixed bottom-4 right-4 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-3 border border-yellow-200/50 dark:border-yellow-700/50 shadow-lg"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <div className="flex items-center space-x-2">
        <motion.button
          onClick={togglePlay}
          className={`p-2 rounded-full transition-colors ${
            isPlaying 
              ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400' 
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={isPlaying ? 'Stop ambient sounds' : 'Play ambient sounds'}
        >
          {isPlaying ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              <Music className="w-4 h-4" />
            </motion.div>
          ) : (
            <Music className="w-4 h-4" />
          )}
        </motion.button>
        
        {isPlaying && (
          <motion.button
            onClick={toggleMute}
            className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </motion.button>
        )}
      </div>
      
      {isPlaying && !isMuted && (
        <motion.div
          className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}