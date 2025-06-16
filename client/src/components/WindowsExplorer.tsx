import { useState } from "react";
import { Folder, File, HardDrive, ArrowLeft, ArrowRight, ArrowUp, X, Minus, Square } from "lucide-react";

interface WindowsExplorerProps {
  onClose: () => void;
  onMinimize?: () => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

interface FileSystemItem {
  name: string;
  type: 'folder' | 'file' | 'drive';
  size?: string;
  modified?: string;
  icon: string;
  path: string;
}

export default function WindowsExplorer({ 
  onClose, 
  onMinimize, 
  position, 
  size, 
  zIndex 
}: WindowsExplorerProps) {
  const [currentPath, setCurrentPath] = useState("C:");
  const [history, setHistory] = useState(["C:"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'icons' | 'list' | 'details'>('details');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const fileSystem: Record<string, FileSystemItem[]> = {
    "C:": [
      { name: "Documents and Settings", type: "folder", icon: "👥", path: "C:\\Documents and Settings" },
      { name: "Program Files", type: "folder", icon: "📁", path: "C:\\Program Files" },
      { name: "WINDOWS", type: "folder", icon: "🏠", path: "C:\\WINDOWS" },
      { name: "My Documents", type: "folder", icon: "📄", path: "C:\\My Documents" },
      { name: "AOL Instant Messenger", type: "folder", icon: "💬", path: "C:\\AOL Instant Messenger" },
    ],
    "C:\\My Documents": [
      { name: "My Pictures", type: "folder", icon: "🖼️", path: "C:\\My Documents\\My Pictures" },
      { name: "My Music", type: "folder", icon: "🎵", path: "C:\\My Documents\\My Music" },
      { name: "My Videos", type: "folder", icon: "🎬", path: "C:\\My Documents\\My Videos" },
      { name: "readme.txt", type: "file", icon: "📄", size: "2 KB", modified: "6/15/2025 10:30 AM", path: "C:\\My Documents\\readme.txt" },
    ],
    "C:\\My Documents\\My Pictures": [
      { name: "vacation.jpg", type: "file", icon: "🖼️", size: "1.2 MB", modified: "6/10/2025 3:15 PM", path: "C:\\My Documents\\My Pictures\\vacation.jpg" },
      { name: "family.bmp", type: "file", icon: "🖼️", size: "850 KB", modified: "6/8/2025 2:45 PM", path: "C:\\My Documents\\My Pictures\\family.bmp" },
      { name: "screenshot.png", type: "file", icon: "🖼️", size: "245 KB", modified: "6/14/2025 11:20 AM", path: "C:\\My Documents\\My Pictures\\screenshot.png" },
    ],
    "C:\\Program Files": [
      { name: "AOL", type: "folder", icon: "💬", path: "C:\\Program Files\\AOL" },
      { name: "Internet Explorer", type: "folder", icon: "🌐", path: "C:\\Program Files\\Internet Explorer" },
      { name: "Windows Media Player", type: "folder", icon: "🎵", path: "C:\\Program Files\\Windows Media Player" },
      { name: "Microsoft Office", type: "folder", icon: "📊", path: "C:\\Program Files\\Microsoft Office" },
      { name: "Notepad++", type: "folder", icon: "📝", path: "C:\\Program Files\\Notepad++" },
    ],
  };

  const getCurrentItems = (): FileSystemItem[] => {
    return fileSystem[currentPath] || [];
  };

  const navigateTo = (path: string) => {
    if (fileSystem[path]) {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(path);
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setCurrentPath(path);
      setSelectedItem(null);
    }
  };

  const navigateBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(history[historyIndex - 1]);
      setSelectedItem(null);
    }
  };

  const navigateForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(history[historyIndex + 1]);
      setSelectedItem(null);
    }
  };

  const navigateUp = () => {
    const pathParts = currentPath.split("\\");
    if (pathParts.length > 1) {
      const parentPath = pathParts.slice(0, -1).join("\\");
      navigateTo(parentPath || "C:");
    }
  };

  const handleItemClick = (item: FileSystemItem) => {
    setSelectedItem(item.name);
  };

  const handleItemDoubleClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      navigateTo(item.path);
    }
  };

  const getFileTypeIcon = (item: FileSystemItem) => {
    if (item.type === 'folder') return item.icon;
    const ext = item.name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt': case 'log': return '📄';
      case 'jpg': case 'jpeg': case 'png': case 'bmp': case 'gif': return '🖼️';
      case 'mp3': case 'wav': case 'wma': return '🎵';
      case 'avi': case 'mpg': case 'wmv': return '🎬';
      case 'exe': return '⚙️';
      case 'doc': case 'docx': return '📝';
      case 'xls': case 'xlsx': return '📊';
      default: return '📄';
    }
  };

  return (
    <div
      className="fixed bg-white shadow-lg select-none border-2"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: zIndex,
        border: '2px outset #c0c0c0',
        minWidth: '600px',
        minHeight: '400px'
      }}
    >
      {/* Windows XP Title Bar */}
      <div className="h-7 px-2 flex justify-between items-center text-white text-sm font-bold"
           style={{ 
             background: 'linear-gradient(to bottom, #0078d4 0%, #1e3c72 100%)',
             borderBottom: '1px solid #316ac5'
           }}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 border border-gray-600 flex items-center justify-center">
            <span style={{ fontSize: '8px' }}>📁</span>
          </div>
          <span>My Computer</span>
        </div>
        <div className="flex space-x-1">
          {onMinimize && (
            <button 
              className="w-5 h-4 bg-gray-300 hover:bg-gray-400 border border-gray-600 text-black text-xs flex items-center justify-center"
              onClick={onMinimize}
            >
              <Minus className="w-3 h-3" />
            </button>
          )}
          <button 
            className="w-5 h-4 bg-gray-300 hover:bg-gray-400 border border-gray-600 text-black text-xs flex items-center justify-center"
          >
            <Square className="w-2 h-2" />
          </button>
          <button 
            className="w-5 h-4 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs flex items-center justify-center"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="h-6 px-2 flex items-center text-xs bg-gray-100 border-b border-gray-300">
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">File</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Edit</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">View</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Favorites</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Tools</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Help</span>
      </div>

      {/* Toolbar */}
      <div className="h-10 px-2 flex items-center space-x-2 bg-gray-100 border-b border-gray-300">
        <button 
          className="p-1 hover:bg-gray-200 border border-transparent hover:border-gray-400 rounded"
          onClick={navigateBack}
          disabled={historyIndex === 0}
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button 
          className="p-1 hover:bg-gray-200 border border-transparent hover:border-gray-400 rounded"
          onClick={navigateForward}
          disabled={historyIndex >= history.length - 1}
        >
          <ArrowRight className="w-4 h-4" />
        </button>
        <button 
          className="p-1 hover:bg-gray-200 border border-transparent hover:border-gray-400 rounded"
          onClick={navigateUp}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <div className="flex-1 mx-4">
          <div className="flex items-center space-x-2">
            <span className="text-xs">Address:</span>
            <input 
              className="flex-1 px-2 py-1 text-xs border border-gray-400 bg-white"
              value={currentPath}
              readOnly
            />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1" style={{ height: 'calc(100% - 5.5rem)' }}>
        {/* Sidebar */}
        <div className="w-48 bg-gray-50 border-r border-gray-300 p-2">
          <div className="text-xs font-bold mb-2 text-blue-700">System Tasks</div>
          <div className="text-xs mb-1 cursor-pointer hover:text-blue-600">View system information</div>
          <div className="text-xs mb-1 cursor-pointer hover:text-blue-600">Add or remove programs</div>
          <div className="text-xs mb-1 cursor-pointer hover:text-blue-600">Change a setting</div>
          
          <div className="text-xs font-bold mt-4 mb-2 text-blue-700">Other Places</div>
          <div className="text-xs mb-1 cursor-pointer hover:text-blue-600 flex items-center space-x-1">
            <span>📄</span><span>My Documents</span>
          </div>
          <div className="text-xs mb-1 cursor-pointer hover:text-blue-600 flex items-center space-x-1">
            <span>🌐</span><span>My Network Places</span>
          </div>
          <div className="text-xs mb-1 cursor-pointer hover:text-blue-600 flex items-center space-x-1">
            <span>🗑️</span><span>Recycle Bin</span>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 p-2 bg-white overflow-auto">
          {viewMode === 'details' && (
            <div>
              <div className="flex text-xs font-bold border-b border-gray-300 py-1 mb-2">
                <div className="flex-1">Name</div>
                <div className="w-16">Size</div>
                <div className="w-20">Type</div>
                <div className="w-32">Date Modified</div>
              </div>
              {getCurrentItems().map((item) => (
                <div
                  key={item.name}
                  className={`flex items-center text-xs py-1 cursor-pointer hover:bg-blue-100 ${
                    selectedItem === item.name ? 'bg-blue-200' : ''
                  }`}
                  onClick={() => handleItemClick(item)}
                  onDoubleClick={() => handleItemDoubleClick(item)}
                >
                  <div className="flex-1 flex items-center space-x-2">
                    <span>{getFileTypeIcon(item)}</span>
                    <span>{item.name}</span>
                  </div>
                  <div className="w-16">{item.size || ''}</div>
                  <div className="w-20">{item.type === 'folder' ? 'File Folder' : 'File'}</div>
                  <div className="w-32">{item.modified || ''}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 px-2 flex items-center justify-between text-xs bg-gray-100 border-t border-gray-300">
        <span>{getCurrentItems().length} object(s)</span>
        <span>My Computer</span>
      </div>
    </div>
  );
}