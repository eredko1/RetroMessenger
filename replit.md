# AIM (AOL Instant Messenger) Clone

## Overview

This is a full-stack web application that recreates the classic AOL Instant Messenger (AIM) experience from the early 2000s. The application provides real-time messaging, buddy lists, status management, and authentic AIM-style UI components. Built with modern technologies while maintaining the nostalgic look and feel of the original AIM client.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom AIM-themed CSS variables
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: Wouter for lightweight client-side routing
- **Real-time Communication**: WebSocket connection for live messaging

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **WebSocket**: Native WebSocket Server for real-time messaging
- **Development**: tsx for TypeScript execution in development
- **Build**: esbuild for production bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Defined in shared/schema.ts for type safety
- **Migrations**: Drizzle Kit for database schema management
- **Fallback**: In-memory storage implementation for development

## Key Components

### Database Schema
- **Users**: Screen names, passwords, status, away messages, profiles
- **Buddy Lists**: User relationships with grouping support
- **Messages**: Direct messaging with read status tracking

### Real-time Features
- **WebSocket Connection**: Persistent connection for instant messaging
- **Status Updates**: Online/away/offline status broadcasting
- **Typing Indicators**: Real-time typing status
- **Message Delivery**: Instant message delivery and read receipts

### UI Components
- **Buddy List Window**: Classic AIM buddy list with status indicators
- **Chat Windows**: Multi-window chat interface with positioning
- **Away Message Dialog**: Setting custom away messages
- **Profile Viewer**: Buddy profile information display
- **Login/Registration**: User authentication interface

### Audio Features
- **Message Sounds**: Web Audio API for classic AIM notification sounds
- **Buddy Online Sounds**: Audio notifications for status changes

## Data Flow

1. **Authentication**: User login/registration through REST API
2. **WebSocket Connection**: Establish persistent connection for real-time features
3. **Buddy List Loading**: Fetch and display user's buddy list with status
4. **Message Exchange**: Real-time messaging through WebSocket
5. **Status Updates**: Broadcast user status changes to connected clients
6. **Conversation History**: REST API for loading message history

## External Dependencies

### UI Libraries
- **Radix UI**: Accessible component primitives
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **cmdk**: Command palette component

### Data & State Management
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling with validation
- **Zod**: Schema validation
- **Drizzle ORM**: Type-safe database operations

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TypeScript**: Static type checking
- **PostCSS**: CSS processing
- **Drizzle Kit**: Database migration tool

### Database
- **PostgreSQL**: Primary database (configured for Neon)
- **@neondatabase/serverless**: Serverless PostgreSQL driver

## Deployment Strategy

### Development
- **Hot Reload**: Vite dev server with HMR
- **TypeScript**: Real-time type checking
- **Database**: PostgreSQL with environment-based connection

### Production Build
- **Frontend**: Vite production build with optimization
- **Backend**: esbuild bundling for Node.js deployment
- **Static Assets**: Served from dist/public directory

### Replit Configuration
- **Auto-scaling**: Configured for autoscale deployment
- **Port**: Application runs on port 5000
- **Environment**: Node.js 20 with PostgreSQL 16 module

## Changelog

Changelog:
- June 14, 2025. Initial setup
- June 14, 2025. Added buddy management functionality and Windows XP styling
  - Created AddBuddyDialog component for adding friends
  - Implemented Windows XP desktop background with gradient
  - Added Windows taskbar with start button and system tray
  - Added desktop icons (My Computer, Recycle Bin, etc.)
  - Seeded sample users for testing buddy system
  - Users can now add buddies by screen name
- June 14, 2025. Enhanced buddy list system and improved design
  - Fixed unique buddy lists for each user with proper isolation
  - Added real-time online status tracking via WebSocket connections
  - Modernized buddy list UI with gradient avatars and status indicators
  - Improved chat window design with better message styling
  - Enhanced mobile responsiveness for phone usage
  - Fixed conversation system to work properly between users
- June 14, 2025. Comprehensive offline messaging and social features
  - Implemented complete offline messaging system with popup notifications
  - Added rich user profiles with quotes, interests, location, occupation, hobbies
  - Created user profile editor with comprehensive editing capabilities
  - Implemented blocking and reporting system for privacy controls
  - Added message search functionality for finding past conversations
  - Implemented word filtering system for appropriate content
  - Enhanced buddy profile viewer with detailed information display
  - Added offline message notifications when users return online
  - Integrated invisible mode and direct message privacy controls
  - Message timestamps displayed in all chat windows
  - Database schema expanded to support all new social features
- June 14, 2025. Complete Windows XP integration with advanced AIM features
  - Implemented buddy-specific alert settings with custom notification sounds
  - Added Windows XP system tray balloon notifications for messages and buddy status
  - Created IM forwarding to email/SMS when users are away using SendGrid
  - Enhanced sound system with custom frequency alerts for specific buddies
  - Added multi-monitor window position management and persistence
  - Integrated right-click context menus for buddy alert configuration
  - Implemented Windows XP-style notification sounds and visual effects
  - Added comprehensive buddy alert customization dialog
  - Enhanced WebSocket system to support buddy-specific alert preferences
  - All classic 2002 AIM functionality now fully implemented
- June 15, 2025. Enhanced group messaging system with improved UI
  - Added prominent "Start Group Chat" button to buddy list for easy access
  - Fixed React key warnings by adding unique index-based keys for buddy lists
  - Enhanced group chat interface with rich text editor supporting formatting
  - Improved mobile touch support for dragging chat windows on mobile devices
  - Updated buddy list layout with better spacing and visual hierarchy
  - Group chat button is intelligently disabled when fewer than 2 buddies are online

## User Preferences

Preferred communication style: Simple, everyday language.
Requested features:
- Buddy management system for adding friends
- Windows XP desktop appearance and styling