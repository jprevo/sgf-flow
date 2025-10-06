import { httpClient } from "./http.service";
import { showSuccessToast } from "./toast.service";

export interface IndexProgress {
  phase: "scanning" | "indexing" | "cleanup" | "complete" | "error";
  filesScanned: number;
  filesIndexed: number;
  filesSkipped: number;
  filesRemoved: number;
  currentFile?: string;
  error?: string;
  status?: string;
}

export type ProgressCallback = (progress: IndexProgress) => void;

/**
 * Runs the SGF indexer with Server-Sent Events for progress updates
 */
export async function runIndexer(
  onProgress: ProgressCallback,
): Promise<void> {
  const baseURL = httpClient.defaults.baseURL || "";
  const url = `${baseURL}/sgf-indexer/index`;

  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(url, {
      withCredentials: false,
    });

    eventSource.onmessage = (event) => {
      try {
        const progress: IndexProgress = JSON.parse(event.data);

        // Handle connection status
        if (progress.status === "connected") {
          return;
        }

        onProgress(progress);

        // Close connection when complete
        if (progress.phase === "complete") {
          eventSource.close();
          showSuccessToast("Indexing completed successfully");
          resolve();
        } else if (progress.phase === "error" || progress.error) {
          eventSource.close();
          reject(new Error(progress.error || "Indexing failed"));
        }
      } catch (error) {
        eventSource.close();
        reject(error);
      }
    };

    eventSource.onerror = (error) => {
      eventSource.close();
      reject(new Error("Connection to indexer failed"));
    };
  });
}

/**
 * Clears all games from the database
 */
export async function clearIndex(): Promise<void> {
  const response = await httpClient.delete<{
    message: string;
    deletedCount: number;
  }>("/sgf-indexer/clear");

  showSuccessToast(
    response.data.message || `Cleared ${response.data.deletedCount} games`,
  );
}
