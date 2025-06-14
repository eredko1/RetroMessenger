import { users, buddyLists, messages, type User, type InsertUser, type BuddyList, type InsertBuddyList, type Message, type InsertMessage, type UserWithStatus } from "@shared/schema";
import { db } from "./db";
import { eq, or, and } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  private onlineUsers: Set<number> = new Set();

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByScreenName(screenName: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.screenName, screenName));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStatus(id: number, status: string, awayMessage?: string): Promise<void> {
    await db
      .update(users)
      .set({ status, awayMessage })
      .where(eq(users.id, id));
  }

  async updateUserProfile(id: number, profileText: string, avatarUrl?: string): Promise<void> {
    await db
      .update(users)
      .set({ profileText, avatarUrl })
      .where(eq(users.id, id));
  }

  async getBuddyList(userId: number): Promise<UserWithStatus[]> {
    const buddyListResult = await db
      .select({
        id: users.id,
        screenName: users.screenName,
        password: users.password,
        status: users.status,
        awayMessage: users.awayMessage,
        profileText: users.profileText,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
      })
      .from(buddyLists)
      .innerJoin(users, eq(buddyLists.buddyId, users.id))
      .where(eq(buddyLists.userId, userId));

    return buddyListResult.map(user => ({
      ...user,
      isOnline: this.onlineUsers.has(user.id),
    }));
  }

  async addBuddy(userId: number, buddyId: number, groupName: string = "Buddies"): Promise<BuddyList> {
    const [buddy] = await db
      .insert(buddyLists)
      .values({ userId, buddyId, groupName })
      .returning();
    return buddy;
  }

  async removeBuddy(userId: number, buddyId: number): Promise<void> {
    await db
      .delete(buddyLists)
      .where(and(eq(buddyLists.userId, userId), eq(buddyLists.buddyId, buddyId)));
  }

  async saveMessage(message: InsertMessage): Promise<Message> {
    const [savedMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return savedMessage;
  }

  async getConversation(userId1: number, userId2: number, limit: number = 50): Promise<Message[]> {
    const result = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.fromUserId, userId1), eq(messages.toUserId, userId2)),
          and(eq(messages.fromUserId, userId2), eq(messages.toUserId, userId1))
        )
      )
      .orderBy(messages.timestamp)
      .limit(limit);
    
    return result;
  }

  async markMessagesAsRead(userId: number, fromUserId: number): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(and(eq(messages.toUserId, userId), eq(messages.fromUserId, fromUserId)));
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

export const storage = new DatabaseStorage();
