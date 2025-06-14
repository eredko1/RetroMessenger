import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface ChatWindowProps {
  chatId: string;
  currentUser: any;
  buddyId: number;
  buddyName: string;
  isOnline: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  socket: WebSocket | null;
}

export default function ChatWindow({
  chatId,
  currentUser,
  buddyId,
  buddyName,
  isOnline,
  position,
  onClose,
  socket
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [buddyTyping, setBuddyTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  // Fetch conversation history
  const { data: messages = [] } = useQuery<any[]>({
    queryKey: ['/api/conversation', currentUser.id, buddyId],
    refetchInterval: 1000, // Poll for new messages
  });

  // Send message mutation
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
      className="win-window absolute w-80 h-64 shadow-lg md:w-full md:h-full md:inset-0 md:relative"
      style={{ 
        left: position.x, 
        top: position.y,
      }}
    >
      {/* Title Bar */}
      <div className="win-titlebar px-2 py-1 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className={`status-dot ${isOnline ? 'status-online' : 'status-offline'}`}></span>
          <span className="text-white font-bold text-xs">
            Instant Message from {buddyName}
          </span>
        </div>
        <div className="flex space-x-1">
          <button className="w-4 h-4 bg-gray-300 border border-gray-500 text-xs">_</button>
          <button 
            onClick={onClose}
            className="w-4 h-4 bg-red-500 border border-red-700 text-white text-xs"
          >
            ×
          </button>
        </div>
      </div>

      {/* Chat History */}
      <div className="chat-history h-40 md:flex-1 overflow-y-auto">
        {(messages as any[]).map((msg: any) => (
          <div key={msg.id} className="mb-2">
            <div className={`message-sender ${msg.fromUserId === currentUser.id ? 'text-red-600' : 'text-blue-600'}`}>
              {msg.fromUserId === currentUser.id ? currentUser.screenName : buddyName}:
            </div>
            <div className="message-content">{msg.content}</div>
            <div className="message-time">{formatTime(msg.timestamp)}</div>
          </div>
        ))}
        {buddyTyping && (
          <div className="mb-2 text-gray-500 italic text-xs">
            {buddyName} is typing...
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
    </div>
  );
}
