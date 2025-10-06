import * as fs from "fs";
import * as path from "path";
import {
  normalizePath,
  directoryExists,
  isSubdirectory,
  addSgfDirectory,
  removeSgfDirectory,
  getSgfDirectories,
} from "../services/sgf-directory.service";
import { saveConfig, Config } from "../utils/config";

describe("SGF Directory Service", () => {
  const testConfigPath = path.join(__dirname, "test-sgf-config.yaml");
  const testDir1 = path.join(__dirname, "test-dir-1");
  const testDir2 = path.join(__dirname, "test-dir-2");
  const testSubDir = path.join(testDir1, "subdir");

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

  describe("normalizePath", () => {
    it("should convert relative path to absolute", () => {
      const result = normalizePath("./test");
      expect(path.isAbsolute(result)).toBe(true);
    });

    it("should normalize path separators to forward slashes", () => {
      const result = normalizePath("/home/user/test");
      expect(result).not.toContain("\\");
      expect(result).toContain("/");
    });

    it("should handle paths with .. correctly", () => {
      const testPath = path.join(__dirname, "..", "services");
      const result = normalizePath(testPath);
      expect(result).not.toContain("..");
    });

    it("should handle absolute paths", () => {
      const absolutePath = "/home/user/test";
      const result = normalizePath(absolutePath);
      expect(result).toContain("/home/user/test");
    });
  });

  describe("directoryExists", () => {
    it("should return true for existing directory", () => {
      expect(directoryExists(testDir1)).toBe(true);
    });

    it("should return false for non-existing directory", () => {
      expect(directoryExists("/non/existent/path")).toBe(false);
    });

    it("should return false for files", () => {
      const testFile = path.join(testDir1, "test.txt");
      fs.writeFileSync(testFile, "test");
      expect(directoryExists(testFile)).toBe(false);
      fs.unlinkSync(testFile);
    });
  });

  describe("isSubdirectory", () => {
    it("should return true when child is subdirectory of parent", () => {
      expect(isSubdirectory(testDir1, testSubDir)).toBe(true);
    });

    it("should return false when paths are the same", () => {
      expect(isSubdirectory(testDir1, testDir1)).toBe(false);
    });

    it("should return false when child is not subdirectory of parent", () => {
      expect(isSubdirectory(testDir1, testDir2)).toBe(false);
      expect(isSubdirectory(testDir2, testDir1)).toBe(false);
    });

    it("should work with relative paths", () => {
      const relativePath = path.relative(process.cwd(), testSubDir);
      expect(isSubdirectory(testDir1, relativePath)).toBe(true);
    });
  });

  describe("addSgfDirectory", () => {
    it("should add a new directory to config", () => {
      addSgfDirectory(testDir1, testConfigPath);
      const directories = getSgfDirectories(testConfigPath);
      expect(directories).toHaveLength(1);
      expect(directories[0]).toContain(normalizePath(testDir1));
    });

    it("should add multiple directories", () => {
      addSgfDirectory(testDir1, testConfigPath);
      addSgfDirectory(testDir2, testConfigPath);
      const directories = getSgfDirectories(testConfigPath);
      expect(directories).toHaveLength(2);
    });

    it("should throw error if directory does not exist", () => {
      expect(() => {
        addSgfDirectory("/non/existent/path", testConfigPath);
      }).toThrow("Directory does not exist");
    });

    it("should throw error if directory already exists in config", () => {
      addSgfDirectory(testDir1, testConfigPath);
      expect(() => {
        addSgfDirectory(testDir1, testConfigPath);
      }).toThrow("Directory already exists in configuration");
    });

    it("should throw error if adding subdirectory when parent exists", () => {
      addSgfDirectory(testDir1, testConfigPath);
      expect(() => {
        addSgfDirectory(testSubDir, testConfigPath);
      }).toThrow("Cannot add directory");
      expect(() => {
        addSgfDirectory(testSubDir, testConfigPath);
      }).toThrow("parent");
    });

    it("should throw error if adding parent when subdirectory exists", () => {
      addSgfDirectory(testSubDir, testConfigPath);
      expect(() => {
        addSgfDirectory(testDir1, testConfigPath);
      }).toThrow("Cannot add directory");
      expect(() => {
        addSgfDirectory(testDir1, testConfigPath);
      }).toThrow("subdirectories");
    });

    it("should normalize paths when adding", () => {
      const relativePath = path.relative(process.cwd(), testDir1);
      addSgfDirectory(relativePath, testConfigPath);
      const directories = getSgfDirectories(testConfigPath);
      expect(directories[0]).toBe(normalizePath(testDir1));
    });
  });

  describe("removeSgfDirectory", () => {
    it("should remove a directory from config", () => {
      addSgfDirectory(testDir1, testConfigPath);
      addSgfDirectory(testDir2, testConfigPath);
      removeSgfDirectory(testDir1, testConfigPath);
      const directories = getSgfDirectories(testConfigPath);
      expect(directories).toHaveLength(1);
      expect(directories[0]).toContain(normalizePath(testDir2));
    });

    it("should throw error if directory is not in config", () => {
      expect(() => {
        removeSgfDirectory(testDir1, testConfigPath);
      }).toThrow("Directory not found in configuration");
    });

    it("should handle normalized paths when removing", () => {
      addSgfDirectory(testDir1, testConfigPath);
      const relativePath = path.relative(process.cwd(), testDir1);
      removeSgfDirectory(relativePath, testConfigPath);
      const directories = getSgfDirectories(testConfigPath);
      expect(directories).toHaveLength(0);
    });

    it("should remove all directories", () => {
      addSgfDirectory(testDir1, testConfigPath);
      addSgfDirectory(testDir2, testConfigPath);
      removeSgfDirectory(testDir1, testConfigPath);
      removeSgfDirectory(testDir2, testConfigPath);
      const directories = getSgfDirectories(testConfigPath);
      expect(directories).toHaveLength(0);
    });
  });

  describe("getSgfDirectories", () => {
    it("should return empty array when no directories configured", () => {
      const directories = getSgfDirectories(testConfigPath);
      expect(directories).toEqual([]);
    });

    it("should return all configured directories", () => {
      addSgfDirectory(testDir1, testConfigPath);
      addSgfDirectory(testDir2, testConfigPath);
      const directories = getSgfDirectories(testConfigPath);
      expect(directories).toHaveLength(2);
      expect(directories).toContain(normalizePath(testDir1));
      expect(directories).toContain(normalizePath(testDir2));
    });
  });
});
