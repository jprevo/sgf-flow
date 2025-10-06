import * as path from "path";
import * as fs from "fs";
import { loadConfig, saveConfig, Config } from "../utils/config";

/**
 * Normalizes a file path to use consistent format across platforms
 * @param dirPath - The directory path to normalize
 * @returns Normalized absolute path
 */
export function normalizePath(dirPath: string): string {
  // Convert to absolute path and normalize (handles .., ., and platform-specific separators)
  const absolutePath = path.isAbsolute(dirPath)
    ? path.normalize(dirPath)
    : path.resolve(process.cwd(), dirPath);

  // Normalize to forward slashes for consistency across platforms
  return absolutePath.split(path.sep).join("/");
}

/**
 * Checks if a directory exists
 * @param dirPath - The directory path to check
 * @returns True if the directory exists and is a directory
 */
export function directoryExists(dirPath: string): boolean {
  try {
    const stats = fs.statSync(dirPath);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
}

/**
 * Checks if one path is a subdirectory of another
 * @param parent - The potential parent directory
 * @param child - The potential child directory
 * @returns True if child is a subdirectory of parent
 */
export function isSubdirectory(parent: string, child: string): boolean {
  const normalizedParent = normalizePath(parent);
  const normalizedChild = normalizePath(child);

  // Check if child starts with parent path
  if (normalizedChild === normalizedParent) {
    return false; // Same directory, not a subdirectory
  }

  // Ensure parent path ends with separator for accurate comparison
  const parentWithSeparator = normalizedParent.endsWith("/")
    ? normalizedParent
    : normalizedParent + "/";

  return normalizedChild.startsWith(parentWithSeparator);
}

/**
 * Adds a directory to sgfDirectories in the config
 * @param dirPath - The directory path to add
 * @param configPath - Optional path to config file
 * @throws Error if directory doesn't exist, is already listed, or is a subdirectory/parent of existing entries
 */
export function addSgfDirectory(dirPath: string, configPath?: string): void {
  const normalizedPath = normalizePath(dirPath);

  // Validate directory exists
  if (!directoryExists(normalizedPath)) {
    throw new Error(`Directory does not exist: ${dirPath}`);
  }

  // Load current config
  const config = loadConfig(configPath);
  const currentDirectories = config.sgfDirectories || [];

  // Check if directory is already in the list
  if (currentDirectories.some((dir) => normalizePath(dir) === normalizedPath)) {
    throw new Error(`Directory already exists in configuration: ${dirPath}`);
  }

  // Check if new directory is a subdirectory of any existing directory
  for (const existingDir of currentDirectories) {
    if (isSubdirectory(existingDir, normalizedPath)) {
      throw new Error(
        `Cannot add directory "${dirPath}" because its parent "${existingDir}" is already included`,
      );
    }
  }

  // Check if new directory is a parent of any existing directory
  const subdirectories = currentDirectories.filter((existingDir) =>
    isSubdirectory(normalizedPath, existingDir),
  );

  if (subdirectories.length > 0) {
    throw new Error(
      `Cannot add directory "${dirPath}" because it contains existing subdirectories: ${subdirectories.join(", ")}`,
    );
  }

  // Add the new directory
  config.sgfDirectories = [...currentDirectories, normalizedPath];
  saveConfig(config, configPath);
}

/**
 * Removes a directory from sgfDirectories in the config
 * @param dirPath - The directory path to remove
 * @param configPath - Optional path to config file
 * @throws Error if directory is not in the configuration
 */
export function removeSgfDirectory(dirPath: string, configPath?: string): void {
  const normalizedPath = normalizePath(dirPath);

  // Load current config
  const config = loadConfig(configPath);
  const currentDirectories = config.sgfDirectories || [];

  // Find the directory in the list
  const indexToRemove = currentDirectories.findIndex(
    (dir) => normalizePath(dir) === normalizedPath,
  );

  if (indexToRemove === -1) {
    throw new Error(`Directory not found in configuration: ${dirPath}`);
  }

  // Remove the directory
  config.sgfDirectories = currentDirectories.filter(
    (_, index) => index !== indexToRemove,
  );
  saveConfig(config, configPath);
}

/**
 * Gets all SGF directories from the config
 * @param configPath - Optional path to config file
 * @returns Array of SGF directory paths
 */
export function getSgfDirectories(configPath?: string): string[] {
  const config = loadConfig(configPath);
  return config.sgfDirectories || [];
}
