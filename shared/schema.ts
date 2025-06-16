import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
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
  imageUrl: text("image_url"), // Base64 data URL for images
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

// Application instances and states
export const applicationInstances = pgTable("application_instances", {
  id: varchar("id").primaryKey(), // e.g., "notepad-1234567890"
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 50 }).notNull(), // notepad, calculator, paint, etc.
  title: varchar("title", { length: 100 }).notNull(),
  position: jsonb("position").notNull(), // {x: number, y: number}
  size: jsonb("size").notNull(), // {width: number, height: number}
  zIndex: integer("z_index").default(1000),
  isMinimized: boolean("is_minimized").default(false),
  state: jsonb("state"), // Application-specific state data
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// File system for Windows applications
export const filesystemEntries = pgTable("filesystem_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  path: varchar("path", { length: 500 }).notNull(), // Full file path
  name: varchar("name", { length: 255 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // file, folder, drive
  parentPath: varchar("parent_path", { length: 500 }),
  content: text("content"), // File content for text files
  binaryData: text("binary_data"), // Base64 encoded binary data
  size: integer("size").default(0),
  mimeType: varchar("mime_type", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Desktop customization
export const desktopSettings = pgTable("desktop_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  wallpaper: varchar("wallpaper", { length: 500 }).default("https://www.newegg.com/insider/wp-content/uploads/windows_xp_bliss-wide.jpg"),
  iconPositions: jsonb("icon_positions"), // Custom desktop icon positions
  theme: varchar("theme", { length: 50 }).default("windows_xp"),
  taskbarPosition: varchar("taskbar_position", { length: 20 }).default("bottom"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Internet Explorer bookmarks and history
export const browserData = pgTable("browser_data", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // bookmark, history
  url: varchar("url", { length: 2000 }).notNull(),
  title: varchar("title", { length: 200 }),
  favicon: varchar("favicon", { length: 500 }),
  visitCount: integer("visit_count").default(1),
  lastVisited: timestamp("last_visited").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas for the new tables
export const insertApplicationInstanceSchema = createInsertSchema(applicationInstances).pick({
  id: true,
  userId: true,
  type: true,
  title: true,
  position: true,
  size: true,
  zIndex: true,
  isMinimized: true,
  state: true,
});

export const insertFilesystemEntrySchema = createInsertSchema(filesystemEntries).pick({
  userId: true,
  path: true,
  name: true,
  type: true,
  parentPath: true,
  content: true,
  binaryData: true,
  size: true,
  mimeType: true,
});

export const insertDesktopSettingsSchema = createInsertSchema(desktopSettings).pick({
  userId: true,
  wallpaper: true,
  iconPositions: true,
  theme: true,
  taskbarPosition: true,
});

export const insertBrowserDataSchema = createInsertSchema(browserData).pick({
  userId: true,
  type: true,
  url: true,
  title: true,
  favicon: true,
  visitCount: true,
});

// Type exports
export type InsertApplicationInstance = z.infer<typeof insertApplicationInstanceSchema>;
export type ApplicationInstance = typeof applicationInstances.$inferSelect;
export type InsertFilesystemEntry = z.infer<typeof insertFilesystemEntrySchema>;
export type FilesystemEntry = typeof filesystemEntries.$inferSelect;
export type InsertDesktopSettings = z.infer<typeof insertDesktopSettingsSchema>;
export type DesktopSettings = typeof desktopSettings.$inferSelect;
export type InsertBrowserData = z.infer<typeof insertBrowserDataSchema>;
export type BrowserData = typeof browserData.$inferSelect;
