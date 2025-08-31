# Overview

CineReview is a comprehensive movie review platform built with React and Node.js. The application allows users to browse movies, read and write reviews, rate films, and manage personal watchlists. It features a modern, responsive interface with dark theme styling and integrates with external movie APIs for comprehensive film data.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack Query for server state management and React Context for authentication
- **UI Components**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with a custom dark theme and CSS variables for design tokens
- **Forms**: React Hook Form with Zod validation for type-safe form handling

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Database**: PostgreSQL with Prisma ORM for type-safe database operations
- **API Design**: RESTful API with endpoints for movies, reviews, users, and watchlists
- **Authentication**: Simple username/password authentication with localStorage persistence
- **Data Validation**: Zod schemas for request/response validation
- **Database Migrations**: Prisma Migrate for schema management and migrations

## Database Schema
- **Users**: Username, email, password, profile information, and join date
- **Movies**: Title, synopsis, director, cast, genres (enum), release year, duration, poster/backdrop URLs, ratings, and metadata flags
- **Reviews**: User reviews with ratings (1-5 stars), title, content, spoiler warnings, and timestamps
- **Watchlist**: User's saved movies for later viewing
- **Relationships**: Proper foreign key constraints linking users to reviews and watchlists

## Development Environment
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript for type safety, ESLint configuration implied through dependencies
- **Path Aliases**: Configured for clean imports (@/, @shared/, @assets/)

## API Structure
The application follows RESTful conventions with endpoints for:
- Authentication (register/login)
- Movies (CRUD operations with filtering, pagination, and search)
- Reviews (per-movie and per-user review management)
- User profiles and watchlist management
- Featured and trending movie collections

# External Dependencies

## Database Services
- **Neon Database**: Serverless PostgreSQL hosting (@neondatabase/serverless)
- **Connection Management**: PostgreSQL session storage (connect-pg-simple)

## UI and Component Libraries
- **Radix UI**: Comprehensive set of unstyled, accessible components
- **shadcn/ui**: Pre-styled component system built on Radix UI
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Lucide React**: Icon library for consistent iconography

## Development and Build Tools
- **Vite**: Fast build tool and development server
- **TypeScript**: Type safety and enhanced developer experience
- **Replit Integration**: Development environment plugins and runtime error handling

## Data Management
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form state management and validation
- **date-fns**: Date formatting and manipulation utilities

## Authentication and Security
- Simple local authentication system (no external auth providers)
- Client-side session management via localStorage
- Input validation through Zod schemas

## Movie Data Integration
- Application structure suggests integration with external movie APIs (likely TMDB based on schema design)
- Poster, backdrop, and trailer URL handling for rich media content