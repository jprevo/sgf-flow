import express, { Request, Response } from "express";
import { loadConfig } from "./utils/config";
import { closeDatabase, initializeDatabase } from "./utils/database";
import sgfDirectoryController from "./controllers/sgf-directory.controller";
import sgfIndexerController from "./controllers/sgf-indexer.controller";
import gamesController from "./controllers/games.controller";
import packageJson from "./../package.json";
import path from "path";
import urlOpener from "./services/url-opener.service";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// Load configuration
const config = loadConfig();

// Initialize database
initializeDatabase()
  .then(() => {
    console.log("Database initialized successfully");
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });

// Routes
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Tenuki Database API", version: packageJson.version });
});

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/sgf-directories", sgfDirectoryController);
app.use("/api/sgf-indexer", sgfIndexerController);
app.use("/api/games", gamesController);

// Start server
const PORT = config.server.port || 3012;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${config.server.environment}`);

  //if (config.server.environment !== "development") {
  urlOpener.open("http://localhost:" + PORT);
  //}
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down gracefully...");
  await closeDatabase();
  process.exit(0);
});

export default app;
