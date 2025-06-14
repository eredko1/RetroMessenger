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
    <div className="win-window absolute top-32 left-96 w-72 shadow-lg z-20">
      {/* Title Bar */}
      <div className="win-titlebar px-2 py-1 flex justify-between items-center">
        <span className="text-white font-bold">Away Message</span>
        <button 
          onClick={onClose}
          className="w-4 h-4 bg-red-500 border border-red-700 text-white text-xs"
        >
          ×
        </button>
      </div>

      {/* Away Message Content */}
      <div className="p-3 space-y-3">
        <div>
          <label className="block text-xs font-bold mb-1">Select an Away Message:</label>
          <select 
            className="aim-select w-full"
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
            <label className="block text-xs font-bold mb-1">Custom Away Message:</label>
            <textarea 
              className="aim-textarea w-full h-16"
              placeholder="Enter your custom away message..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              maxLength={100}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2">
          <button 
            onClick={onClose}
            className="win-button px-3 py-1 text-xs"
          >
            Cancel
          </button>
          <button 
            onClick={handleSetAway}
            className="win-button px-3 py-1 text-xs font-bold"
            disabled={selectedMessage === "Custom message..." && !customMessage.trim()}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
