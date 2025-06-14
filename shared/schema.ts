import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  screenName: text("screen_name").notNull().unique(),
  password: text("password").notNull(),
  status: text("status").notNull().default("online"), // online, away, offline
  awayMessage: text("away_message"),
  profileText: text("profile_text"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const buddyLists = pgTable("buddy_lists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  buddyId: integer("buddy_id").notNull().references(() => users.id),
  groupName: text("group_name").notNull().default("Buddies"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  screenName: true,
  password: true,
});

export const insertBuddyListSchema = createInsertSchema(buddyLists).pick({
  userId: true,
  buddyId: true,
  groupName: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  fromUserId: true,
  toUserId: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertBuddyList = z.infer<typeof insertBuddyListSchema>;
export type BuddyList = typeof buddyLists.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type UserWithStatus = User & {
  isOnline: boolean;
  lastSeen?: Date;
};
