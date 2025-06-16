import { useState } from "react";
import { X, Minus, Square } from "lucide-react";

interface WindowsNotepadProps {
  onClose: () => void;
  onMinimize?: () => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export default function WindowsNotepad({ 
  onClose, 
  onMinimize, 
  position, 
  size, 
  zIndex 
}: WindowsNotepadProps) {
  const [content, setContent] = useState("");
  const [fileName, setFileName] = useState("Untitled");
  const [isModified, setIsModified] = useState(false);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsModified(true);
  };

  const handleNew = () => {
    setContent("");
    setFileName("Untitled");
    setIsModified(false);
  };

  const handleSave = () => {
    // Create a blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.txt') ? fileName : `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsModified(false);
  };

  const handleOpen = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setContent(e.target?.result as string || '');
          setFileName(file.name);
          setIsModified(false);
        };
        reader.readAsText(file);
      }
    };
    input.click();
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
        minWidth: '400px',
        minHeight: '300px'
      }}
    >
      {/* Title Bar */}
      <div className="h-7 px-2 flex justify-between items-center text-white text-sm font-bold"
           style={{ 
             background: 'linear-gradient(to bottom, #0078d4 0%, #1e3c72 100%)',
             borderBottom: '1px solid #316ac5'
           }}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 border border-gray-600 flex items-center justify-center">
            <span style={{ fontSize: '8px' }}>📝</span>
          </div>
          <span>{fileName}{isModified ? '*' : ''} - Notepad</span>
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
        <div className="relative group">
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">File</span>
          <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-gray-300 shadow-lg z-10 min-w-32">
            <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={handleNew}>New</div>
            <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={handleOpen}>Open...</div>
            <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={handleSave}>Save</div>
            <div className="border-t border-gray-300 my-1"></div>
            <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={onClose}>Exit</div>
          </div>
        </div>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Edit</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Format</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">View</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Help</span>
      </div>

      {/* Text Area */}
      <div className="flex-1" style={{ height: 'calc(100% - 3.25rem)' }}>
        <textarea
          className="w-full h-full p-2 text-sm font-mono resize-none border-none outline-none bg-white"
          value={content}
          onChange={handleContentChange}
          placeholder="Type your text here..."
          style={{ fontFamily: 'Courier New, monospace' }}
        />
      </div>
    </div>
  );
}