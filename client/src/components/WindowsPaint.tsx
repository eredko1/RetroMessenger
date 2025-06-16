import { useState, useRef, useEffect } from "react";
import { X, Minus, Square } from "lucide-react";

interface WindowsPaintProps {
  onClose: () => void;
  onMinimize?: () => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export default function WindowsPaint({ 
  onClose, 
  onMinimize, 
  position, 
  size, 
  zIndex 
}: WindowsPaintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('brush');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(2);

  const tools = [
    { name: 'brush', icon: '🖌️', label: 'Brush' },
    { name: 'pencil', icon: '✏️', label: 'Pencil' },
    { name: 'eraser', icon: '🧽', label: 'Eraser' },
    { name: 'line', icon: '📏', label: 'Line' },
    { name: 'rectangle', icon: '⬜', label: 'Rectangle' },
    { name: 'circle', icon: '⭕', label: 'Circle' },
    { name: 'bucket', icon: '🪣', label: 'Fill' }
  ];

  const colors = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00',
    '#FF00FF', '#00FFFF', '#800000', '#008000', '#000080', '#808000',
    '#800080', '#008080', '#C0C0C0', '#808080'
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentTool === 'eraser' ? 'white' : currentColor;

    if (currentTool === 'brush' || currentTool === 'pencil' || currentTool === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const link = document.createElement('a');
    link.download = 'paint-drawing.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div
      className="fixed bg-gray-200 shadow-lg select-none border-2"
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
      {/* Title Bar */}
      <div className="h-7 px-2 flex justify-between items-center text-white text-sm font-bold"
           style={{ 
             background: 'linear-gradient(to bottom, #0078d4 0%, #1e3c72 100%)',
             borderBottom: '1px solid #316ac5'
           }}>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 border border-gray-600 flex items-center justify-center">
            <span style={{ fontSize: '8px' }}>🎨</span>
          </div>
          <span>untitled - Paint</span>
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
            <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={clearCanvas}>New</div>
            <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={saveImage}>Save</div>
            <div className="border-t border-gray-300 my-1"></div>
            <div className="py-1 px-3 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={onClose}>Exit</div>
          </div>
        </div>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Edit</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">View</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Image</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Colors</span>
        <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Help</span>
      </div>

      {/* Toolbar */}
      <div className="h-16 px-2 flex items-center space-x-2 bg-gray-100 border-b border-gray-300">
        {/* Tools */}
        <div className="flex flex-wrap gap-1">
          {tools.map((tool) => (
            <button
              key={tool.name}
              className={`w-8 h-8 border-2 flex items-center justify-center text-sm hover:bg-gray-200 ${
                currentTool === tool.name ? 'border-inset bg-gray-300' : 'border-outset'
              }`}
              onClick={() => setCurrentTool(tool.name)}
              title={tool.label}
            >
              {tool.icon}
            </button>
          ))}
        </div>

        {/* Brush Size */}
        <div className="flex items-center space-x-2 ml-4">
          <span className="text-xs">Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-16"
          />
          <span className="text-xs w-4">{brushSize}</span>
        </div>
      </div>

      {/* Color Palette */}
      <div className="h-12 px-2 flex items-center bg-gray-100 border-b border-gray-300">
        <div className="flex items-center space-x-1">
          <span className="text-xs mr-2">Colors:</span>
          {colors.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 border-2 ${
                currentColor === color ? 'border-black' : 'border-gray-400'
              }`}
              style={{ backgroundColor: color }}
              onClick={() => setCurrentColor(color)}
            />
          ))}
          <input
            type="color"
            value={currentColor}
            onChange={(e) => setCurrentColor(e.target.value)}
            className="w-6 h-6 ml-2 border border-gray-400"
          />
        </div>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-2 bg-gray-100" style={{ height: 'calc(100% - 8.75rem)' }}>
        <div className="w-full h-full bg-white border-2 border-inset overflow-hidden">
          <canvas
            ref={canvasRef}
            width={size.width - 20}
            height={size.height - 160}
            className="cursor-crosshair"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>
      </div>
    </div>
  );
}