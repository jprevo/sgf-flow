import * as yaml from 'js-yaml';
import * as fs from 'fs';
import * as path from 'path';

export interface Config {
  server: {
    port: number;
    environment: string;
  };
  database: {
    url: string;
  };
  logging: {
    level: string;
    format: string;
  };
  sgfDirectories?: string[];
}

/**
 * Get the configuration file path based on environment
 * @param env - Environment name (defaults to NODE_ENV or 'development')
 * @returns Path to the configuration file
 */
function getConfigFilePath(env?: string): string {
  const environment = env || process.env.NODE_ENV || 'development';
  const envConfigPath = path.join(process.cwd(), `config.${environment}.yaml`);
  const defaultConfigPath = path.join(process.cwd(), 'config.yaml');

  if (fs.existsSync(envConfigPath)) {
    return envConfigPath;
  }

  if (fs.existsSync(defaultConfigPath)) {
    console.warn(
      `Environment-specific config not found (config.${environment}.yaml), using default config.yaml`
    );
    return defaultConfigPath;
  }

  throw new Error(
    `No configuration file found. Expected config.${environment}.yaml or config.yaml`
  );
}

/**
 * Merge environment variables into configuration
 * @param config - Base configuration object
 * @returns Configuration with environment variables applied
 */
function mergeEnvironmentVariables(config: Config): Config {
  const mergedConfig = { ...config };

  if (process.env.PORT) {
    mergedConfig.server.port = parseInt(process.env.PORT, 10);
  }
  if (process.env.NODE_ENV) {
    mergedConfig.server.environment = process.env.NODE_ENV;
  }
  if (process.env.DATABASE_URL) {
    mergedConfig.database.url = process.env.DATABASE_URL;
  }

  return mergedConfig;
}

/**
 * Load configuration from YAML file
 * @param configPath - Path to config file (defaults to environment-specific config file)
 * @returns Parsed configuration object
 */
export function loadConfig(configPath?: string): Config {
  const filePath = configPath || getConfigFilePath();

  try {
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const config = yaml.load(fileContents) as Config;
    return mergeEnvironmentVariables(config);
  } catch (error) {
    console.error(`Failed to load config from ${filePath}:`, error);
    throw error;
  }
}

/**
 * Save configuration to YAML file
 * @param config - Configuration object to save
 * @param configPath - Path to config file (defaults to environment-specific config file)
 */
export function saveConfig(config: Config, configPath?: string): void {
  const filePath = configPath || getConfigFilePath();

  try {
    const yamlString = yaml.dump(config, {
      indent: 2,
      lineWidth: -1,
    });
    fs.writeFileSync(filePath, yamlString, 'utf8');
  } catch (error) {
    console.error(`Failed to save config to ${filePath}:`, error);
    throw error;
  }
}
