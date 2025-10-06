# Claude Code Context

This document provides context for Claude Code when working on this project.

## Project Overview

SGF Flow is a monorepo application for managing and displaying Go/Baduk game records (SGF files). It consists of a React
frontend and an Express backend with SQLite database.

## Architecture

### Backend (`backend/`)

**Database Layer:**

- SQLite via native `sqlite3` module
- Database helpers in `src/utils/database.ts`
- Schema created programmatically on initialization
- Single `games` table with game metadata

**Services:**

- `games.service.ts` - Game data retrieval and filtering
- `sgf-parser.service.ts` - Parse SGF files for metadata
- `sgf-indexer.service.ts` - Fast batch indexing of SGF directories
- `sgf-directory.service.ts` - Manage configured directories

**Controllers:**

- `games.controller.ts` - Game data endpoints
- `sgf-indexer.controller.ts` - SSE streaming for indexing progress
- `sgf-directory.controller.ts` - Directory management

**Configuration:**

- YAML-based config in `config.yaml` and `config.development.yaml`
- Loaded via `src/utils/config.ts`
- Environment-specific overrides

### Frontend (`frontend/`)

**State Management:**

- Preact Signals for reactive state
- Fine-grained updates without full re-renders

**Key Features:**

- Virtualized game list (react-window)
- Real-time indexing progress via SSE
- Directory management UI
- Advanced search and filtering
- Light/dark theme support

**Tech Stack:**

- React 19.1.1
- Vite + Tailwind CSS v4
- TypeScript strict mode

## Development Workflow

### Starting Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

### Building for Production

```bash
cd backend
npm run prepackage  # Builds both backend and frontend
npm run package     # Creates binaries in bin/
```

### Testing

```bash
cd backend
npm test           # Run all tests
npm run test:watch # Watch mode
```

## Important Notes for Claude

1. **No Prisma** - Do not suggest Prisma commands or reference Prisma schema files
2. **Direct SQLite** - Use `dbAll`, `dbGet`, `dbRun` helpers for database queries
3. **SSE for Indexing** - Indexing uses Server-Sent Events, not WebSockets
4. **YAML Config** - Configuration is YAML-based, not environment variables primarily
5. **Monorepo Structure** - Backend and frontend are separate npm projects
6. **Binary Distribution** - The app can be packaged as standalone executables

## Common Tasks

### Adding a New Database Table

1. Add `CREATE TABLE` statement in `backend/src/utils/database.ts` `initializeDatabase()`
2. Create service for business logic
3. Create controller for endpoints
4. Wire up routes in `backend/src/index.ts`

### Adding a New API Endpoint

1. Add service method in appropriate service file
2. Add controller method
3. Register route in `backend/src/index.ts`
4. Update frontend API client if needed

### Modifying Game Schema

1. Update `CREATE TABLE` in `backend/src/utils/database.ts`
2. Update TypeScript types in shared type definitions
3. Update parser if needed in `sgf-parser.service.ts`
4. Consider data migration strategy for existing databases

## File Paths to Know

- Database helpers: `backend/src/utils/database.ts`
- Configuration loader: `backend/src/utils/config.ts`
- SGF parser: `backend/src/services/sgf-parser.service.ts`
- Indexer: `backend/src/services/sgf-indexer.service.ts`
- Game types: Look for shared type definitions
- Main server: `backend/src/index.ts`

## Dependencies to Note

**Backend:**

- `express` v5.1.0 (not v4)
- `sqlite3` v5.1.7 (native module)
- `@yao-pkg/pkg` v6.7.0 (for binaries)
- `js-yaml` v4.1.0 (config parsing)

**Frontend:**

- `react` v19.1.1 (latest)
- `@preact/signals-react` (state management)
- `react-window` (virtualization)
- `tailwindcss` v4 (latest major version)

## Git Workflow

Current branch: `main`

- Keep commits atomic and well-described
- Follow conventional commit format (feat:, fix:, refactor:, etc.)
- Run tests before committing when possible
