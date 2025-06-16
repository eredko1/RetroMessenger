import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAIMSounds } from "@/hooks/useAIMSounds";
import BuddyList from "@/components/BuddyList";
import ChatWindow from "@/components/ChatWindow";
import MobileChatWindow from "@/components/MobileChatWindow";
import GroupChatWindow from "@/components/GroupChatWindow";
import AwayMessageDialog from "@/components/AwayMessageDialog";
import BuddyProfile from "@/components/BuddyProfile";
import AddBuddyDialog from "@/components/AddBuddyDialog";
import UserProfileEditor from "@/components/UserProfileEditor";
import OfflineNotification from "@/components/OfflineNotification";
import SystemTrayNotification from "@/components/SystemTrayNotification";
import BuddyAlertSettings from "@/components/BuddyAlertSettings";
import BuddyManagerDialog from "@/components/BuddyManagerDialog";
import GroupChatSelector from "@/components/GroupChatSelector";
import WindowsTaskbar from "@/components/WindowsTaskbar";
import DesktopIcons from "@/components/DesktopIcons";
import WindowsExplorer from "@/components/WindowsExplorer";
import WindowsCalculator from "@/components/WindowsCalculator";
import WindowsNotepad from "@/components/WindowsNotepad";
import WindowsPaint from "@/components/WindowsPaint";
import InternetExplorer from "@/components/InternetExplorer";
import TestApp from "@/components/TestApp";
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
  const [showBuddyManager, setShowBuddyManager] = useState(false);
  const [showGroupChatSelector, setShowGroupChatSelector] = useState(false);
  const [offlineMessages, setOfflineMessages] = useState<any[]>([]);
  const [systemNotifications, setSystemNotifications] = useState<any[]>([]);
  const [nextZIndex, setNextZIndex] = useState(1000);
  const [minimizedWindows, setMinimizedWindows] = useState<Set<string>>(new Set());
  const [allWindowsMinimized, setAllWindowsMinimized] = useState(false);
  
  // Windows XP Applications State
  const [openApplications, setOpenApplications] = useState<{
    [key: string]: {
      id: string;
      type: string;
      title: string;
      position: { x: number; y: number };
      size: { width: number; height: number };
      zIndex: number;
      isMinimized: boolean;
    }
  }>({});
  
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
  // Load user's saved window positions on startup
  const loadUserWindowPositions = async () => {
    if (!currentUser?.id) return;
    try {
      const response = await apiRequest(`/api/user/${currentUser.id}/window-positions`);
      if (response.positions) {
        // Restore buddy list position if saved
        if (response.positions.buddyList) {
          // This would be handled by BuddyList component
        }
        // Restore application positions if saved
        if (response.positions.applications) {
          Object.entries(response.positions.applications).forEach(([appId, position]: any) => {
            // Restore saved applications
            const appType = appId.split('-')[0];
            openApplication(appType);
          });
        }
      }
    } catch (error) {
      console.log('No saved window positions found');
    }
  };

  const saveUserWindowPositions = async () => {
    if (!currentUser?.id) return;
    try {
      const positions = {
        applications: Object.fromEntries(
          Object.entries(openApplications).map(([id, app]) => [
            id, 
            { position: app.position, size: app.size }
          ])
        )
      };
      await apiRequest(`/api/user/${currentUser.id}/window-positions`, 'PUT', { positions });
    } catch (error) {
      console.error('Failed to save window positions:', error);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      loadUserWindowPositions();
    }
  }, [currentUser?.id]);

  // Auto-save positions when they change
  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (Object.keys(openApplications).length > 0) {
        saveUserWindowPositions();
      }
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [openApplications]);

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
        zIndex: nextZIndex + 100
      };
      setOpenChats(prev => [...prev, newChat]);
      setNextZIndex(prev => prev + 1);
    } else {
      // If chat already exists, bring it to front
      setOpenChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, zIndex: nextZIndex + 100 }
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

  const handleOpenGroupChat = (selectedBuddyIds: number[]) => {
    console.log('handleOpenGroupChat called with:', selectedBuddyIds);
    
    if (selectedBuddyIds.length < 1) {
      toast({
        title: "Group Chat",
        description: "Select at least 1 buddy for a group chat",
        variant: "destructive"
      });
      return;
    }

    const participants = buddies?.filter(buddy => selectedBuddyIds.includes(buddy.id)) || [];
    console.log('Group participants:', participants);
    
    const groupId = `group-${Date.now()}`;
    const newGroupChat = {
      id: groupId,
      participants: participants.map(p => ({ 
        id: p.id, 
        screenName: p.screenName, 
        isOnline: p.isOnline 
      })),
      position: { x: 150 + openGroupChats.length * 30, y: 150 + openGroupChats.length * 30 },
      size: { width: 500, height: 400 },
      zIndex: nextZIndex,
      isMinimized: false
    };

    console.log('Creating group chat:', newGroupChat);
    setOpenGroupChats(prev => [...prev, newGroupChat]);
    setNextZIndex(prev => prev + 1);
    setShowGroupChatSelector(false);
    
    toast({
      title: "Group Chat Created",
      description: `Started group chat with ${participants.length} participant(s)`,
    });
  };

  const focusChat = (chatId: string) => {
    setOpenChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { ...chat, zIndex: nextZIndex + 100 }
        : chat
    ));
    setNextZIndex(prev => prev + 1);
  };

  // Window Management Functions
  const handleWindowMinimize = (windowId: string) => {
    setMinimizedWindows(prev => new Set(Array.from(prev).concat(windowId)));
  };

  const handleWindowRestore = (windowId: string) => {
    setMinimizedWindows(prev => {
      const newSet = new Set(prev);
      newSet.delete(windowId);
      return newSet;
    });
    setAllWindowsMinimized(false);
    focusChat(windowId);
  };

  const handleShowDesktop = () => {
    const allWindows = [
      ...openChats.map(chat => chat.id),
      ...openGroupChats.map(chat => chat.id),
      ...Object.keys(openApplications),
      'buddy-list'
    ];
    
    if (allWindowsMinimized) {
      setMinimizedWindows(new Set());
      setAllWindowsMinimized(false);
    } else {
      setMinimizedWindows(new Set(allWindows));
      setAllWindowsMinimized(true);
    }
  };

  // Windows XP Application Management
  const openApplication = (appType: string, savedPosition?: any) => {
    console.log('Opening application:', appType);
    const appId = `${appType}-${Date.now()}`;
    const appTitles: { [key: string]: string } = {
      explorer: 'My Computer',
      calculator: 'Calculator',
      notepad: 'Notepad',
      paint: 'Paint',
      documents: 'My Documents',
      recycle: 'Recycle Bin',
      'internet-explorer': 'Internet Explorer',
      browser: 'Internet Explorer',
      mediaplayer: 'Windows Media Player',
      solitaire: 'Solitaire',
      minesweeper: 'Minesweeper'
    };

    const appSizes: { [key: string]: { width: number; height: number } } = {
      explorer: { width: 700, height: 500 },
      calculator: { width: 280, height: 320 },
      notepad: { width: 600, height: 400 },
      paint: { width: 800, height: 600 },
      documents: { width: 700, height: 500 },
      recycle: { width: 500, height: 400 },
      browser: { width: 900, height: 700 },
      'internet-explorer': { width: 900, height: 700 },
      mediaplayer: { width: 400, height: 300 },
      solitaire: { width: 600, height: 500 },
      minesweeper: { width: 300, height: 350 }
    };

    const newApp = {
      id: appId,
      type: appType,
      title: appTitles[appType] || appType,
      position: savedPosition?.position || { 
        x: 100 + Object.keys(openApplications).length * 30, 
        y: 100 + Object.keys(openApplications).length * 30 
      },
      size: savedPosition?.size || appSizes[appType] || { width: 600, height: 400 },
      zIndex: nextZIndex + 1000,
      isMinimized: false
    };

    console.log('Creating new app:', newApp);
    setOpenApplications(prev => {
      const newApps = { ...prev, [appId]: newApp };
      console.log('Updated applications:', newApps);
      return newApps;
    });
    setNextZIndex(prev => prev + 1);
    
    toast({
      title: "Application Opened",
      description: `${appTitles[appType] || appType} is now running`,
    });
  };

  const closeApplication = (appId: string) => {
    setOpenApplications(prev => {
      const newApps = { ...prev };
      delete newApps[appId];
      return newApps;
    });
    setMinimizedWindows(prev => {
      const newSet = new Set(prev);
      newSet.delete(appId);
      return newSet;
    });
  };

  const minimizeApplication = (appId: string) => {
    setMinimizedWindows(prev => new Set(Array.from(prev).concat(appId)));
  };

  const restoreApplication = (appId: string) => {
    setMinimizedWindows(prev => {
      const newSet = new Set(prev);
      newSet.delete(appId);
      return newSet;
    });
    setAllWindowsMinimized(false);
  };

  const getTaskbarWindows = () => {
    return [
      {
        id: 'buddy-list',
        title: 'Buddy List',
        type: 'buddy-list' as const,
        isMinimized: minimizedWindows.has('buddy-list')
      },
      ...openChats.map(chat => ({
        id: chat.id,
        title: `Chat: ${chat.buddyName}`,
        type: 'chat' as const,
        isMinimized: minimizedWindows.has(chat.id)
      })),
      ...openGroupChats.map(chat => ({
        id: chat.id,
        title: `Group: ${chat.participants?.map((p: any) => p.screenName).join(', ')}`,
        type: 'group' as const,
        isMinimized: minimizedWindows.has(chat.id)
      })),
      ...Object.values(openApplications).map(app => ({
        id: app.id,
        title: app.title,
        type: 'application' as const,
        isMinimized: minimizedWindows.has(app.id)
      }))
    ];
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
      return await apiRequest(`/api/user/${currentUser.id}/status`, 'PUT', { status, awayMessage });
    },
    onSuccess: (_, { status, awayMessage }) => {
      setCurrentUser(prev => prev ? { ...prev, status, awayMessage } : prev);
      refetchBuddies();
      toast({
        title: "Status Updated",
        description: `Status changed to ${status}${awayMessage ? ` with message: "${awayMessage}"` : ''}`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    }
  });

  if (!currentUser) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div 
      className="w-screen h-screen relative text-xs overflow-hidden md:flex md:flex-col"
      style={{
        backgroundImage: 'url("https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        fontFamily: 'Tahoma, sans-serif'
      }}
    >
      {/* Desktop Icons - Always visible on desktop */}
      <div className="absolute inset-0 z-0">
        <DesktopIcons 
          onOpenApplication={openApplication}
          onOpenBuddyList={() => {
            console.log('Opening Buddy List from desktop icon');
            // Restore buddy list if minimized
            if (minimizedWindows.has('buddy-list')) {
              setMinimizedWindows(prev => {
                const newSet = new Set(prev);
                newSet.delete('buddy-list');
                return newSet;
              });
            }
          }}
        />
        
        {/* Show Desktop Button for mobile */}
        <div className="md:hidden fixed top-4 right-4 z-50">
          <button
            onClick={() => setAllWindowsMinimized(!allWindowsMinimized)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-2 rounded shadow-lg border border-blue-500"
          >
            {allWindowsMinimized ? 'Show Windows' : 'Show Desktop'}
          </button>
        </div>
      </div>
      
      {/* Mobile/Desktop Layout */}
      <div className="h-full w-full md:flex md:flex-row">
        {/* Buddy List */}
        <div className="relative z-10">
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
            onShowBuddyManager={() => setShowBuddyManager(true)}
            onShowGroupChat={() => {
              console.log('Setting showGroupChatSelector to true');
              setShowGroupChatSelector(true);
            }}
            onMinimize={() => handleWindowMinimize('buddy-list')}
          />
        </div>

        {/* Chat Area - Mobile optimized */}
        <div className="hidden md:block flex-1 relative">
          {/* Chat Windows */}
          {openChats.map((chat) => (
            !minimizedWindows.has(chat.id) && (
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
                onMinimize={handleWindowMinimize}
                socket={socket}
              />
            )
          ))}

          {/* Group Chat Windows */}
          {openGroupChats.map((groupChat) => (
            !minimizedWindows.has(groupChat.id) && (
              <GroupChatWindow
                key={groupChat.id}
                chatId={groupChat.id}
                currentUser={currentUser}
                participants={groupChat.participants}
                position={groupChat.position}
                size={groupChat.size}
                zIndex={groupChat.zIndex}
                onClose={() => closeGroupChat(groupChat.id)}
                onMove={(chatId, position) => {
                  setOpenGroupChats(prev => prev.map(chat => 
                    chat.id === chatId ? { ...chat, position } : chat
                  ));
                }}
                onResize={(chatId, size) => {
                  setOpenGroupChats(prev => prev.map(chat => 
                    chat.id === chatId ? { ...chat, size } : chat
                  ));
                }}
                onFocus={(chatId) => {
                  setOpenGroupChats(prev => prev.map(chat => 
                    chat.id === chatId ? { ...chat, zIndex: nextZIndex + 100 } : chat
                  ));
                  setNextZIndex(prev => prev + 1);
                }}
                onMinimize={handleWindowMinimize}
                socket={socket}
              />
            )
          ))}
        </div>
      </div>

      {/* Mobile Chat Windows - Full screen overlay */}
      {openChats.length > 0 && (
        <div className="md:hidden">
          {openChats.slice(-1).map((chat) => (
            <div key={chat.id} className="fixed inset-0 bg-white z-50 flex flex-col">
              {/* Mobile Title Bar */}
              <div className="bg-blue-600 text-white px-4 py-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: chat.isOnline ? '#00ff00' : '#808080' }}></div>
                  <span className="font-bold">Chat with {chat.buddyName}</span>
                </div>
                <button 
                  onClick={() => closeChat(chat.id)}
                  className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white text-xl rounded flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              {/* Mobile Chat Content */}
              <div className="flex-1 flex flex-col">
                <ChatWindow
                  chatId={chat.id}
                  currentUser={currentUser}
                  buddyId={chat.buddyId}
                  buddyName={chat.buddyName}
                  isOnline={chat.isOnline}
                  position={{ x: 0, y: 0 }}
                  size={{ width: window.innerWidth, height: window.innerHeight - 60 }}
                  zIndex={50}
                  onClose={() => closeChat(chat.id)}
                  onMove={moveChat}
                  onResize={resizeChat}
                  onFocus={focusChat}
                  socket={socket}
                />
              </div>
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

      {/* Buddy Manager Dialog */}
      {showBuddyManager && currentUser && (
        <BuddyManagerDialog
          buddies={buddies}
          onClose={() => setShowBuddyManager(false)}
          onRemoveBuddy={(buddyId) => {
            // Remove buddy from list
            refetchBuddies();
            toast({
              title: "Buddy Removed",
              description: "Buddy has been removed from your list",
            });
          }}
          onMoveBuddy={(buddyId, newGroup) => {
            // Move buddy to new group
            refetchBuddies();
            toast({
              title: "Buddy Moved",
              description: `Buddy moved to ${newGroup} group`,
            });
          }}
        />
      )}

      {/* Group Chat Selector */}
      {showGroupChatSelector && (
        <div className="absolute inset-0 z-50">
          <GroupChatSelector
            buddies={buddies}
            onClose={() => setShowGroupChatSelector(false)}
            onCreateGroup={handleOpenGroupChat}
          />
        </div>
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

      {/* Windows XP Applications */}
      {Object.values(openApplications).map((app) => {
        if (minimizedWindows.has(app.id)) return null;
        
        switch (app.type) {
          case 'explorer':
          case 'documents':
            return (
              <WindowsExplorer
                key={app.id}
                onClose={() => closeApplication(app.id)}
                onMinimize={() => minimizeApplication(app.id)}
                position={app.position}
                size={app.size}
                zIndex={app.zIndex}
                onMove={(position) => {
                  setOpenApplications(prev => ({
                    ...prev,
                    [app.id]: { ...prev[app.id], position }
                  }));
                }}
                onResize={(size) => {
                  setOpenApplications(prev => ({
                    ...prev,
                    [app.id]: { ...prev[app.id], size }
                  }));
                }}
                onFocus={() => {
                  setOpenApplications(prev => ({
                    ...prev,
                    [app.id]: { ...prev[app.id], zIndex: nextZIndex + 1000 }
                  }));
                  setNextZIndex(prev => prev + 1);
                }}
              />
            );
          case 'calculator':
            return (
              <WindowsCalculator
                key={app.id}
                onClose={() => closeApplication(app.id)}
                onMinimize={() => minimizeApplication(app.id)}
                position={app.position}
                zIndex={app.zIndex}
                onMove={(position) => {
                  setOpenApplications(prev => ({
                    ...prev,
                    [app.id]: { ...prev[app.id], position }
                  }));
                }}
                onFocus={() => {
                  setOpenApplications(prev => ({
                    ...prev,
                    [app.id]: { ...prev[app.id], zIndex: nextZIndex + 1000 }
                  }));
                  setNextZIndex(prev => prev + 1);
                }}
              />
            );
          case 'notepad':
            return (
              <WindowsNotepad
                key={app.id}
                onClose={() => closeApplication(app.id)}
                onMinimize={() => minimizeApplication(app.id)}
                position={app.position}
                size={app.size}
                zIndex={app.zIndex}
              />
            );
          case 'paint':
            return (
              <WindowsPaint
                key={app.id}
                onClose={() => closeApplication(app.id)}
                onMinimize={() => minimizeApplication(app.id)}
                position={app.position}
                size={app.size}
                zIndex={app.zIndex}
              />
            );
          case 'internet-explorer':
            return (
              <InternetExplorer
                key={app.id}
                onClose={() => closeApplication(app.id)}
                onMinimize={() => minimizeApplication(app.id)}
                position={app.position}
                size={app.size}
                zIndex={app.zIndex}
                instanceId={app.id}
              />
            );
          case 'mediaplayer':
          case 'solitaire':
          case 'minesweeper':
          case 'recycle':
            return (
              <div
                key={app.id}
                className="absolute bg-gray-100 border-2 border-gray-400 shadow-lg flex items-center justify-center"
                style={{
                  left: app.position.x,
                  top: app.position.y,
                  width: app.size.width,
                  height: app.size.height,
                  zIndex: app.zIndex,
                  borderStyle: 'outset'
                }}
              >
                <div className="text-center">
                  <div className="text-4xl mb-4">🚧</div>
                  <div className="text-sm font-bold">{app.title}</div>
                  <div className="text-xs mt-2">Coming Soon</div>
                  <button
                    onClick={() => closeApplication(app.id)}
                    className="mt-4 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          default:
            return null;
        }
      })}

      {/* Windows XP Taskbar */}
      <WindowsTaskbar 
        openWindows={getTaskbarWindows()}
        onWindowRestore={(windowId) => {
          if (openApplications[windowId]) {
            restoreApplication(windowId);
          } else {
            handleWindowRestore(windowId);
          }
        }}
        onWindowMinimize={(windowId) => {
          if (openApplications[windowId]) {
            minimizeApplication(windowId);
          } else {
            handleWindowMinimize(windowId);
          }
        }}
        onShowDesktop={handleShowDesktop}
        onOpenApplication={openApplication}
        onLogout={handleLogout}
        user={currentUser}
      />
    </div>
  );
}
