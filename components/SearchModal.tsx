'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Calendar, Play, Image, Megaphone, Book } from 'lucide-react';
import { searchVerses } from '@/lib/bible-api';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SearchResult {
  objectID: string;
  title: string;
  content: string;
  type: 'sermon' | 'event' | 'announcement' | 'gallery';
  url: string;
  date?: string;
}

interface FirestoreSearchDoc {
  id: string;
  title?: string;
  description?: string;
  shortDescription?: string;
  content?: string;
  date?: string;
  startDate?: string;
}

/** Queries the real Firestore-backed /api/search route and flattens its
 * per-category results into the shape this modal renders. Replaces the
 * previous Algolia integration, whose app ID was unreachable — every real
 * search silently fell back to four hardcoded fake results. */
async function searchContent(query: string): Promise<SearchResult[]> {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) return [];
  const data = await response.json();

  const results: SearchResult[] = [];
  (data.results?.sermons as FirestoreSearchDoc[] || []).forEach((s) => {
    results.push({ objectID: s.id, title: s.title || 'Untitled sermon', content: s.description || '', type: 'sermon', url: '/sermons', date: s.date });
  });
  (data.results?.events as FirestoreSearchDoc[] || []).forEach((e) => {
    results.push({ objectID: e.id, title: e.title || 'Untitled event', content: e.description || e.shortDescription || '', type: 'event', url: '/events', date: e.startDate });
  });
  (data.results?.announcements as FirestoreSearchDoc[] || []).forEach((a) => {
    results.push({ objectID: a.id, title: a.title || 'Untitled announcement', content: a.content || '', type: 'announcement', url: '/', date: a.date });
  });
  (data.results?.gallery as FirestoreSearchDoc[] || []).forEach((g) => {
    results.push({ objectID: g.id, title: g.title || 'Untitled photo', content: g.description || '', type: 'gallery', url: '/gallery' });
  });
  return results;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [bibleResults, setBibleResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'bible'>('content');
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(isOpen, onClose, modalRef);

  useEffect(() => {
    if (query.length > 1) {
      const debounceTimer = setTimeout(() => {
        performSearch();
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setResults([]);
      setBibleResults([]);
    }
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const [contentResults, verseResults] = await Promise.all([
        searchContent(query),
        searchVerses(query)
      ]);
      
      setResults(contentResults);
      setBibleResults(verseResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setBibleResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'sermon': return <Play className="w-4 h-4" />;
      case 'event': return <Calendar className="w-4 h-4" />;
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      case 'gallery': return <Image className="w-4 h-4" />;
      default: return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sermon': return 'bg-blue-100 text-blue-800';
      case 'event': return 'bg-green-100 text-green-800';
      case 'announcement': return 'bg-orange-100 text-orange-800';
      case 'gallery': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20"
          onClick={onClose}
        >
          <motion.div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            tabIndex={-1}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search sermons, events, Bible verses..."
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 placeholder-gray-500"
                  autoFocus
                />
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-4 mt-3">
                <button
                  onClick={() => setActiveTab('content')}
                  className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                    activeTab === 'content' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  <span>Content ({results.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('bible')}
                  className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                    activeTab === 'bible' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'
                  }`}
                >
                  <Book className="w-3 h-3" />
                  <span>Bible ({bibleResults.length})</span>
                </button>
              </div>
            </div>

            {/* Results */}
            <div className="max-h-96 overflow-y-auto">
              {activeTab === 'content' ? (
                results.length > 0 ? (
                  <div className="p-2">
                    {results.map((result) => (
                      <a
                        key={result.objectID}
                        href={result.url}
                        className="block p-3 hover:bg-gray-50 rounded cursor-pointer"
                        onClick={onClose}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`p-1 rounded ${getTypeColor(result.type)}`}>
                            {getIcon(result.type)}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{result.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{result.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-blue-600 capitalize">{result.type}</span>
                              {result.date && (
                                <span className="text-xs text-gray-500">{result.date}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                ) : query.length > 1 && !loading ? (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No content found for "{query}"</p>
                  </div>
                ) : null
              ) : (
                bibleResults.length > 0 ? (
                  <div className="p-2">
                    {bibleResults.map((verse, index) => (
                      <div key={index} className="p-3 hover:bg-gray-50 rounded">
                        <div className="flex items-start space-x-3">
                          <div className="p-1 rounded bg-purple-100 text-purple-800">
                            <Book className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{verse.reference}</h3>
                    <p className="text-sm text-gray-700 mt-1" dangerouslySetInnerHTML={{ __html: verse.content }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : query.length > 1 && !loading ? (
                  <div className="p-8 text-center">
                    <Book className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No verses found for "{query}"</p>
                  </div>
                ) : null
              )}
              
              {query.length <= 1 && (
                <div className="p-8 text-center">
                  <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Start typing to search...</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Search across sermons, events, announcements, gallery photos, and Bible verses
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Press ESC to close</span>
                <span>Enter to select</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}