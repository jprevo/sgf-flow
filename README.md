# SGF Flow

A monorepo for managing and displaying Go/Baduk game records (SGF files).

## Project Structure

- **frontend/** - React + Vite + TypeScript frontend application
- **backend/** - Express + TypeScript + Prisma backend server

## Frontend

A peaceful, modern UI for browsing and managing SGF game files.

### Features

- **Light/Dark Theme** - Toggle between peaceful pastel light and dark themes
- **Advanced Search** - Search by player name, game name, year, with wins-only filter
- **Virtualized Game List** - Efficiently display thousands of games using react-window
- **Responsive Design** - Full-screen layout with sidebar navigation
- **State Management** - Preact Signals for reactive, fine-grained state updates

### Tech Stack

- React 19.1.1
- Vite with Tailwind CSS v4
- @preact/signals-react for state management
- react-window for list virtualization
- TypeScript with strict mode

### Getting Started

```bash
cd frontend
npm install
npm run dev
```

## Backend

RESTful API server for SGF game data with SQLite database.

### Features

- Game metadata storage (players, events, dates, results)
- SGF directory indexing
- Prisma ORM for database management

### Tech Stack

- Express.js
- TypeScript
- Prisma ORM
- SQLite database
- Jest for testing

### Getting Started

```bash
cd backend
npm install
npm run prisma:generate
npm run dev
```

## Development

See individual README files in `frontend/` and `backend/` directories for detailed development instructions.