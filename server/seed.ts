import { db } from "./db";
import { users } from "@shared/schema";

export async function seedDatabase() {
  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log('Database already seeded');
      return;
    }

    // Add sample users for testing
    const sampleUsers = [
      { 
        screenName: "CoolDude2002", 
        password: "password123",
        profileText: "Hey! This is CoolDude2002. Add me to your buddy list!"
      },
      { 
        screenName: "SkaterGirl", 
        password: "password123",
        profileText: "🛹 Skateboarding is life! Chat with me anytime."
      },
      { 
        screenName: "MusicLover", 
        password: "password123",
        profileText: "🎵 Music is my passion. What's your favorite song?"
      },
      { 
        screenName: "GameMaster", 
        password: "password123",
        profileText: "🎮 Always up for gaming! What are you playing?"
      },
      { 
        screenName: "ChatQueen", 
        password: "password123",
        profileText: "💬 Love to chat! Send me a message anytime!"
      }
    ];

    await db.insert(users).values(sampleUsers);
    console.log('Database seeded with sample users');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}