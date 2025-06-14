import { useState } from "react";

interface BuddyListProps {
  user: any;
  buddies: any[];
  onOpenChat: (buddy: any) => void;
  onShowAwayDialog: () => void;
  onShowProfile: (buddy: any) => void;
  onLogout: () => void;
  onStatusChange: (status: string, awayMessage?: string) => void;
  onShowAddBuddy: () => void;
}

export default function BuddyList({
  user,
  buddies,
  onOpenChat,
  onShowAwayDialog,
  onShowProfile,
  onLogout,
  onStatusChange,
  onShowAddBuddy
}: BuddyListProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['Buddies']));

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

  return (
    <div className="win-window absolute top-8 left-8 w-64 h-96 shadow-lg md:relative md:w-full md:h-full md:top-0 md:left-0 md:max-w-sm md:flex md:flex-col">
      {/* Title Bar */}
      <div className="win-titlebar px-2 py-1 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-white font-bold">AOL Instant Messenger</span>
        </div>
        <div className="flex space-x-1">
          <button className="w-4 h-4 bg-gray-300 border border-gray-500 text-xs">_</button>
          <button className="w-4 h-4 bg-gray-300 border border-gray-500 text-xs">□</button>
          <button 
            onClick={onLogout}
            className="w-4 h-4 bg-red-500 border border-red-700 text-white text-xs"
          >
            ×
          </button>
        </div>
      </div>

      {/* User Status Bar */}
      <div className="bg-blue-100 p-2 border-b border-gray-400">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-300 border border-gray-400 buddy-icon flex items-center justify-center text-xs">
            👤
          </div>
          <div className="flex-1">
            <div className="font-bold text-black text-xs">{user.screenName}</div>
            <select 
              className="aim-select w-full text-xs"
              value={user.status}
              onChange={handleStatusChange}
            >
              <option value="online">Online</option>
              <option value="away">Away</option>
              <option value="invisible">Invisible</option>
            </select>
          </div>
        </div>
      </div>

      {/* Buddy List */}
      <div className="flex-1 bg-white overflow-y-auto md:flex-1">
        {/* Online Buddies Group */}
        <div className="border-b border-gray-300">
          <div 
            className="group-header px-2 py-1 text-xs font-bold cursor-pointer"
            onClick={() => toggleGroup('Buddies')}
          >
            {expandedGroups.has('Buddies') ? '▼' : '▶'} Buddies ({onlineBuddies.length}/{buddies.length})
          </div>
          
          {expandedGroups.has('Buddies') && onlineBuddies.map(buddy => (
            <div 
              key={buddy.id}
              className="buddy-item px-2 py-1 hover:bg-blue-100 cursor-pointer flex items-center space-x-2"
              onClick={() => onOpenChat(buddy)}
              onDoubleClick={() => onShowProfile(buddy)}
            >
              <span className={`status-dot ${getStatusDotClass(buddy)}`}></span>
              <div className="w-4 h-4 bg-gray-300 buddy-icon flex items-center justify-center text-xs">
                👤
              </div>
              <span className="text-xs">{buddy.screenName}</span>
              {buddy.status === 'away' && (
                <span className="text-gray-500 text-xs">(Away)</span>
              )}
            </div>
          ))}
        </div>

        {/* Offline Buddies Group */}
        {offlineBuddies.length > 0 && (
          <div>
            <div 
              className="group-header px-2 py-1 text-xs font-bold cursor-pointer"
              onClick={() => toggleGroup('Offline')}
            >
              {expandedGroups.has('Offline') ? '▼' : '▶'} Offline ({offlineBuddies.length})
            </div>
            
            {expandedGroups.has('Offline') && offlineBuddies.map(buddy => (
              <div 
                key={buddy.id}
                className="buddy-item px-2 py-1 text-gray-500 flex items-center space-x-2"
                onDoubleClick={() => onShowProfile(buddy)}
              >
                <span className="status-dot status-offline"></span>
                <div className="w-4 h-4 bg-gray-300 buddy-icon grayscale flex items-center justify-center text-xs">
                  👤
                </div>
                <span className="text-xs">{buddy.screenName}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="bg-gray-200 px-2 py-1 border-t border-gray-400 flex justify-between items-center">
        <span className="text-xs">Online: {onlineBuddies.length} of {buddies.length} buddies</span>
        <div className="flex space-x-1">
          <button 
            onClick={onShowAddBuddy}
            className="win-button px-2 py-0 text-xs"
            title="Add Buddy"
          >
            Add
          </button>
          <button className="win-button px-2 py-0 text-xs">Setup</button>
        </div>
      </div>
    </div>
  );
}
