import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  screenName: text("screen_name").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  mobileNumber: text("mobile_number"),
  status: text("status").notNull().default("online"), // online, away, offline, invisible
  awayMessage: text("away_message"),
  profileText: text("profile_text"),
  profileQuote: text("profile_quote"),
  interests: text("interests"),
  location: text("location"),
  occupation: text("occupation"),
  hobbies: text("hobbies"),
  avatarUrl: text("avatar_url"),
  isInvisible: boolean("is_invisible").notNull().default(false),
  allowDirectIMs: boolean("allow_direct_ims").notNull().default(true),
  enableEmailForwarding: boolean("enable_email_forwarding").notNull().default(false),
  enableSMSForwarding: boolean("enable_sms_forwarding").notNull().default(false),
  soundNotifications: boolean("sound_notifications").notNull().default(true),
  systemTrayNotifications: boolean("system_tray_notifications").notNull().default(true),
  windowPositions: text("window_positions"), // JSON string for multi-monitor support
  createdAt: timestamp("created_at").defaultNow(),
});

export const buddyLists = pgTable("buddy_lists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  buddyId: integer("buddy_id").notNull().references(() => users.id),
  groupName: text("group_name").notNull().default("Buddies"),
  customSoundAlert: text("custom_sound_alert"), // Custom sound for this buddy
  enableAlerts: boolean("enable_alerts").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  fromUserId: integer("from_user_id").notNull().references(() => users.id),
  toUserId: integer("to_user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  formatting: text("formatting"), // JSON string for rich text formatting
  timestamp: timestamp("timestamp").defaultNow(),
  isRead: boolean("is_read").notNull().default(false),
});

export const blockedUsers = pgTable("blocked_users", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  blockedUserId: integer("blocked_user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userWarnings = pgTable("user_warnings", {
  id: serial("id").primaryKey(),
  reporterId: integer("reporter_id").notNull().references(() => users.id),
  reportedUserId: integer("reported_user_id").notNull().references(() => users.id),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").notNull().default("pending"), // pending, reviewed, resolved
  createdAt: timestamp("created_at").defaultNow(),
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
