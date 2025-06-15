import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { formatTime } from "@/lib/aimUtils";

interface BuddyProfileProps {
  buddy: any;
  onClose: () => void;
  onSendMessage: () => void;
}

export default function BuddyProfile({ buddy, onClose, onSendMessage }: BuddyProfileProps) {
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");

  const blockUserMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/user/${buddy.id}/block`, { blockedUserId: buddy.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${buddy.id}/buddies`] });
      onClose();
    }
  });

  const reportUserMutation = useMutation({
    mutationFn: async (data: { reason: string; description: string }) => {
      return await apiRequest(`/api/user/${buddy.id}/report`, {
        reportedUserId: buddy.id,
        reason: data.reason,
        description: data.description
      });
    },
    onSuccess: () => {
      setShowReportDialog(false);
      setReportReason("");
      setReportDescription("");
    }
  });

  const handleReport = () => {
    if (reportReason.trim()) {
      reportUserMutation.mutate({ reason: reportReason, description: reportDescription });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1200]">
      <div className="win-window w-96 max-h-[80vh] overflow-hidden border-2 border-gray-400 rounded-lg shadow-2xl">
        {/* Title Bar */}
        <div className="win-titlebar px-3 py-2 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
              <span className="text-xs font-bold text-blue-800">👤</span>
            </div>
            <span className="text-white font-bold text-sm">Buddy Info - {buddy.screenName}</span>
          </div>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors flex items-center justify-center"
          >
            <span className="leading-none">×</span>
          </button>
        </div>

        {/* Profile Content */}
        <div className="bg-white p-4 max-h-[60vh] overflow-y-auto">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-4 mb-4 pb-4 border-b border-gray-200">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
              {buddy.avatarUrl ? (
                <img src={buddy.avatarUrl} alt={buddy.screenName} className="w-16 h-16 rounded-full object-cover" />
              ) : (
                buddy.screenName.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg text-gray-900">{buddy.screenName}</h3>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${
                  buddy.isOnline ? 'bg-green-500' : 
                  buddy.status === 'away' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="text-sm text-gray-600 capitalize">{buddy.status}</span>
              </div>
            </div>
          </div>

          {/* Away Message */}
          {buddy.status === 'away' && buddy.awayMessage && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-bold text-sm text-yellow-800 mb-1">Away Message</h4>
              <div className="text-sm text-yellow-700 italic">
                {buddy.awayMessage}
              </div>
            </div>
          )}

          {/* Profile Quote */}
          {buddy.profileQuote && (
            <div className="mb-4">
              <h4 className="font-bold text-sm text-gray-700 mb-1">Quote</h4>
              <div className="text-sm italic text-gray-600 bg-gray-50 p-2 rounded border">
                "{buddy.profileQuote}"
              </div>
            </div>
          )}

          {/* About Me */}
          {buddy.profileText && (
            <div className="mb-4">
              <h4 className="font-bold text-sm text-gray-700 mb-1">About Me</h4>
              <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded border">
                {buddy.profileText}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-3">
            {buddy.location && (
              <div>
                <span className="font-bold text-sm text-gray-700">Location: </span>
                <span className="text-sm text-gray-800">{buddy.location}</span>
              </div>
            )}
            
            {buddy.occupation && (
              <div>
                <span className="font-bold text-sm text-gray-700">Occupation: </span>
                <span className="text-sm text-gray-800">{buddy.occupation}</span>
              </div>
            )}
            
            {buddy.interests && (
              <div>
                <span className="font-bold text-sm text-gray-700">Interests: </span>
                <span className="text-sm text-gray-800">{buddy.interests}</span>
              </div>
            )}
            
            {buddy.hobbies && (
              <div>
                <span className="font-bold text-sm text-gray-700">Hobbies: </span>
                <span className="text-sm text-gray-800">{buddy.hobbies}</span>
              </div>
            )}
          </div>

          {/* Away Message */}
          {buddy.awayMessage && buddy.status === 'away' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-bold text-sm text-yellow-800 mb-1">Away Message</h4>
              <div className="text-sm text-yellow-700">{buddy.awayMessage}</div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4 border-t border-gray-200 mt-4">
            <div className="space-x-2">
              <button
                onClick={onSendMessage}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 rounded transition-colors"
              >
                Send Message
              </button>
              <button
                onClick={() => setShowReportDialog(true)}
                className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-600 rounded transition-colors"
              >
                Report
              </button>
            </div>
            <button
              onClick={() => blockUserMutation.mutate()}
              disabled={blockUserMutation.isPending}
              className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white border border-red-600 rounded transition-colors disabled:opacity-50"
            >
              {blockUserMutation.isPending ? 'Blocking...' : 'Block User'}
            </button>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg border-2 border-gray-400 shadow-xl w-80">
            <div className="win-titlebar px-3 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500">
              <span className="text-white font-bold text-sm">Report User</span>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Reason</label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Select a reason...</option>
                  <option value="harassment">Harassment</option>
                  <option value="inappropriate_content">Inappropriate Content</option>
                  <option value="spam">Spam</option>
                  <option value="impersonation">Impersonation</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold mb-1 text-gray-700">Description (Optional)</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  rows={3}
                  placeholder="Additional details..."
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowReportDialog(false)}
                  className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportReason.trim() || reportUserMutation.isPending}
                  className="px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-600 text-white border border-yellow-600 rounded transition-colors disabled:opacity-50"
                >
                  {reportUserMutation.isPending ? 'Reporting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}