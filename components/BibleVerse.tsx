'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Book, Heart, Share2, Copy, Sparkles, Star } from 'lucide-react';
import { getRandomVerse, BibleVerse as BibleVerseType } from '@/lib/bible-api';

export default function BibleVerse() {
  const [verse, setVerse] = useState<BibleVerseType | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{id: number, x: number, y: number}>>([]);

  const fetchVerse = async () => {
    setLoading(true);
    try {
      const randomVerse = await getRandomVerse();
      setVerse(randomVerse);
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
      // Create sparkle effect
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
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
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
    content: '"For I know the plans I have for you," declares the Lord, "plans to prosper you and not to harm you, to give you hope and a future."',
    copyright: 'NIV'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-yellow-900/20 p-8 rounded-2xl shadow-xl border border-amber-200/50 dark:border-amber-700/50 group hover:shadow-2xl transition-all duration-500"
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-4 w-16 h-16 border-2 border-amber-300 rounded-full animate-pulse"></div>
        <div className="absolute bottom-4 right-4 w-12 h-12 border-2 border-orange-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-8 w-8 h-8 border-2 border-yellow-300 rounded-full animate-pulse delay-500"></div>
      </div>

      {/* Sparkle Effects */}
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

      {/* Header */}
      <div className="relative flex items-center justify-between mb-6">
        <motion.div 
          className="flex items-center space-x-3"
          whileHover={{ scale: 1.05 }}
        >
          <div className="relative">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl shadow-lg"
            >
              <Book className="w-6 h-6 text-white drop-shadow-sm" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
            ></motion.div>
          </div>
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              ✨ Today's Divine Message
            </h3>
            <p className="text-sm text-amber-600/70 dark:text-amber-400/70">Blessed words for your soul</p>
          </div>
        </motion.div>
        
        <div className="flex items-center space-x-2">
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
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 bg-white/50 hover:bg-white/80 rounded-full transition-all duration-300 group"
            title="Get new blessing"
          >
            <RefreshCw className="w-5 h-5 text-gray-600 group-hover:text-amber-600" />
          </motion.button>
        </div>
      </div>
      
      {/* Verse Content */}
      <motion.div
        key={displayVerse.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative"
      >
        <div className="text-2xl leading-relaxed font-medium text-gray-800 dark:text-gray-200 mb-6 relative">
          <span className="text-6xl text-amber-300/30 absolute -top-4 -left-2 font-serif">"</span>
          <span 
            className="relative z-10 italic"
            dangerouslySetInnerHTML={{ __html: displayVerse.content.replace(/"/g, '') }}
          />
          <span className="text-6xl text-amber-300/30 absolute -bottom-8 -right-2 font-serif">"</span>
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

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
    </motion.div>
  );
}