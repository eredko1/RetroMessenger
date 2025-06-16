import { useState } from 'react';

interface LoginSelectorProps {
  onLogin: (user: any, uiMode: 'retro' | 'osweb') => void;
}

export default function LoginSelector({ onLogin }: LoginSelectorProps) {
  const [selectedMode, setSelectedMode] = useState<'retro' | 'osweb' | null>(null);
  const [screenName, setScreenName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!selectedMode || !screenName.trim()) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenName: screenName.trim(), password: password || 'password' })
      });

      if (response.ok) {
        const user = await response.json();
        onLogin(user.user, selectedMode);
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedMode && screenName.trim()) {
      handleLogin();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center z-50">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 border border-white/20 shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AIM Experience</h1>
          <p className="text-blue-200">Choose your interface style</p>
        </div>

        {!selectedMode ? (
          <div className="space-y-4">
            <button
              onClick={() => setSelectedMode('retro')}
              className="w-full p-6 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">🖥️</span>
                <div className="text-left">
                  <div className="text-xl">Retro</div>
                  <div className="text-sm opacity-90">Classic Windows XP Experience</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setSelectedMode('osweb')}
              className="w-full p-6 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-white font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <div className="flex items-center justify-center space-x-3">
                <span className="text-2xl">🌐</span>
                <div className="text-left">
                  <div className="text-xl">OSWeb</div>
                  <div className="text-sm opacity-90">Modern Web Interface</div>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <h2 className="text-xl text-white mb-2">
                {selectedMode === 'retro' ? '🖥️ Retro Mode' : '🌐 OSWeb Mode'}
              </h2>
              <button
                onClick={() => setSelectedMode(null)}
                className="text-blue-300 hover:text-white text-sm underline"
              >
                Choose different mode
              </button>
            </div>

            <input
              type="text"
              value={screenName}
              onChange={(e) => setScreenName(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter your screen name"
              className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              autoFocus
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Password (optional)"
              className="w-full p-4 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            />

            <button
              onClick={handleLogin}
              disabled={!screenName.trim() || isLoading}
              className="w-full p-4 bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>

            <p className="text-center text-blue-200 text-sm">
              {selectedMode === 'retro' 
                ? 'Experience the classic 2002 AIM interface with Windows XP styling'
                : 'Modern web interface with contemporary design and features'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}