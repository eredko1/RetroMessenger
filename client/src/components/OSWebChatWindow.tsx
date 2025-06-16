import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface OSWebChatWindowProps {
  user: any;
  buddy: any;
  socket: WebSocket | null;
  onClose: () => void;
}

interface Message {
  id: number;
  content: string;
  fromUserId: number;
  toUserId: number;
  timestamp: string;
  isRead: boolean;
}

export default function OSWebChatWindow({ user, buddy, socket, onClose }: OSWebChatWindowProps) {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: messages = [] } = useQuery({
    queryKey: [`/api/user/${user?.id}/conversations/${buddy?.id}`],
    enabled: !!user?.id && !!buddy?.id,
    refetchInterval: 2000,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest('/api/messages', {
        method: 'POST',
        body: {
          toUserId: buddy.id,
          content: content.trim()
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/user/${user.id}/conversations/${buddy.id}`] 
      });
      setMessage('');
    }
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'new_message' && 
            (data.fromUserId === buddy.id || data.toUserId === buddy.id)) {
          queryClient.invalidateQueries({ 
            queryKey: [`/api/user/${user.id}/conversations/${buddy.id}`] 
          });
        } else if (data.type === 'typing' && data.fromUserId === buddy.id) {
          setIsTyping(true);
          setTimeout(() => setIsTyping(false), 3000);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, buddy.id, user.id, queryClient]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    sendMessageMutation.mutate(message);

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'message',
        toUserId: buddy.id,
        content: message.trim()
      }));
    }
  };

  const handleTyping = (value: string) => {
    setMessage(value);

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({
        type: 'typing',
        toUserId: buddy.id
      }));
    }

    if (typingTimeout) clearTimeout(typingTimeout);
    const timeout = setTimeout(() => {
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'stop_typing',
          toUserId: buddy.id
        }));
      }
    }, 1000);
    setTypingTimeout(timeout);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="h-full flex flex-col bg-[var(--window-content-bg)]">
      {/* Chat Header */}
      <div className="p-4 border-b border-[var(--border-color)] bg-[var(--surface-overlay-bg)]">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img 
              src={`https://placehold.co/40x40/82AAFF/1E1E1E?text=${buddy.screenName?.charAt(0) || 'U'}&font=roboto`} 
              alt={buddy.screenName} 
              className="rounded-full h-10 w-10"
            />
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--surface-bg)] ${
              buddy.isOnline ? 'bg-green-500' : 'bg-gray-400'
            }`}></div>
          </div>
          <div className="flex-1">
            <div className="font-semibold text-[var(--text-primary)]">{buddy.screenName}</div>
            <div className="text-sm text-[var(--text-secondary)]">
              {buddy.isOnline ? 'Online' : 'Offline'}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-[var(--surface-active-bg)] text-[var(--text-secondary)] hover:text-[var(--error-color)] transition-colors"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-secondary)]">
            <i className="fas fa-comment text-3xl mb-2 opacity-50"></i>
            <p className="text-sm">Start a conversation with {buddy.screenName}</p>
          </div>
        ) : (
          messages.map((msg: Message) => {
            const isFromUser = msg.fromUserId === user.id;
            return (
              <div 
                key={msg.id}
                className={`flex ${isFromUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                  isFromUser 
                    ? 'bg-[var(--accent-color)] text-white' 
                    : 'bg-[var(--surface-overlay-bg)] text-[var(--text-primary)]'
                }`}>
                  <div className="break-words">
                    {msg.content}
                  </div>
                  <div className={`text-xs mt-1 ${
                    isFromUser ? 'text-white/70' : 'text-[var(--text-secondary)]'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              </div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[var(--surface-overlay-bg)] text-[var(--text-secondary)] px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--border-color)] bg-[var(--surface-overlay-bg)]">
        <div className="flex space-x-3">
          <input
            type="text"
            value={message}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder={`Message ${buddy.screenName}...`}
            className="flex-1 p-3 rounded-lg bg-[var(--window-content-bg)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
            disabled={sendMessageMutation.isPending}
          />
          <button
            type="submit"
            disabled={!message.trim() || sendMessageMutation.isPending}
            className="px-4 py-3 rounded-lg bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {sendMessageMutation.isPending ? (
              <i className="fas fa-spinner fa-spin"></i>
            ) : (
              <i className="fas fa-paper-plane"></i>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}