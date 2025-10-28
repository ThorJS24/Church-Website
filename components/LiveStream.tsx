'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, X, Users, MessageCircle } from 'lucide-react';

interface LiveStreamProps {
  streamUrl?: string;
  isLive?: boolean;
  viewerCount?: number;
}

export default function LiveStream({ streamUrl, isLive = false, viewerCount = 0 }: LiveStreamProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'John D.', message: 'Praise the Lord! 🙏', time: '10:30 AM' },
    { id: 2, user: 'Sarah M.', message: 'Beautiful service today', time: '10:32 AM' },
    { id: 3, user: 'Mike R.', message: 'Amen! God bless', time: '10:35 AM' }
  ]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now(),
        user: 'You',
        message: chatMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages([...chatMessages, newMessage]);
      setChatMessage('');
    }
  };

  if (!isLive && !streamUrl) {
    return (
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg text-center">
        <Play className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold mb-2">No Live Stream</h3>
        <p className="text-blue-100">Join us for our next live service</p>
        <p className="text-sm text-blue-200 mt-2">Sundays at 10:00 AM</p>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-black rounded-lg overflow-hidden shadow-2xl ${
          isFullscreen ? 'fixed inset-0 z-50' : 
          isMinimized ? 'fixed bottom-4 right-4 w-80 h-48 z-40' : 
          'relative w-full'
        }`}
      >
        {/* Live Indicator */}
        {isLive && (
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center">
              <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              LIVE
            </div>
          </div>
        )}

        {/* Viewer Count */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm flex items-center">
            <Users className="w-4 h-4 mr-1" />
            {viewerCount.toLocaleString()}
          </div>
        </div>

        {/* Video Container */}
        <div className={`relative ${isMinimized ? 'h-32' : 'aspect-video'} bg-gray-900`}>
          {streamUrl ? (
            <iframe
              src={streamUrl}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center text-white">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Stream Starting Soon...</p>
              </div>
            </div>
          )}

          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handlePlayPause}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                
                <button
                  onClick={handleMute}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                </button>

                <div className="text-white text-sm">
                  {isLive ? 'Live Stream' : 'Recorded Service'}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowChat(!showChat)}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>

                {!isFullscreen && (
                  <button
                    onClick={handleMinimize}
                    className="text-white hover:text-blue-400 transition-colors"
                  >
                    <Minimize className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={handleFullscreen}
                  className="text-white hover:text-blue-400 transition-colors"
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </button>

                {isMinimized && (
                  <button
                    onClick={() => setIsMinimized(false)}
                    className="text-white hover:text-red-400 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute right-0 top-0 bottom-0 w-80 bg-gray-800 border-l border-gray-700"
          >
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Live Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 h-64">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-blue-400 font-medium">{msg.user}</span>
                    <span className="text-gray-500 text-xs">{msg.time}</span>
                  </div>
                  <p className="text-gray-300">{msg.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}