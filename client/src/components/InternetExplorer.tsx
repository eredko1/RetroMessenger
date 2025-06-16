import { useState, useRef, useEffect } from 'react';
import WindowComponent from './WindowComponent';

interface InternetExplorerProps {
  onClose: () => void;
  onMinimize?: () => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  instanceId?: string;
}

export default function InternetExplorer({ 
  onClose, 
  onMinimize, 
  position, 
  size, 
  zIndex, 
  instanceId 
}: InternetExplorerProps) {
  const [currentUrl, setCurrentUrl] = useState('https://www.google.com');
  const [urlInput, setUrlInput] = useState('https://www.google.com');
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNavigate = (url: string) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    setIsLoading(true);
    setCurrentUrl(url);
    setUrlInput(url);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigate(urlInput);
  };

  const handleBack = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.history.back();
    }
  };

  const handleForward = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.history.forward();
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
      className="bg-gray-100"
    >
      <div className="flex flex-col h-full">
        {/* Menu Bar */}
        <div className="bg-gray-200 border-b border-gray-300 px-2 py-1">
          <div className="flex items-center text-xs space-x-4">
            <span className="font-bold">File</span>
            <span className="font-bold">Edit</span>
            <span className="font-bold">View</span>
            <span className="font-bold">Favorites</span>
            <span className="font-bold">Tools</span>
            <span className="font-bold">Help</span>
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