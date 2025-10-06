import * as fs from "fs";
import * as path from "path";
import { loadConfig, saveConfig, Config } from "../utils/config";

describe("Config Utility", () => {
  const testConfigPath = path.join(__dirname, "test-config.yaml");
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
  };

  afterEach(() => {
    // Clean up test config file
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  describe("saveConfig", () => {
    it("should save config to YAML file", () => {
      saveConfig(testConfig, testConfigPath);
      expect(fs.existsSync(testConfigPath)).toBe(true);
    });

    it("should create valid YAML", () => {
      saveConfig(testConfig, testConfigPath);
      const fileContents = fs.readFileSync(testConfigPath, "utf8");
      expect(fileContents).toContain("server:");
      expect(fileContents).toContain("port: 4000");
    });
  });

  describe("loadConfig", () => {
    beforeEach(() => {
      saveConfig(testConfig, testConfigPath);
    });

    it("should load config from YAML file", () => {
      const config = loadConfig(testConfigPath);
      expect(config).toEqual(testConfig);
    });

    it("should parse server configuration", () => {
      const config = loadConfig(testConfigPath);
      expect(config.server.port).toBe(4000);
      expect(config.server.environment).toBe("test");
    });

    it("should parse database configuration", () => {
      const config = loadConfig(testConfigPath);
      expect(config.database.url).toBe("file:./test.db");
    });

    it("should parse logging configuration", () => {
      const config = loadConfig(testConfigPath);
      expect(config.logging.level).toBe("debug");
      expect(config.logging.format).toBe("text");
    });
  });
});
