# New Year Goals & Routines Visualization App

## Overview

This is a goal tracking and visualization application centered around a New Year countdown. The app allows users to organize their aspirations across four time horizons: daily routines, weekly goals, monthly goals, and yearly goals. Each goal type is visually distinct through color-coding and displayed in both list and calendar views. The primary visual element is a real-time countdown to New Year's Day, serving as a motivational anchor for goal planning.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite as the build tool and development server.

**UI Library**: Shadcn/ui (New York style variant) - a collection of accessible, customizable Radix UI components styled with Tailwind CSS. This provides a comprehensive design system with pre-built components for dialogs, forms, cards, calendars, and more.

**Styling**: Tailwind CSS with a custom configuration that extends the base theme with:
- Custom color schemes for goal types (daily, weekly, monthly, yearly)
- Material Design-inspired spacing and typography
- CSS variables for theming support (light/dark mode ready)
- Inter font family from Google Fonts

**State Management**: 
- TanStack Query (React Query v5) for server state management, providing caching, background updates, and optimistic UI updates
- React hooks for local component state

**Routing**: Wouter - a minimal client-side router (1.5KB alternative to React Router)

**Design System**: Component-based architecture following the principles outlined in design_guidelines.md:
- Color-coded categories for different goal types
- Generous spacing for clarity
- Calendar-based temporal organization
- Clear information hierarchy (countdown → yearly → monthly → weekly → daily)

### Backend Architecture

**Runtime**: Node.js with Express.js framework

**API Pattern**: RESTful API with JSON responses
- GET /api/goals - Retrieve all goals
- POST /api/goals - Create a new goal

**Development/Production Split**:
- Development mode uses Vite middleware for HMR (Hot Module Replacement)
- Production mode serves pre-built static assets from dist/public
- Separate entry points (index-dev.ts, index-prod.ts) for environment-specific setup

**Build Process**:
- Client: Vite bundles React application
- Server: esbuild bundles Express server for production
- TypeScript compilation with strict mode enabled

**Data Validation**: Zod schemas integrated with Drizzle ORM for runtime type safety on API inputs

### Data Storage Solutions

**Current Implementation**: PostgreSQL database with persistent storage using Drizzle ORM
- All goals are stored in a Neon PostgreSQL database
- Data persists across server restarts and deployments
- Fast read/write operations with database connection pooling

**Database Schema**: PostgreSQL schema using Drizzle ORM:

**Goals Table**:
- id (UUID primary key, auto-generated)
- text (goal description)
- type (enum: 'daily', 'weekly', 'monthly', 'yearly')
- createdAt (timestamp)
- dayOfWeek (0-6, for weekly goals)
- dayOfMonth (1-31, for monthly/yearly goals)
- month (0-11, for yearly goals)

**Rationale**: The schema supports flexible scheduling - daily goals appear every day, weekly goals on specific weekdays, monthly goals on specific dates, and yearly goals on specific month/day combinations. This allows the calendar view to accurately display when goals are relevant.

**Database Provider**: Neon Postgres (serverless PostgreSQL) - fully connected and operational. The DATABASE_URL environment variable is configured, and the app uses DbStorage class with Drizzle ORM for all data operations. Goals persist permanently in the database.

### Authentication and Authorization

**Current State**: No authentication implemented. The application currently operates as a single-user system without access controls.

**Design Consideration**: The architecture is prepared to add authentication later - the session middleware (connect-pg-simple) is already in dependencies, suggesting plans for session-based authentication.

### External Dependencies

**UI Component Library**: 
- Radix UI primitives (@radix-ui/*) - Unstyled, accessible component foundations
- Lucide React - Icon library for consistent iconography

**Date/Time Handling**:
- date-fns - Modern JavaScript date utility library for countdown calculations and date formatting

**Database & ORM**:
- Drizzle ORM - Lightweight TypeScript ORM with Zod integration
- @neondatabase/serverless - Serverless Postgres driver for Neon
- drizzle-zod - Automatic Zod schema generation from Drizzle schemas

**Form Management**:
- React Hook Form (@hookform/resolvers) - Form state management and validation

**Styling**:
- Tailwind CSS - Utility-first CSS framework
- class-variance-authority - Type-safe variant creation for components
- clsx + tailwind-merge - Conditional className merging

**Development Tools**:
- @replit/vite-plugin-* - Replit-specific development enhancements (error overlay, dev banner, cartographer)
- tsx - TypeScript execution for development server
- esbuild - Fast JavaScript bundler for production builds

**Third-Party Services**:
- Google Fonts CDN - Serves Inter font family
- Neon Database (configured but optional) - Serverless PostgreSQL hosting

**Key Architectural Decisions**:

1. **Monorepo Structure**: Client and server code coexist in a single repository with shared TypeScript types in the `/shared` directory, enabling type safety across the full stack.

2. **Type Safety**: End-to-end TypeScript with strict mode, Zod runtime validation, and Drizzle's type inference ensures data integrity from database to UI.

3. **Component Reusability**: Shadcn/ui pattern allows components to be copied into the project and customized, avoiding version lock-in while maintaining consistency.

4. **Flexible Storage**: The IStorage interface abstraction allows swapping between in-memory and database storage without changing business logic.

5. **Build Optimization**: Separate bundlers for client (Vite) and server (esbuild) optimize for their respective runtime environments.