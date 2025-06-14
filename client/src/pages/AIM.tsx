import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAIMSounds } from "@/hooks/useAIMSounds";
import BuddyList from "@/components/BuddyList";
import ChatWindow from "@/components/ChatWindow";
import AwayMessageDialog from "@/components/AwayMessageDialog";
import BuddyProfile from "@/components/BuddyProfile";
import LoginForm from "@/components/LoginForm";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  screenName: string;
  status: string;
}

interface ChatWindowData {
  id: string;
  buddyId: number;
  buddyName: string;
  isOnline: boolean;
}

export default function AIM() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [openChats, setOpenChats] = useState<ChatWindowData[]>([]);
  const [showAwayDialog, setShowAwayDialog] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { toast } = useToast();
  const { playMessageSound, playBuddyOnlineSound } = useAIMSounds();

  const { socket, isConnected } = useWebSocket(currentUser);

  // Fetch buddy list
  const { data: buddies = [], refetch: refetchBuddies } = useQuery({
    queryKey: ['/api/user/' + currentUser?.id + '/buddies'],
    enabled: !!currentUser,
  });

  // Listen for WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
          playMessageSound();
          // Add notification
          setNotifications(prev => [...prev, {
            id: Date.now(),
            type: 'message',
            from: data.message.fromUser.screenName,
            content: data.message.content,
            timestamp: new Date()
          }]);
          
          // Update chat window if open
          queryClient.invalidateQueries({
            queryKey: ['/api/conversation']
          });
          break;
          
        case 'user_online':
          playBuddyOnlineSound();
          refetchBuddies();
          toast({
            title: "Buddy Online",
            description: `${data.screenName} has signed on`,
          });
          break;
          
        case 'user_offline':
          refetchBuddies();
          toast({
            title: "Buddy Offline", 
            description: `${data.screenName} has signed off`,
          });
          break;
          
        case 'status_change':
          refetchBuddies();
          break;
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => socket.removeEventListener('message', handleMessage);
  }, [socket, playMessageSound, playBuddyOnlineSound, refetchBuddies, toast]);

  // Auto-hide notifications
  useEffect(() => {
    notifications.forEach(notification => {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== notification.id));
      }, 5000);
    });
  }, [notifications]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setOpenChats([]);
    setShowAwayDialog(false);
    setSelectedBuddy(null);
  };

  const openChat = (buddy: any) => {
    const chatId = `chat-${buddy.id}`;
    if (!openChats.find(chat => chat.id === chatId)) {
      setOpenChats(prev => [...prev, {
        id: chatId,
        buddyId: buddy.id,
        buddyName: buddy.screenName,
        isOnline: buddy.isOnline
      }]);
    }
  };

  const closeChat = (chatId: string) => {
    setOpenChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const updateUserStatus = useMutation({
    mutationFn: async ({ status, awayMessage }: { status: string; awayMessage?: string }) => {
      if (!currentUser) return;
      await apiRequest('PUT', `/api/user/${currentUser.id}/status`, { status, awayMessage });
    },
    onSuccess: () => {
      refetchBuddies();
    }
  });

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="w-screen h-screen relative bg-win-gray font-system text-xs overflow-hidden">
      {/* Buddy List */}
      <BuddyList
        user={currentUser}
        buddies={buddies}
        onOpenChat={openChat}
        onShowAwayDialog={() => setShowAwayDialog(true)}
        onShowProfile={setSelectedBuddy}
        onLogout={handleLogout}
        onStatusChange={(status, awayMessage) => 
          updateUserStatus.mutate({ status, awayMessage })
        }
      />

      {/* Chat Windows */}
      {openChats.map((chat, index) => (
        <ChatWindow
          key={chat.id}
          chatId={chat.id}
          currentUser={currentUser}
          buddyId={chat.buddyId}
          buddyName={chat.buddyName}
          isOnline={chat.isOnline}
          position={{ x: 320 + (index * 50), y: 80 + (index * 50) }}
          onClose={() => closeChat(chat.id)}
          socket={socket}
        />
      ))}

      {/* Away Message Dialog */}
      {showAwayDialog && (
        <AwayMessageDialog
          onClose={() => setShowAwayDialog(false)}
          onSetAway={(message) => {
            updateUserStatus.mutate({ status: 'away', awayMessage: message });
            setShowAwayDialog(false);
          }}
        />
      )}

      {/* Buddy Profile */}
      {selectedBuddy && (
        <BuddyProfile
          buddy={selectedBuddy}
          onClose={() => setSelectedBuddy(null)}
          onSendMessage={() => {
            openChat(selectedBuddy);
            setSelectedBuddy(null);
          }}
        />
      )}

      {/* Notifications */}
      {notifications.map(notification => (
        <div
          key={notification.id}
          className="notification-popup absolute bottom-8 right-8 p-3 rounded shadow-lg max-w-xs z-50"
          style={{ bottom: `${8 + (notifications.indexOf(notification) * 80)}px` }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
            <div className="text-xs">
              <div className="font-bold">New Instant Message</div>
              <div>From: {notification.from}</div>
              <div className="text-gray-600 truncate">{notification.content}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
