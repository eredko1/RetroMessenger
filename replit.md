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
- June 15, 2025. Comprehensive message formatting and image compression system
  - Implemented automatic image compression for all uploaded images (JPEG, PNG, GIF, WebP, BMP)
  - Added full support for rich text formatting visible to both sender and receiver
  - Enhanced message rendering with HTML formatting support (bold, italic, underline, colors)
  - Compressed images maintain quality while reducing file size significantly
  - Added clickable image preview with full-screen viewer functionality
  - GIF support with smart compression to preserve animation quality
  - URL auto-linking and proper line break handling in all chat windows
  - Consistent formatting display across desktop, mobile, and group chat interfaces
- June 15, 2025. Complete window management system with minimize/restore and show desktop
  - Added minimize/restore functionality to all windows (buddy list, chat windows, group chats)
  - Implemented Windows XP-style minimize buttons with authentic visual design
  - Created comprehensive taskbar integration showing all open windows with status indicators
  - Added show desktop functionality to minimize/restore all windows at once
  - Enhanced taskbar with dynamic window tracking and click-to-restore functionality
  - Improved visual design with prettier gradients, shadows, and streamlined layouts
  - All windows now support proper minimize state management with seamless restoration
  - Taskbar displays window icons, truncated titles, and visual feedback for minimized state
- June 16, 2025. Comprehensive Windows XP desktop simulation with authentic applications
  - Implemented complete Windows XP application suite: File Explorer, Calculator, Notepad, Paint
  - Added authentic Windows XP desktop icons with click/double-click functionality
  - Created realistic File Explorer with proper folder navigation, system tasks, and file details
  - Implemented fully functional Calculator with standard operations and memory functions
  - Added Notepad with file operations (new, open, save) and authentic text editing
  - Created Paint application with drawing tools, color palette, and canvas functionality
  - Enhanced desktop icons with full Windows XP application collection (10 applications)
  - Integrated all applications into taskbar with proper minimize/restore functionality
  - Fixed group chat system to properly open new windows with selected participants
  - Enhanced file and image upload system with comprehensive format support
  - All applications feature authentic Windows XP styling with proper title bars and menus
- June 16, 2025. Enhanced desktop experience with web applications and screensaver
  - Added desktop icons for Google Drive, Telegram, Replit, OpenAI, and Gemini web applications
  - Enhanced Internet Explorer with comprehensive toolbars including bookmarks, settings, and history
  - Implemented functional menu bar with File, Edit, View, Favorites, Tools, and Help menus
  - Added bookmarks management with add/remove functionality and quick navigation
  - Implemented screensaver system with 30-second inactivity detection and floating bubbles animation
  - Added desktop wallpaper customization with 6 gradient options (Bliss, Azul, Energy, Peace, Radiance, Serenity)
  - Created right-click desktop context menu for wallpaper selection
  - All web applications open in browser windows with proper authentication flows
  - Enhanced single-click interface compatibility for Mac browsers and smartphones
  - Comprehensive activity detection system prevents screensaver during user interaction
- June 16, 2025. Complete UI/UX overhaul with enhanced functionality and authentic Windows XP experience
  - Fixed all desktop shortcuts to launch applications properly with single-click functionality
  - Replaced emoji icons with custom SVG-based Windows XP style icons for authentic appearance
  - Enhanced Internet Explorer with iframes for proper web page loading and authentication
  - Created authentic Windows Media Player with classic orange/black theme and visualization effects
  - Enhanced buddy list with Profile and Away message buttons for each user without requiring chat initiation
  - Improved screensaver with animated gradient background, twinkling stars, and enhanced bubble effects
  - Fixed My Computer system tasks with functional information dialogs for system info, programs, and settings
  - Implemented away message display in chat windows when messaging users who are away
  - Applied consistent Bliss background wallpaper throughout the entire application
  - Enhanced Windows Explorer with working system tasks including Windows Update and System Restore
- June 16, 2025. Critical bug fixes and system stability improvements
  - Completely rebuilt desktop icons system with proper single-click application launching
  - Fixed screensaver activity detection to only activate when no windows are open
  - Resolved Internet Explorer CORS/iframe issues by implementing secure new tab navigation
  - Fixed WebSocket connection and authentication issues for real-time messaging
  - Improved window position saving with proper error handling and JSON response validation
  - Enhanced application stability with comprehensive error recovery mechanisms
  - Web applications (Google Drive, Telegram, Replit, OpenAI, Gemini) now open securely in new tabs
  - All critical functionality restored including real-time chat, buddy status updates, and application management
- June 16, 2025. Desktop icons and window management system overhaul
  - Fixed desktop icon click functionality by resolving z-index layer conflicts
  - All desktop shortcuts now properly launch applications (Paint, Gemini, Calculator, etc.)
  - Added comprehensive maximize/restore functionality to all window components
  - Implemented window size constraints to prevent applications from exceeding desktop boundaries
  - Enhanced window management with proper state tracking for maximized windows
  - Desktop icons positioned above background elements to ensure proper click event handling
  - All applications now support single-click launching and maximize functionality

## User Preferences

Preferred communication style: Simple, everyday language.
Requested features:
- Buddy management system for adding friends
- Windows XP desktop appearance and styling