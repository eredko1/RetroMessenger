import React from "react";
import { formatTime } from "@/lib/aimUtils";

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
  if (messages.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {messages.map((message) => (
        <div
          key={message.id}
          className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 min-w-80 max-w-96 shadow-lg animate-bounce"
          style={{
            boxShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            border: '2px outset #fbbf24'
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center">
                <span className="text-xs text-white font-bold">💬</span>
              </div>
              <span className="font-bold text-sm text-gray-900">New Message!</span>
            </div>
            <button
              onClick={() => onDismiss(message.id)}
              className="w-4 h-4 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors flex items-center justify-center"
            >
              <span className="leading-none">×</span>
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-bold text-blue-700">{message.fromUser}</span>
              <span className="text-gray-600 ml-2 text-xs">
                {formatTime(message.timestamp)}
              </span>
            </div>
            <div className="text-sm text-gray-800 bg-white p-2 rounded border border-gray-300">
              {message.content.length > 50 
                ? `${message.content.substring(0, 50)}...` 
                : message.content
              }
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-3">
            <button
              onClick={() => onDismiss(message.id)}
              className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onOpenChat(message.fromUser);
                onDismiss(message.id);
              }}
              className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 rounded transition-colors"
            >
              Reply
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}