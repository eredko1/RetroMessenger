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
      className="win-window absolute w-96 h-80 shadow-2xl md:w-full md:h-full md:inset-0 md:relative border-2 border-gray-400 rounded-lg overflow-hidden"
      style={{ 
        left: position.x, 
        top: position.y,
      }}
    >
      {/* Title Bar */}
      <div className="win-titlebar px-3 py-2 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
              {buddyName[0].toUpperCase()}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-white ${isOnline ? 'bg-green-400' : 'bg-gray-400'} shadow-sm`}></span>
          </div>
          <span className="text-white font-bold text-sm">Chat with {buddyName}</span>
        </div>
        <div className="flex space-x-1">
          <button className="w-5 h-5 bg-gray-200 hover:bg-gray-300 border border-gray-400 text-xs rounded-sm transition-colors">_</button>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors"
            title="Close Chat"
          >
            ×
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
    </div>
  );
}
