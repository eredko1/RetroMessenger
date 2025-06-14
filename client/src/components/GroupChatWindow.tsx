import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
  onFocus
}: GroupChatWindowProps) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  // Send group message mutation
  const sendGroupMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      // Send message to each participant
      const promises = participants.map(participant => 
        apiRequest('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromUserId: currentUser.id,
            toUserId: participant.id,
            content: `[Group] ${messageData.content}`,
            timestamp: messageData.timestamp
          })
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
        timestamp: new Date().toISOString(),
        isGroup: true
      };
      setMessages(prev => [...prev, newMessage]);
      setMessage("");
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
      
      if (data.type === 'message' && data.content?.startsWith('[Group]')) {
        const participant = participants.find(p => p.id === data.fromUserId);
        if (participant) {
          const newMessage = {
            id: Date.now() + Math.random(),
            fromUserId: data.fromUserId,
            fromUserName: participant.screenName,
            content: data.content.replace('[Group] ', ''),
            timestamp: data.timestamp,
            isGroup: true
          };
          setMessages(prev => [...prev, newMessage]);
          scrollToBottom();
        }
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, participants]);

  // Mouse event handlers for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).closest('.xp-titlebar')) return;
    
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
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

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
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
      timestamp: new Date().toISOString()
    };

    sendGroupMessageMutation.mutate(messageData);
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
                  {msg.content}
                </div>
              </div>
            ))
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="p-2 bg-gray-100 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your group message here..."
              className="flex-1 px-2 py-1 text-xs border"
              style={{ 
                background: 'white',
                borderColor: 'var(--xp-border-dark)',
                borderTopColor: 'var(--xp-border-light)',
                borderLeftColor: 'var(--xp-border-light)'
              }}
              disabled={sendGroupMessageMutation.isPending}
            />
            <button
              onClick={handleSendMessage}
              disabled={!message.trim() || sendGroupMessageMutation.isPending}
              className="xp-button px-3 py-1 text-xs"
            >
              Send to All
            </button>
          </div>
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