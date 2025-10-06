import request from "supertest";
import express from "express";
import * as fs from "fs";
import * as path from "path";
import { saveConfig, Config } from "../utils/config";

// We need to mock the service before importing the controller
const testConfigPath = path.join(__dirname, "test-controller-config.yaml");

jest.mock("../services/sgf-directory.service", () => {
  const actual = jest.requireActual("../services/sgf-directory.service");
  return {
    ...actual,
    addSgfDirectory: (dirPath: string) =>
      actual.addSgfDirectory(dirPath, testConfigPath),
    removeSgfDirectory: (dirPath: string) =>
      actual.removeSgfDirectory(dirPath, testConfigPath),
    getSgfDirectories: () => actual.getSgfDirectories(testConfigPath),
  };
});

// Import controller after mocking
import sgfDirectoryController from "../controllers/sgf-directory.controller";

// Create a test app
const app = express();
app.use(express.json());
app.use("/api/sgf-directories", sgfDirectoryController);

describe("SGF Directory Controller", () => {
  const testDir1 = path.join(__dirname, "test-ctrl-dir-1");
  const testDir2 = path.join(__dirname, "test-ctrl-dir-2");
  const testSubDir = path.join(testDir1, "subdir");

  // Mock the config path
  beforeAll(() => {
    // Create test directories
    if (!fs.existsSync(testDir1)) {
      fs.mkdirSync(testDir1, { recursive: true });
    }
    if (!fs.existsSync(testDir2)) {
      fs.mkdirSync(testDir2, { recursive: true });
    }
    if (!fs.existsSync(testSubDir)) {
      fs.mkdirSync(testSubDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test directories
    if (fs.existsSync(testSubDir)) {
      fs.rmdirSync(testSubDir);
    }
    if (fs.existsSync(testDir1)) {
      fs.rmdirSync(testDir1);
    }
    if (fs.existsSync(testDir2)) {
      fs.rmdirSync(testDir2);
    }
  });

  beforeEach(() => {
    // Create a fresh test config before each test
    const testConfig: Config = {
      server: {
        port: 4000,
        environment: "test",
      },
      database: {
        url: "file:./test.db",
      },
      logging: {
        level: "debug",
        format: "text",
      },
      sgfDirectories: [],
    };
    saveConfig(testConfig, testConfigPath);
  });

  afterEach(() => {
    // Clean up test config file
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  describe("GET /api/sgf-directories", () => {
    it("should return empty array when no directories configured", async () => {
      const response = await request(app).get("/api/sgf-directories");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("directories");
      expect(response.body.directories).toEqual([]);
    });

    it("should return all configured directories", async () => {
      // Add directories first
      await request(app).post("/api/sgf-directories").send({ path: testDir1 });
      await request(app).post("/api/sgf-directories").send({ path: testDir2 });

      const response = await request(app).get("/api/sgf-directories");

      expect(response.status).toBe(200);
      expect(response.body.directories).toHaveLength(2);
    });
  });

  describe("POST /api/sgf-directories", () => {
    it("should add a new directory", async () => {
      const response = await request(app)
        .post("/api/sgf-directories")
        .send({ path: testDir1 });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Directory added successfully",
      );
      expect(response.body).toHaveProperty("directories");
      expect(response.body.directories).toHaveLength(1);
    });

    it("should return 400 if path is missing", async () => {
      const response = await request(app).post("/api/sgf-directories").send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid request");
      expect(response.body.message).toContain("required");
    });

    it("should return 400 if path is not a string", async () => {
      const response = await request(app)
        .post("/api/sgf-directories")
        .send({ path: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid request");
    });

    it("should return 404 if directory does not exist", async () => {
      const response = await request(app)
        .post("/api/sgf-directories")
        .send({ path: "/non/existent/path" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Failed to add directory");
      expect(response.body.message).toContain("does not exist");
    });

    it("should return 409 if directory already exists in config", async () => {
      await request(app).post("/api/sgf-directories").send({ path: testDir1 });

      const response = await request(app)
        .post("/api/sgf-directories")
        .send({ path: testDir1 });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error", "Failed to add directory");
      expect(response.body.message).toContain("already exists");
    });

    it("should return 409 if adding subdirectory when parent exists", async () => {
      await request(app).post("/api/sgf-directories").send({ path: testDir1 });

      const response = await request(app)
        .post("/api/sgf-directories")
        .send({ path: testSubDir });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error", "Failed to add directory");
      expect(response.body.message).toContain("Cannot add");
    });

    it("should return 409 if adding parent when subdirectory exists", async () => {
      await request(app)
        .post("/api/sgf-directories")
        .send({ path: testSubDir });

      const response = await request(app)
        .post("/api/sgf-directories")
        .send({ path: testDir1 });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty("error", "Failed to add directory");
      expect(response.body.message).toContain("Cannot add");
    });
  });

  describe("DELETE /api/sgf-directories", () => {
    it("should remove a directory", async () => {
      await request(app).post("/api/sgf-directories").send({ path: testDir1 });

      const response = await request(app)
        .delete("/api/sgf-directories")
        .send({ path: testDir1 });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Directory removed successfully",
      );
      expect(response.body.directories).toHaveLength(0);
    });

    it("should return 400 if path is missing", async () => {
      const response = await request(app)
        .delete("/api/sgf-directories")
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid request");
      expect(response.body.message).toContain("required");
    });

    it("should return 400 if path is not a string", async () => {
      const response = await request(app)
        .delete("/api/sgf-directories")
        .send({ path: 123 });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("error", "Invalid request");
    });

    it("should return 404 if directory not in config", async () => {
      const response = await request(app)
        .delete("/api/sgf-directories")
        .send({ path: testDir1 });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty(
        "error",
        "Failed to remove directory",
      );
      expect(response.body.message).toContain("not found");
    });

    it("should only remove specified directory", async () => {
      await request(app).post("/api/sgf-directories").send({ path: testDir1 });
      await request(app).post("/api/sgf-directories").send({ path: testDir2 });

      const response = await request(app)
        .delete("/api/sgf-directories")
        .send({ path: testDir1 });

      expect(response.status).toBe(200);
      expect(response.body.directories).toHaveLength(1);
    });
  });
});
