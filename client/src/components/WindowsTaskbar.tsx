import { useState, useEffect } from "react";

interface TaskbarProps {
  openWindows: Array<{
    id: string;
    title: string;
    type: 'chat' | 'group' | 'buddy-list';
    isMinimized: boolean;
  }>;
  onWindowRestore: (windowId: string) => void;
  onWindowMinimize: (windowId: string) => void;
  onShowDesktop: () => void;
}

export default function WindowsTaskbar({ 
  openWindows = [], 
  onWindowRestore, 
  onWindowMinimize,
  onShowDesktop 
}: TaskbarProps) {
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

  const getWindowIcon = (type: string) => {
    switch (type) {
      case 'chat': return '💬';
      case 'group': return '👥';
      case 'buddy-list': return '👤';
      default: return '📱';
    }
  };

  const truncateTitle = (title: string, maxLength = 15) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <>
      {/* Start Menu */}
      {showStartMenu && (
        <div className="fixed bottom-10 left-0 w-80 h-96 bg-gradient-to-b from-blue-500 to-blue-700 border-2 border-blue-300 rounded-tr-lg shadow-2xl z-50">
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
          <div className="flex-1 flex items-center space-x-1 mx-2 overflow-x-auto">
            {/* AIM Main Application */}
            <div className="h-5 px-2 border rounded-sm flex items-center space-x-1 cursor-pointer hover:bg-blue-400 transition-colors"
                 style={{ background: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <div className="w-3 h-3 rounded-sm flex items-center justify-center"
                   style={{ background: '#ffeb3b' }}>
                <span className="text-blue-800 text-xs font-bold">A</span>
              </div>
              <span className="text-white text-xs font-medium">AOL Instant Messenger</span>
            </div>

            {/* Open Windows */}
            {openWindows.map((window) => (
              <button
                key={window.id}
                onClick={() => window.isMinimized ? onWindowRestore(window.id) : onWindowMinimize(window.id)}
                className={`h-5 px-2 border rounded-sm flex items-center space-x-1 text-xs font-medium transition-all duration-200 hover:bg-blue-400 ${
                  window.isMinimized ? 'bg-gray-400 bg-opacity-60' : 'bg-blue-300 bg-opacity-80'
                }`}
                style={{ 
                  borderColor: window.isMinimized ? 'rgba(200,200,200,0.5)' : 'rgba(255,255,255,0.4)',
                  maxWidth: '140px'
                }}
                title={window.title}
              >
                <span className="text-sm">{getWindowIcon(window.type)}</span>
                <span className="text-white truncate">
                  {truncateTitle(window.title)}
                </span>
              </button>
            ))}
          </div>

          {/* System Tray */}
          <div className="flex items-center space-x-2">
            {/* Show Desktop Button */}
            <button 
              onClick={onShowDesktop}
              className="w-4 h-5 border border-gray-300 hover:bg-gray-200 transition-colors flex items-center justify-center"
              style={{ 
                background: 'linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 50%, #d0d0d0 100%)',
                borderColor: '#999'
              }}
              title="Show Desktop"
            >
              <div className="w-2 h-2 border border-gray-600" style={{ borderColor: '#666' }}></div>
            </button>
            
            {/* System Tray Icons */}
            <div className="flex items-center space-x-1 px-2 h-5 border rounded-sm"
                 style={{ background: 'rgba(0,0,0,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}>
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-green-400 rounded-sm shadow-sm" title="Network Connection"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-sm shadow-sm" title="Volume"></div>
                <div className="w-3 h-3 bg-blue-400 rounded-sm shadow-sm" title="AIM Online"></div>
              </div>
              
              {/* Clock */}
              <div className="text-white text-xs font-medium ml-2">
                <div className="leading-none">{formatTime(currentTime)}</div>
                <div className="text-xs opacity-80 leading-none">{formatDate(currentTime)}</div>
              </div>
            </div>
          </div>
        </div>
    </>
  );
}