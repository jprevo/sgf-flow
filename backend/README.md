# Tenuki Database Backend

Express server with TypeScript, SQLite (Prisma ORM), and hot reload.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npm run prisma:generate
```

3. Run database migrations:

```bash
npm run prisma:migrate
```

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

## Configuration

Configuration is loaded from `config.yaml` and can be overridden with environment variables in `.env`:

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `DATABASE_URL` - SQLite database file path

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── __tests__/          # Test files
│   ├── utils/
│   │   ├── config.ts       # YAML config loader
│   │   └── database.ts     # Prisma client
│   └── index.ts            # Express server
├── config.yaml             # Application configuration
├── .env                    # Environment variables
├── tsconfig.json           # TypeScript config
├── nodemon.json            # Hot reload config
└── jest.config.js          # Test config
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Run production build
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio
