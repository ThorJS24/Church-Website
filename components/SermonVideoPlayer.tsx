'use client';

import { useEffect, useRef, useState } from 'react';
import { NotebookPen } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

let apiLoadPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT?.Player) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;
  apiLoadPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve(); };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  });
  return apiLoadPromise;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function SermonVideoPlayer({ sermonId, embedUrl, title }: { sermonId: string; embedUrl: string; title: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [resumeAt, setResumeAt] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const progressKey = `sermon-progress-${sermonId}`;
  const notesKey = `sermon-notes-${sermonId}`;

  useEffect(() => {
    const saved = localStorage.getItem(progressKey);
    if (saved) {
      const seconds = parseFloat(saved);
      if (seconds > 10) setResumeAt(seconds);
    }
    const savedNotes = localStorage.getItem(notesKey);
    if (savedNotes) setNotes(savedNotes);
  }, [progressKey, notesKey]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    loadYouTubeApi().then(() => {
      if (cancelled || !containerRef.current) return;
      playerRef.current = new window.YT.Player(containerRef.current, {
        events: {
          onReady: () => {
            interval = setInterval(() => {
              const player = playerRef.current;
              if (!player?.getCurrentTime || !player?.getDuration) return;
              const current = player.getCurrentTime();
              const duration = player.getDuration();
              if (duration > 0 && current / duration < 0.95) {
                localStorage.setItem(progressKey, String(current));
              } else if (duration > 0) {
                localStorage.removeItem(progressKey);
              }
            }, 5000);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (interval) clearInterval(interval);
    };
  }, [progressKey]);

  const handleResume = () => {
    if (resumeAt && playerRef.current?.seekTo) {
      playerRef.current.seekTo(resumeAt, true);
      playerRef.current.playVideo?.();
    }
    setResumeAt(null);
  };

  const saveNotes = (value: string) => {
    setNotes(value);
    if (value.trim()) localStorage.setItem(notesKey, value);
    else localStorage.removeItem(notesKey);
  };

  const src = `${embedUrl}?enablejsapi=1`;

  return (
    <div>
      <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-xl bg-black no-print">
        <iframe
          ref={containerRef as any}
          src={src}
          title={title}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {resumeAt !== null && (
        <div className="mt-3 flex items-center justify-between rounded-lg border border-accent/30 bg-accent-subtle px-4 py-2.5 text-body-sm text-accent no-print">
          <span>Continue where you left off, at {formatTime(resumeAt)}?</span>
          <div className="flex gap-3">
            <button onClick={() => setResumeAt(null)} className="font-medium hover:underline">Dismiss</button>
            <button onClick={handleResume} className="font-medium underline underline-offset-2">Resume</button>
          </div>
        </div>
      )}

      <div className="mt-4 no-print">
        <button
          type="button"
          onClick={() => setShowNotes((prev) => !prev)}
          className="flex items-center gap-1.5 text-body-sm font-medium text-foreground-muted hover:text-foreground"
        >
          <NotebookPen className="h-4 w-4" /> {showNotes ? 'Hide my notes' : notes ? 'View my notes' : 'Take notes'}
        </button>
        {showNotes && (
          <Textarea
            value={notes}
            onChange={(e) => saveNotes(e.target.value)}
            placeholder="Jot down anything that stands out while you watch — saved automatically on this device."
            rows={5}
            className="mt-2"
          />
        )}
      </div>
    </div>
  );
}
