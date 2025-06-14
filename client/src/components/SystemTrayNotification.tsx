import React, { useState, useEffect } from "react";

interface SystemTrayNotificationProps {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

export default function SystemTrayNotification({ 
  title, 
  message, 
  type, 
  onClose, 
  duration = 5000 
}: SystemTrayNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Animate in from bottom right
    setTimeout(() => setIsVisible(true), 100);
    
    // Auto-close after duration
    const timer = setTimeout(() => {
      setIsClosing(true);
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'info': return '💬';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'info': return 'border-blue-400';
      case 'warning': return 'border-yellow-400';
      case 'error': return 'border-red-400';
      default: return 'border-gray-400';
    }
  };

  return (
    <div 
      className={`fixed bottom-8 right-8 w-80 bg-gradient-to-r from-blue-50 to-blue-100 border-2 ${getBorderColor()} rounded-lg shadow-xl transition-all duration-300 z-50 ${
        isVisible && !isClosing ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
      style={{
        boxShadow: '4px 4px 12px rgba(0,0,0,0.3)',
        background: 'linear-gradient(145deg, #f0f8ff, #e6f3ff)'
      }}
    >
      {/* Windows XP-style title bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-2 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
            <span className="text-xs font-bold text-blue-800">💬</span>
          </div>
          <span className="text-sm font-bold">AOL Instant Messenger</span>
        </div>
        <button 
          onClick={() => {
            setIsClosing(true);
            setTimeout(onClose, 300);
          }}
          className="w-5 h-5 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors flex items-center justify-center"
        >
          <span className="leading-none">×</span>
        </button>
      </div>

      {/* Notification content */}
      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="text-2xl flex-shrink-0">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-sm text-gray-900 mb-1">{title}</h4>
            <p className="text-sm text-gray-700 break-words">{message}</p>
          </div>
        </div>
        
        {/* Windows XP-style buttons */}
        <div className="flex justify-end mt-3">
          <button
            onClick={() => {
              setIsClosing(true);
              setTimeout(onClose, 300);
            }}
            className="px-4 py-1.5 text-xs bg-gradient-to-b from-gray-100 to-gray-200 border border-gray-400 rounded hover:from-gray-200 hover:to-gray-300 transition-all shadow-sm"
            style={{ 
              boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.8), 1px 1px 2px rgba(0,0,0,0.2)' 
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}