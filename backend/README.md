# SGF Flow Backend

Express server with TypeScript, SQLite, and hot reload.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

The database will be automatically initialized on first run.

## Development

Start the development server with hot reload:

```bash
npm run dev
```

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

## Build

Build for production:

```bash
npm run build
```

Run production build:

```bash
npm start
```

## Packaging

Generate standalone binaries for Linux, macOS, and Windows:

```bash
npm run package     # Creates executables in bin/ folder
```

Binaries include the frontend static files and can run without Node.js installed.

## Configuration

Configuration is loaded from `config.yaml` and `config.development.yaml`:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_PATH` - SQLite database file path (default: ./sgf-flow.db)

## Project Structure

```
backend/
├── src/
│   ├── __tests__/                      # Test files
│   ├── controllers/
│   │   ├── games.controller.ts         # Game data endpoints
│   │   ├── sgf-directory.controller.ts # Directory management
│   │   └── sgf-indexer.controller.ts   # Real-time indexing
│   ├── services/
│   │   ├── games.service.ts            # Game data logic
│   │   ├── sgf-parser.service.ts       # SGF file parser
│   │   ├── sgf-directory.service.ts    # Directory management
│   │   └── sgf-indexer.service.ts      # Fast indexing logic
│   ├── utils/
│   │   ├── config.ts                   # YAML config loader
│   │   └── database.ts                 # SQLite helpers
│   └── index.ts                        # Express server
├── config.yaml                         # Production configuration
├── config.development.yaml             # Development configuration
├── tsconfig.json                       # TypeScript config
├── nodemon.json                        # Hot reload config
└── package.json                        # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run build-frontend` - Build frontend (from backend directory)
- `npm run package` - Generate standalone binaries for distribution

## API Endpoints

### Games

- `GET /api/games` - Get all games with optional search filters
- `GET /api/games/:id` - Get specific game by ID

### Directories

- `GET /api/sgf-directories` - Get configured SGF directories
- `POST /api/sgf-directories` - Add new SGF directory
- `DELETE /api/sgf-directories` - Remove SGF directory

### Indexing

- `GET /api/indexer/stream` - Server-Sent Events stream for real-time indexing progress
