import { users, buddyLists, messages, type User, type InsertUser, type BuddyList, type InsertBuddyList, type Message, type InsertMessage, type UserWithStatus } from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByScreenName(screenName: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string, awayMessage?: string): Promise<void>;
  updateUserProfile(id: number, profileText: string, avatarUrl?: string): Promise<void>;
  
  // Buddy list operations
  getBuddyList(userId: number): Promise<UserWithStatus[]>;
  addBuddy(userId: number, buddyId: number, groupName?: string): Promise<BuddyList>;
  removeBuddy(userId: number, buddyId: number): Promise<void>;
  
  // Message operations
  saveMessage(message: InsertMessage): Promise<Message>;
  getConversation(userId1: number, userId2: number, limit?: number): Promise<Message[]>;
  markMessagesAsRead(userId: number, fromUserId: number): Promise<void>;
  
  // Online status tracking
  setUserOnline(userId: number): Promise<void>;
  setUserOffline(userId: number): Promise<void>;
  getOnlineUsers(): Promise<number[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private buddyLists: Map<number, BuddyList[]>;
  private messages: Map<string, Message[]>;
  private onlineUsers: Set<number>;
  private currentId: number;
  private messageId: number;
  private buddyListId: number;

  constructor() {
    this.users = new Map();
    this.buddyLists = new Map();
    this.messages = new Map();
    this.onlineUsers = new Set();
    this.currentId = 1;
    this.messageId = 1;
    this.buddyListId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByScreenName(screenName: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.screenName === screenName,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = {
      ...insertUser,
      id,
      status: "online",
      awayMessage: null,
      profileText: null,
      avatarUrl: null,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStatus(id: number, status: string, awayMessage?: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.status = status;
      user.awayMessage = awayMessage || null;
      this.users.set(id, user);
    }
  }

  async updateUserProfile(id: number, profileText: string, avatarUrl?: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.profileText = profileText;
      if (avatarUrl) user.avatarUrl = avatarUrl;
      this.users.set(id, user);
    }
  }

  async getBuddyList(userId: number): Promise<UserWithStatus[]> {
    const buddies = this.buddyLists.get(userId) || [];
    const buddyUsers: UserWithStatus[] = [];
    
    for (const buddy of buddies) {
      const user = this.users.get(buddy.buddyId);
      if (user) {
        buddyUsers.push({
          ...user,
          isOnline: this.onlineUsers.has(user.id),
        });
      }
    }
    
    return buddyUsers;
  }

  async addBuddy(userId: number, buddyId: number, groupName: string = "Buddies"): Promise<BuddyList> {
    const buddy: BuddyList = {
      id: this.buddyListId++,
      userId,
      buddyId,
      groupName,
      createdAt: new Date(),
    };
    
    const userBuddies = this.buddyLists.get(userId) || [];
    userBuddies.push(buddy);
    this.buddyLists.set(userId, userBuddies);
    
    return buddy;
  }

  async removeBuddy(userId: number, buddyId: number): Promise<void> {
    const userBuddies = this.buddyLists.get(userId) || [];
    const filtered = userBuddies.filter(b => b.buddyId !== buddyId);
    this.buddyLists.set(userId, filtered);
  }

  async saveMessage(message: InsertMessage): Promise<Message> {
    const savedMessage: Message = {
      ...message,
      id: this.messageId++,
      timestamp: new Date(),
      isRead: false,
    };
    
    const conversationKey = [message.fromUserId, message.toUserId].sort().join('-');
    const conversation = this.messages.get(conversationKey) || [];
    conversation.push(savedMessage);
    this.messages.set(conversationKey, conversation);
    
    return savedMessage;
  }

  async getConversation(userId1: number, userId2: number, limit: number = 50): Promise<Message[]> {
    const conversationKey = [userId1, userId2].sort().join('-');
    const conversation = this.messages.get(conversationKey) || [];
    return conversation.slice(-limit);
  }

  async markMessagesAsRead(userId: number, fromUserId: number): Promise<void> {
    const conversationKey = [userId, fromUserId].sort().join('-');
    const conversation = this.messages.get(conversationKey) || [];
    
    conversation.forEach(message => {
      if (message.toUserId === userId && message.fromUserId === fromUserId) {
        message.isRead = true;
      }
    });
    
    this.messages.set(conversationKey, conversation);
  }

  async setUserOnline(userId: number): Promise<void> {
    this.onlineUsers.add(userId);
  }

  async setUserOffline(userId: number): Promise<void> {
    this.onlineUsers.delete(userId);
  }

  async getOnlineUsers(): Promise<number[]> {
    return Array.from(this.onlineUsers);
  }
}

export const storage = new MemStorage();
