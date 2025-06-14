import { users, buddyLists, messages, blockedUsers, userWarnings, type User, type InsertUser, type BuddyList, type InsertBuddyList, type Message, type InsertMessage, type UserWithStatus } from "@shared/schema";
import { db } from "./db";
import { eq, or, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByScreenName(screenName: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStatus(id: number, status: string, awayMessage?: string): Promise<void>;
  updateUserProfile(id: number, profileData: any): Promise<void>;
  
  // Buddy list operations
  getBuddyList(userId: number): Promise<UserWithStatus[]>;
  addBuddy(userId: number, buddyId: number, groupName?: string): Promise<BuddyList>;
  removeBuddy(userId: number, buddyId: number): Promise<void>;
  
  // Message operations
  saveMessage(message: InsertMessage): Promise<Message>;
  getConversation(userId1: number, userId2: number, limit?: number): Promise<Message[]>;
  markMessagesAsRead(userId: number, fromUserId: number): Promise<void>;
  searchMessages(userId: number, query: string, limit?: number): Promise<Message[]>;
  getUnreadMessagesCount(userId: number): Promise<number>;
  
  // Privacy and blocking
  blockUser(userId: number, blockedUserId: number): Promise<void>;
  unblockUser(userId: number, blockedUserId: number): Promise<void>;
  getBlockedUsers(userId: number): Promise<number[]>;
  isUserBlocked(userId: number, blockedUserId: number): Promise<boolean>;
  reportUser(reporterId: number, reportedUserId: number, reason: string, description?: string): Promise<void>;
  
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

  async updateUserProfile(id: number, profileData: any): Promise<void> {
    await db
      .update(users)
      .set(profileData)
      .where(eq(users.id, id));
  }

  async getBuddyList(userId: number): Promise<UserWithStatus[]> {
    const buddyListResult = await db
      .select({
        id: users.id,
        screenName: users.screenName,
        password: users.password,
        email: users.email,
        mobileNumber: users.mobileNumber,
        status: users.status,
        awayMessage: users.awayMessage,
        profileText: users.profileText,
        profileQuote: users.profileQuote,
        interests: users.interests,
        location: users.location,
        occupation: users.occupation,
        hobbies: users.hobbies,
        avatarUrl: users.avatarUrl,
        isInvisible: users.isInvisible,
        allowDirectIMs: users.allowDirectIMs,
        enableEmailForwarding: users.enableEmailForwarding,
        enableSMSForwarding: users.enableSMSForwarding,
        soundNotifications: users.soundNotifications,
        systemTrayNotifications: users.systemTrayNotifications,
        windowPositions: users.windowPositions,
        createdAt: users.createdAt,
        customSoundAlert: buddyLists.customSoundAlert,
        enableAlerts: buddyLists.enableAlerts,
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
    const filteredMessage = {
      ...message,
      content: this.filterBadWords(message.content)
    };
    
    const [savedMessage] = await db
      .insert(messages)
      .values(filteredMessage)
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

  // Message search and filtering
  async searchMessages(userId: number, query: string, limit: number = 50): Promise<Message[]> {
    const searchResults = await db
      .select()
      .from(messages)
      .where(and(
        or(eq(messages.fromUserId, userId), eq(messages.toUserId, userId)),
        sql`${messages.content} ILIKE ${`%${query}%`}`
      ))
      .orderBy(desc(messages.timestamp))
      .limit(limit);
    return searchResults;
  }

  async getUnreadMessagesCount(userId: number): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(and(eq(messages.toUserId, userId), eq(messages.isRead, false)));
    return result?.count || 0;
  }

  // Privacy and blocking system
  async blockUser(userId: number, blockedUserId: number): Promise<void> {
    await db.insert(blockedUsers).values({ userId, blockedUserId });
  }

  async unblockUser(userId: number, blockedUserId: number): Promise<void> {
    await db.delete(blockedUsers)
      .where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)));
  }

  async getBlockedUsers(userId: number): Promise<number[]> {
    const blocked = await db.select({ blockedUserId: blockedUsers.blockedUserId })
      .from(blockedUsers)
      .where(eq(blockedUsers.userId, userId));
    return blocked.map(b => b.blockedUserId);
  }

  async isUserBlocked(userId: number, blockedUserId: number): Promise<boolean> {
    const [result] = await db.select()
      .from(blockedUsers)
      .where(and(eq(blockedUsers.userId, userId), eq(blockedUsers.blockedUserId, blockedUserId)))
      .limit(1);
    return !!result;
  }

  async reportUser(reporterId: number, reportedUserId: number, reason: string, description?: string): Promise<void> {
    await db.insert(userWarnings).values({
      reporterId,
      reportedUserId,
      reason,
      description
    });
  }

  private filterBadWords(content: string): string {
    const badWords = ['damn', 'hell', 'crap', 'stupid', 'idiot', 'shut up', 'hate'];
    let filtered = content;
    badWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      filtered = filtered.replace(regex, '*'.repeat(word.length));
    });
    return filtered;
  }

  // IM Forwarding functionality
  async forwardMessageIfNeeded(toUserId: number, fromUser: any, content: string): Promise<void> {
    const recipient = await this.getUser(toUserId);
    if (!recipient) return;

    // Check if user is away and has forwarding enabled
    if (recipient.status === 'away') {
      if (recipient.enableEmailForwarding && recipient.email) {
        await this.forwardToEmail(recipient.email, fromUser.screenName, content);
      }
      if (recipient.enableSMSForwarding && recipient.mobileNumber) {
        await this.forwardToSMS(recipient.mobileNumber, fromUser.screenName, content);
      }
    }
  }

  private async forwardToEmail(email: string, fromScreenName: string, content: string): Promise<void> {
    try {
      console.log(`Forwarding IM to email ${email}: From ${fromScreenName}: ${content}`);
    } catch (error) {
      console.error('Email forwarding failed:', error);
    }
  }

  private async forwardToSMS(mobileNumber: string, fromScreenName: string, content: string): Promise<void> {
    try {
      console.log(`Forwarding IM to SMS ${mobileNumber}: From ${fromScreenName}: ${content}`);
    } catch (error) {
      console.error('SMS forwarding failed:', error);
    }
  }

  // Buddy alert sound management
  async setBuddyAlert(userId: number, buddyId: number, soundAlert?: string, enableAlerts: boolean = true): Promise<void> {
    await db.update(buddyLists)
      .set({ customSoundAlert: soundAlert, enableAlerts })
      .where(and(eq(buddyLists.userId, userId), eq(buddyLists.buddyId, buddyId)));
  }

  async getBuddyAlertSettings(userId: number, buddyId: number): Promise<{ customSoundAlert?: string; enableAlerts: boolean }> {
    const [result] = await db.select({
      customSoundAlert: buddyLists.customSoundAlert,
      enableAlerts: buddyLists.enableAlerts
    })
    .from(buddyLists)
    .where(and(eq(buddyLists.userId, userId), eq(buddyLists.buddyId, buddyId)))
    .limit(1);
    
    return result || { enableAlerts: true };
  }

  // Window position management for multi-monitor support
  async saveWindowPositions(userId: number, positions: any): Promise<void> {
    await db.update(users)
      .set({ windowPositions: JSON.stringify(positions) })
      .where(eq(users.id, userId));
  }

  async getWindowPositions(userId: number): Promise<any> {
    const user = await this.getUser(userId);
    if (user?.windowPositions) {
      try {
        return JSON.parse(user.windowPositions);
      } catch {
        return {};
      }
    }
    return {};
  }
}

export const storage = new DatabaseStorage();
