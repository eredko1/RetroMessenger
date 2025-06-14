import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAIMSounds } from "@/hooks/useAIMSounds";
import BuddyList from "@/components/BuddyList";
import ChatWindow from "@/components/ChatWindow";
import GroupChatWindow from "@/components/GroupChatWindow";
import AwayMessageDialog from "@/components/AwayMessageDialog";
import BuddyProfile from "@/components/BuddyProfile";
import AddBuddyDialog from "@/components/AddBuddyDialog";
import UserProfileEditor from "@/components/UserProfileEditor";
import OfflineNotification from "@/components/OfflineNotification";
import SystemTrayNotification from "@/components/SystemTrayNotification";
import BuddyAlertSettings from "@/components/BuddyAlertSettings";
import WindowsTaskbar from "@/components/WindowsTaskbar";
import DesktopIcons from "@/components/DesktopIcons";
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
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export default function AIM() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [openChats, setOpenChats] = useState<ChatWindowData[]>([]);
  const [openGroupChats, setOpenGroupChats] = useState<any[]>([]);
  const [selectedBuddies, setSelectedBuddies] = useState<number[]>([]);
  const [showAwayDialog, setShowAwayDialog] = useState(false);
  const [selectedBuddy, setSelectedBuddy] = useState<any>(null);
  const [showAddBuddy, setShowAddBuddy] = useState(false);
  const [showProfileEditor, setShowProfileEditor] = useState(false);
  const [showBuddyAlerts, setShowBuddyAlerts] = useState<any>(null);
  const [offlineMessages, setOfflineMessages] = useState<any[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);
  const { toast } = useToast();
  const { playMessageSound, playBuddyOnlineSound, playCustomBuddySound, playSystemNotificationSound } = useAIMSounds();

  const { socket, isConnected } = useWebSocket(currentUser);

  // Fetch buddy list
  const { data: buddies = [], refetch: refetchBuddies } = useQuery<any[]>({
    queryKey: [`/api/user/${currentUser?.id}/buddies`],
    enabled: !!currentUser,
    refetchInterval: 5000, // Refresh every 5 seconds to update online status
  });

  // Listen for WebSocket messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'new_message':
          playMessageSound();
          
          // Show system tray notification for new message
          const messageNotification = {
            id: Date.now().toString(),
            title: 'New Message',
            message: `Message from ${data.message.fromUser?.screenName || 'Unknown'}`,
            type: 'info' as const
          };
          setSystemNotifications(prev => [...prev, messageNotification]);
          
          // Add offline notification for messages when user is away
          if (currentUser?.status === 'away') {
            setOfflineMessages(prev => [...prev, {
              id: `offline-${Date.now()}`,
              fromUser: data.message.fromUser.screenName,
              content: data.message.content,
              timestamp: new Date()
            }]);
          }
          
          // Update chat window if open
          queryClient.invalidateQueries({
            queryKey: ['/api/conversation']
          });
          break;
          
        case 'user_online':
          refetchBuddies();
          
          // Handle custom buddy alerts with system tray notification
          if (data.alertSettings?.enableAlerts) {
            // Show system tray notification
            const notification = {
              id: Date.now().toString(),
              title: 'Buddy Online',
              message: `${data.screenName} has signed on`,
              type: 'info' as const
            };
            setSystemNotifications(prev => [...prev, notification]);
            
            // Play custom sound if specified
            if (data.alertSettings.customSoundAlert) {
              if (data.alertSettings.customSoundAlert.startsWith('freq:')) {
                const freq = parseInt(data.alertSettings.customSoundAlert.split(':')[1]);
                playCustomBuddySound(freq);
              } else {
                playBuddyOnlineSound();
              }
            } else {
              playBuddyOnlineSound();
            }
          } else {
            playBuddyOnlineSound();
            toast({
              title: "Buddy Online",
              description: `${data.screenName} has signed on`,
            });
          }
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
  }, [socket, playMessageSound, playBuddyOnlineSound, playCustomBuddySound, refetchBuddies, toast]);

  // Auto-hide offline messages after 10 seconds
  useEffect(() => {
    offlineMessages.forEach(message => {
      setTimeout(() => {
        setOfflineMessages(prev => prev.filter(m => m.id !== message.id));
      }, 10000);
    });
  }, [offlineMessages]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setOpenChats([]);
    setShowAwayDialog(false);
    setSelectedBuddy(null);
    setShowAddBuddy(false);
  };

  const openChat = (buddy: any) => {
    const chatId = `chat-${buddy.id}`;
    if (!openChats.find(chat => chat.id === chatId)) {
      const newChat: ChatWindowData = {
        id: chatId,
        buddyId: buddy.id,
        buddyName: buddy.screenName,
        isOnline: buddy.isOnline,
        position: { 
          x: 300 + (openChats.length * 30), 
          y: 100 + (openChats.length * 30) 
        },
        size: { width: 420, height: 350 },
        zIndex: nextZIndex
      };
      setOpenChats(prev => [...prev, newChat]);
      setNextZIndex(prev => prev + 1);
    } else {
      // If chat already exists, bring it to front
      setOpenChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, zIndex: nextZIndex }
          : chat
      ));
      setNextZIndex(prev => prev + 1);
    }
  };

  const closeChat = (chatId: string) => {
    setOpenChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const closeGroupChat = (chatId: string) => {
    setOpenGroupChats(prev => prev.filter(chat => chat.id !== chatId));
  };

  const handleOpenGroupChat = (buddies: any[]) => {
    if (selectedBuddies.length < 2) {
      toast({
        title: "Group Chat",
        description: "Select at least 2 buddies for a group chat",
        variant: "destructive"
      });
      return;
    }

    const participants = buddies.filter(buddy => selectedBuddies.includes(buddy.id));
    const groupId = `group-${Date.now()}`;
    const newGroupChat = {
      id: groupId,
      participants: participants,
      position: { x: 150 + openGroupChats.length * 30, y: 150 + openGroupChats.length * 30 },
      size: { width: 500, height: 400 },
      zIndex: nextZIndex
    };

    setOpenGroupChats(prev => [...prev, newGroupChat]);
    setNextZIndex(prev => prev + 1);
    setSelectedBuddies([]);
  };

  const focusChat = (chatId: string) => {
    setOpenChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, zIndex: nextZIndex }
        : chat
    ));
    setNextZIndex(prev => prev + 1);
  };

  const moveChat = (chatId: string, position: { x: number; y: number }) => {
    setOpenChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, position }
        : chat
    ));
  };

  const resizeChat = (chatId: string, size: { width: number; height: number }) => {
    setOpenChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, size }
        : chat
    ));
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
    <div className="xp-desktop w-screen h-screen relative text-xs overflow-hidden md:flex md:flex-col">
      {/* Desktop Icons - Hidden on mobile */}
      <div className="hidden lg:block">
        <DesktopIcons />
      </div>
      
      {/* Mobile/Desktop Layout */}
      <div className="h-full w-full md:flex md:flex-row">
        {/* Buddy List */}
        <div className="w-full md:w-80 h-full md:h-auto">
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
            onShowAddBuddy={() => setShowAddBuddy(true)}
            onEditProfile={() => setShowProfileEditor(true)}
            onShowBuddyAlerts={(buddy) => setShowBuddyAlerts(buddy)}
          />
        </div>

        {/* Chat Area - Mobile optimized */}
        <div className="hidden md:block flex-1 relative">
          {/* Chat Windows */}
          {openChats.map((chat) => (
            <ChatWindow
              key={chat.id}
              chatId={chat.id}
              currentUser={currentUser}
              buddyId={chat.buddyId}
              buddyName={chat.buddyName}
              isOnline={chat.isOnline}
              position={chat.position}
              size={chat.size}
              zIndex={chat.zIndex}
              onClose={() => closeChat(chat.id)}
              onMove={moveChat}
              onResize={resizeChat}
              onFocus={focusChat}
              socket={socket}
            />
          ))}
        </div>
      </div>

      {/* Mobile Chat Windows - Full screen overlay */}
      {openChats.length > 0 && (
        <div className="md:hidden fixed inset-0 z-40">
          {openChats.map((chat, index) => (
            <div key={chat.id} className={index === openChats.length - 1 ? 'block' : 'hidden'}>
              <ChatWindow
                chatId={chat.id}
                currentUser={currentUser}
                buddyId={chat.buddyId}
                buddyName={chat.buddyName}
                isOnline={chat.isOnline}
                position={{ x: 0, y: 0 }}
                size={{ width: window.innerWidth, height: window.innerHeight }}
                zIndex={chat.zIndex}
                onClose={() => closeChat(chat.id)}
                onMove={moveChat}
                onResize={resizeChat}
                onFocus={focusChat}
                socket={socket}
              />
            </div>
          ))}
        </div>
      )}

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

      {/* Add Buddy Dialog */}
      {showAddBuddy && (
        <AddBuddyDialog
          currentUserId={currentUser.id}
          onClose={() => setShowAddBuddy(false)}
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

      {/* User Profile Editor */}
      {showProfileEditor && currentUser && (
        <UserProfileEditor
          user={currentUser}
          onClose={() => setShowProfileEditor(false)}
        />
      )}

      {/* Buddy Alert Settings */}
      {showBuddyAlerts && currentUser && (
        <BuddyAlertSettings
          buddy={showBuddyAlerts}
          currentUserId={currentUser.id}
          onClose={() => setShowBuddyAlerts(null)}
        />
      )}

      {/* Offline Message Notifications */}
      <OfflineNotification
        messages={offlineMessages}
        onDismiss={(id) => setOfflineMessages(prev => prev.filter(m => m.id !== id))}
        onOpenChat={(fromUser) => {
          const buddy = buddies.find(b => b.screenName === fromUser);
          if (buddy) openChat(buddy);
        }}
      />

      {/* System Tray Notifications */}
      {systemNotifications.map((notification) => (
        <SystemTrayNotification
          key={notification.id}
          title={notification.title}
          message={notification.message}
          type={notification.type}
          onClose={() => setSystemNotifications(prev => prev.filter(n => n.id !== notification.id))}
        />
      ))}

      {/* Windows XP Taskbar */}
      <WindowsTaskbar />
    </div>
  );
}
