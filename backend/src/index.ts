import express, { Request, Response } from "express";
import { loadConfig } from "./utils/config";
import { prisma } from "./utils/database";
import sgfDirectoryController from "./controllers/sgf-directory.controller";
import sgfIndexerController from "./controllers/sgf-indexer.controller";
import packageJson from "./../package.json";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Load configuration
const config = loadConfig();

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Tenuki Database API", version: packageJson.version });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/sgf-directories", sgfDirectoryController);
app.use("/api/sgf-indexer", sgfIndexerController);

// Start server
const PORT = config.server.port || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.server.environment}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
