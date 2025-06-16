import { useState, useRef, useEffect } from "react";
import WindowComponent from "./WindowComponent";

interface WindowsPaintProps {
  onClose: () => void;
  onMinimize?: () => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onFocus?: () => void;
}

export default function WindowsPaint({ 
  onClose, 
  onMinimize, 
  position, 
  size, 
  zIndex,
  onMove,
  onResize,
  onFocus
}: WindowsPaintProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState("pencil");
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(2);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  const colors = [
    "#000000", "#808080", "#800000", "#808000", "#008000", "#008080", 
    "#000080", "#800080", "#804000", "#ffffff", "#c0c0c0", "#ff0000", 
    "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff", "#ffff80"
  ];

  const tools = [
    { name: "pencil", icon: "✏️", label: "Pencil" },
    { name: "brush", icon: "🖌️", label: "Brush" },
    { name: "eraser", icon: "🧹", label: "Eraser" },
    { name: "line", icon: "📏", label: "Line" },
    { name: "rectangle", icon: "⬜", label: "Rectangle" },
    { name: "circle", icon: "⭕", label: "Circle" }
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

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const getTouchPos = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  };

  const startDrawing = (pos: { x: number; y: number }) => {
    setIsDrawing(true);
    setLastPosition(pos);
  };

  const draw = (pos: { x: number; y: number }) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    
    if (tool === "eraser") {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }

    if (tool === "pencil" || tool === "brush" || tool === "eraser") {
      ctx.beginPath();
      ctx.moveTo(lastPosition.x, lastPosition.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }

    setLastPosition(pos);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (ctx && canvas) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveImage = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'painting.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <WindowComponent
      title="untitled - Paint"
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
      <div className="h-full flex flex-col bg-gray-100">
        {/* Menu Bar */}
        <div className="h-6 px-2 flex items-center text-xs bg-gray-100 border-b border-gray-300">
          <div className="relative group">
            <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">File</span>
            <div className="absolute top-full left-0 hidden group-hover:block bg-white border border-gray-400 shadow-lg z-10 min-w-32">
              <div className="py-1 px-2 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">New</div>
              <div className="py-1 px-2 hover:bg-blue-500 hover:text-white cursor-pointer text-xs">Open</div>
              <div className="py-1 px-2 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={saveImage}>Save</div>
              <hr className="my-1" />
              <div className="py-1 px-2 hover:bg-blue-500 hover:text-white cursor-pointer text-xs" onClick={onClose}>Exit</div>
            </div>
          </div>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Edit</span>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">View</span>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Image</span>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Colors</span>
          <span className="px-2 hover:bg-blue-500 hover:text-white cursor-pointer">Help</span>
        </div>

        {/* Tool Palette */}
        <div className="flex bg-gray-100 border-b border-gray-300">
          {/* Tools */}
          <div className="w-16 p-1 border-r border-gray-300">
            <div className="grid grid-cols-2 gap-1">
              {tools.map((t) => (
                <button
                  key={t.name}
                  className={`w-6 h-6 border text-xs flex items-center justify-center ${
                    tool === t.name 
                      ? 'bg-blue-200 border-blue-400' 
                      : 'bg-gray-200 border-gray-400 hover:bg-gray-300'
                  }`}
                  onClick={() => setTool(t.name)}
                  title={t.label}
                >
                  {t.icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palette */}
          <div className="flex-1 p-1">
            <div className="flex items-center space-x-2">
              <div className="grid grid-cols-9 gap-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    className={`w-4 h-4 border-2 ${
                      color === c ? 'border-black' : 'border-gray-400'
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <label className="text-xs">Size:</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
                  className="w-16"
                />
                <span className="text-xs w-6">{brushSize}</span>
              </div>
              <button
                onClick={clearCanvas}
                className="px-2 py-1 bg-red-200 hover:bg-red-300 border border-red-400 text-xs rounded"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-2 bg-gray-200 overflow-auto">
          <div className="bg-white border-2 border-gray-400" style={{ borderStyle: 'inset' }}>
            <canvas
              ref={canvasRef}
              width={size.width - 20}
              height={size.height - 120}
              className="block cursor-crosshair"
              onMouseDown={(e) => startDrawing(getMousePos(e))}
              onMouseMove={(e) => draw(getMousePos(e))}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={(e) => {
                e.preventDefault();
                startDrawing(getTouchPos(e));
              }}
              onTouchMove={(e) => {
                e.preventDefault();
                draw(getTouchPos(e));
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                stopDrawing();
              }}
            />
          </div>
        </div>

        {/* Status Bar */}
        <div className="h-5 px-2 flex items-center justify-between text-xs bg-gray-100 border-t border-gray-300">
          <span>For Help, click Help Topics on the Help Menu.</span>
          <span>{size.width - 20} x {size.height - 120}</span>
        </div>
      </div>
    </WindowComponent>
  );
}