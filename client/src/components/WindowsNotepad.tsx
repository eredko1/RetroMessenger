import { useState } from "react";
import WindowComponent from "./WindowComponent";

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
    if (isModified) {
      const save = confirm("Do you want to save changes to " + fileName + "?");
      if (save) {
        handleSave();
      }
    }
    setContent("");
    setFileName("Untitled");
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
          setContent(e.target?.result as string || "");
          setFileName(file.name);
          setIsModified(false);
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.txt') ? fileName : fileName + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsModified(false);
  };

  const handleSaveAs = () => {
    const newName = prompt("Save as:", fileName);
    if (newName) {
      setFileName(newName);
      handleSave();
    }
  };

  return (
    <WindowComponent
      title={`${fileName}${isModified ? '*' : ''} - Notepad`}
      position={position}
      size={size}
      zIndex={zIndex}
      onClose={onClose}
      onMinimize={onMinimize}
      className="text-xs"
    >
      <div className="h-full flex flex-col bg-gray-100">
        {/* Menu Bar */}
        <div className="h-6 px-2 flex items-center text-xs bg-gray-100 border-b border-gray-300">
          <div className="relative group">
            <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">File</span>
            <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-gray-400 shadow-lg z-10 min-w-32">
              <div className="py-1 px-2 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={handleNew}>New</div>
              <div className="py-1 px-2 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={handleOpen}>Open</div>
              <div className="py-1 px-2 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={handleSave}>Save</div>
              <div className="py-1 px-2 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={handleSaveAs}>Save As</div>
              <hr className="my-1" />
              <div className="py-1 px-2 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={onClose}>Exit</div>
            </div>
          </div>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Edit</span>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Format</span>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">View</span>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Help</span>
        </div>

        {/* Text Area */}
        <textarea
          className="flex-1 p-2 bg-white border-none outline-none resize-none font-mono text-sm"
          value={content}
          onChange={handleContentChange}
          placeholder="Type your text here..."
          style={{
            fontFamily: 'Courier New, monospace',
            lineHeight: '1.4'
          }}
        />

        {/* Status Bar */}
        <div className="h-5 px-2 flex items-center justify-between text-xs bg-gray-100 border-t border-gray-300">
          <span>Line 1, Col 1</span>
          <span>{content.length} characters</span>
        </div>
      </div>
    </WindowComponent>
  );
}