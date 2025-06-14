import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAIMSounds } from "@/hooks/useAIMSounds";

interface BuddyAlertSettingsProps {
  buddy: any;
  currentUserId: number;
  onClose: () => void;
}

export default function BuddyAlertSettings({ buddy, currentUserId, onClose }: BuddyAlertSettingsProps) {
  const [enableAlerts, setEnableAlerts] = useState(true);
  const [selectedSound, setSelectedSound] = useState<string>("");
  const [customFrequency, setCustomFrequency] = useState(700);
  const { playCustomBuddySound, playSystemNotificationSound } = useAIMSounds();

  // Fetch current buddy alert settings
  const { data: alertSettings } = useQuery({
    queryKey: [`/api/user/${currentUserId}/buddy/${buddy.id}/alerts`],
    enabled: !!buddy.id,
  });

  useEffect(() => {
    if (alertSettings) {
      setEnableAlerts(alertSettings.enableAlerts);
      setSelectedSound(alertSettings.customSoundAlert || "");
      if (alertSettings.customSoundAlert?.startsWith("freq:")) {
        setCustomFrequency(parseInt(alertSettings.customSoundAlert.split(":")[1]) || 700);
      }
    }
  }, [alertSettings]);

  const saveAlertsMutation = useMutation({
    mutationFn: async (settings: { enableAlerts: boolean; customSoundAlert?: string }) => {
      await apiRequest('PUT', `/api/user/${currentUserId}/buddy/${buddy.id}/alerts`, settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${currentUserId}/buddy/${buddy.id}/alerts`] });
      onClose();
    }
  });

  const handleSave = () => {
    const customSoundAlert = selectedSound === "custom" ? `freq:${customFrequency}` : selectedSound || undefined;
    saveAlertsMutation.mutate({
      enableAlerts,
      customSoundAlert
    });
  };

  const previewSound = (soundType: string) => {
    switch (soundType) {
      case "default":
        playSystemNotificationSound();
        break;
      case "chime":
        playCustomBuddySound(800);
        break;
      case "bell":
        playCustomBuddySound(600);
        break;
      case "whistle":
        playCustomBuddySound(1000);
        break;
      case "custom":
        playCustomBuddySound(customFrequency);
        break;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="win-window w-96 border-2 border-gray-400 rounded-lg shadow-2xl">
        {/* Title Bar */}
        <div className="win-titlebar px-3 py-2 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
              <span className="text-xs font-bold text-blue-800">🔔</span>
            </div>
            <span className="text-white font-bold text-sm">Buddy Alert Settings - {buddy.screenName}</span>
          </div>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors flex items-center justify-center"
          >
            <span className="leading-none">×</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="bg-white p-4 space-y-4">
          {/* Enable Alerts */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enableAlerts"
              checked={enableAlerts}
              onChange={(e) => setEnableAlerts(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="enableAlerts" className="text-sm font-medium text-gray-700">
              Enable alerts when {buddy.screenName} comes online
            </label>
          </div>

          {/* Sound Selection */}
          {enableAlerts && (
            <div>
              <label className="block text-sm font-bold mb-2 text-gray-700">Alert Sound</label>
              <div className="space-y-2">
                {[
                  { value: "", label: "Default Windows sound" },
                  { value: "chime", label: "High Chime" },
                  { value: "bell", label: "Soft Bell" },
                  { value: "whistle", label: "Sharp Whistle" },
                  { value: "custom", label: "Custom Frequency" }
                ].map((sound) => (
                  <div key={sound.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id={`sound-${sound.value}`}
                      name="alertSound"
                      value={sound.value}
                      checked={selectedSound === sound.value}
                      onChange={(e) => setSelectedSound(e.target.value)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                    />
                    <label htmlFor={`sound-${sound.value}`} className="text-sm text-gray-700 flex-1">
                      {sound.label}
                    </label>
                    <button
                      onClick={() => previewSound(sound.value)}
                      className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors"
                    >
                      Preview
                    </button>
                  </div>
                ))}
              </div>

              {/* Custom Frequency Slider */}
              {selectedSound === "custom" && (
                <div className="mt-3 p-3 bg-gray-50 rounded border">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Custom Frequency: {customFrequency} Hz
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="1500"
                    step="50"
                    value={customFrequency}
                    onChange={(e) => setCustomFrequency(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Low (200 Hz)</span>
                    <span>High (1500 Hz)</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saveAlertsMutation.isPending}
              className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 rounded transition-colors disabled:opacity-50"
            >
              {saveAlertsMutation.isPending ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}