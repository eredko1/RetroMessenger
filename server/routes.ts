import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertUserSchema, insertMessageSchema } from "@shared/schema";

interface WebSocketClient extends WebSocket {
  userId?: number;
  screenName?: string;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time messaging
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const clients = new Map<number, WebSocketClient>();

  // Authentication routes
  app.post("/api/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if screen name already exists
      const existingUser = await storage.getUserByScreenName(userData.screenName);
      if (existingUser) {
        return res.status(400).json({ message: "Screen name already taken" });
      }
      
      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, screenName: user.screenName } });
    } catch (error) {
      res.status(400).json({ message: "Invalid registration data" });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { screenName, password } = req.body;
      
      const user = await storage.getUserByScreenName(screenName);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      await storage.setUserOnline(user.id);
      res.json({ user: { id: user.id, screenName: user.screenName, status: user.status } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // User routes
  app.get("/api/user/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.put("/api/user/:id/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { status, awayMessage } = req.body;
      
      await storage.updateUserStatus(userId, status, awayMessage);
      
      // Broadcast status change to buddies
      broadcastToUserBuddies(userId, {
        type: 'status_change',
        userId,
        status,
        awayMessage
      });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update status" });
    }
  });

  app.put("/api/user/:id/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const profileData = req.body;
      
      await storage.updateUserProfile(userId, profileData);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Buddy list routes
  app.get("/api/user/:id/buddies", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const buddies = await storage.getBuddyList(userId);
      res.json(buddies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch buddy list" });
    }
  });

  app.post("/api/user/:id/buddies", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { buddyScreenName, groupName } = req.body;
      
      const buddy = await storage.getUserByScreenName(buddyScreenName);
      if (!buddy) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const buddyList = await storage.addBuddy(userId, buddy.id, groupName);
      res.json(buddyList);
    } catch (error) {
      res.status(500).json({ message: "Failed to add buddy" });
    }
  });

  // Message routes
  app.get("/api/conversation", async (req, res) => {
    try {
      const userId1 = parseInt(req.query.userId1 as string);
      const userId2 = parseInt(req.query.userId2 as string);
      const limit = parseInt(req.query.limit as string) || 50;
      
      const messages = await storage.getConversation(userId1, userId2, limit);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.get("/api/conversation/:userId1/:userId2", async (req, res) => {
    try {
      const userId1 = parseInt(req.params.userId1);
      const userId2 = parseInt(req.params.userId2);
      
      const messages = await storage.getConversation(userId1, userId2);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const messageData = insertMessageSchema.parse(req.body);
      
      // Forward message to email/SMS if user is away
      const fromUser = await storage.getUser(messageData.fromUserId);
      await storage.forwardMessageIfNeeded(messageData.toUserId, fromUser, messageData.content);
      
      const message = await storage.saveMessage(messageData);
      
      // Send message via WebSocket if recipient is online
      const recipientClient = clients.get(messageData.toUserId);
      if (recipientClient && recipientClient.readyState === WebSocket.OPEN) {
        recipientClient.send(JSON.stringify({
          type: 'new_message',
          message: {
            ...message,
            fromUser: await storage.getUser(message.fromUserId)
          }
        }));
      }
      
      res.json(message);
    } catch (error) {
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // Message search route
  app.get("/api/user/:id/messages/search", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { query, limit = 50 } = req.query;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const messages = await storage.searchMessages(userId, query, parseInt(limit as string));
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to search messages" });
    }
  });

  // Unread messages count
  app.get("/api/user/:id/messages/unread", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const count = await storage.getUnreadMessagesCount(userId);
      res.json({ count });
    } catch (error) {
      res.status(500).json({ message: "Failed to get unread count" });
    }
  });

  // Blocking system routes
  app.post("/api/user/:id/block", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { blockedUserId } = req.body;
      
      await storage.blockUser(userId, blockedUserId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to block user" });
    }
  });

  app.delete("/api/user/:id/block/:blockedId", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const blockedUserId = parseInt(req.params.blockedId);
      
      await storage.unblockUser(userId, blockedUserId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to unblock user" });
    }
  });

  app.get("/api/user/:id/blocked", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const blockedUsers = await storage.getBlockedUsers(userId);
      res.json(blockedUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to get blocked users" });
    }
  });

  // Warning/reporting system
  app.post("/api/user/:id/report", async (req, res) => {
    try {
      const reporterId = parseInt(req.params.id);
      const { reportedUserId, reason, description } = req.body;
      
      await storage.reportUser(reporterId, reportedUserId, reason, description);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to report user" });
    }
  });

  // Buddy alert settings
  app.get("/api/user/:id/buddy/:buddyId/alerts", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const buddyId = parseInt(req.params.buddyId);
      
      const settings = await storage.getBuddyAlertSettings(userId, buddyId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to get buddy alert settings" });
    }
  });

  app.put("/api/user/:id/buddy/:buddyId/alerts", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const buddyId = parseInt(req.params.buddyId);
      const { enableAlerts, customSoundAlert } = req.body;
      
      await storage.setBuddyAlert(userId, buddyId, customSoundAlert, enableAlerts);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to save buddy alert settings" });
    }
  });

  // Window position management for multi-monitor support
  app.get("/api/user/:id/window-positions", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const positions = await storage.getWindowPositions(userId);
      res.json(positions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get window positions" });
    }
  });

  app.post("/api/user/:id/window-positions", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const positions = req.body;
      
      await storage.saveWindowPositions(userId, positions);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to save window positions" });
    }
  });

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocketClient, req) => {
    console.log('New WebSocket connection');
    
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        switch (message.type) {
          case 'authenticate':
            const user = await storage.getUser(message.userId);
            if (user) {
              ws.userId = user.id;
              ws.screenName = user.screenName;
              clients.set(user.id, ws);
              await storage.setUserOnline(user.id);
              
              // Notify buddies that user is online with custom alert settings
              await broadcastToUserBuddiesWithAlerts(user.id, {
                type: 'user_online',
                userId: user.id,
                screenName: user.screenName
              });
            }
            break;
            
          case 'typing':
            const recipientClient = clients.get(message.toUserId);
            if (recipientClient && recipientClient.readyState === WebSocket.OPEN) {
              recipientClient.send(JSON.stringify({
                type: 'typing',
                fromUserId: ws.userId,
                isTyping: message.isTyping
              }));
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', async () => {
      if (ws.userId) {
        clients.delete(ws.userId);
        await storage.setUserOffline(ws.userId);
        
        // Notify buddies that user is offline
        broadcastToUserBuddies(ws.userId, {
          type: 'user_offline',
          userId: ws.userId,
          screenName: ws.screenName
        });
      }
    });
  });

  async function broadcastToUserBuddies(userId: number, message: any) {
    const buddies = await storage.getBuddyList(userId);
    
    for (const buddy of buddies) {
      const buddyClient = clients.get(buddy.id);
      if (buddyClient && buddyClient.readyState === WebSocket.OPEN) {
        buddyClient.send(JSON.stringify(message));
      }
    }
  }

  async function broadcastToUserBuddiesWithAlerts(userId: number, message: any) {
    const buddies = await storage.getBuddyList(userId);
    
    for (const buddy of buddies) {
      const buddyClient = clients.get(buddy.id);
      if (buddyClient && buddyClient.readyState === WebSocket.OPEN) {
        // Get buddy alert settings for this specific user
        const alertSettings = await storage.getBuddyAlertSettings(buddy.id, userId);
        
        // Enhanced message with alert settings
        const enhancedMessage = {
          ...message,
          alertSettings: {
            enableAlerts: alertSettings.enableAlerts,
            customSoundAlert: alertSettings.customSoundAlert || null
          }
        };
        
        buddyClient.send(JSON.stringify(enhancedMessage));
      }
    }
  }

  return httpServer;
}
