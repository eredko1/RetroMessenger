import { useState, useRef, useEffect } from "react";

interface WindowComponentProps {
  title: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  onClose: () => void;
  onMinimize?: () => void;
  onMove?: (position: { x: number; y: number }) => void;
  onResize?: (size: { width: number; height: number }) => void;
  onFocus?: () => void;
  children: React.ReactNode;
  resizable?: boolean;
  className?: string;
}

export default function WindowComponent({
  title,
  position,
  size,
  zIndex,
  onClose,
  onMinimize,
  onMove,
  onResize,
  onFocus,
  children,
  resizable = true,
  className = ""
}: WindowComponentProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.window-titlebar')) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      onFocus?.();
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.window-titlebar')) {
      e.preventDefault();
      const touch = e.touches[0];
      setIsDragging(true);
      setDragStart({
        x: touch.clientX - position.x,
        y: touch.clientY - position.y
      });
      onFocus?.();
    }
  };

  // Handle resizing
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    onFocus?.();
  };

  // Global mouse/touch events
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && onMove) {
        onMove({
          x: Math.max(0, Math.min(window.innerWidth - size.width, e.clientX - dragStart.x)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, e.clientY - dragStart.y))
        });
      }
      if (isResizing && onResize) {
        const newWidth = Math.max(200, resizeStart.width + (e.clientX - resizeStart.x));
        const newHeight = Math.max(150, resizeStart.height + (e.clientY - resizeStart.y));
        onResize({ width: newWidth, height: newHeight });
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (isDragging && onMove) {
        const touch = e.touches[0];
        onMove({
          x: Math.max(0, Math.min(window.innerWidth - size.width, touch.clientX - dragStart.x)),
          y: Math.max(0, Math.min(window.innerHeight - size.height, touch.clientY - dragStart.y))
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, position, size, onMove, onResize]);

  return (
    <div
      ref={windowRef}
      className={`absolute bg-gray-100 border-2 shadow-lg ${className}`}
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex,
        borderStyle: 'outset',
        borderColor: '#c0c0c0'
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      {/* Title Bar */}
      <div 
        className="window-titlebar h-7 flex items-center justify-between px-2 text-white text-xs font-bold cursor-move"
        style={{
          background: 'linear-gradient(to bottom, #0054e3 0%, #003dc6 3%, #0054e3 6%, #4d92ff 50%, #0054e3 94%, #003dc6 97%, #0054e3 100%)'
        }}
      >
        <span className="select-none">{title}</span>
        <div className="flex items-center space-x-1">
          {onMinimize && (
            <button
              onClick={onMinimize}
              className="w-5 h-4 bg-gray-200 border border-gray-400 hover:bg-gray-300 flex items-center justify-center text-black text-xs"
              style={{ borderStyle: 'outset' }}
            >
              _
            </button>
          )}
          <button
            onClick={onClose}
            className="w-5 h-4 bg-red-500 border border-red-600 hover:bg-red-600 flex items-center justify-center text-white text-xs"
            style={{ borderStyle: 'outset' }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden" style={{ height: 'calc(100% - 28px)' }}>
        {children}
      </div>

      {/* Resize Handle */}
      {resizable && onResize && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 border-t border-l border-gray-400"
          onMouseDown={handleResizeMouseDown}
          style={{
            background: 'linear-gradient(135deg, #e0e0e0 0%, #c0c0c0 100%)',
            borderTopColor: '#ffffff',
            borderLeftColor: '#ffffff'
          }}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-gray-600"></div>
        </div>
      )}
    </div>
  );
}