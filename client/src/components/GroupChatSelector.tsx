import React, { useState } from "react";
import { X, Users, MessageCircle } from "lucide-react";

interface GroupChatSelectorProps {
  buddies: any[];
  onClose: () => void;
  onCreateGroup: (selectedBuddies: number[]) => void;
}

export default function GroupChatSelector({ buddies, onClose, onCreateGroup }: GroupChatSelectorProps) {
  const [selectedBuddies, setSelectedBuddies] = useState<number[]>([]);
  const [groupName, setGroupName] = useState("");

  const toggleBuddy = (buddyId: number) => {
    setSelectedBuddies(prev => 
      prev.includes(buddyId) 
        ? prev.filter(id => id !== buddyId)
        : [...prev, buddyId]
    );
  };

  const handleCreateGroup = () => {
    if (selectedBuddies.length < 2) return;
    onCreateGroup(selectedBuddies);
    onClose();
  };

  const onlineBuddies = buddies.filter(buddy => buddy.isOnline);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="win-window w-96 max-h-[80vh] overflow-hidden border-2 border-gray-400 rounded-lg shadow-2xl">
        {/* Title Bar */}
        <div className="win-titlebar px-3 py-2 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
              <Users className="w-3 h-3 text-blue-800" />
            </div>
            <span className="text-white font-bold text-sm">Create Group Chat</span>
          </div>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Group Chat Form */}
        <div className="bg-white p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Group Name (Optional)
              </label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter group name..."
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">
                Select Buddies (Choose at least 2)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
                {onlineBuddies.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    No online buddies available for group chat
                  </p>
                ) : (
                  onlineBuddies.map(buddy => (
                    <div 
                      key={buddy.id}
                      className={`flex items-center space-x-3 p-2 rounded cursor-pointer transition-colors ${
                        selectedBuddies.includes(buddy.id) 
                          ? 'bg-blue-100 border border-blue-300' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => toggleBuddy(buddy.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedBuddies.includes(buddy.id)}
                        onChange={() => toggleBuddy(buddy.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div className="flex items-center space-x-2 flex-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                          {buddy.screenName[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{buddy.screenName}</div>
                          <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span className="text-xs text-gray-500">Online</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {selectedBuddies.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Selected ({selectedBuddies.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {selectedBuddies.map(buddyId => {
                    const buddy = buddies.find(b => b.id === buddyId);
                    return buddy ? (
                      <span 
                        key={buddyId}
                        className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full"
                      >
                        {buddy.screenName}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={selectedBuddies.length < 2}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white border border-blue-600 rounded-md transition-colors"
              >
                Create Group Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}