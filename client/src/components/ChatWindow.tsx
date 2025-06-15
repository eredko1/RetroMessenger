import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import RichTextInput from "./RichTextInput";
import RichTextEditor from "./RichTextEditor";

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
  const [messageFormatting, setMessageFormatting] = useState<any>({});
  const [isTyping, setIsTyping] = useState(false);
  const [buddyTyping, setBuddyTyping] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const windowRef = useRef<HTMLDivElement>(null);

  // Fetch conversation history with proper pagination
  const { data: messages = [], refetch } = useQuery({
    queryKey: ['/api/conversation', currentUser.id, buddyId],
    queryFn: () => {
      console.log('Fetching messages for:', currentUser.id, buddyId);
      return apiRequest(`/api/conversation?userId1=${currentUser.id}&userId2=${buddyId}&limit=100`);
    },
    refetchInterval: 2000,
    select: (data) => {
      console.log('Received message data:', data);
      return Array.isArray(data) ? data : [];
    }
  });

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return await apiRequest('/api/messages', messageData);
    },
    onSuccess: () => {
      setMessage("");
      setMessageFormatting({});
      queryClient.invalidateQueries({ queryKey: ['/api/conversation', currentUser.id, buddyId] });
      scrollToBottom();
    }
  });

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // WebSocket message handling
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message' && (data.fromUserId === buddyId || data.toUserId === buddyId)) {
        queryClient.invalidateQueries({ queryKey: ['/api/conversation', currentUser.id, buddyId] });
        scrollToBottom();
      }
      
      if (data.type === 'typing' && data.fromUserId === buddyId) {
        setBuddyTyping(data.isTyping);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, buddyId, currentUser.id]);

  // Mouse and touch event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.xp-titlebar')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.xp-titlebar')) return;
    
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      onMove(chatId, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
    
    if (isResizing) {
      const newWidth = Math.max(320, resizeStart.width + (e.clientX - resizeStart.x));
      const newHeight = Math.max(240, resizeStart.height + (e.clientY - resizeStart.y));
      onResize(chatId, { width: newWidth, height: newHeight });
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (isDragging) {
      const touch = e.touches[0];
      onMove(chatId, {
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  // Resize handle mouse down
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const messageData = {
      fromUserId: currentUser.id,
      toUserId: buddyId,
      content: message.trim(),
      formatting: messageFormatting,
      timestamp: new Date().toISOString()
    };

    sendMessageMutation.mutate(messageData);
    
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

  const handleImageUpload = (file: File) => {
    // Create a data URL for the image
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      const messageData = {
        fromUserId: currentUser.id,
        toUserId: buddyId,
        content: `[Image] ${file.name}`,
        imageUrl: imageData,
        timestamp: new Date().toISOString()
      };
      sendMessageMutation.mutate(messageData);
    };
    reader.readAsDataURL(file);
  };

  const handleTyping = (content: string) => {
    setMessage(content);

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
      hour12: true
    });
  };

  return (
    <div
      ref={windowRef}
      className="fixed bg-white shadow-lg select-none"
      style={{
        left: position.x,
        top: position.y,
        width: Math.max(320, size.width),
        height: Math.max(240, size.height),
        zIndex: zIndex,
        border: '2px outset hsl(0, 0%, 85%)',
        minWidth: '320px',
        minHeight: '240px'
      }}
      onMouseDown={(e) => {
        onFocus(chatId);
        handleMouseDown(e);
      }}
      onTouchStart={(e) => {
        onFocus(chatId);
        handleTouchStart(e);
      }}
    >
      {/* Windows XP Title Bar */}
      <div className="xp-titlebar cursor-move flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 flex items-center justify-center"
               style={{ background: isOnline ? '#00ff00' : '#808080' }}>
            <span style={{ fontSize: '8px' }}>💬</span>
          </div>
          <span>Chat with {buddyName}</span>
        </div>
        <div className="flex space-x-1">
          <button className="xp-close-button" onClick={onClose}>×</button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex flex-col h-full" style={{ height: 'calc(100% - 22px)' }}>
        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-2 border-b"
          style={{ 
            background: 'white',
            maxHeight: 'calc(100% - 100px)',
            minHeight: '120px'
          }}
        >
          {!messages || messages.length === 0 ? (
            <div className="text-center text-gray-500 text-xs mt-4">
              No messages yet. Start a conversation!
            </div>
          ) : (
            messages.map((msg: any, index: number) => (
              <div key={index} className="mb-2">
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-bold">
                    {msg.fromUserId === currentUser.id ? currentUser.screenName : buddyName}
                  </span>
                  <span className="ml-2 opacity-70">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div 
                  className="text-xs break-words"
                  style={{ 
                    background: msg.fromUserId === currentUser.id ? '#e6f3ff' : '#f0f0f0',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    marginLeft: msg.fromUserId === currentUser.id ? '20px' : '0',
                    marginRight: msg.fromUserId === currentUser.id ? '0' : '20px'
                  }}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
          
          {buddyTyping && (
            <div className="text-xs text-gray-500 italic">
              {buddyName} is typing...
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Rich Text Message Input Area */}
        <div className="p-2 bg-gray-100 border-t">
          <RichTextEditor
            value={message}
            onChange={(content, formatting) => {
              setMessage(content);
              setMessageFormatting(formatting || {});
              handleTyping(content);
            }}
            onSend={handleSendMessage}
            onImageUpload={handleImageUpload}
            placeholder="Type your message here... Use formatting tools and send images!"
            disabled={sendMessageMutation.isPending}
          />
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
        style={{
          background: 'linear-gradient(135deg, transparent 0%, transparent 30%, #666 30%, #666 70%, transparent 70%)',
        }}
        onMouseDown={handleResizeMouseDown}
      />
    </div>
  );
}