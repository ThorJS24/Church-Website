'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
        title: 'Daily Blessing',
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
      <motion.div 
        className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 p-8 rounded-2xl shadow-xl border border-amber-200/50 dark:border-amber-700/50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-amber-200 rounded-full"></div>
            <div className="h-6 bg-amber-200 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-amber-200 rounded w-full"></div>
            <div className="h-4 bg-amber-200 rounded w-3/4"></div>
            <div className="h-4 bg-amber-200 rounded w-1/2"></div>
          </div>
        </div>
      </motion.div>
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
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 p-8 rounded-2xl shadow-xl border border-amber-200/50 dark:border-amber-700/50 group hover:shadow-2xl transition-all duration-500"
    >
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 180 }}
            exit={{ opacity: 0, scale: 0, rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="absolute pointer-events-none"
            style={{ left: `${sparkle.x}%`, top: `${sparkle.y}%` }}
          >
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative flex items-center justify-between mb-6">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg"
            >
              <Book className="w-6 h-6 text-white drop-shadow-sm" />
            </motion.div>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              ✨ Today's Divine Message
            </h3>
            <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Blessed words for your soul</p>
          </div>
        </motion.div>
        
        <div className="flex items-center space-x-2">
          <select
            value={bibleVersion}
            onChange={(e) => {
              const newVersion = e.target.value;
              setBibleVersion(newVersion);
              if (currentVerseId) {
                const sameVerseNewVersion = getVerseInVersion(currentVerseId, newVersion);
                if (sameVerseNewVersion) {
                  setVerse(sameVerseNewVersion);
                }
              }
            }}
            className="px-2 py-1 text-xs bg-white/60 hover:bg-white/80 rounded-full border-none outline-none text-gray-700 font-medium"
          >
            {bibleVersions.map(version => (
              <option key={version.code} value={version.code}>
                {version.code}
              </option>
            ))}
          </select>
          
          <motion.button
            onClick={handleLike}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full transition-all duration-300 ${liked ? 'bg-red-100 text-red-500' : 'bg-white/50 text-gray-600 hover:bg-white/80'}`}
          >
            <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          </motion.button>
          
          <motion.button
            onClick={fetchVerse}
            disabled={loading}
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className={`p-2 rounded-full transition-all duration-300 group ${
              loading 
                ? 'bg-gray-200 cursor-not-allowed' 
                : 'bg-white/50 hover:bg-white/80'
            }`}
            title="Get new blessing"
          >
            <RefreshCw className={`w-5 h-5 transition-all ${
              loading 
                ? 'animate-spin text-gray-400' 
                : 'text-gray-600 group-hover:text-amber-600'
            }`} />
          </motion.button>
        </div>
      </div>
      
      <motion.div
        key={displayVerse.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div className="text-2xl leading-relaxed font-medium text-gray-800 dark:text-gray-200 mb-6 relative px-8 font-serif">
          <span className="text-6xl text-amber-300/30 absolute -top-4 left-2 font-serif">"</span>
          <span className="relative z-10 italic block text-center">
            {displayVerse.content.replace(/"/g, '')}
          </span>
          <span className="text-6xl text-amber-300/30 absolute -bottom-8 right-2 font-serif">"</span>
        </div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-amber-500" />
            <p className="text-lg font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {displayVerse.reference}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={copyVerse}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1 px-3 py-1 bg-white/60 hover:bg-white/80 rounded-full text-sm font-medium text-gray-700 transition-all duration-300"
            >
              <Copy className="w-4 h-4" />
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </motion.button>
            
            {navigator.share && (
              <motion.button
                onClick={shareVerse}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-1 px-3 py-1 bg-white/60 hover:bg-white/80 rounded-full text-sm font-medium text-gray-700 transition-all duration-300"
              >
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </motion.div>
      
      {displayVerse.copyright && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-xs text-amber-600/60 dark:text-amber-400/60 mt-4 text-center"
        >
          {displayVerse.copyright}
        </motion.p>
      )}
    </motion.div>
  );
}