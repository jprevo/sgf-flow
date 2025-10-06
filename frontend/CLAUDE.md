# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SGF Flow is a monorepo containing a React frontend for managing and displaying Go/Baduk game records (SGF files) and a backend API for database operations.

**Current directory**: `frontend/` - React + Vite + TypeScript frontend application
**Sibling directory**: `../backend/` - Express + TypeScript + Prisma backend server

## Frontend Development Commands

### Development
- `npm run dev` - Start Vite dev server with hot reload
- `npm run build` - Type-check with `tsc -b` then build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint on all files

### Key Dependencies
- **React 19.1.1** with React 19 features
- **@preact/signals** - Fine-grained reactivity with Preact Signals (using react-transform plugin)
- **Tailwind CSS v4** - Using the new Vite plugin (`@tailwindcss/vite`)
- **react-window** - For virtualizing large lists

## Backend Development Commands

The backend lives in `../backend/` and provides the API for SGF game data.

### Development
- `npm run dev` - Start development server with hot reload (nodemon + ts-node)
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode

### Database (Prisma)
- `npm run prisma:generate` - Generate Prisma client (run after schema changes)
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio GUI

## Architecture Notes

### Frontend Architecture

- **Build System**: Vite with custom React plugin configuration using Babel transform for Preact Signals
- **Styling**: Tailwind CSS v4 with Vite plugin integration
- **TypeScript**: Strict mode enabled with project references (`tsconfig.app.json` and `tsconfig.node.json`)
- **State Management**: Uses Preact Signals for reactive state (requires Babel transform plugin)

### Backend Architecture

- **Database**: SQLite with Prisma ORM
  - Schema: `prisma/schema.prisma` defines `Game` model with SGF metadata
  - Fields: id, playedAt, round, event, komi, white, black, whiteWins, blackWins, result, createdAt
- **API**: RESTful Express server
  - Base route: `/` - API info and version
  - Health check: `/health`
  - SGF directories: `/api/sgf-directories` (controller-based routing)
- **Configuration**: YAML-based config (`config.yaml`) with environment variable overrides
- **Testing**: Jest with ts-jest for TypeScript support

### Database Schema

The `Game` model stores SGF game metadata:
- String ID, timestamps (playedAt, createdAt)
- Game details: round, event, komi, result
- Players: white, black
- Outcome flags: whiteWins, blackWins

### Project Structure Patterns

- **Frontend Structure**:
  - `src/components/` - Reusable UI components (Button, Checkbox, SearchBox, Modal, ThemeToggle, Sidebar, GameList)
  - `src/hooks/` - Custom hooks (useTheme for theme management)
  - `src/stores/` - Preact Signals stores (searchStore for search filters)
  - `src/utils/` - Utility functions (mockData for generating test data)
  - `src/index.css` - Global styles and Tailwind CSS v4 theme configuration
- **Backend Structure**: MVC-like pattern with controllers (`src/controllers/`), utils (`src/utils/`), and tests (`src/__tests__/`)
- Both projects use TypeScript with strict type checking
- Both projects have Prettier configured (backend has `.prettierrc` and `.prettierignore`)

### UI Design System

- **Color Scheme**: Peaceful pastel brown and green tones
  - Light theme: Warm beige/brown backgrounds (`#f5f1ea`) with soft green accents (`#a8c8a0`)
  - Dark theme: Deep brown backgrounds (`#2a2520`) with muted green accents (`#7a9c72`)
- **Theme System**: Uses CSS custom properties (CSS variables) with localStorage persistence
  - Theme toggle in sidebar header with sun/moon icons
  - Automatic theme application via `data-theme` attribute on `<html>` element
  - CSS switches variable values based on `[data-theme="dark"]` selector
  - Components use CSS variables directly (no Tailwind `dark:` variants needed)
- **Component Library**:
  - Button (primary, secondary, ghost variants)
  - Checkbox with label
  - SearchBox input
  - Modal with backdrop
  - ThemeToggle with sun/moon icons
- **Layout**: Full-screen flexbox layout with 320px sidebar and flexible main content area

## Important Development Notes

1. **Preact Signals Integration**: The frontend uses `@preact/signals-react-transform` Babel plugin. This is configured in `vite.config.ts` and allows using Preact Signals with React.

2. **TypeScript Configuration**: The frontend uses TypeScript project references with separate configs for app code (`tsconfig.app.json`) and Node/Vite config files (`tsconfig.node.json`).

3. **Database Workflow**: When modifying the Prisma schema, always run `prisma:generate` to update the Prisma client before using new models/fields.

4. **Monorepo Context**: This is a monorepo. Frontend is in `frontend/`, backend is in `../backend/`. They are separate npm workspaces.

## Configuration Files

- **Backend**: Uses `config.yaml` with environment-specific overrides (`config.development.yaml`)
- **Backend Environment**: `.env` file for DATABASE_URL, PORT, NODE_ENV
- **Frontend**: No special runtime configuration files (uses Vite's standard `.env` system)