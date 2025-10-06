import { Router, Request, Response } from "express";
import {
  addSgfDirectory,
  removeSgfDirectory,
  getSgfDirectories,
} from "../services/sgf-directory.service";

const router = Router();

/**
 * GET /api/sgf-directories
 * Get all SGF directories
 */
router.get("/", (req: Request, res: Response) => {
  try {
    const directories = getSgfDirectories();
    res.json({ directories });
  } catch (error) {
    res.status(500).json({
      error: "Failed to retrieve SGF directories",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/sgf-directories
 * Add a new SGF directory
 * Body: { path: string }
 */
router.post("/", (req: Request, res: Response) => {
  try {
    const { path } = req.body;

    if (!path || typeof path !== "string") {
      res.status(400).json({
        error: "Invalid request",
        message: "Path is required and must be a string",
      });
      return;
    }

    addSgfDirectory(path);
    const directories = getSgfDirectories();

    res.status(201).json({
      message: "Directory added successfully",
      directories,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Determine appropriate status code based on error message
    const statusCode = message.includes("does not exist")
      ? 404
      : message.includes("already exists") || message.includes("Cannot add")
        ? 409
        : 500;

    res.status(statusCode).json({
      error: "Failed to add directory",
      message,
    });
  }
});

/**
 * DELETE /api/sgf-directories
 * Remove an SGF directory
 * Body: { path: string }
 */
router.delete("/", (req: Request, res: Response) => {
  try {
    const { path } = req.body;

    if (!path || typeof path !== "string") {
      res.status(400).json({
        error: "Invalid request",
        message: "Path is required and must be a string",
      });
      return;
    }

    removeSgfDirectory(path);
    const directories = getSgfDirectories();

    res.status(200).json({
      message: "Directory removed successfully",
      directories,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    // Determine appropriate status code based on error message
    const statusCode = message.includes("not found") ? 404 : 500;

    res.status(statusCode).json({
      error: "Failed to remove directory",
      message,
    });
  }
});

export default router;
