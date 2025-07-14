# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an unofficial archive site for Omocoro (おもこロ), a Japanese comedy content website. The application is built with Next.js 15 and React 19, featuring a progressive web app (PWA) with service worker support and providing search functionality for archived articles.

## Common Development Commands

### Development

- `npm run dev` - Start development server with local Docker PostgreSQL
- `npm run dev:prod` - Start development server with Vercel Postgres

### Building & Linting

- `npm run build` - Build the application
- `npm run lint` - Run ESLint (use this for linting)
- `npm run lint:fix` - Run ESLint with auto-fix
- `npm run lint:style` - Run Stylelint with auto-fix
- `npm run type-check` - Run TypeScript type checking (use this for type checking)
- `npm run prettier` - Format code with Prettier

### Database Operations

- `npm run migrate:create -- --name [migration_name]` - Create new migration
- `npm run migrate:dev` - Run migrations on local Docker
- `npm run migrate:prod` - Run migrations on Vercel Postgres
- `npm run studio:dev` - Open Prisma Studio for local Docker
- `npm run studio:prod` - Open Prisma Studio for Vercel Postgres
- `npm run seed` - Seed database with initial data

### Code Quality & Analysis

- `npm run depcheck` - Check for unused dependencies
- `npm run find:unused` - Find unused Next.js files
- `npm run knip` - Find unused files and exports

### Docker

- `docker-compose up` - Start local PostgreSQL with WebSocket proxy

## Architecture & Data Models

### Database Schema (Prisma)

The application uses PostgreSQL with three main models:

- **Article**: Core content model with title, URL, thumbnail, category, writers, and publication date
- **Category**: Content categories (マンガ, コラム, 動画, 企画) with onigiri flag support
- **Writer**: Author profiles with avatar and profile URLs

### Key Technical Patterns

- **App Router**: Uses Next.js 15 App Router with typed routes enabled
- **Search Parameters**: Managed with `nuqs` library for URL state synchronization
- **Data Fetching**: Server actions pattern for database operations
- **Styling**: CSS Modules with strict scoping rules enforced by ESLint
- **PWA**: Service worker implementation with Serwist for offline functionality

### Project Structure

- `src/app/` - Next.js App Router pages and components
- `src/app/_components/` - Shared application components
- `src/app/api/` - API routes for scraping and proxy functionality
- `src/lib/` - Utility libraries (cookies, Prisma client)
- `prisma/` - Database schema and migrations

## Environment Setup

### Database Environments

- **Local Development**: Uses Docker PostgreSQL (port 54320) with WebSocket proxy (port 54330)
- **Production**: Uses Vercel Postgres with connection pooling

### Environment Variables

- `CRON_SECRET` - Required for cron job authentication (defined in src/env.ts)
- Database URLs are automatically configured for Vercel deployment

## Code Style & Standards

### Pre-commit Hooks (Lefthook)

All code must pass these checks before commit:

- Prettier formatting
- Stylelint for CSS
- TypeScript compilation
- ESLint with auto-fix

### ESLint Configuration

- Strict TypeScript rules with explicit return types required
- Import sorting with perfectionist plugin
- CSS Modules validation
- React best practices enforcement
- Write-good-comments for comment quality

### Commit Message Format

Uses conventional commits with additional rules:

- Subject must be lowercase
- Must use present tense verbs
- Type is required (feat, fix, chore, etc.)

## Development Notes

- React Strict Mode is disabled for compatibility
- Images are unoptimized in Next.js config
- Uses React 19 with backwards compatibility overrides
- Service worker disabled in development mode
- PWA installability supported with proper manifest
