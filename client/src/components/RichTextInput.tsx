import React, { useState, useRef } from "react";

interface RichTextInputProps {
  value: string;
  onChange: (content: string, formatting?: any) => void;
  onSend: () => void;
  placeholder?: string;
}

export default function RichTextInput({ value, onChange, onSend, placeholder }: RichTextInputProps) {
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    color: '#000000',
    fontSize: 12,
    fontFamily: 'Arial'
  });
  const [showFormatting, setShowFormatting] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const fontFamilies = [
    'Arial', 'Times New Roman', 'Courier New', 'Comic Sans MS', 
    'Impact', 'Verdana', 'Georgia', 'Trebuchet MS'
  ];

  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#800080', '#FFA500', '#008000'
  ];

  const handleFormatting = (type: string, value?: any) => {
    const newFormatting = { ...formatting };
    
    if (type === 'bold' || type === 'italic' || type === 'underline') {
      newFormatting[type as keyof typeof formatting] = !newFormatting[type as keyof typeof formatting];
    } else {
      (newFormatting as any)[type] = value;
    }
    
    setFormatting(newFormatting);
    
    if (textRef.current) {
      textRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const content = e.currentTarget.textContent || '';
    onChange(content, formatting);
  };

  const insertEmoji = (emoji: string) => {
    const content = value + emoji;
    onChange(content, formatting);
  };

  const insertLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const content = value + ` ${url}`;
      onChange(content, formatting);
    }
  };

  const insertImage = () => {
    const url = prompt('Enter image URL:');
    if (url) {
      const content = value + ` [IMG]${url}[/IMG]`;
      onChange(content, formatting);
    }
  };

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      {/* Formatting Toolbar */}
      {showFormatting && (
        <div className="bg-gray-100 p-2 border-b border-gray-300 flex flex-wrap items-center gap-2">
          {/* Font Family */}
          <select 
            value={formatting.fontFamily}
            onChange={(e) => handleFormatting('fontFamily', e.target.value)}
            className="text-xs px-1 py-0.5 border border-gray-300 rounded"
          >
            {fontFamilies.map(font => (
              <option key={font} value={font} style={{ fontFamily: font }}>
                {font}
              </option>
            ))}
          </select>

          {/* Font Size */}
          <select 
            value={formatting.fontSize}
            onChange={(e) => handleFormatting('fontSize', parseInt(e.target.value))}
            className="text-xs px-1 py-0.5 border border-gray-300 rounded"
          >
            {fontSizes.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          {/* Bold, Italic, Underline */}
          <button
            onClick={() => handleFormatting('bold')}
            className={`px-2 py-1 text-xs font-bold border rounded ${formatting.bold ? 'bg-blue-200' : 'bg-white'}`}
          >
            B
          </button>
          <button
            onClick={() => handleFormatting('italic')}
            className={`px-2 py-1 text-xs italic border rounded ${formatting.italic ? 'bg-blue-200' : 'bg-white'}`}
          >
            I
          </button>
          <button
            onClick={() => handleFormatting('underline')}
            className={`px-2 py-1 text-xs underline border rounded ${formatting.underline ? 'bg-blue-200' : 'bg-white'}`}
          >
            U
          </button>

          {/* Color Picker */}
          <div className="flex items-center gap-1">
            <span className="text-xs">Color:</span>
            <div className="flex gap-1">
              {colors.map(color => (
                <button
                  key={color}
                  onClick={() => handleFormatting('color', color)}
                  className={`w-4 h-4 border-2 rounded ${formatting.color === color ? 'border-black' : 'border-gray-300'}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Emoji and Media */}
          <div className="flex gap-1">
            <button
              onClick={() => insertEmoji('😀')}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
            >
              😀
            </button>
            <button
              onClick={() => insertEmoji('😂')}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
            >
              😂
            </button>
            <button
              onClick={() => insertEmoji('❤️')}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
            >
              ❤️
            </button>
            <button
              onClick={insertLink}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
              title="Insert Link"
            >
              🔗
            </button>
            <button
              onClick={insertImage}
              className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50"
              title="Insert Image"
            >
              🖼️
            </button>
          </div>
        </div>
      )}

      {/* Text Input */}
      <div className="relative">
        <div
          ref={textRef}
          contentEditable
          onInput={handleInput}
          onKeyPress={handleKeyPress}
          className="min-h-[60px] max-h-[120px] overflow-y-auto p-3 text-sm outline-none resize-none"
          style={{
            fontFamily: formatting.fontFamily,
            fontSize: `${formatting.fontSize}px`,
            fontWeight: formatting.bold ? 'bold' : 'normal',
            fontStyle: formatting.italic ? 'italic' : 'normal',
            textDecoration: formatting.underline ? 'underline' : 'none',
            color: formatting.color
          }}
          suppressContentEditableWarning={true}
        >
          {!value && (
            <div className="text-gray-400 pointer-events-none absolute top-3 left-3">
              {placeholder}
            </div>
          )}
        </div>
        
        {/* Format Toggle Button */}
        <button
          onClick={() => setShowFormatting(!showFormatting)}
          className="absolute bottom-2 right-2 w-6 h-6 bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded text-xs flex items-center justify-center"
          title="Toggle Formatting"
        >
          A
        </button>
      </div>
    </div>
  );
}