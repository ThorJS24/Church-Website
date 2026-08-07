'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Book, Heart, Share2, Copy, Sparkles, Star } from 'lucide-react';
import { getRandomVerse, getVerseInVersion, BibleVerse as BibleVerseType } from '@/lib/bible-api';

export default function BibleVerse() {
  const [verse, setVerse] = useState<BibleVerseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number}>>([]);
  const [bibleVersion, setBibleVersion] = useState('NKJV');
  const [currentVerseId, setCurrentVerseId] = useState<string | null>(null);

  const bibleVersions = [
    { code: 'NKJV', name: 'New King James Version' },
    { code: 'NIV', name: 'New International Version' },
    { code: 'ESV', name: 'English Standard Version' },
    { code: 'KJV', name: 'King James Version' },
    { code: 'NLT', name: 'New Living Translation' },
    { code: 'CJB', name: 'Complete Jewish Bible' },
  ];

  const fetchVerse = async () => {
    setLoading(true);
    try {
      const randomVerse = await getRandomVerse(bibleVersion);
      setVerse(randomVerse);
      setCurrentVerseId(randomVerse?.id || null);
    } catch (error) {
      console.error('Error fetching verse:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyVerse = async () => {
    if (verse) {
      await navigator.clipboard.writeText(`${verse.content} - ${verse.reference}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareVerse = async () => {
    if (verse && navigator.share) {
      await navigator.share({
        title: "Today's Verse",
        text: `${verse.content} - ${verse.reference}`
      });
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    if (!liked) {
      const newSparkles = Array.from({length: 6}, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setSparkles(newSparkles);
      setTimeout(() => setSparkles([]), 1000);
    }
  };

  useEffect(() => {
    fetchVerse();
  }, []);

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-border bg-warm-subtle p-8 shadow-sm">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-warm/20" />
            <div className="h-6 w-32 rounded bg-warm/20" />
          </div>
          <div className="space-y-3">
            <div className="h-4 w-full rounded bg-warm/20" />
            <div className="h-4 w-3/4 rounded bg-warm/20" />
            <div className="h-4 w-1/2 rounded bg-warm/20" />
          </div>
        </div>
      </div>
    );
  }

  const displayVerse = verse || {
    id: 'fallback',
    orgId: 'fallback',
    bookId: 'JER',
    chapterIds: ['29'],
    reference: 'Jeremiah 29:11',
    content: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, to give you hope and a future.',
    copyright: 'NIV'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-2xl border border-border bg-warm-subtle p-8 shadow-sm"
    >
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 180 }}
            exit={{ opacity: 0, scale: 0, rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute"
            style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
          >
            <Sparkles className="h-4 w-4 text-warm" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative mb-6 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-warm p-3 shadow-sm">
            <Book className="h-5 w-5 text-warm-foreground" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-title-md text-foreground">Today's Verse</h2>
            <p className="text-caption text-foreground-subtle">A blessing for your day</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={bibleVersion}
            aria-label="Bible translation version"
            onChange={(e) => {
              const newVersion = e.target.value;
              setBibleVersion(newVersion);
              if (currentVerseId) {
                const newVerse = getVerseInVersion(currentVerseId, newVersion);
                if (newVerse) {
                  setVerse(newVerse);
                }
              }
            }}
            className="rounded-full border-none bg-background/70 px-2 py-1 text-caption font-medium text-foreground-muted outline-hidden"
          >
            {bibleVersions.map(version => (
              <option key={version.code} value={version.code}>
                {version.code}
              </option>
            ))}
          </select>

          <button
            onClick={handleLike}
            aria-label={liked ? 'Unlike this verse' : 'Like this verse'}
            className={`rounded-full p-2 transition-colors duration-fast ${liked ? 'bg-danger-subtle text-danger' : 'bg-background/60 text-foreground-muted hover:bg-background/90'}`}
          >
            <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={fetchVerse}
            disabled={loading}
            title="Get new verse"
            className="rounded-full bg-background/60 p-2 text-foreground-muted transition-colors duration-fast hover:bg-background/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div key={displayVerse.id} className="relative">
        <div className="relative mb-6 px-8 text-center font-serif text-headline-sm leading-relaxed text-foreground">
          <span className="absolute -top-4 left-2 font-serif text-6xl text-warm/20" aria-hidden="true">&ldquo;</span>
          <span className="relative z-10 block italic">
            {displayVerse.content.replace(/"/g, '')}
          </span>
          <span className="absolute -bottom-8 right-2 font-serif text-6xl text-warm/20" aria-hidden="true">&rdquo;</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-warm" aria-hidden="true" />
            <p className="text-title-sm text-warm">{displayVerse.reference}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyVerse}
              className="flex items-center gap-1.5 rounded-full bg-background/60 px-3 py-1 text-body-sm font-medium text-foreground-muted transition-colors duration-fast hover:bg-background/90"
            >
              <Copy className="h-4 w-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            {typeof window !== 'undefined' && typeof navigator?.share === 'function' && (
              <button
                onClick={shareVerse}
                className="flex items-center gap-1.5 rounded-full bg-background/60 px-3 py-1 text-body-sm font-medium text-foreground-muted transition-colors duration-fast hover:bg-background/90"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {displayVerse.copyright && (
        <p className="mt-4 text-center text-caption text-foreground-subtle">{displayVerse.copyright}</p>
      )}
    </motion.div>
  );
}
