import { useState } from "react";

interface AwayMessageDialogProps {
  onClose: () => void;
  onSetAway: (message: string) => void;
}

const presetMessages = [
  "I am away from my computer right now.",
  "Gone to lunch, back in 30 minutes",
  "At school, will be back later",
  "Sleeping... zzz",
  "On the phone, will be back soon",
  "Custom message..."
];

export default function AwayMessageDialog({ onClose, onSetAway }: AwayMessageDialogProps) {
  const [selectedMessage, setSelectedMessage] = useState(presetMessages[0]);
  const [customMessage, setCustomMessage] = useState("");

  const handleSetAway = () => {
    const messageToUse = selectedMessage === "Custom message..." ? customMessage : selectedMessage;
    if (!messageToUse.trim()) return;
    onSetAway(messageToUse);
  };

  return (
    <div className="win-window absolute top-32 left-96 w-80 shadow-2xl z-50 border-2 border-gray-400 rounded-lg overflow-hidden">
      {/* Title Bar */}
      <div className="win-titlebar px-3 py-2 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
            <span className="text-xs font-bold text-blue-800">⚠</span>
          </div>
          <span className="text-white font-bold text-sm">Set Away Message</span>
        </div>
        <button 
          onClick={onClose}
          className="w-5 h-5 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors flex items-center justify-center"
          title="Close"
        >
          <span className="leading-none">×</span>
        </button>
      </div>

      {/* Away Message Content */}
      <div className="bg-white p-4 space-y-4">
        <div>
          <label className="block text-sm font-bold mb-2 text-gray-700">Select an Away Message:</label>
          <select 
            className="w-full text-sm bg-white border-2 border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            value={selectedMessage}
            onChange={(e) => setSelectedMessage(e.target.value)}
          >
            {presetMessages.map(msg => (
              <option key={msg} value={msg}>{msg}</option>
            ))}
          </select>
        </div>

        {selectedMessage === "Custom message..." && (
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700">Custom Away Message:</label>
            <textarea 
              className="w-full h-20 text-sm bg-white border-2 border-gray-300 rounded-md px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
              placeholder="Enter your custom away message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              maxLength={100}
            />
            <div className="text-xs text-gray-500 mt-1">{customMessage.length}/100 characters</div>
          </div>
        )}

        <div className="flex justify-end space-x-3 pt-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded-md transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSetAway}
            className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 rounded-md transition-colors font-medium shadow-sm"
            disabled={selectedMessage === "Custom message..." && !customMessage.trim()}
          >
            Set Away
          </button>
        </div>
      </div>
    </div>
  );
}
