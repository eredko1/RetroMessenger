import { X, Minus } from "lucide-react";

interface TestAppProps {
  onClose: () => void;
  onMinimize?: () => void;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export default function TestApp({ 
  onClose, 
  onMinimize, 
  position, 
  size, 
  zIndex 
}: TestAppProps) {
  return (
    <div
      className="fixed bg-white shadow-lg select-none border-2"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: zIndex,
        border: '2px outset #c0c0c0'
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
            <span style={{ fontSize: '8px' }}>🔧</span>
          </div>
          <span>Test Application</span>
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
            className="w-5 h-4 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs flex items-center justify-center"
            onClick={onClose}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Test Application Working!</h2>
        <p className="mb-2">This is a test to verify application launching works correctly.</p>
        <p className="mb-2">Position: {position.x}, {position.y}</p>
        <p className="mb-2">Size: {size.width} x {size.height}</p>
        <p>Z-Index: {zIndex}</p>
      </div>
    </div>
  );
}