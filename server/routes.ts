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

  app.get("/api/user/:id/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        profileText: user.profileText || "",
        profileQuote: user.profileQuote || "",
        interests: user.interests || "",
        location: user.location || "",
        occupation: user.occupation || "",
        hobbies: user.hobbies || "",
        avatarUrl: user.avatarUrl || "",
        allowDirectIMs: user.allowDirectIMs !== false
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Update user profile route
  app.put("/api/user/:id/profile", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const profileData = req.body;
      
      await storage.updateUserProfile(userId, profileData);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Update user status route
  app.put("/api/user/:id/status", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { status, awayMessage } = req.body;
      
      await storage.updateUserStatus(userId, status, awayMessage);
      
      // Broadcast status change to all buddies
      await broadcastToUserBuddies(userId, {
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
      console.log('Received message data:', req.body);
      
      const messageData = insertMessageSchema.parse(req.body);
      
      // Forward message to email/SMS if user is away
      const fromUser = await storage.getUser(messageData.fromUserId);
      await storage.forwardMessageIfNeeded(messageData.toUserId, fromUser, messageData.content);
      
      const message = await storage.saveMessage(messageData);
      
      // Send message via WebSocket if recipient is online
      console.log('Looking for recipient client:', messageData.toUserId, 'Available clients:', Array.from(clients.keys()));
      const recipientClient = clients.get(messageData.toUserId);
      if (recipientClient && recipientClient.readyState === WebSocket.OPEN) {
        console.log('Sending message to recipient:', messageData.toUserId);
        recipientClient.send(JSON.stringify({
          type: 'new_message',
          message: {
            ...message,
            fromUser: await storage.getUser(message.fromUserId)
          }
        }));
      } else {
        console.log('Recipient not online or client not found:', messageData.toUserId);
      }
      
      // Also send to sender if they have another window open
      const senderClient = clients.get(messageData.fromUserId);
      if (senderClient && senderClient.readyState === WebSocket.OPEN) {
        console.log('Sending message confirmation to sender:', messageData.fromUserId);
        senderClient.send(JSON.stringify({
          type: 'new_message',
          message: {
            ...message,
            fromUser: await storage.getUser(message.fromUserId)
          }
        }));
      }
      
      res.json(message);
    } catch (error) {
      console.error('Message send error:', error);
      res.status(500).json({ message: "Failed to send message", error: error instanceof Error ? error.message : 'Unknown error' });
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

  // Application instance management for database persistence
  app.get("/api/user/:userId/applications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const instances = await storage.getUserApplicationInstances(userId);
      res.json(instances);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const instance = await storage.saveApplicationInstance(req.body);
      res.json(instance);
    } catch (error) {
      console.error("Error saving application:", error);
      res.status(500).json({ message: "Failed to save application" });
    }
  });

  app.put("/api/applications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.updateApplicationInstance(id, req.body);
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  app.delete("/api/applications/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteApplicationInstance(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting application:", error);
      res.status(500).json({ message: "Failed to delete application" });
    }
  });

  // File system operations for Windows applications
  app.get("/api/user/:userId/files", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const path = req.query.path as string || "/";
      const contents = await storage.getDirectoryContents(userId, path);
      res.json(contents);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const file = await storage.createFileSystemEntry(req.body);
      res.json(file);
    } catch (error) {
      console.error("Error creating file:", error);
      res.status(500).json({ message: "Failed to create file" });
    }
  });

  app.get("/api/user/:userId/files/:path(*)", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const path = req.params.path;
      const file = await storage.getFileSystemEntry(userId, path);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: "Failed to fetch file" });
    }
  });

  // Desktop settings with Bliss wallpaper
  app.get("/api/user/:userId/desktop", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.getDesktopSettings(userId);
      res.json(settings || {
        wallpaper: "https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg",
        theme: "windows_xp",
        taskbarPosition: "bottom",
        iconPositions: {}
      });
    } catch (error) {
      console.error("Error fetching desktop settings:", error);
      res.status(500).json({ message: "Failed to fetch desktop settings" });
    }
  });

  app.post("/api/user/:userId/desktop", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const settings = await storage.saveDesktopSettings({
        userId,
        ...req.body
      });
      res.json(settings);
    } catch (error) {
      console.error("Error saving desktop settings:", error);
      res.status(500).json({ message: "Failed to save desktop settings" });
    }
  });

  // Browser data for Internet Explorer
  app.get("/api/user/:userId/browser/history", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const limit = parseInt(req.query.limit as string) || 50;
      const history = await storage.getBrowserHistory(userId, limit);
      res.json(history);
    } catch (error) {
      console.error("Error fetching browser history:", error);
      res.status(500).json({ message: "Failed to fetch browser history" });
    }
  });

  app.get("/api/user/:userId/browser/bookmarks", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const bookmarks = await storage.getBrowserBookmarks(userId);
      res.json(bookmarks);
    } catch (error) {
      console.error("Error fetching bookmarks:", error);
      res.status(500).json({ message: "Failed to fetch bookmarks" });
    }
  });

  app.post("/api/browser", async (req, res) => {
    try {
      const data = await storage.saveBrowserData(req.body);
      res.json(data);
    } catch (error) {
      console.error("Error saving browser data:", error);
      res.status(500).json({ message: "Failed to save browser data" });
    }
  });

  // Browser proxy route for iframe content
  app.get("/api/proxy", async (req, res) => {
    try {
      const { url } = req.query;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ message: "URL parameter required" });
      }

      // Validate and normalize URL
      let targetUrl: string;
      try {
        targetUrl = url.startsWith('http') ? url : `https://${url}`;
        new URL(targetUrl); // Validate URL format
      } catch {
        return res.status(400).json({ message: "Invalid URL format" });
      }

      console.log('Proxy request for:', targetUrl);

      // Fetch the content with Windows XP era headers and no auth
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-us,en;q=0.5',
          'Connection': 'keep-alive'
        },
        redirect: 'follow'
      });

      if (!response.ok) {
        return res.status(response.status).json({ 
          message: `Failed to fetch: ${response.status} ${response.statusText}` 
        });
      }

      let content = await response.text();
      
      // Rewrite URLs to make them absolute and fix relative links
      const baseUrl = new URL(targetUrl).origin;
      const basePath = new URL(targetUrl).pathname.split('/').slice(0, -1).join('/');
      
      content = content
        .replace(/href="\/([^"]*?)"/g, `href="${baseUrl}/$1"`)
        .replace(/src="\/([^"]*?)"/g, `src="${baseUrl}/$1"`)
        .replace(/action="\/([^"]*?)"/g, `action="${baseUrl}/$1"`)
        .replace(/href="([^"]*?)"/g, (match, url) => {
          if (url.startsWith('http') || url.startsWith('//')) return match;
          if (url.startsWith('/')) return `href="${baseUrl}${url}"`;
          return `href="${baseUrl}${basePath}/${url}"`;
        })
        .replace(/src="([^"]*?)"/g, (match, url) => {
          if (url.startsWith('http') || url.startsWith('//')) return match;
          if (url.startsWith('/')) return `src="${baseUrl}${url}"`;
          return `src="${baseUrl}${basePath}/${url}"`;
        });

      // Remove frame-busting scripts and X-Frame-Options restrictions
      content = content
        .replace(/<script[^>]*>[\s\S]*?if\s*\(\s*top\s*!=\s*self\s*\)[\s\S]*?<\/script>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?top\.location[\s\S]*?<\/script>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?window\.top[\s\S]*?<\/script>/gi, '');

      res.setHeader('Content-Type', response.headers.get('content-type') || 'text/html');
      res.setHeader('X-Frame-Options', 'ALLOWALL');
      res.setHeader('Content-Security-Policy', '');
      res.send(content);
    } catch (error) {
      console.error("Proxy error:", error);
      res.status(500).json({ message: "Proxy request failed" });
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
            console.log('Authenticating user:', message.userId);
            const user = await storage.getUser(message.userId);
            if (user) {
              ws.userId = user.id;
              ws.screenName = user.screenName;
              clients.set(user.id, ws);
              await storage.setUserOnline(user.id);
              console.log('User authenticated and added to clients:', user.id, 'Total clients:', clients.size);
              
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
