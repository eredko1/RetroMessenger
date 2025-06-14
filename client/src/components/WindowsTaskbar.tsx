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

        <div className="fixed bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-blue-600 to-blue-700 border-t-2 border-blue-400 flex items-center justify-between px-1 z-50">
          {/* Start Button */}
          <div className="flex items-center">
            <button 
              onClick={() => setShowStartMenu(!showStartMenu)}
              className="h-6 px-3 bg-gradient-to-r from-green-500 to-green-600 border border-green-700 rounded-sm flex items-center space-x-1 hover:from-green-400 hover:to-green-500 active:from-green-600 active:to-green-700"
            >
              <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-blue-600 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">⊞</span>
              </div>
              <span className="text-white font-bold text-xs">start</span>
            </button>
          </div>

          {/* Taskbar Items */}
          <div className="flex-1 flex items-center space-x-1 mx-2">
            <div className="h-6 px-2 bg-blue-800 border border-blue-900 rounded-sm flex items-center space-x-1">
              <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs">A</span>
              </div>
              <span className="text-white text-xs">AOL Instant Messenger</span>
            </div>
          </div>

          {/* System Tray */}
          <div className="flex items-center space-x-2 bg-blue-500 border border-blue-700 px-2 h-6 rounded-sm">
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