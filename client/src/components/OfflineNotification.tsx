import React, { useState, useEffect } from "react";

interface OfflineMessage {
  id: string;
  fromUser: string;
  content: string;
  timestamp: Date;
}

interface OfflineNotificationProps {
  messages: OfflineMessage[];
  onDismiss: (id: string) => void;
  onOpenChat: (fromUser: string) => void;
}

export default function OfflineNotification({ messages, onDismiss, onOpenChat }: OfflineNotificationProps) {
  const [visibleMessages, setVisibleMessages] = useState<OfflineMessage[]>([]);

  useEffect(() => {
    // Show notifications one by one with delays
    messages.forEach((message, index) => {
      setTimeout(() => {
        setVisibleMessages(prev => [...prev, message]);
        
        // Auto-dismiss after 8 seconds
        setTimeout(() => {
          onDismiss(message.id);
          setVisibleMessages(prev => prev.filter(m => m.id !== message.id));
        }, 8000);
      }, index * 500);
    });
  }, [messages, onDismiss]);

  if (visibleMessages.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleMessages.map((message, index) => (
        <div
          key={message.id}
          className="w-80 bg-yellow-100 border-2 border-yellow-400 rounded-lg shadow-2xl animate-slideIn"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Notification Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-3 py-2 rounded-t-md flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-yellow-400 rounded-sm flex items-center justify-center">
                <span className="text-xs font-bold text-blue-800">💬</span>
              </div>
              <span className="text-sm font-bold">New Instant Message</span>
            </div>
            <button 
              onClick={() => {
                onDismiss(message.id);
                setVisibleMessages(prev => prev.filter(m => m.id !== message.id));
              }}
              className="w-4 h-4 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Notification Body */}
          <div className="p-3">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md flex-shrink-0">
                {message.fromUser[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-gray-800 mb-1">
                  From: {message.fromUser}
                </div>
                <div className="text-sm text-gray-700 mb-2 break-words">
                  {message.content.length > 100 
                    ? `${message.content.substring(0, 100)}...` 
                    : message.content}
                </div>
                <div className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 mt-3">
              <button
                onClick={() => {
                  onDismiss(message.id);
                  setVisibleMessages(prev => prev.filter(m => m.id !== message.id));
                }}
                className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded transition-colors"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  onOpenChat(message.fromUser);
                  onDismiss(message.id);
                  setVisibleMessages(prev => prev.filter(m => m.id !== message.id));
                }}
                className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 rounded transition-colors"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}