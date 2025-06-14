import { useState, useEffect } from "react";

export default function WindowsTaskbar() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showStartMenu, setShowStartMenu] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      {/* Start Menu */}
      {showStartMenu && (
        <div className="fixed bottom-8 left-0 w-80 h-96 bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-300 rounded-tr-lg shadow-2xl z-50">
          <div className="h-16 bg-gradient-to-r from-blue-600 to-blue-400 flex items-center px-4 rounded-tr-lg">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600 font-bold text-lg">👤</span>
            </div>
            <span className="text-white font-bold">Administrator</span>
          </div>
          <div className="p-3 text-white space-y-1">
            <div className="hover:bg-blue-600 p-2 rounded cursor-pointer flex items-center text-sm">
              <span className="mr-3 text-base">📁</span>My Documents
            </div>
            <div className="hover:bg-blue-600 p-2 rounded cursor-pointer flex items-center text-sm">
              <span className="mr-3 text-base">🖼️</span>My Pictures
            </div>
            <div className="hover:bg-blue-600 p-2 rounded cursor-pointer flex items-center text-sm">
              <span className="mr-3 text-base">🎵</span>My Music
            </div>
            <div className="hover:bg-blue-600 p-2 rounded cursor-pointer flex items-center text-sm">
              <span className="mr-3 text-base">💻</span>My Computer
            </div>
            <div className="border-t border-blue-400 pt-2 mt-2">
              <div className="hover:bg-blue-600 p-2 rounded cursor-pointer flex items-center text-sm">
                <span className="mr-3 text-base">🔧</span>Control Panel
              </div>
              <div className="hover:bg-blue-600 p-2 rounded cursor-pointer flex items-center text-sm">
                <span className="mr-3 text-base">🔍</span>Search
              </div>
              <div className="hover:bg-blue-600 p-2 rounded cursor-pointer flex items-center text-sm">
                <span className="mr-3 text-base">❓</span>Help and Support
              </div>
            </div>
            <div className="border-t border-blue-400 pt-2 mt-2">
              <div className="hover:bg-red-600 p-2 rounded cursor-pointer flex items-center text-sm">
                <span className="mr-3 text-base">🔌</span>Turn Off Computer
              </div>
            </div>
          </div>
        </div>
      )}

        <div className="fixed bottom-0 left-0 right-0 h-7 border-t flex items-center justify-between px-1 z-50" 
             style={{ 
               background: 'linear-gradient(to bottom, #245edb 0%, #1941a5 3%, #245edb 6%, #4584ff 50%, #245edb 94%, #1941a5 97%, #245edb 100%)',
               borderTopColor: '#5d9cff'
             }}>
          {/* Authentic XP Start Button */}
          <div className="flex items-center">
            <button 
              onClick={() => setShowStartMenu(!showStartMenu)}
              className="h-6 px-3 text-white font-bold text-xs flex items-center space-x-1 border rounded-sm"
              style={{
                background: 'linear-gradient(to bottom, #44c767 0%, #2d8f47 3%, #44c767 6%, #5dd184 50%, #44c767 94%, #2d8f47 97%, #44c767 100%)',
                borderColor: '#5dd184'
              }}
            >
              <div className="w-3 h-3 rounded-sm flex items-center justify-center"
                   style={{ background: 'linear-gradient(45deg, #ff4444 0%, #4444ff 100%)' }}>
                <span className="text-white" style={{ fontSize: '8px' }}>⊞</span>
              </div>
              <span>start</span>
            </button>
          </div>

          {/* Taskbar Items */}
          <div className="flex-1 flex items-center space-x-1 mx-2">
            <div className="h-5 px-2 border rounded-sm flex items-center space-x-1"
                 style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <div className="w-3 h-3 rounded-sm flex items-center justify-center"
                   style={{ background: '#ffeb3b' }}>
                <span className="text-blue-800 text-xs font-bold">A</span>
              </div>
              <span className="text-white text-xs">AOL Instant Messenger</span>
            </div>
          </div>

          {/* System Tray */}
          <div className="flex items-center space-x-1 px-1 h-5 border rounded-sm"
               style={{ background: 'rgba(0,0,0,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-400 rounded-sm" title="Network Connection"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-sm" title="Volume"></div>
              <div className="w-3 h-3 bg-blue-400 rounded-sm" title="AIM"></div>
            </div>
            <div className="text-white text-xs">
              <div>{formatTime(currentTime)}</div>
              <div className="text-xs opacity-80">{formatDate(currentTime)}</div>
            </div>
          </div>
        </div>
    </>
  );
}