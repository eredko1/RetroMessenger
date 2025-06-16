import { useState, useRef, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import WindowComponent from './WindowComponent';

interface InternetExplorerProps {
  onClose: () => void;
  onMinimize?: () => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  instanceId?: string;
  appType?: string;
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onFocus?: () => void;
}

export default function InternetExplorer({ 
  onClose, 
  onMinimize, 
  position, 
  size, 
  zIndex, 
  instanceId,
  appType = 'internet-explorer',
  onMove,
  onResize,
  onFocus
}: InternetExplorerProps) {
  // URL mappings for different app types
  const getInitialUrl = (type: string) => {
    const urlMap: { [key: string]: string } = {
      'internet-explorer': 'https://www.google.com',
      'google-drive': 'https://drive.google.com',
      'telegram': 'https://web.telegram.org',
      'replit': 'https://replit.com',
      'openai': 'https://chat.openai.com',
      'gemini': 'https://gemini.google.com'
    };
    return urlMap[type] || 'https://www.google.com';
  };

  const initialUrl = getInitialUrl(appType);
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [urlInput, setUrlInput] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [bookmarks, setBookmarks] = useState<Array<{title: string, url: string}>>([
    { title: 'Google', url: 'https://www.google.com' },
    { title: 'Replit', url: 'https://replit.com' },
    { title: 'OpenAI', url: 'https://chat.openai.com' },
    { title: 'Gemini', url: 'https://gemini.google.com' },
    { title: 'GitHub', url: 'https://github.com' },
    { title: 'Stack Overflow', url: 'https://stackoverflow.com' }
  ]);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Browser history persistence
  const saveBrowserHistory = useMutation({
    mutationFn: async (data: { url: string; title: string; userId: number; type: 'history' }) => {
      return await apiRequest('/api/browser-data', {
        method: 'POST',
        body: data
      });
    }
  });

  const handleNavigate = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setIsLoading(true);
    setCurrentUrl(url);
    setUrlInput(url);
    
    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(url);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanGoBack(newHistory.length > 1);
    setCanGoForward(false);
    
    // Save to database
    saveBrowserHistory.mutate({
      url,
      title: url,
      userId: 12, // TODO: Get from current user
      type: 'history'
    });
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigate(urlInput);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      setCurrentUrl(url);
      setUrlInput(url);
      setCanGoBack(newIndex > 0);
      setCanGoForward(true);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      setCurrentUrl(url);
      setUrlInput(url);
      setCanGoBack(true);
      setCanGoForward(newIndex < history.length - 1);
    }
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = currentUrl;
      setIsLoading(true);
    }
  };

  const handleHome = () => {
    handleNavigate('https://www.google.com');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        const iframeUrl = iframeRef.current.contentWindow.location.href;
        if (iframeUrl !== 'about:blank') {
          setCurrentUrl(iframeUrl);
          setUrlInput(iframeUrl);
        }
      }
    } catch (error) {
      // Cross-origin restrictions prevent access to iframe URL
      console.log('Cannot access iframe URL due to CORS policy');
    }
  };

  return (
    <WindowComponent
      title={`Internet Explorer - ${currentUrl}`}
      position={position}
      size={size}
      zIndex={zIndex}
      onClose={onClose}
      onMinimize={onMinimize}
      onMove={onMove}
      onResize={onResize}
      onFocus={onFocus}
      className="bg-gray-100"
    >
      <div className="flex flex-col h-full">
        {/* Menu Bar */}
        <div className="bg-gray-200 border-b border-gray-300 px-2 py-1">
          <div className="flex items-center text-xs space-x-4">
            <div className="relative group">
              <span className="font-bold cursor-pointer hover:bg-blue-500 hover:text-white px-2 py-1">File</span>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-gray-400 shadow-lg z-10 min-w-40">
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">New Window</div>
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Save Page As...</div>
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Print</div>
                <hr className="my-1" />
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={onClose}>Exit</div>
              </div>
            </div>
            <div className="relative group">
              <span className="font-bold cursor-pointer hover:bg-blue-500 hover:text-white px-2 py-1">Edit</span>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-gray-400 shadow-lg z-10 min-w-32">
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Copy</div>
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Paste</div>
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Find</div>
              </div>
            </div>
            <div className="relative group">
              <span className="font-bold cursor-pointer hover:bg-blue-500 hover:text-white px-2 py-1">View</span>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-gray-400 shadow-lg z-10 min-w-32">
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Source</div>
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Full Screen</div>
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Zoom</div>
              </div>
            </div>
            <div className="relative group">
              <span className="font-bold cursor-pointer hover:bg-blue-500 hover:text-white px-2 py-1" onClick={() => setShowBookmarks(!showBookmarks)}>Favorites</span>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-gray-400 shadow-lg z-10 min-w-48">
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={() => setBookmarks([...bookmarks, {title: currentUrl, url: currentUrl}])}>Add to Favorites</div>
                <hr className="my-1" />
                {bookmarks.map((bookmark, idx) => (
                  <div key={idx} className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={() => handleNavigate(bookmark.url)}>
                    {bookmark.title}
                  </div>
                ))}
              </div>
            </div>
            <div className="relative group">
              <span className="font-bold cursor-pointer hover:bg-blue-500 hover:text-white px-2 py-1">Tools</span>
              <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-gray-400 shadow-lg z-10 min-w-32">
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={() => setShowHistory(!showHistory)}>History</div>
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Downloads</div>
                <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Internet Options</div>
              </div>
            </div>
            <span className="font-bold cursor-pointer hover:bg-blue-500 hover:text-white px-2 py-1">Help</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-gray-200 border-b border-gray-300 p-2">
          <div className="flex items-center space-x-2">
            {/* Navigation Buttons */}
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className="px-3 py-1 bg-gray-100 border border-gray-400 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
              style={{ borderStyle: 'outset' }}
            >
              ◀ Back
            </button>
            <button
              onClick={handleForward}
              disabled={!canGoForward}
              className="px-3 py-1 bg-gray-100 border border-gray-400 rounded text-xs hover:bg-gray-50 disabled:opacity-50"
              style={{ borderStyle: 'outset' }}
            >
              Forward ▶
            </button>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 bg-gray-100 border border-gray-400 rounded text-xs hover:bg-gray-50"
              style={{ borderStyle: 'outset' }}
            >
              🔄 Refresh
            </button>
            <button
              onClick={handleHome}
              className="px-3 py-1 bg-gray-100 border border-gray-400 rounded text-xs hover:bg-gray-50"
              style={{ borderStyle: 'outset' }}
            >
              🏠 Home
            </button>

            {/* Address Bar */}
            <div className="flex-1 flex items-center space-x-2">
              <span className="text-xs font-bold">Address:</span>
              <form onSubmit={handleUrlSubmit} className="flex-1">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="w-full px-2 py-1 border border-gray-400 text-xs"
                  style={{ borderStyle: 'inset' }}
                />
              </form>
            </div>

            {/* Go Button */}
            <button
              onClick={() => handleNavigate(urlInput)}
              className="px-3 py-1 bg-gray-100 border border-gray-400 rounded text-xs hover:bg-gray-50"
              style={{ borderStyle: 'outset' }}
            >
              Go
            </button>
          </div>
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="bg-yellow-100 border-b border-yellow-300 px-2 py-1">
            <div className="flex items-center space-x-2">
              <div className="animate-spin text-xs">⟳</div>
              <span className="text-xs">Loading...</span>
            </div>
          </div>
        )}

        {/* Web Content */}
        <div className="flex-1 bg-white">
          <iframe
            ref={iframeRef}
            src={currentUrl}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
            title="Internet Explorer Content"
          />
        </div>

        {/* Status Bar */}
        <div className="bg-gray-200 border-t border-gray-300 px-2 py-1">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-4">
              <span>Ready</span>
              <span>Internet</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>🔒 {isLoading ? 'Connecting...' : 'Done'}</span>
            </div>
          </div>
        </div>
      </div>
    </WindowComponent>
  );
}