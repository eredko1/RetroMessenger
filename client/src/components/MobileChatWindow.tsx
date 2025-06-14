import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MobileChatWindowProps {
  chatId: string;
  currentUser: any;
  buddyId: number;
  buddyName: string;
  isOnline: boolean;
  onClose: () => void;
  socket: WebSocket | null;
}

export default function MobileChatWindow({
  chatId,
  currentUser,
  buddyId,
  buddyName,
  isOnline,
  onClose,
  socket
}: MobileChatWindowProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [buddyTyping, setBuddyTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch conversation history
  const { data: messages = [], refetch } = useQuery({
    queryKey: ['/api/conversation', currentUser.id, buddyId],
    queryFn: () => apiRequest('GET', `/api/conversation?userId1=${currentUser.id}&userId2=${buddyId}&limit=50`)
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      return await apiRequest('POST', '/api/messages', messageData);
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['/api/conversation'] });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket message handling
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'message' && 
          ((data.fromUserId === buddyId && data.toUserId === currentUser.id) ||
           (data.fromUserId === currentUser.id && data.toUserId === buddyId))) {
        refetch();
      }
      
      if (data.type === 'typing' && data.fromUserId === buddyId) {
        setBuddyTyping(data.isTyping);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, buddyId, currentUser.id, refetch]);

  const handleSendMessage = async () => {
    if (!message.trim() || sendMessageMutation.isPending) return;

    const messageData = {
      fromUserId: currentUser.id,
      toUserId: buddyId,
      content: message.trim()
    };

    // Send via WebSocket first for real-time delivery
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'message',
        ...messageData
      }));
    }

    // Also save to database
    await sendMessageMutation.mutateAsync(messageData);
    setMessage("");

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
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Mobile Title Bar */}
      <div className="xp-titlebar flex justify-between items-center px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full" style={{ background: isOnline ? '#00ff00' : '#808080' }}></div>
          <span className="text-white font-bold text-sm">Chat with {buddyName}</span>
        </div>
        <button 
          onClick={onClose}
          className="w-8 h-8 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-lg rounded-sm transition-colors flex items-center justify-center"
        >
          ×
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 bg-white"
        style={{ paddingBottom: '80px' }}
      >
        {!messages || messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-8">
            No messages yet. Start a conversation!
          </div>
        ) : (
          messages.map((msg: any, index: number) => (
            <div key={index} className="mb-4">
              <div className="text-xs text-gray-600 mb-1">
                <span className="font-bold">
                  {msg.fromUserId === currentUser.id ? currentUser.screenName : buddyName}
                </span>
                <span className="ml-2 opacity-70">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
              <div 
                className="text-sm break-words p-3 rounded-lg max-w-xs"
                style={{ 
                  background: msg.fromUserId === currentUser.id ? '#e6f3ff' : '#f0f0f0',
                  marginLeft: msg.fromUserId === currentUser.id ? 'auto' : '0',
                  marginRight: msg.fromUserId === currentUser.id ? '0' : 'auto'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        
        {buddyTyping && (
          <div className="text-sm text-gray-500 italic mb-4">
            {buddyName} is typing...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gray-100 border-t">
        <div className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message here..."
            className="flex-1 px-4 py-3 text-base border rounded-lg"
            style={{ 
              background: 'white',
              borderColor: '#ccc',
              minHeight: '48px'
            }}
            disabled={sendMessageMutation.isPending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg disabled:opacity-50"
            style={{ minHeight: '48px', minWidth: '80px' }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}