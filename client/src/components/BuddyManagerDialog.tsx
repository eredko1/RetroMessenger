import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface BuddyManagerDialogProps {
  buddies: any[];
  onClose: () => void;
  onRemoveBuddy: (buddyId: number) => void;
  onMoveBuddy: (buddyId: number, newGroup: string) => void;
}

export default function BuddyManagerDialog({ 
  buddies, 
  onClose, 
  onRemoveBuddy, 
  onMoveBuddy 
}: BuddyManagerDialogProps) {
  const [selectedBuddies, setSelectedBuddies] = useState<Set<number>>(new Set());
  const [newGroupName, setNewGroupName] = useState("");
  const [showNewGroup, setShowNewGroup] = useState(false);
  const { toast } = useToast();

  const removeBuddyMutation = useMutation({
    mutationFn: async (buddyId: number) => {
      // This would call the API to remove buddy
      return await apiRequest('DELETE', `/api/user/buddies/${buddyId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/user'] });
      toast({
        title: "Buddy Removed",
        description: "Buddy has been removed from your list",
      });
    }
  });

  const handleBuddySelect = (buddyId: number) => {
    const newSelected = new Set(selectedBuddies);
    if (newSelected.has(buddyId)) {
      newSelected.delete(buddyId);
    } else {
      newSelected.add(buddyId);
    }
    setSelectedBuddies(newSelected);
  };

  const handleRemoveSelected = () => {
    selectedBuddies.forEach(buddyId => {
      removeBuddyMutation.mutate(buddyId);
      onRemoveBuddy(buddyId);
    });
    setSelectedBuddies(new Set());
  };

  const handleMoveToGroup = (groupName: string) => {
    selectedBuddies.forEach(buddyId => {
      onMoveBuddy(buddyId, groupName);
    });
    setSelectedBuddies(new Set());
  };

  const handleCreateNewGroup = () => {
    if (newGroupName.trim()) {
      handleMoveToGroup(newGroupName.trim());
      setNewGroupName("");
      setShowNewGroup(false);
    }
  };

  const groups = Array.from(new Set(buddies.map(buddy => buddy.groupName || 'Buddies')));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1200]">
      <div className="win-window w-96 max-h-[80vh] overflow-hidden border-2 border-gray-400 rounded-lg shadow-2xl">
        {/* Title Bar */}
        <div className="win-titlebar px-3 py-2 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
              <span className="text-xs font-bold text-blue-800">⚙️</span>
            </div>
            <span className="text-white font-bold text-sm">Manage Buddy List</span>
          </div>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="bg-white p-4 max-h-[60vh] overflow-y-auto">
          <div className="mb-4">
            <h3 className="font-bold text-sm mb-2">Select buddies to manage:</h3>
            <div className="max-h-48 overflow-y-auto border border-gray-300 rounded">
              {buddies.map(buddy => (
                <div 
                  key={buddy.id}
                  className={`flex items-center space-x-3 p-2 hover:bg-gray-50 cursor-pointer ${
                    selectedBuddies.has(buddy.id) ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handleBuddySelect(buddy.id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedBuddies.has(buddy.id)}
                    onChange={() => handleBuddySelect(buddy.id)}
                    className="w-4 h-4"
                  />
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {buddy.screenName[0].toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{buddy.screenName}</div>
                    <div className="text-xs text-gray-500">
                      Group: {buddy.groupName || 'Buddies'} • {buddy.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedBuddies.size > 0 && (
            <div className="border-t pt-4">
              <h4 className="font-bold text-sm mb-3">Actions for {selectedBuddies.size} selected buddy(ies):</h4>
              
              <div className="space-y-3">
                {/* Move to Group */}
                <div>
                  <label className="block text-xs font-bold mb-1">Move to Group:</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {groups.map(group => (
                      <button
                        key={group}
                        onClick={() => handleMoveToGroup(group)}
                        className="win-button px-2 py-1 text-xs"
                      >
                        {group}
                      </button>
                    ))}
                  </div>
                  
                  {!showNewGroup ? (
                    <button
                      onClick={() => setShowNewGroup(true)}
                      className="win-button px-2 py-1 text-xs"
                    >
                      + New Group
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Group name..."
                        className="flex-1 px-2 py-1 text-xs border"
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateNewGroup()}
                      />
                      <button
                        onClick={handleCreateNewGroup}
                        disabled={!newGroupName.trim()}
                        className="win-button px-2 py-1 text-xs"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowNewGroup(false);
                          setNewGroupName("");
                        }}
                        className="win-button px-2 py-1 text-xs"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                {/* Remove Buddies */}
                <div>
                  <button
                    onClick={handleRemoveSelected}
                    className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 text-xs rounded transition-colors"
                  >
                    Remove Selected Buddies
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-100 px-4 py-3 border-t">
          <div className="flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="win-button px-4 py-1 text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}