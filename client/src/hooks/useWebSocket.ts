import { useState, useEffect, useRef } from "react";

export function useWebSocket(user: any) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('WebSocket connected');
        setIsConnected(true);
        
        // Authenticate with the server
        ws.send(JSON.stringify({
          type: 'authenticate',
          userId: user.id
        }));
        
        // Clear reconnect timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
      };
      
      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          if (user) {
            connectWebSocket();
          }
        }, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      setSocket(ws);
    };

    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socket) {
        socket.close();
      }
    };
  }, [user]);

  return { socket, isConnected };
}
