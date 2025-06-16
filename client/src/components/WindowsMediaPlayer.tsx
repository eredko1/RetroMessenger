import { useState } from 'react';
import WindowComponent from './WindowComponent';

interface WindowsMediaPlayerProps {
  onClose: () => void;
  onMinimize?: () => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  instanceId?: string;
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onFocus?: () => void;
}

export default function WindowsMediaPlayer({ 
  onClose, 
  onMinimize, 
  position, 
  size, 
  zIndex, 
  instanceId,
  onMove,
  onResize,
  onFocus
}: WindowsMediaPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <WindowComponent
      title="Windows Media Player"
      onClose={onClose}
      onMinimize={onMinimize}
      position={position}
      size={size}
      zIndex={zIndex}
      onMove={onMove}
      onResize={onResize}
      onFocus={onFocus}
      className="bg-black"
    >
      <div className="h-full flex flex-col bg-black text-white">
        {/* Menu Bar */}
        <div className="bg-gray-800 border-b border-gray-600 px-2 py-1">
          <div className="flex items-center text-xs space-x-4">
            <span className="text-white font-bold cursor-pointer hover:bg-gray-700 px-2 py-1">File</span>
            <span className="text-white font-bold cursor-pointer hover:bg-gray-700 px-2 py-1">View</span>
            <span className="text-white font-bold cursor-pointer hover:bg-gray-700 px-2 py-1">Play</span>
            <span className="text-white font-bold cursor-pointer hover:bg-gray-700 px-2 py-1">Tools</span>
            <span className="text-white font-bold cursor-pointer hover:bg-gray-700 px-2 py-1">Help</span>
          </div>
        </div>

        {/* Video/Visualization Area */}
        <div className="flex-1 bg-black flex items-center justify-center relative">
          <div className="text-center">
            {!isPlaying ? (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-white" style={{ clipPath: 'polygon(0 0, 100% 50%, 0 100%)' }}></div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">Ready</div>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center animate-pulse">
                  <div className="text-white text-lg font-bold">♪♫♪</div>
                </div>
                <div className="text-orange-400 text-sm">Playing Audio</div>
              </div>
            )}
          </div>

          {/* Classic WMP Visualization Bars */}
          {isPlaying && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-orange-600 to-yellow-400 rounded-sm animate-pulse"
                  style={{
                    height: `${Math.random() * 40 + 10}px`,
                    animationDelay: `${i * 50}ms`,
                    animationDuration: `${500 + Math.random() * 500}ms`
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Control Panel */}
        <div className="bg-gradient-to-b from-gray-700 to-gray-800 border-t border-gray-600 p-3">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-gray-300">{formatTime(currentTime)}</span>
              <div className="flex-1 bg-gray-900 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 h-full rounded-full transition-all"
                  style={{ width: `${(currentTime / 180) * 100}%` }}
                />
              </div>
              <span className="text-gray-300">3:00</span>
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center space-x-4 mb-3">
            <button className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded flex items-center justify-center text-white">
              ⏮
            </button>
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 bg-orange-600 hover:bg-orange-500 rounded-full flex items-center justify-center text-white font-bold"
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded flex items-center justify-center text-white">
              ⏹
            </button>
            <button className="w-8 h-8 bg-gray-600 hover:bg-gray-500 rounded flex items-center justify-center text-white">
              ⏭
            </button>
          </div>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className="text-white hover:text-orange-400"
            >
              {isMuted || volume === 0 ? '🔇' : volume < 50 ? '🔉' : '🔊'}
            </button>
            <div className="flex-1 bg-gray-900 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-yellow-500 h-full rounded-full"
                style={{ width: `${isMuted ? 0 : volume}%` }}
              />
            </div>
            <span className="text-xs text-gray-300 w-8">{isMuted ? 0 : volume}</span>
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-gray-900 border-t border-gray-700 px-3 py-1 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Ready</span>
            <span>Windows Media Player</span>
          </div>
        </div>
      </div>
    </WindowComponent>
  );
}