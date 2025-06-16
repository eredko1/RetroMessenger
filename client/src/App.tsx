import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useState } from "react";
import AIM from "@/pages/AIM";
import LoginSelector from "@/components/LoginSelector";
import OSWebInterface from "@/components/OSWebInterface";

function Router() {
  const [user, setUser] = useState<any>(null);
  const [uiMode, setUiMode] = useState<'retro' | 'osweb' | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  const handleLogin = (userData: any, selectedMode: 'retro' | 'osweb') => {
    setUser(userData);
    setUiMode(selectedMode);
    
    // Establish WebSocket connection
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('WebSocket connected');
      ws.send(JSON.stringify({
        type: 'authenticate',
        userId: userData.id
      }));
      setSocket(ws);
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected');
      setSocket(null);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  };

  const handleLogout = () => {
    if (socket) {
      socket.close();
    }
    setUser(null);
    setUiMode(null);
    setSocket(null);
  };

  if (!user || !uiMode) {
    return <LoginSelector onLogin={handleLogin} />;
  }

  if (uiMode === 'osweb') {
    return <OSWebInterface user={user} socket={socket} onLogout={handleLogout} />;
  }

  // Retro mode (existing Windows XP interface)
  return (
    <Switch>
      <Route path="/" component={() => <AIM />} />
      <Route component={() => <AIM />} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <Router />
    </QueryClientProvider>
  );
}

export default App;
