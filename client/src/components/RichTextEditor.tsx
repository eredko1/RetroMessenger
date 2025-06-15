import React, { useState, useRef } from "react";
import { Bold, Italic, Underline, Image, Smile, Send } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string, formatting?: any) => void;
  onSend: () => void;
  onImageUpload?: (file: File) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  onSend, 
  onImageUpload,
  placeholder = "Type a message...",
  disabled = false
}: RichTextEditorProps) {
  const [formatting, setFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    color: '#000000'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const applyFormatting = (type: string) => {
    if (disabled) return;
    
    const newFormatting = { ...formatting };
    if (type === 'bold') newFormatting.bold = !newFormatting.bold;
    if (type === 'italic') newFormatting.italic = !newFormatting.italic;
    if (type === 'underline') newFormatting.underline = !newFormatting.underline;
    
    setFormatting(newFormatting);
    
    // Focus back to textarea
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim()) {
        onSend();
      }
    }
  };

  const handleImageClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/') && onImageUpload) {
      onImageUpload(file);
    }
  };

  const getTextStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {};
    if (formatting.bold) style.fontWeight = 'bold';
    if (formatting.italic) style.fontStyle = 'italic';
    if (formatting.underline) style.textDecoration = 'underline';
    if (formatting.color !== '#000000') style.color = formatting.color;
    return style;
  };

  return (
    <div className="border border-gray-300 rounded-md bg-white">
      {/* Formatting Toolbar */}
      <div className="flex items-center space-x-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => applyFormatting('bold')}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${formatting.bold ? 'bg-blue-200' : ''}`}
          title="Bold"
          disabled={disabled}
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormatting('italic')}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${formatting.italic ? 'bg-blue-200' : ''}`}
          title="Italic"
          disabled={disabled}
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => applyFormatting('underline')}
          className={`p-1 rounded hover:bg-gray-200 transition-colors ${formatting.underline ? 'bg-blue-200' : ''}`}
          title="Underline"
          disabled={disabled}
        >
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-gray-300 mx-1"></div>
        <input
          type="color"
          value={formatting.color}
          onChange={(e) => setFormatting(prev => ({ ...prev, color: e.target.value }))}
          className="w-6 h-6 rounded border border-gray-300 cursor-pointer"
          title="Text Color"
          disabled={disabled}
        />
        <button
          type="button"
          onClick={handleImageClick}
          className="p-1 rounded hover:bg-gray-200 transition-colors"
          title="Insert Image"
          disabled={disabled}
        >
          <Image className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-gray-200 transition-colors"
          title="Emoticons"
          disabled={disabled}
        >
          <Smile className="w-4 h-4" />
        </button>
      </div>

      {/* Text Input Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value, formatting)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          className="w-full p-3 resize-none focus:outline-none text-sm min-h-[80px] max-h-[200px]"
          style={getTextStyle()}
          disabled={disabled}
        />
        <button
          onClick={onSend}
          disabled={!value.trim() || disabled}
          className="absolute bottom-2 right-2 p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-full transition-colors"
          title="Send Message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}