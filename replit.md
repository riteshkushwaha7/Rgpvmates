# Overview

RGPV Mates is a college dating application designed specifically for RGPV (Rajiv Gandhi Proudyogiki Vishwavidyalaya) students. The platform provides a secure, verified environment where students can connect with their college peers through a swipe-based matching system. The application emphasizes safety through mandatory student ID verification and includes comprehensive features like real-time messaging, user reporting/blocking, and administrative oversight.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React + TypeScript SPA**: Built with React 18 and TypeScript for type safety, using Vite as the build tool for fast development
- **Routing**: Wouter library provides lightweight client-side routing with authentication-based route protection
- **UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for consistent styling and accessibility
- **State Management**: TanStack Query handles server state with caching, background updates, and optimistic updates; local state managed with React hooks
- **Form Handling**: React Hook Form with Zod schema validation for type-safe form management
- **Gesture Controls**: Custom swipe implementation using react-spring animations and use-gesture for touch interactions

## Backend Architecture
- **Express.js REST API**: RESTful endpoints with middleware for authentication, logging, and error handling
- **TypeScript + ES Modules**: Modern JavaScript throughout the stack with consistent module system
- **Session-based Authentication**: Server-side sessions stored in PostgreSQL using connect-pg-simple
- **Replit OAuth Integration**: Seamless authentication using Replit's OpenID Connect system
- **Database Layer**: Drizzle ORM provides type-safe database operations with PostgreSQL

## Database Design
- **PostgreSQL with Neon**: Serverless PostgreSQL database hosted on Neon for scalability
- **Schema Structure**: Core entities include users, profiles, swipes, matches, messages, payments, reports, blocks, and contact submissions
- **Type Safety**: Drizzle schema definitions with Zod validation ensure end-to-end type safety
- **Enums**: Predefined enumerations for gender, academic branches, years, verification status, and priorities
- **Relationships**: Proper foreign key relationships with cascading deletes where appropriate

## Key Features
- **Swipe System**: Card-based interface with smooth gesture animations and mutual matching logic
- **Profile Verification**: Admin-managed approval system for student ID verification before platform access
- **Real-time Messaging**: Chat system with message history and user blocking capabilities
- **Safety Features**: Comprehensive reporting system, user blocking, and content moderation tools
- **Payment Integration**: Structured payment system with status tracking (ready for payment gateway integration)
- **Administrative Dashboard**: Admin interface for managing verifications, monitoring platform activity, and handling reports

## Authentication & Authorization
- **Replit OAuth Flow**: Secure authentication using Replit's identity provider with automatic user creation
- **Multi-step Onboarding**: Progressive user setup including profile creation, verification, and payment
- **Route Protection**: Both client and server-side route guards with automatic redirects
- **Session Management**: Secure session storage in PostgreSQL with configurable TTL

## API Architecture
- **RESTful Design**: Consistent REST patterns with proper HTTP status codes and error handling
- **Error Handling**: Centralized error handling with user-friendly error messages
- **Request Logging**: Comprehensive API request logging with response time tracking
- **Data Validation**: Server-side validation using Zod schemas matching frontend validation

# External Dependencies

## Database & Storage
- **Neon PostgreSQL**: Serverless PostgreSQL database for primary data storage
- **connect-pg-simple**: PostgreSQL session store for Express sessions

## Authentication & Security
- **Replit OAuth**: OpenID Connect integration for secure authentication
- **openid-client**: OAuth client implementation with Passport.js strategy

## Development & Build Tools
- **Vite**: Frontend build tool with HMR and optimized production builds
- **Replit Plugins**: Development-specific plugins for error overlay and cartographer integration
- **esbuild**: Backend bundling for production deployment

## UI & Interaction Libraries
- **Radix UI**: Accessible component primitives for consistent UI interactions
- **Tailwind CSS**: Utility-first CSS framework with custom design system
- **Lucide React**: Icon library for consistent iconography
- **react-spring**: Physics-based animations for smooth interactions
- **use-gesture**: Touch and mouse gesture recognition for swipe functionality

## Data Management
- **Drizzle ORM**: Type-safe database queries with automatic migration generation
- **TanStack Query**: Advanced data fetching with caching and synchronization
- **Zod**: Schema validation library for end-to-end type safety

## Communication & Utilities
- **date-fns**: Date manipulation and formatting utilities
- **nanoid**: URL-safe unique ID generation
- **memoizee**: Function memoization for performance optimization