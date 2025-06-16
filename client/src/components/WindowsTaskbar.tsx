import { useState, useEffect } from "react";
import WindowsStartMenu from "./WindowsStartMenu";

interface TaskbarProps {
  openWindows: Array<{
    id: string;
    title: string;
    type: 'chat' | 'group' | 'buddy-list' | 'application';
    isMinimized: boolean;
  }>;
  onWindowRestore: (windowId: string) => void;
  onWindowMinimize: (windowId: string) => void;
  onShowDesktop: () => void;
  onOpenApplication: (appType: string) => void;
  onLogout: () => void;
  user: any;
}

export default function WindowsTaskbar({ 
  openWindows = [], 
  onWindowRestore, 
  onWindowMinimize,
  onShowDesktop,
  onOpenApplication,
  onLogout,
  user
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
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getWindowIcon = (type: string) => {
    switch (type) {
      case 'chat': return '💬';
      case 'group': return '👥';
      case 'buddy-list': return '👤';
      case 'application': return '📱';
      default: return '📱';
    }
  };

  const truncateTitle = (title: string, maxLength = 15) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <>
      {/* Windows Start Menu */}
      <WindowsStartMenu
        isOpen={showStartMenu}
        onClose={() => setShowStartMenu(false)}
        onOpenApplication={onOpenApplication}
        onShowDesktop={onShowDesktop}
        onLogout={onLogout}
        user={user}
      />

      {/* Windows XP Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-10 flex items-center px-2 text-white text-xs z-50"
           style={{
             background: 'linear-gradient(to bottom, #245cdc 0%, #1e3c72 100%)',
             borderTop: '1px solid #5c85d6'
           }}>
        
        {/* Start Button */}
        <button 
          className="h-8 px-3 rounded border font-bold text-white mr-2 shadow-md transition-all flex items-center space-x-1"
          onClick={() => setShowStartMenu(!showStartMenu)}
          style={{
            background: showStartMenu 
              ? 'linear-gradient(to bottom, #2d5016 0%, #4a7c28 100%)'
              : 'linear-gradient(to bottom, #4a7c28 0%, #2d5016 100%)',
            borderStyle: showStartMenu ? 'inset' : 'outset',
            borderColor: '#5dd184'
          }}
        >
          <span className="text-lg">🪟</span>
          <span>start</span>
        </button>

        {/* Taskbar Items */}
        <div className="flex-1 flex items-center space-x-1 mx-2 overflow-x-auto">
          {/* Open Windows */}
          {openWindows.map((window) => (
            <button
              key={window.id}
              onClick={() => window.isMinimized ? onWindowRestore(window.id) : onWindowMinimize(window.id)}
              className={`h-7 px-3 border rounded flex items-center space-x-2 text-xs font-medium transition-all duration-200 hover:bg-blue-400 ${
                window.isMinimized 
                  ? 'bg-blue-700 border-blue-600' 
                  : 'bg-blue-500 border-blue-400'
              }`}
              style={{
                minWidth: '120px',
                maxWidth: '200px'
              }}
            >
              <span className="text-base">{getWindowIcon(window.type)}</span>
              <span className="text-white truncate">{truncateTitle(window.title)}</span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onShowDesktop}
            className="h-6 px-2 border rounded text-white text-xs hover:bg-blue-400 transition-colors"
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderColor: 'rgba(255,255,255,0.2)'
            }}
          >
            Desktop
          </button>
          
          <div className="text-white text-xs text-center">
            <div className="font-bold">{formatTime(currentTime)}</div>
            <div className="text-xs opacity-80">{formatDate(currentTime)}</div>
          </div>
        </div>
      </div>
    </>
  );
}