import React, { useState, useEffect } from "react";
import BuddyManagerDialog from "./BuddyManagerDialog";

interface BuddyListProps {
  user: any;
  buddies: any[];
  onOpenChat: (buddy: any) => void;
  onShowAwayDialog: () => void;
  onShowProfile: (buddy: any) => void;
  onLogout: () => void;
  onStatusChange: (status: string, awayMessage?: string) => void;
  onShowAddBuddy: () => void;
  onEditProfile: () => void;
  onShowBuddyAlerts?: (buddy: any) => void;
  onShowBuddyManager?: () => void;
  onShowGroupChat?: () => void;
  onMinimize?: () => void;
}

export default function BuddyList({
  user,
  buddies,
  onOpenChat,
  onShowAwayDialog,
  onShowProfile,
  onLogout,
  onStatusChange,
  onShowAddBuddy,
  onEditProfile,
  onShowBuddyAlerts,
  onShowBuddyManager,
  onShowGroupChat,
  onMinimize
}: BuddyListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Buddies']));
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [size, setSize] = useState({ width: 280, height: 320 });
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [showBuddyManager, setShowBuddyManager] = useState(false);

  const onlineBuddies = buddies.filter(buddy => buddy.isOnline);
  const offlineBuddies = buddies.filter(buddy => !buddy.isOnline);

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName);
    } else {
      newExpanded.add(groupName);
    }
    setExpandedGroups(newExpanded);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    if (status === 'away') {
      onShowAwayDialog();
    } else {
      onStatusChange(status);
    }
  };

  const getStatusDotClass = (buddy: any) => {
    if (!buddy.isOnline) return 'status-offline';
    return buddy.status === 'away' ? 'status-away' : 'status-online';
  };

  // Drag handlers for buddy list
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.win-titlebar')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
      e.preventDefault();
    }
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height
    });
  };

  // Mouse events for dragging and resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPosition({
          x: Math.max(0, Math.min(window.innerWidth - 300, e.clientX - dragStart.x)),
          y: Math.max(0, Math.min(window.innerHeight - 500, e.clientY - dragStart.y))
        });
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;
        
        setSize({
          width: Math.max(250, resizeStart.width + deltaX),
          height: Math.max(280, resizeStart.height + deltaY)
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  return (
    <div 
      className="xp-window absolute overflow-hidden select-none md:relative md:w-full md:h-full md:top-0 md:left-0 md:max-w-sm md:flex md:flex-col"
      style={{ 
        left: position.x, 
        top: position.y, 
        width: Math.max(250, size.width),
        height: Math.max(280, size.height),
        zIndex: 1000,
        cursor: isDragging ? 'move' : 'default',
        minWidth: '250px',
        minHeight: '280px'
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Windows XP Title Bar */}
      <div 
        className="xp-titlebar cursor-move"
      >
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-yellow-400 border border-gray-600 flex items-center justify-center">
            <span style={{ fontSize: '8px' }}>💬</span>
          </div>
          <span>AOL Instant Messenger</span>
        </div>
        <div className="flex space-x-1">
          {onMinimize && (
            <button 
              className="xp-minimize-button w-4 h-4 text-xs flex items-center justify-center hover:bg-gray-300 transition-colors"
              onClick={onMinimize}
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
          <div className="xp-close-button" onClick={onLogout} title="Sign Off">
            ×
          </div>
        </div>
      </div>

      {/* User Status Bar */}
      <div className="p-3 border-b" style={{ background: 'var(--xp-gray)', borderColor: 'var(--xp-border-dark)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {user.screenName[0].toUpperCase()}
              </div>
              <span className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${user.status === 'away' ? 'bg-yellow-400' : 'bg-green-400'} shadow-sm`}></span>
            </div>
            <div>
              <div className="font-bold text-sm text-gray-800">{user.screenName}</div>
              <div className="text-xs text-gray-600">{user.status === 'away' ? 'Away' : 'Available'}</div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={onEditProfile}
              className="xp-button text-xs flex items-center space-x-1"
            >
              <span>✏️</span>
              <span>Edit Profile</span>
            </button>
            <button 
              onClick={onShowAddBuddy}
              className="xp-button text-xs flex items-center space-x-1"
            >
              <span>👥</span>
              <span>Add Buddy</span>
            </button>
          </div>
        </div>
        <div className="mt-3">
          <select 
            className="w-full text-xs border px-2 py-1"
            style={{ 
              background: 'white',
              borderColor: 'var(--xp-border-dark)',
              borderTopColor: 'var(--xp-border-light)',
              borderLeftColor: 'var(--xp-border-light)'
            }}
            value={user.status}
            onChange={handleStatusChange}
          >
            <option value="online">🟢 Available</option>
            <option value="away">🟡 Away</option>
            <option value="invisible">⚫ Invisible</option>
          </select>
        </div>
      </div>

      {/* Buddy List */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden" style={{ background: 'white', maxHeight: 'calc(100vh - 280px)' }}>
        {/* Online Buddies Group */}
        <div className="border-b border-gray-200">
          <div 
            className="group-header px-3 py-2 text-xs font-bold cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-all flex items-center"
            onClick={() => toggleGroup('Buddies')}
          >
            <span className={`mr-2 transition-transform ${expandedGroups.has('Buddies') ? 'rotate-90' : ''}`}>▶</span>
            <span className="text-gray-700">Online Buddies ({onlineBuddies.length})</span>
          </div>
          
          {expandedGroups.has('Buddies') && onlineBuddies.map((buddy, index) => (
            <div 
              key={`buddy-online-${buddy.id}`}
              className="buddy-item px-3 py-2 hover:bg-blue-50 cursor-pointer flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-colors group"
              onClick={() => onOpenChat(buddy)}
              onContextMenu={(e) => {
                e.preventDefault();
                onShowProfile(buddy);
              }}
              title="Click to chat, right-click for profile"
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                  {buddy.screenName[0].toUpperCase()}
                </div>
                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${getStatusDotClass(buddy)} shadow-sm`}></span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-800 truncate">{buddy.screenName}</div>
                {buddy.status === 'away' && buddy.awayMessage && (
                  <div className="text-xs text-gray-500 truncate">{buddy.awayMessage}</div>
                )}
              </div>
              <div className="text-xs text-gray-400">💬</div>
            </div>
          ))}
        </div>

        {/* Offline Buddies Group */}
        {offlineBuddies.length > 0 && (
          <div>
            <div 
              className="group-header px-3 py-2 text-xs font-bold cursor-pointer bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-150 transition-all flex items-center"
              onClick={() => toggleGroup('Offline')}
            >
              <span className={`mr-2 transition-transform ${expandedGroups.has('Offline') ? 'rotate-90' : ''}`}>▶</span>
              <span className="text-gray-700">Offline ({offlineBuddies.length})</span>
            </div>
            
            {expandedGroups.has('Offline') && offlineBuddies.map((buddy, index) => (
              <div 
                key={`buddy-offline-${buddy.id}-${index}`}
                className="buddy-item px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center space-x-3 border-b border-gray-100 last:border-b-0 transition-colors opacity-60"
                onClick={() => onOpenChat(buddy)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  onShowProfile(buddy);
                }}
                title="Click to chat, right-click for profile"
              >
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-400 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md">
                    {buddy.screenName[0].toUpperCase()}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white bg-gray-400 shadow-sm"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-600 truncate">{buddy.screenName}</div>
                  <div className="text-xs text-gray-400">Offline</div>
                </div>
                <div className="text-xs text-gray-300">💭</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-200 px-2 py-2 border-t border-gray-400 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs">Online: {onlineBuddies.length} of {buddies.length} buddies</span>
          <div className="flex space-x-1">
            <button 
              onClick={onShowBuddyManager}
              className="win-button px-2 py-0 text-xs"
              title="Manage Buddies"
            >
              Manage
            </button>
            <button 
              onClick={onShowAddBuddy}
              className="win-button px-2 py-0 text-xs"
              title="Add Buddy"
            >
              Add
            </button>
            <button 
              onClick={onShowAwayDialog}
              className="win-button px-2 py-0 text-xs"
              title="Set Away Message"
            >
              Away
            </button>
          </div>
        </div>
        
        {/* Group Chat Button */}
        <button 
          onClick={onShowGroupChat}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-2 px-3 rounded shadow-md transition-all duration-200 transform hover:scale-105 text-sm"
          disabled={onlineBuddies.length < 2}
          title={onlineBuddies.length < 2 ? "Need at least 2 online buddies for group chat" : "Start a group chat with multiple buddies"}
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg">👥</span>
            <span>Start Group Chat</span>
          </div>
        </button>
      </div>

      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize bg-gray-300 border-l border-t border-gray-400"
        onMouseDown={handleResizeMouseDown}
        style={{
          background: 'linear-gradient(135deg, transparent 0%, transparent 30%, #999 30%, #999 35%, transparent 35%, transparent 65%, #999 65%, #999 70%, transparent 70%)'
        }}
      />
    </div>
  );
}
