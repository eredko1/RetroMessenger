import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddBuddyDialogProps {
  currentUserId: number;
  onClose: () => void;
}

export default function AddBuddyDialog({ currentUserId, onClose }: AddBuddyDialogProps) {
  const [screenName, setScreenName] = useState("");
  const [groupName, setGroupName] = useState("Buddies");
  const { toast } = useToast();

  const addBuddyMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/user/${currentUserId}/buddies`, {
        buddyScreenName: screenName.trim(),
        groupName: groupName.trim()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/user', currentUserId, 'buddies']
      });
      toast({
        title: "Buddy Added",
        description: `${screenName} has been added to your buddy list`,
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to Add Buddy",
        description: error.message || "User not found or already in buddy list",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a screen name",
        variant: "destructive",
      });
      return;
    }
    addBuddyMutation.mutate();
  };

  return (
    <div className="win-window absolute top-48 left-80 w-72 shadow-lg z-20">
      {/* Title Bar */}
      <div className="win-titlebar px-2 py-1 flex justify-between items-center">
        <span className="text-white font-bold text-xs">Add Buddy</span>
        <button 
          onClick={onClose}
          className="w-4 h-4 bg-red-500 border border-red-700 text-white text-xs"
        >
          ×
        </button>
      </div>

      {/* Add Buddy Content */}
      <div className="p-3 space-y-3">
        <div className="text-xs text-gray-700 mb-3">
          Add a friend to your buddy list by entering their screen name below.
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold mb-1">Screen Name:</label>
            <input
              type="text"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              className="aim-input w-full"
              placeholder="Enter buddy's screen name"
              maxLength={20}
              disabled={addBuddyMutation.isPending}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Group:</label>
            <select 
              className="aim-select w-full"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              disabled={addBuddyMutation.isPending}
            >
              <option value="Buddies">Buddies</option>
              <option value="Family">Family</option>
              <option value="Co-Workers">Co-Workers</option>
              <option value="School">School</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="win-button px-3 py-1 text-xs"
              disabled={addBuddyMutation.isPending}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="win-button px-3 py-1 text-xs font-bold"
              disabled={addBuddyMutation.isPending || !screenName.trim()}
            >
              {addBuddyMutation.isPending ? "Adding..." : "Add Buddy"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}