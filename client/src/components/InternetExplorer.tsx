import { useState, useRef } from "react";
import { ArrowLeft, ArrowRight, RotateCcw, Home, Search, Star, Settings, Menu } from "lucide-react";
import WindowComponent from "./WindowComponent";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

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
  onMove,
  onResize,
  onFocus
}: InternetExplorerProps) {
  const [currentUrl, setCurrentUrl] = useState("about:blank");
  const [urlInput, setUrlInput] = useState("");
  const [history, setHistory] = useState<string[]>(["about:blank"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMenus, setShowMenus] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  // Fetch bookmarks
  const { data: bookmarks = [] } = useQuery({
    queryKey: ['/api/browser-data', 'bookmarks'],
    queryFn: () => apiRequest('/api/browser-data?type=bookmark'),
  });

  // Fetch browser history
  const { data: browserHistory = [] } = useQuery({
    queryKey: ['/api/browser-data', 'history'],
    queryFn: () => apiRequest('/api/browser-data?type=history'),
  });

  // Add bookmark mutation
  const addBookmarkMutation = useMutation({
    mutationFn: (data: { url: string; title: string; type: string }) =>
      apiRequest('/api/browser-data', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/browser-data', 'bookmarks'] });
    },
  });

  // Add to history mutation
  const addHistoryMutation = useMutation({
    mutationFn: (data: { url: string; title: string; type: string }) =>
      apiRequest('/api/browser-data', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/browser-data', 'history'] });
    },
  });

  const navigateToUrl = (url: string) => {
    let finalUrl = url.trim();
    
    // Handle special URLs
    if (finalUrl === "about:blank" || finalUrl === "") {
      setCurrentUrl("about:blank");
      setUrlInput("");
      return;
    }

    // Add protocol if missing
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
    }

    setIsLoading(true);
    setCurrentUrl(finalUrl);
    setUrlInput(finalUrl);

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(finalUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // Save to browser history
    addHistoryMutation.mutate({
      url: finalUrl,
      title: new URL(finalUrl).hostname,
      type: 'history'
    });

    // Use proxy for iframe content
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const goBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      setCurrentUrl(url);
      setUrlInput(url);
    }
  };

  const goForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const url = history[newIndex];
      setCurrentUrl(url);
      setUrlInput(url);
    }
  };

  const refresh = () => {
    navigateToUrl(currentUrl);
  };

  const goHome = () => {
    navigateToUrl("https://www.google.com");
  };

  const addBookmark = () => {
    if (currentUrl && currentUrl !== "about:blank") {
      addBookmarkMutation.mutate({
        url: currentUrl,
        title: new URL(currentUrl).hostname,
        type: 'bookmark'
      });
    }
  };

  const quickLinks = [
    { name: "Google", url: "https://www.google.com" },
    { name: "Yahoo", url: "https://www.yahoo.com" },
    { name: "MSN", url: "https://www.msn.com" },
    { name: "CNN", url: "https://www.cnn.com" },
    { name: "eBay", url: "https://www.ebay.com" },
    { name: "Amazon", url: "https://www.amazon.com" }
  ];

  return (
    <WindowComponent
      title="Internet Explorer"
      onClose={onClose}
      onMinimize={onMinimize}
      position={position}
      size={size}
      zIndex={zIndex}
      onMove={onMove}
      onResize={onResize}
      onFocus={onFocus}
    >
      <div className="flex flex-col h-full bg-gray-100">
        {/* Menu Bar */}
        {showMenus && (
          <div className="bg-gray-200 px-2 py-1 border-b border-gray-300 text-xs">
            <div className="flex space-x-4">
              <div className="cursor-pointer hover:bg-blue-100 px-2 py-1">File</div>
              <div className="cursor-pointer hover:bg-blue-100 px-2 py-1">Edit</div>
              <div className="cursor-pointer hover:bg-blue-100 px-2 py-1">View</div>
              <div className="cursor-pointer hover:bg-blue-100 px-2 py-1" onClick={() => setShowBookmarks(!showBookmarks)}>
                Favorites
              </div>
              <div className="cursor-pointer hover:bg-blue-100 px-2 py-1">Tools</div>
              <div className="cursor-pointer hover:bg-blue-100 px-2 py-1">Help</div>
            </div>
          </div>
        )}

        {/* Toolbar */}
        <div className="bg-gray-200 p-2 border-b border-gray-300 flex items-center space-x-2">
          <button
            onClick={goBack}
            disabled={historyIndex <= 0}
            className="p-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 border border-gray-500 rounded"
            style={{ borderStyle: 'outset' }}
          >
            <ArrowLeft size={14} />
          </button>
          <button
            onClick={goForward}
            disabled={historyIndex >= history.length - 1}
            className="p-1 bg-gray-300 hover:bg-gray-400 disabled:opacity-50 border border-gray-500 rounded"
            style={{ borderStyle: 'outset' }}
          >
            <ArrowRight size={14} />
          </button>
          <button
            onClick={refresh}
            className="p-1 bg-gray-300 hover:bg-gray-400 border border-gray-500 rounded"
            style={{ borderStyle: 'outset' }}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={goHome}
            className="p-1 bg-gray-300 hover:bg-gray-400 border border-gray-500 rounded"
            style={{ borderStyle: 'outset' }}
          >
            <Home size={14} />
          </button>
          
          <div className="flex-1 flex items-center space-x-2">
            <span className="text-xs">Address:</span>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && navigateToUrl(urlInput)}
              className="flex-1 px-2 py-1 text-xs border border-gray-400 focus:outline-none focus:border-blue-500"
              placeholder="Enter URL..."
            />
            <button
              onClick={() => navigateToUrl(urlInput)}
              className="px-3 py-1 bg-gray-300 hover:bg-gray-400 border border-gray-500 text-xs rounded"
              style={{ borderStyle: 'outset' }}
            >
              Go
            </button>
          </div>

          <button
            onClick={addBookmark}
            className="p-1 bg-gray-300 hover:bg-gray-400 border border-gray-500 rounded"
            style={{ borderStyle: 'outset' }}
            title="Add to Favorites"
          >
            <Star size={14} />
          </button>
        </div>

        {/* Bookmarks Bar */}
        {showBookmarks && (
          <div className="bg-gray-100 p-2 border-b border-gray-300 text-xs">
            <div className="flex flex-wrap gap-2">
              <span className="text-gray-600">Bookmarks:</span>
              {bookmarks.map((bookmark: any, index: number) => (
                <button
                  key={index}
                  onClick={() => navigateToUrl(bookmark.url)}
                  className="px-2 py-1 bg-white hover:bg-blue-100 border border-gray-400 rounded text-xs"
                >
                  {bookmark.title}
                </button>
              ))}
              {bookmarks.length === 0 && (
                <span className="text-gray-500 italic">No bookmarks saved</span>
              )}
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-white">
          {currentUrl === "about:blank" ? (
            <div className="h-full p-4 flex flex-col items-center justify-center text-center">
              <div className="mb-8">
                <h1 className="text-2xl font-bold mb-4 text-blue-800">Internet Explorer</h1>
                <p className="text-gray-600 mb-6">Welcome to the World Wide Web</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-md">
                <h3 className="col-span-full text-lg font-semibold mb-2">Quick Links</h3>
                {quickLinks.map((link, index) => (
                  <button
                    key={index}
                    onClick={() => navigateToUrl(link.url)}
                    className="p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded text-sm"
                  >
                    {link.name}
                  </button>
                ))}
              </div>

              <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded max-w-md">
                <p className="text-sm text-green-800">
                  <strong>Authentic Internet Explorer:</strong> Websites now load directly in the browser window using our secure proxy system. Experience the web exactly as it was in the Windows XP era!
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full">
              {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p>Loading {currentUrl}...</p>
                </div>
              ) : (
                <iframe
                  src={`/api/proxy?url=${encodeURIComponent(currentUrl)}`}
                  className="w-full h-full border-none"
                  title="Web Content"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox"
                  onLoad={() => console.log('Iframe loaded:', currentUrl)}
                  onError={() => console.error('Iframe load error:', currentUrl)}
                />
              )}
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="bg-gray-200 px-2 py-1 border-t border-gray-300 text-xs flex items-center justify-between">
          <div>Done</div>
          <div className="flex items-center space-x-4">
            <div>Internet Zone</div>
            <div className="w-4 h-4 bg-green-400 rounded border"></div>
          </div>
        </div>
      </div>
    </WindowComponent>
  );
}