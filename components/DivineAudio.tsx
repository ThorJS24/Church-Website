'use client';

import { useState, useRef } from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

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
          alert('Please add an ambient audio track (ambientAudio/current in Firestore) and mark it active');
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
      role="region"
      aria-label="Ambient audio controls"
      // bottom-4 alone put this directly on top of MobileBottomNav's
      // rightmost tab below md (confirmed via CDP: both occupied the same
      // ~56px vertical band, with the FAB visually cutting off the
      // "Contact" label) — lifted above the nav bar there, back to bottom-4
      // at md: and up where MobileBottomNav doesn't render.
      className="fixed bottom-24 right-4 z-50 rounded-full border border-warm/30 bg-background/90 p-3 shadow-lg backdrop-blur-xs md:bottom-4"
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <motion.button
          onClick={togglePlay}
          className={cn(
            'rounded-full p-2 transition-colors',
            isPlaying ? 'bg-warm-subtle text-warm' : 'bg-surface text-foreground-muted'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title={isPlaying ? 'Stop ambient sounds' : 'Play ambient sounds'}
        >
          {isPlaying ? (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
              <Music className="h-4 w-4" />
            </motion.div>
          ) : (
            <Music className="h-4 w-4" />
          )}
        </motion.button>

        {isPlaying && (
          <motion.button
            onClick={toggleMute}
            className="rounded-full bg-surface p-2 text-foreground-muted transition-colors hover:bg-surface-hover"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </motion.button>
        )}
      </div>

      {isPlaying && !isMuted && (
        <motion.div
          className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-warm"
          animate={{ scale: [1, 1.3, 1], opacity: [1, 0.7, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}
