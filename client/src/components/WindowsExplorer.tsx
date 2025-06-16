import { useState } from "react";
import { Folder, File, HardDrive, ArrowLeft, ArrowRight, ArrowUp } from "lucide-react";
import WindowComponent from "./WindowComponent";

interface WindowsExplorerProps {
  onClose: () => void;
  onMinimize?: () => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onFocus?: () => void;
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
  zIndex,
  onMove,
  onResize,
  onFocus
}: WindowsExplorerProps) {
  const [currentPath, setCurrentPath] = useState("C:");
  const [history, setHistory] = useState(["C:"]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
    }
  };

  const navigateForward = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCurrentPath(history[newIndex]);
    }
  };

  const navigateUp = () => {
    if (currentPath !== "My Computer") {
      const newPath = currentPath === "C:" ? "My Computer" : "C:";
      navigateTo(newPath);
    }
  };

  const navigateTo = (path: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCurrentPath(path);
    setSelectedItem(null);
  };

  const handleItemClick = (item: FileSystemItem) => {
    setSelectedItem(item.name);
    // Single click navigation for touch device compatibility
    if (item.type === 'folder' || item.type === 'drive') {
      navigateTo(item.path);
    }
  };

  // Removed double-click for touch device compatibility

  const getFileTypeIcon = (item: FileSystemItem) => {
    if (item.type === 'drive') return <HardDrive className="w-4 h-4" />;
    if (item.type === 'folder') return <Folder className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  // Sample file system data
  const getItemsForPath = (path: string): FileSystemItem[] => {
    switch (path) {
      case "My Computer":
        return [
          { name: "Local Disk (C:)", type: 'drive', icon: "💾", path: "C:" },
          { name: "3½ Floppy (A:)", type: 'drive', icon: "💾", path: "A:" },
          { name: "CD Drive (D:)", type: 'drive', icon: "💿", path: "D:" }
        ];
      case "C:":
        return [
          { name: "Documents and Settings", type: 'folder', icon: "📁", path: "C:\\Documents and Settings" },
          { name: "Program Files", type: 'folder', icon: "📁", path: "C:\\Program Files" },
          { name: "Windows", type: 'folder', icon: "📁", path: "C:\\Windows" },
          { name: "autoexec.bat", type: 'file', size: "1 KB", modified: "6/16/2025 3:00 PM", icon: "📄", path: "C:\\autoexec.bat" },
          { name: "config.sys", type: 'file', size: "1 KB", modified: "6/16/2025 3:00 PM", icon: "📄", path: "C:\\config.sys" }
        ];
      default:
        return [
          { name: "Empty Folder", type: 'folder', icon: "📁", path: currentPath + "\\Empty Folder" }
        ];
    }
  };

  const currentItems = getItemsForPath(currentPath);

  return (
    <WindowComponent
      title="My Computer"
      position={position}
      size={size}
      zIndex={zIndex}
      onClose={onClose}
      onMinimize={onMinimize}
      onMove={onMove}
      onResize={onResize}
      onFocus={onFocus}
      className="text-xs"
    >
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
          disabled={currentPath === "My Computer"}
        >
          <ArrowUp className="w-4 h-4" />
        </button>
        <div className="flex-1 bg-white border border-gray-400 px-2 py-1 text-xs">
          {currentPath}
        </div>
      </div>

      {/* Address Bar */}
      <div className="h-6 px-2 flex items-center text-xs bg-gray-100 border-b border-gray-300">
        <span className="mr-2">Address</span>
        <div className="flex-1 bg-white border border-gray-400 px-2 py-1 text-xs">
          {currentPath}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 bg-white">
        {/* Left Sidebar */}
        <div className="w-48 bg-gray-50 border-r border-gray-300 p-2">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-blue-600 mb-2">System Tasks</h3>
            <div className="space-y-1 text-xs">
              <div className="hover:bg-blue-100 p-1 cursor-pointer">View system information</div>
              <div className="hover:bg-blue-100 p-1 cursor-pointer">Add or remove programs</div>
              <div className="hover:bg-blue-100 p-1 cursor-pointer">Change a setting</div>
            </div>
          </div>
          <div className="mb-4">
            <h3 className="text-xs font-bold text-blue-600 mb-2">Other Places</h3>
            <div className="space-y-1 text-xs">
              <div className="hover:bg-blue-100 p-1 cursor-pointer">My Network Places</div>
              <div className="hover:bg-blue-100 p-1 cursor-pointer">My Documents</div>
              <div className="hover:bg-blue-100 p-1 cursor-pointer">Shared Documents</div>
              <div className="hover:bg-blue-100 p-1 cursor-pointer">Control Panel</div>
            </div>
          </div>
        </div>

        {/* File List */}
        <div className="flex-1 p-2">
          <div className="grid grid-cols-4 gap-4">
            {currentItems.map((item) => (
              <div
                key={item.name}
                className={`p-2 rounded cursor-pointer hover:bg-blue-100 ${
                  selectedItem === item.name ? 'bg-blue-200' : ''
                }`}
                onClick={() => handleItemClick(item)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-2 text-2xl">{item.icon}</div>
                  <div className="text-xs font-medium">{item.name}</div>
                  {item.size && (
                    <div className="text-xs text-gray-500">{item.size}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="h-6 px-2 flex items-center justify-between text-xs bg-gray-100 border-t border-gray-300">
        <span>{currentItems.length} object(s)</span>
        <span>My Computer</span>
      </div>
    </WindowComponent>
  );
}