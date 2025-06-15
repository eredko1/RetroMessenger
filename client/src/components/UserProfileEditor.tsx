import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface UserProfileEditorProps {
  user: any;
  onClose: () => void;
}

export default function UserProfileEditor({ user, onClose }: UserProfileEditorProps) {
  const [profile, setProfile] = useState({
    profileText: user.profileText || "",
    profileQuote: user.profileQuote || "",
    interests: user.interests || "",
    location: user.location || "",
    occupation: user.occupation || "",
    hobbies: user.hobbies || "",
    avatarUrl: user.avatarUrl || "",
    allowDirectIMs: user.allowDirectIMs !== false
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest(`/api/user/${user.id}/profile`, 'PUT', profileData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/user/${user.id}/buddies`] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(profile);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="win-window w-96 max-h-[80vh] overflow-hidden border-2 border-gray-400 rounded-lg shadow-2xl">
        {/* Title Bar */}
        <div className="win-titlebar px-3 py-2 flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded-sm flex items-center justify-center">
              <span className="text-xs font-bold text-blue-800">👤</span>
            </div>
            <span className="text-white font-bold text-sm">Edit Profile - {user.screenName}</span>
          </div>
          <button 
            onClick={onClose}
            className="w-5 h-5 bg-red-500 hover:bg-red-600 border border-red-700 text-white text-xs rounded-sm transition-colors flex items-center justify-center"
          >
            <span className="leading-none">×</span>
          </button>
        </div>

        {/* Profile Form */}
        <div className="bg-white p-4 max-h-[60vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Profile Quote</label>
              <input
                type="text"
                value={profile.profileQuote}
                onChange={(e) => setProfile(prev => ({ ...prev, profileQuote: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your favorite quote or motto..."
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">About Me</label>
              <textarea
                value={profile.profileText}
                onChange={(e) => setProfile(prev => ({ ...prev, profileText: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={3}
                placeholder="Tell people about yourself..."
                maxLength={300}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="City, State/Country"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Occupation</label>
              <input
                type="text"
                value={profile.occupation}
                onChange={(e) => setProfile(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What do you do?"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Interests</label>
              <input
                type="text"
                value={profile.interests}
                onChange={(e) => setProfile(prev => ({ ...prev, interests: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Music, movies, sports, etc."
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Hobbies</label>
              <input
                type="text"
                value={profile.hobbies}
                onChange={(e) => setProfile(prev => ({ ...prev, hobbies: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="What do you do for fun?"
                maxLength={100}
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700">Avatar URL</label>
              <input
                type="url"
                value={profile.avatarUrl}
                onChange={(e) => setProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/your-avatar.jpg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="allowDirectIMs"
                checked={profile.allowDirectIMs}
                onChange={(e) => setProfile(prev => ({ ...prev, allowDirectIMs: e.target.checked }))}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="allowDirectIMs" className="text-sm text-gray-700">
                Allow direct messages from anyone
              </label>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 border border-gray-400 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProfileMutation.isPending}
                className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white border border-blue-600 rounded-md transition-colors disabled:opacity-50"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}