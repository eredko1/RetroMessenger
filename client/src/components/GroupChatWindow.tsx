import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatTime } from "@/lib/aimUtils";
import { Minus, X, Users, Image, Upload } from "lucide-react";
import RichTextEditor from "./RichTextEditor";

interface GroupChatWindowProps {
  chatId: string;
  currentUser: any;
  participants: Array<{ id: number; screenName: string; isOnline: boolean }>;
  position: { x: number; y: number };
  size: { width: number; height: number };
  onClose: () => void;
  onMove: (chatId: string, position: { x: number; y: number }) => void;
  onResize: (chatId: string, size: { width: number; height: number }) => void;
  socket: WebSocket | null;
  zIndex: number;
  onFocus: (chatId: string) => void;
  onMinimize?: (chatId: string) => void;
}

export default function GroupChatWindow({
  chatId,
  currentUser,
  participants,
  position,
  size,
  onClose,
  onMove,
  onResize,
  socket,
  zIndex,
  onFocus,
  onMinimize
}: GroupChatWindowProps) {
  const [message, setMessage] = useState("");
  const [messageFormatting, setMessageFormatting] = useState<any>({});
  const [messages, setMessages] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Send group message mutation
  const sendGroupMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      // Send message to each participant
      const promises = participants.map(participant => 
        apiRequest('/api/messages', 'POST', {
          fromUserId: currentUser.id,
          toUserId: participant.id,
          content: `[Group] ${messageData.content}`,
          formatting: messageData.formatting,
          imageUrl: messageData.imageUrl,
          timestamp: messageData.timestamp
        })
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      const newMessage = {
        id: Date.now(),
        fromUserId: currentUser.id,
        fromUserName: currentUser.screenName,
        content: message,
        formatting: messageFormatting,
        timestamp: new Date().toISOString(),
        isGroup: true
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
      setMessageFormatting({});
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

  // WebSocket message handling for group responses
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_message' && data.message.content?.startsWith('[Group]')) {
        const participant = participants.find(p => p.id === data.message.fromUserId);
        if (participant && data.message.fromUserId !== currentUser.id) {
          const newMessage = {
            id: data.message.id,
            fromUserId: data.message.fromUserId,
            fromUserName: participant.screenName,
            content: data.message.content.replace('[Group] ', ''),
            formatting: data.message.formatting,
            imageUrl: data.message.imageUrl,
            timestamp: data.message.timestamp,
            isGroup: true
          };
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });
          scrollToBottom();
        }
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, participants, currentUser.id]);

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
      const newWidth = Math.max(400, resizeStart.width + (e.clientX - resizeStart.x));
      const newHeight = Math.max(300, resizeStart.height + (e.clientY - resizeStart.y));
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
      content: message.trim(),
      formatting: messageFormatting,
      timestamp: new Date().toISOString()
    };

    sendGroupMessageMutation.mutate(messageData);
  };

  const handleImageUpload = async (file: File) => {
    try {
      const { compressImage, isSupportedImageType, formatFileSize } = await import('@/lib/imageUtils');
      
      if (!isSupportedImageType(file)) {
        alert('Unsupported image format. Please use JPEG, PNG, GIF, WebP, or BMP.');
        return;
      }

      const compressedImage = await compressImage(file);
      
      sendGroupMessageMutation.mutate({
        content: `[Image: ${file.name} - ${formatFileSize(compressedImage.compressedSize)}]`,
        imageUrl: compressedImage.dataUrl,
        formatting: null,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Group chat image upload failed:', error);
      alert('Failed to upload image. Please try again.');
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const participantNames = participants.map(p => p.screenName).join(', ');
  const onlineCount = participants.filter(p => p.isOnline).length;

  return (
    <div
      ref={windowRef}
      className="fixed bg-white shadow-lg select-none"
      style={{
        left: position.x,
        top: position.y,
        width: Math.max(400, size.width),
        height: Math.max(300, size.height),
        zIndex: zIndex,
        border: '2px outset hsl(0, 0%, 85%)',
        minWidth: '400px',
        minHeight: '300px'
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
          <div className="w-4 h-4 flex items-center justify-center bg-purple-500">
            <span style={{ fontSize: '8px' }}>👥</span>
          </div>
          <span>Group Chat ({onlineCount}/{participants.length} online)</span>
        </div>
        <div className="flex space-x-1">
          {onMinimize && (
            <button 
              className="xp-minimize-button w-4 h-4 text-xs flex items-center justify-center hover:bg-gray-300 transition-colors"
              onClick={() => onMinimize(chatId)}
              title="Minimize"
              style={{
                background: 'linear-gradient(to bottom, #f0f0f0 0%, #e0e0e0 50%, #d0d0d0 100%)',
                border: '1px solid #999',
                color: '#333'
              }}
            >
              _
            </button>
          )}
          <button className="xp-close-button" onClick={onClose}>×</button>
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex flex-col h-full" style={{ height: 'calc(100% - 22px)' }}>
        {/* Participants Bar */}
        <div className="p-2 bg-gray-100 border-b text-xs">
          <div className="font-bold mb-1">Participants:</div>
          <div className="flex flex-wrap gap-1">
            {participants.map(participant => (
              <span
                key={participant.id}
                className="px-2 py-1 rounded"
                style={{
                  background: participant.isOnline ? '#e6ffe6' : '#ffe6e6',
                  color: participant.isOnline ? '#006600' : '#660000'
                }}
              >
                {participant.screenName} {participant.isOnline ? '●' : '○'}
              </span>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-2 border-b"
          style={{ 
            background: 'white',
            maxHeight: 'calc(100% - 120px)',
            minHeight: '140px'
          }}
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 text-xs mt-4">
              Welcome to the group chat! Messages will be sent to all participants, including offline users.
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className="mb-2">
                <div className="text-xs text-gray-600 mb-1">
                  <span className="font-bold" style={{ color: '#0066cc' }}>
                    {msg.fromUserName}
                  </span>
                  <span className="ml-2 opacity-70">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div 
                  className="text-xs break-words"
                  style={{ 
                    background: msg.fromUserId === currentUser.id ? '#e6f3ff' : '#f5f5ff',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    marginLeft: '20px',
                    borderLeft: '3px solid #0066cc'
                  }}
                >
                  {/* Render formatted text content */}
                  <div className="whitespace-pre-wrap">
                    {msg.content}
                  </div>
                  
                  {/* Render image if present */}
                  {msg.imageUrl && (
                    <div className="mt-2">
                      <img 
                        src={msg.imageUrl} 
                        alt="Shared image"
                        className="max-w-full h-auto rounded border shadow-sm cursor-pointer"
                        style={{ maxWidth: '200px', maxHeight: '150px' }}
                        onClick={() => {
                          // Open image in new window for full view
                          const newWindow = window.open('', '_blank');
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head><title>Image Viewer</title></head>
                                <body style="margin:0; display:flex; justify-content:center; align-items:center; min-height:100vh; background:#000;">
                                  <img src="${msg.imageUrl}" style="max-width:100%; max-height:100vh; object-fit:contain;" />
                                </body>
                              </html>
                            `);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="p-2 bg-gray-100 border-t">
          <RichTextEditor
            value={message}
            onChange={(content, formatting) => {
              setMessage(content);
              setMessageFormatting(formatting || {});
            }}
            onSend={handleSendMessage}
            onImageUpload={handleImageUpload}
            placeholder="Type your group message here... Use formatting tools and send images!"
            disabled={sendGroupMessageMutation.isPending}
          />
          <div className="text-xs text-gray-600 mt-1">
            Message will be sent to all {participants.length} participants (including offline users)
          </div>
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