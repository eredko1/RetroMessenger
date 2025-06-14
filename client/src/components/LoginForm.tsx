import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LoginFormProps {
  onLogin: (user: any) => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [screenName, setScreenName] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/login', { screenName, password });
      return response.json();
    },
    onSuccess: (data) => {
      onLogin(data.user);
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    }
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/register', { screenName, password });
      return response.json();
    },
    onSuccess: (data) => {
      onLogin(data.user);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Screen name already taken",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenName.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please enter both screen name and password",
        variant: "destructive",
      });
      return;
    }

    if (isRegistering) {
      registerMutation.mutate();
    } else {
      loginMutation.mutate();
    }
  };

  return (
    <div className="xp-desktop w-screen h-screen flex items-center justify-center">
      <div className="xp-window w-80 p-4">
        {/* Windows XP Title Bar */}
        <div className="xp-titlebar -mx-4 -mt-4 mb-4">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-yellow-400 border border-gray-600 flex items-center justify-center">
              <span style={{ fontSize: '8px' }}>💬</span>
            </div>
            <span>AOL Instant Messenger</span>
          </div>
          <div className="xp-close-button">×</div>
        </div>

        {/* AIM Logo */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-blue-600 mb-2">AIM</div>
          <div className="text-xs text-gray-600">AOL Instant Messenger - 2002 Edition</div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold mb-1">Screen Name:</label>
            <input
              type="text"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              className="aim-input w-full"
              placeholder="Enter your screen name"
              maxLength={20}
            />
          </div>

          <div>
            <label className="block text-xs font-bold mb-1">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="aim-input w-full"
              placeholder="Enter your password"
            />
          </div>

          <div className="flex space-x-2">
            <button
              type="submit"
              className="win-button flex-1 py-2 font-bold"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {isRegistering ? "Register" : "Sign On"}
            </button>
            <button
              type="button"
              onClick={() => setIsRegistering(!isRegistering)}
              className="win-button px-4 py-2"
            >
              {isRegistering ? "Login Instead" : "New User?"}
            </button>
          </div>
        </form>

        <div className="mt-4 text-xs text-gray-600 text-center">
          {isRegistering ? (
            "Choose a unique screen name and password to create your account"
          ) : (
            "Welcome back to AIM! Enter your screen name and password to sign on"
          )}
        </div>
      </div>
    </div>
  );
}
