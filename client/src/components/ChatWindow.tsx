import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import RichTextInput from "./RichTextInput";

interface ChatWindowProps {
  chatId: string;
  currentUser: any;
  buddyId: number;
  buddyName: string;
  isOnline: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onClose: () => void;
  onMove: (chatId: string, position: { x: number; y: number }) => void;
  onResize: (chatId: string, size: { width: number; height: number }) => void;
  socket: WebSocket | null;
  zIndex: number;
  onFocus: (chatId: string) => void;
}

export default function ChatWindow({
  chatId,
  currentUser,
  buddyId,
  buddyName,
  isOnline,
  position,
  size,
  onClose,
  onMove,
  onResize,
  socket,
  zIndex,
  onFocus
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [buddyTyping, setBuddyTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const windowRef = useRef<HTMLDivElement>(null);

  // Fetch conversation history
  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ['/api/conversation', currentUser.id, buddyId],
    refetchInterval: 1000, // Poll for new messages
  });

  // Send message mutation - works for both online and offline users
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest('POST', '/api/messages', {
        fromUserId: currentUser.id,
        toUserId: buddyId,
        content
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/conversation', currentUser.id, buddyId]
      });
      setMessage("");
    }
  });

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('win-titlebar')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      onFocus(chatId);
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      onMove(chatId, { x: newX, y: newY });
    } else if (isResizing) {
      const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x));
      const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y));
      onResize(chatId, { width: newWidth, height: newHeight });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
    onFocus(chatId);
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle typing indicators
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === 'typing' && data.fromUserId === buddyId) {
        setBuddyTyping(data.isTyping);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, buddyId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate(message);
    
    // Stop typing indicator
    if (socket && isTyping) {
      socket.send(JSON.stringify({
        type: 'typing',
        toUserId: buddyId,
        isTyping: false
      }));
      setIsTyping(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(e.target.value);

    if (!socket) return;

    // Send typing indicator
    if (!isTyping) {
      socket.send(JSON.stringify({
        type: 'typing',
        toUserId: buddyId,
        isTyping: true
      }));
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      if (socket && isTyping) {
        socket.send(JSON.stringify({
          type: 'typing',
          toUserId: buddyId,
          isTyping: false
        }));
        setIsTyping(false);
      }
    }, 2000);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div 
      ref={windowRef}
      className="win-window absolute shadow-2xl md:w-full md:h-full md:inset-0 md:relative border-2 border-gray-400 rounded-lg overflow-hidden select-none"
      style={{ 
        left: position.x, 
        top: position.y,
        width: size.width,
        height: size.height,
        zIndex: zIndex,
        cursor: isDragging ? 'move' : 'default'
      }}
      onClick={() => onFocus(chatId)}
    >
      {/* Title Bar */}
      <div 
        className="win-titlebar px-3 py-2 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
              {buddyName[0].toUpperCase()}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'} shadow-sm`}></span>
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-sm">Chat with {buddyName}</span>
            {!isOnline && (
              <span className="text-blue-200 text-xs">Offline - messages will be delivered when they return</span>
            )}
          </div>
        </div>
        <div className="flex space-x-1">
          <button 
            className="w-5 h-5 bg-gray-200 hover:bg-gray-300 border border-gray-400 text-xs rounded-sm transition-colors flex items-center justify-center"
            title="Minimize"
          >
            <span className="text-gray-600 text-xs leading-none">‾</span>
          </button>
          <button 
            className="w-5 h-5 bg-gray-200 hover:bg-gray-300 border border-gray-400 text-xs rounded-sm transition-colors flex items-center justify-center"
            title="Maximize"
          >
            <span className="text-gray-600 text-xs leading-none">□</span>
          </button>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors flex items-center justify-center"
            title="Close Chat"
          >
            <span className="leading-none">×</span>
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="chat-history flex-1 overflow-y-auto bg-white p-3 md:flex-1">
        {(messages as any[]).map((msg: any) => (
          <div key={msg.id} className="mb-3">
            <div className="flex items-start space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm flex-shrink-0">
                {(msg.fromUserId === currentUser.id ? currentUser.screenName : buddyName)[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2">
                  <span className={`font-medium text-sm ${msg.fromUserId === currentUser.id ? 'text-blue-600' : 'text-purple-600'}`}>
                    {msg.fromUserId === currentUser.id ? currentUser.screenName : buddyName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div className="message-content text-gray-800 text-sm mt-1 break-words">
                  {msg.content}
                </div>
              </div>
            </div>
          </div>
        ))}
        {buddyTyping && (
          <div className="flex items-center space-x-2 text-gray-500 text-sm italic">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span>{buddyName} is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-gray-400 p-2">
        <div className="flex space-x-1 mb-1">
          <button className="win-button px-2 py-0 text-xs font-bold">B</button>
          <button className="win-button px-2 py-0 text-xs italic">I</button>
          <button className="win-button px-2 py-0 text-xs underline">U</button>
          <button className="win-button px-2 py-0 text-xs">😊</button>
        </div>
        <form onSubmit={handleSendMessage} className="flex space-x-1">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            className="aim-input flex-1 text-xs"
            placeholder="Type your message here..."
            disabled={sendMessageMutation.isPending}
          />
          <button 
            type="submit"
            className="win-button px-3 py-1 text-xs font-bold"
            disabled={sendMessageMutation.isPending || !message.trim()}
          >
            Send
          </button>
        </form>
      </div>
      
      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-4 h-4 cursor-nw-resize opacity-50 hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeMouseDown}
        style={{
          background: 'linear-gradient(-45deg, transparent 40%, #666 40%, #666 60%, transparent 60%)',
        }}
      />
    </div>
  );
}
