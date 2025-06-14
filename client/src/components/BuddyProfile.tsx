interface BuddyProfileProps {
  buddy: any;
  onClose: () => void;
  onSendMessage: () => void;
}

export default function BuddyProfile({ buddy, onClose, onSendMessage }: BuddyProfileProps) {
  const getStatusText = () => {
    if (!buddy.isOnline) return "Offline";
    return buddy.status === 'away' ? `Away${buddy.awayMessage ? `: ${buddy.awayMessage}` : ''}` : "Online";
  };

  return (
    <div className="win-window absolute top-40 left-112 w-64 shadow-lg z-20">
      {/* Title Bar */}
      <div className="win-titlebar px-2 py-1 flex justify-between items-center">
        <span className="text-white font-bold text-xs">{buddy.screenName}'s Profile</span>
        <button 
          onClick={onClose}
          className="w-4 h-4 bg-red-500 border border-red-700 text-white text-xs"
        >
          ×
        </button>
      </div>

      {/* Profile Content */}
      <div className="p-3 space-y-3">
        <div className="flex items-center space-x-3">
          <div className="w-16 h-16 bg-gray-300 border border-gray-400 buddy-icon flex items-center justify-center text-2xl">
            👤
          </div>
          <div>
            <div className="font-bold text-sm">{buddy.screenName}</div>
            <div className="text-xs text-gray-600">{getStatusText()}</div>
            {buddy.isOnline && (
              <div className="text-xs text-gray-600">Idle: 0 minutes</div>
            )}
          </div>
        </div>

        <div>
          <div className="text-xs font-bold mb-1">Profile:</div>
          <div className="aim-textarea w-full h-20 overflow-y-auto bg-white border-gray-400 p-2">
            {buddy.profileText || "No profile information available."}
          </div>
        </div>

        <div className="flex justify-between">
          <button 
            onClick={onSendMessage}
            className="win-button px-3 py-1 text-xs"
            disabled={!buddy.isOnline}
          >
            Send Message
          </button>
          <button className="win-button px-3 py-1 text-xs">
            Add Buddy
          </button>
        </div>
      </div>
    </div>
  );
}
