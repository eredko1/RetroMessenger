import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface OSWebBuddyListProps {
  user: any;
  socket: WebSocket | null;
  onOpenChat: (buddy: any) => void;
}

export default function OSWebBuddyList({ user, socket, onOpenChat }: OSWebBuddyListProps) {
  const [status, setStatus] = useState('available');
  const [awayMessage, setAwayMessage] = useState('');
  const [showAddBuddy, setShowAddBuddy] = useState(false);
  const [newBuddyName, setNewBuddyName] = useState('');
  const queryClient = useQueryClient();

  const { data: buddies = [], refetch } = useQuery<any[]>({
    queryKey: [`/api/user/${user?.id}/buddies`],
    enabled: !!user?.id,
    refetchInterval: 5000,
  });

  const addBuddyMutation = useMutation({
    mutationFn: async (screenName: string) => {
      return apiRequest(`/api/user/${user.id}/buddies`, {
        method: 'POST',
        body: { screenName }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${user.id}/buddies`] });
      setNewBuddyName('');
      setShowAddBuddy(false);
    }
  });

  const statusMutation = useMutation({
    mutationFn: async ({ status, awayMessage }: { status: string; awayMessage?: string }) => {
      return apiRequest(`/api/user/${user.id}/status`, {
        method: 'PUT',
        body: { status, awayMessage }
      });
    },
    onSuccess: (_, variables) => {
      setStatus(variables.status);
      if (variables.awayMessage !== undefined) {
        setAwayMessage(variables.awayMessage);
      }
      
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: 'status_change',
          status: variables.status,
          awayMessage: variables.awayMessage
        }));
      }
    }
  });

  const handleAddBuddy = (e: React.FormEvent) => {
    e.preventDefault();
    if (newBuddyName.trim()) {
      addBuddyMutation.mutate(newBuddyName.trim());
    }
  };

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === 'away') {
      const message = prompt('Enter away message:') || '';
      statusMutation.mutate({ status: newStatus, awayMessage: message });
    } else {
      statusMutation.mutate({ status: newStatus });
    }
  };

  return (
    <div className="h-full flex flex-col bg-[var(--window-content-bg)]">
      {/* User Info Header */}
      <div className="p-4 border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-3 mb-3">
          <img 
            src={`https://placehold.co/48x48/82AAFF/1E1E1E?text=${user?.screenName?.charAt(0) || 'U'}&font=roboto`} 
            alt="User" 
            className="rounded-full h-12 w-12"
          />
          <div className="flex-1">
            <div className="font-semibold text-[var(--text-primary)]">{user?.screenName}</div>
            <div className="text-sm text-[var(--text-secondary)]">
              {status === 'available' && 'Available'}
              {status === 'away' && `Away: ${awayMessage}`}
              {status === 'invisible' && 'Invisible'}
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${
              status === 'available' ? 'bg-green-500' : 
              status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
            }`}></div>
          </div>
        </div>
        
        {/* Status Controls */}
        <div className="flex space-x-2">
          <select 
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="flex-1 p-2 rounded-lg bg-[var(--surface-overlay-bg)] border border-[var(--border-color)] text-[var(--text-primary)] text-sm"
          >
            <option value="available">Available</option>
            <option value="away">Away</option>
            <option value="invisible">Invisible</option>
          </select>
        </div>
      </div>

      {/* Buddy List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-[var(--text-primary)]">Buddies ({buddies.length})</h3>
            <button 
              onClick={() => setShowAddBuddy(true)}
              className="p-1.5 rounded-lg bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]/90 transition-colors"
              title="Add Buddy"
            >
              <i className="fas fa-plus text-xs"></i>
            </button>
          </div>
          
          {buddies.length === 0 ? (
            <div className="text-center py-8 text-[var(--text-secondary)]">
              <i className="fas fa-user-friends text-3xl mb-2 opacity-50"></i>
              <p className="text-sm">No buddies yet</p>
              <button 
                onClick={() => setShowAddBuddy(true)}
                className="mt-2 text-[var(--accent-color)] hover:underline text-sm"
              >
                Add your first buddy
              </button>
            </div>
          ) : (
            <div className="space-y-1">
              {buddies.map((buddy: any) => (
                <div 
                  key={buddy.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-[var(--surface-overlay-bg)] cursor-pointer transition-colors group"
                  onClick={() => onOpenChat(buddy)}
                >
                  <div className="relative">
                    <img 
                      src={`https://placehold.co/32x32/82AAFF/1E1E1E?text=${buddy.screenName?.charAt(0) || 'U'}&font=roboto`} 
                      alt={buddy.screenName} 
                      className="rounded-full h-8 w-8"
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[var(--surface-bg)] ${
                      buddy.isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-[var(--text-primary)] truncate">{buddy.screenName}</div>
                    <div className="text-xs text-[var(--text-secondary)] truncate">
                      {buddy.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <i className="fas fa-comment text-[var(--accent-color)] text-sm"></i>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Buddy Modal */}
      {showAddBuddy && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface-bg)] p-6 rounded-xl border border-[var(--border-color)] w-80">
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Add Buddy</h3>
            <form onSubmit={handleAddBuddy}>
              <input
                type="text"
                value={newBuddyName}
                onChange={(e) => setNewBuddyName(e.target.value)}
                placeholder="Enter screen name"
                className="w-full p-3 rounded-lg bg-[var(--surface-overlay-bg)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
                autoFocus
              />
              <div className="flex space-x-3 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddBuddy(false);
                    setNewBuddyName('');
                  }}
                  className="flex-1 p-2 rounded-lg bg-[var(--surface-overlay-bg)] text-[var(--text-secondary)] hover:bg-[var(--surface-active-bg)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newBuddyName.trim() || addBuddyMutation.isPending}
                  className="flex-1 p-2 rounded-lg bg-[var(--accent-color)] text-white hover:bg-[var(--accent-color)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {addBuddyMutation.isPending ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}