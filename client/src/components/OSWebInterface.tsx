import { useEffect, useState, useRef } from 'react';
import OSWebBuddyList from './OSWebBuddyList';
import OSWebChatWindow from './OSWebChatWindow';

interface OSWebInterfaceProps {
  user: any;
  socket: WebSocket | null;
  onLogout: () => void;
}

export default function OSWebInterface({ user, socket, onLogout }: OSWebInterfaceProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [openWindows, setOpenWindows] = useState<{[key: string]: any}>({});
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [highestZIndex, setHighestZIndex] = useState(10);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatWindows, setChatWindows] = useState<{[key: string]: any}>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    document.body.className = isDarkMode ? '' : 'light-mode';
  }, [isDarkMode]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const launchApp = (appType: string, title: string) => {
    const windowId = `${appType}-${Date.now()}`;
    const newWindow = {
      id: windowId,
      type: appType,
      title,
      position: { x: 100 + Object.keys(openWindows).length * 30, y: 100 + Object.keys(openWindows).length * 30 },
      size: { width: 600, height: 400 },
      zIndex: highestZIndex + 1,
      isMinimized: false,
      isMaximized: false
    };
    
    setOpenWindows(prev => ({ ...prev, [windowId]: newWindow }));
    setActiveWindowId(windowId);
    setHighestZIndex(prev => prev + 1);
  };

  const closeWindow = (windowId: string) => {
    setOpenWindows(prev => {
      const newWindows = { ...prev };
      delete newWindows[windowId];
      return newWindows;
    });
    if (activeWindowId === windowId) {
      setActiveWindowId(null);
    }
  };

  const focusWindow = (windowId: string) => {
    setActiveWindowId(windowId);
    setHighestZIndex(prev => {
      const newZIndex = prev + 1;
      setOpenWindows(prevWindows => ({
        ...prevWindows,
        [windowId]: { ...prevWindows[windowId], zIndex: newZIndex }
      }));
      return newZIndex;
    });
  };

  const toggleMinimize = (windowId: string) => {
    setOpenWindows(prev => ({
      ...prev,
      [windowId]: { ...prev[windowId], isMinimized: !prev[windowId].isMinimized }
    }));
  };

  const toggleMaximize = (windowId: string) => {
    setOpenWindows(prev => ({
      ...prev,
      [windowId]: { ...prev[windowId], isMaximized: !prev[windowId].isMaximized }
    }));
  };

  const openChatWindow = (buddy: any) => {
    const chatId = `chat-${buddy.id}`;
    if (chatWindows[chatId]) {
      focusWindow(chatId);
      return;
    }

    const newChat = {
      id: chatId,
      type: 'chat',
      title: `Chat with ${buddy.screenName}`,
      buddy: buddy,
      position: { x: 150 + Object.keys(chatWindows).length * 30, y: 150 + Object.keys(chatWindows).length * 30 },
      size: { width: 400, height: 500 },
      zIndex: highestZIndex + 1,
      isMinimized: false,
      isMaximized: false
    };

    setChatWindows(prev => ({ ...prev, [chatId]: newChat }));
    setActiveWindowId(chatId);
    setHighestZIndex(prev => prev + 1);
  };

  const closeChatWindow = (chatId: string) => {
    setChatWindows(prev => {
      const newChats = { ...prev };
      delete newChats[chatId];
      return newChats;
    });
    if (activeWindowId === chatId) {
      setActiveWindowId(null);
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* CSS Variables and Styles */}
      <style>{`
        :root {
          --accent-color: #82AAFF; 
          --secondary-accent: #C3E88D; 
          --error-color: #FF5370;
          --warning-color: #FFCB6B; 
          --primary-bg: #1E1E1E; 
          --primary-bg-rgb: 30, 30, 30;
          --surface-bg: #2A2A2A; 
          --surface-bg-rgb: 42, 42, 42; 
          --surface-overlay-bg: rgba(255, 255, 255, 0.05); 
          --surface-active-bg: rgba(255, 255, 255, 0.08);
          --text-primary: #E0E0E0; 
          --text-secondary: #B0B0B0; 
          --border-color: rgba(255, 255, 255, 0.12);
          --icon-color: #B0B0B0;
          --disabled-opacity: 0.5;
          --dock-bg-opacity: 0.5;
          --window-content-bg: var(--surface-bg); 
        }
        
        body.light-mode {
          --primary-bg: #F4F6F8; 
          --primary-bg-rgb: 244, 246, 248;
          --surface-bg: #FFFFFF; 
          --surface-bg-rgb: 255, 255, 255;
          --surface-overlay-bg: rgba(0, 0, 0, 0.04); 
          --surface-active-bg: rgba(0, 0, 0, 0.08);
          --text-primary: #212121; 
          --text-secondary: #5F6368; 
          --border-color: rgba(0, 0, 0, 0.12);
          --icon-color: #5F6368;
          --warning-color: #FFA000; 
          --accent-color: #1976D2; 
          --secondary-accent: #4CAF50;
        }

        .surface-card { 
          background: var(--surface-bg);
          border: 1px solid var(--border-color);
          box-shadow: 0 2px 5px 0 rgba(0,0,0,0.2), 0 4px 12px 0 rgba(0,0,0,0.15);
          transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }
        
        .window {
          min-width: 320px; min-height: 240px; 
          transition: opacity 0.28s cubic-bezier(0.4, 0, 0.2, 1), transform 0.28s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.28s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, opacity;
          border-radius: 0.625rem; 
        }
        
        .window.focused {
          box-shadow: 0 0 0 2px var(--accent-color), 0 8px 24px rgba(0,0,0,0.3);
        }
        
        .window.minimized { display: none !important; }
        .window.maximized {
          top: 0 !important; left: 0 !important; width: 100% !important; height: 100% !important;
          border-radius: 0 !important; min-width: unset; min-height: unset;
        }

        .window-title-bar {
          cursor: grab; user-select: none;
          background-color: rgba(0,0,0,0.1); 
          padding: 0.5rem 0.75rem; height: 2.75rem; 
          border-bottom: 1px solid var(--border-color);
          display: flex; align-items: center; justify-content: space-between;
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }
        
        .top-panel-item, .dock-icon, .window-control {
          transition: background-color 0.18s cubic-bezier(0.4, 0, 0.2, 1), color 0.18s cubic-bezier(0.4, 0, 0.2, 1), transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.18s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 0.375rem; 
          color: var(--icon-color);
          padding: 0.375rem 0.625rem; 
        }
        
        .top-panel-item:hover, .dock-icon:hover, .window-control:hover {
          background-color: var(--surface-overlay-bg);
          color: var(--accent-color);
          transform: translateY(-1px); 
        }
      `}</style>

      {/* Wallpaper */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: isDarkMode 
            ? 'linear-gradient(145deg, #0D0D0D 0%, #1A1A1A 50%, #2C2C2C 100%)' 
            : 'linear-gradient(145deg, #E8EAF6 0%, #C5CAE9 70%, #9FA8DA 100%)',
          transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      />

      {/* Top Panel */}
      <header className="surface-card h-14 w-full px-4 flex items-center justify-between z-50 flex-shrink-0 !shadow-md !border-0 !border-b !border-[var(--border-color)]">
        <div className="flex items-center space-x-2">
          <button 
            className="top-panel-item p-2.5 rounded-full focus:outline-none" 
            title="App Launcher"
            onClick={() => launchApp('app-launcher', 'Applications')}
          >
            <i className="fas fa-th-large text-lg"></i>
          </button>
          <button className="top-panel-item p-2.5 rounded-full focus:outline-none" title="Show Desktop">
            <i className="fas fa-desktop text-lg"></i>
          </button>
          <button className="top-panel-item p-2.5 rounded-full focus:outline-none" title="Overview">
            <i className="fas fa-layer-group text-lg"></i>
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-sm font-medium text-[var(--text-primary)]">
            {formatTime(currentTime)}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--icon-color)] text-sm"></i>
            <input 
              type="search" 
              placeholder="Search..." 
              className="bg-[var(--surface-overlay-bg)] border border-transparent text-sm rounded-full py-2 px-4 pl-10 w-40 focus:w-48 transition-all duration-300 outline-none placeholder-[var(--text-secondary)] focus:ring-1 focus:ring-[var(--accent-color)] focus:border-transparent focus:bg-[var(--surface-active-bg)]"
            />
          </div>
          <button 
            className="top-panel-item p-2.5 rounded-full" 
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            <i className={`fas ${isDarkMode ? 'fa-moon' : 'fa-sun'} text-base`}></i>
          </button>
          <button 
            className="top-panel-item p-2.5 rounded-full focus:outline-none" 
            title="Control Panel"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <i className="fas fa-sliders-h text-base"></i>
          </button>
          <button 
            className="top-panel-item p-1.5 rounded-full" 
            title="User Account"
            onClick={onLogout}
          >
            <img 
              src={`https://placehold.co/32x32/82AAFF/1E1E1E?text=${user?.screenName?.charAt(0) || 'U'}&font=roboto`} 
              alt="User" 
              className="rounded-full h-8 w-8"
            />
          </button>
        </div>
      </header>

      {/* Desktop Area */}
      <main className="flex-grow p-4 relative overflow-hidden flex items-center justify-center">
        {/* Desktop Icons */}
        <div 
          className="absolute top-12 left-12 w-20 h-20 flex flex-col items-center justify-center text-center cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-[var(--surface-overlay-bg)]"
          onClick={() => launchApp('buddy-list', 'Buddy List')}
        >
          <i className="fas fa-users text-3xl text-[var(--accent-color)] mb-1"></i>
          <span className="text-xs text-[var(--text-primary)]">Buddy List</span>
        </div>

        <div 
          className="absolute top-12 left-40 w-20 h-20 flex flex-col items-center justify-center text-center cursor-pointer p-2 rounded-lg transition-colors duration-200 hover:bg-[var(--surface-overlay-bg)]"
          onClick={() => launchApp('chat', 'Chat')}
        >
          <i className="fas fa-comments text-3xl text-[var(--accent-color)] mb-1"></i>
          <span className="text-xs text-[var(--text-primary)]">Chat</span>
        </div>

        {/* Regular Windows */}
        {Object.values(openWindows).map((window: any) => (
          <OSWebWindow
            key={window.id}
            window={window}
            isActive={activeWindowId === window.id}
            onClose={() => closeWindow(window.id)}
            onFocus={() => focusWindow(window.id)}
            onMinimize={() => toggleMinimize(window.id)}
            onMaximize={() => toggleMaximize(window.id)}
            user={user}
            socket={socket}
            onOpenChat={openChatWindow}
            onCloseChatWindow={closeChatWindow}
          />
        ))}

        {/* Chat Windows */}
        {Object.values(chatWindows).map((chatWindow: any) => (
          <OSWebWindow
            key={chatWindow.id}
            window={chatWindow}
            isActive={activeWindowId === chatWindow.id}
            onClose={() => closeChatWindow(chatWindow.id)}
            onFocus={() => focusWindow(chatWindow.id)}
            onMinimize={() => toggleMinimize(chatWindow.id)}
            onMaximize={() => toggleMaximize(chatWindow.id)}
            user={user}
            socket={socket}
            onOpenChat={openChatWindow}
            onCloseChatWindow={closeChatWindow}
          />
        ))}
      </main>

      {/* Dock */}
      <nav className="surface-card w-max mx-auto mb-3 px-3 py-2 rounded-2xl flex items-center space-x-2 z-50 flex-shrink-0 !shadow-lg">
        {Object.values(openWindows).map((window: any) => (
          <button
            key={window.id}
            className={`dock-icon p-2 rounded-lg transition-all ${
              activeWindowId === window.id ? 'bg-[var(--surface-active-bg)] border-b-2 border-[var(--accent-color)]' : ''
            }`}
            onClick={() => window.isMinimized ? toggleMinimize(window.id) : focusWindow(window.id)}
            title={window.title}
          >
            <i className={`fas ${getWindowIcon(window.type)} text-lg`}></i>
          </button>
        ))}
        
        <div className="w-px h-6 bg-[var(--border-color)] mx-2"></div>
        
        <button 
          className="dock-icon p-2 rounded-lg"
          onClick={() => launchApp('buddy-list', 'Buddy List')}
          title="Buddy List"
        >
          <i className="fas fa-users text-lg"></i>
        </button>
        
        <button 
          className="dock-icon p-2 rounded-lg"
          onClick={() => launchApp('settings', 'Settings')}
          title="Settings"
        >
          <i className="fas fa-cog text-lg"></i>
        </button>
      </nav>

      {/* Right Sidebar */}
      {sidebarOpen && (
        <aside className="surface-card fixed top-16 right-0 h-[calc(100vh-4rem)] w-80 p-5 space-y-3 transform transition-transform duration-300 ease-out z-40 !shadow-xl overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Control Panel</h2>
            <button 
              className="top-panel-item p-1"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Theme</h3>
              <button 
                className="w-full p-3 rounded-lg bg-[var(--surface-overlay-bg)] hover:bg-[var(--surface-active-bg)] transition-colors"
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                <i className={`fas ${isDarkMode ? 'fa-moon' : 'fa-sun'} mr-2`}></i>
                {isDarkMode ? 'Dark Mode' : 'Light Mode'}
              </button>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">User</h3>
              <div className="p-3 rounded-lg bg-[var(--surface-overlay-bg)]">
                <div className="flex items-center space-x-3">
                  <img 
                    src={`https://placehold.co/40x40/82AAFF/1E1E1E?text=${user?.screenName?.charAt(0) || 'U'}&font=roboto`} 
                    alt="User" 
                    className="rounded-full h-10 w-10"
                  />
                  <div>
                    <div className="font-medium text-[var(--text-primary)]">{user?.screenName}</div>
                    <div className="text-sm text-[var(--text-secondary)]">Online</div>
                  </div>
                </div>
                <button 
                  className="w-full mt-3 p-2 rounded-lg bg-[var(--error-color)] hover:bg-red-600 text-white transition-colors"
                  onClick={onLogout}
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}

function getWindowIcon(type: string): string {
  switch (type) {
    case 'buddy-list': return 'fa-users';
    case 'chat': return 'fa-comments';
    case 'settings': return 'fa-cog';
    case 'app-launcher': return 'fa-th-large';
    default: return 'fa-window-maximize';
  }
}

interface OSWebWindowProps {
  window: any;
  isActive: boolean;
  onClose: () => void;
  onFocus: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  user: any;
  socket: WebSocket | null;
  onOpenChat: (buddy: any) => void;
  onCloseChatWindow: (chatId: string) => void;
}

function OSWebWindow({ 
  window, 
  isActive, 
  onClose, 
  onFocus, 
  onMinimize, 
  onMaximize,
  user,
  socket,
  onOpenChat,
  onCloseChatWindow
}: OSWebWindowProps) {
  const [position, setPosition] = useState(window.position);
  const [size, setSize] = useState(window.size);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (window.isMaximized) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
    onFocus();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragOffset.x)),
        y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragOffset.y))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, size]);

  const renderWindowContent = () => {
    switch (window.type) {
      case 'buddy-list':
        return <OSWebBuddyList user={user} socket={socket} onOpenChat={onOpenChat} />;
      case 'chat':
        return window.buddy ? (
          <OSWebChatWindow 
            user={user} 
            buddy={window.buddy} 
            socket={socket} 
            onClose={() => onCloseChatWindow(window.id)}
          />
        ) : <div className="p-4 text-[var(--text-primary)]">Chat loading...</div>;
      case 'settings':
        return <OSWebSettings />;
      case 'app-launcher':
        return <OSWebAppLauncher />;
      default:
        return <div className="p-4 text-[var(--text-primary)]">Coming soon...</div>;
    }
  };

  return (
    <div
      className={`window surface-card fixed ${isActive ? 'focused' : ''} ${window.isMinimized ? 'minimized' : ''} ${window.isMaximized ? 'maximized' : ''}`}
      style={{
        left: window.isMaximized ? 0 : position.x,
        top: window.isMaximized ? 0 : position.y,
        width: window.isMaximized ? '100%' : size.width,
        height: window.isMaximized ? '100%' : size.height,
        zIndex: window.zIndex
      }}
      onClick={onFocus}
    >
      <div 
        className="window-title-bar"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center">
          <i className={`fas ${getWindowIcon(window.type)} text-[var(--accent-color)] mr-2`}></i>
          <span className="font-medium text-sm text-[var(--text-primary)]">{window.title}</span>
        </div>
        <div className="flex items-center space-x-1">
          <button 
            className="window-control p-1 rounded hover:bg-[var(--surface-overlay-bg)]"
            onClick={onMinimize}
          >
            <i className="fas fa-minus text-xs"></i>
          </button>
          <button 
            className="window-control p-1 rounded hover:bg-[var(--surface-overlay-bg)]"
            onClick={onMaximize}
          >
            <i className={`fas ${window.isMaximized ? 'fa-compress' : 'fa-expand'} text-xs`}></i>
          </button>
          <button 
            className="window-control p-1 rounded hover:bg-[var(--error-color)] hover:text-white"
            onClick={onClose}
          >
            <i className="fas fa-times text-xs"></i>
          </button>
        </div>
      </div>
      <div className="window-content flex-1 overflow-hidden">
        {renderWindowContent()}
      </div>
    </div>
  );
}

// Placeholder components for OSWeb applications

function OSWebSettings() {
  return (
    <div className="p-4 h-full">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Settings</h3>
      <div className="text-[var(--text-secondary)]">
        Settings interface coming soon...
      </div>
    </div>
  );
}

function OSWebAppLauncher() {
  return (
    <div className="p-4 h-full">
      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Applications</h3>
      <div className="grid grid-cols-4 gap-4">
        {['Calculator', 'Notepad', 'File Manager', 'Terminal', 'Music Player', 'Email'].map((app) => (
          <div 
            key={app}
            className="flex flex-col items-center p-3 rounded-lg bg-[var(--surface-overlay-bg)] hover:bg-[var(--surface-active-bg)] cursor-pointer transition-colors"
          >
            <i className="fas fa-cube text-2xl text-[var(--accent-color)] mb-2"></i>
            <span className="text-xs text-[var(--text-primary)]">{app}</span>
          </div>
        ))}
      </div>
    </div>
  );
}