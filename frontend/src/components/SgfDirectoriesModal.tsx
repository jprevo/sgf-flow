import { useEffect, useState } from "react";
import { signal } from "@preact/signals-react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { SearchBox } from "./SearchBox";
import {
  getSgfDirectories,
  addSgfDirectory,
  removeSgfDirectory,
} from "../services/sgf-directories.service";
import {
  runIndexer,
  clearIndex,
  type IndexProgress,
} from "../services/sgf-indexer.service";

const directories = signal<string[]>([]);
const isLoading = signal(false);
const newDirectory = signal("");
const isIndexing = signal(false);
const indexProgress = signal<IndexProgress | null>(null);

interface SgfDirectoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SgfDirectoriesModal({
  isOpen,
  onClose,
}: SgfDirectoriesModalProps) {
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    if (isOpen) {
      loadDirectories();
    }
  }, [isOpen]);

  async function loadDirectories() {
    isLoading.value = true;
    try {
      directories.value = await getSgfDirectories();
    } catch (error) {
      // Error already handled by HTTP interceptor
    } finally {
      isLoading.value = false;
    }
  }

  async function handleAddDirectory() {
    if (!newDirectory.value.trim()) return;

    isLoading.value = true;
    try {
      directories.value = await addSgfDirectory(newDirectory.value.trim());
      newDirectory.value = "";
    } catch (error) {
      // Error already handled by HTTP interceptor
    } finally {
      isLoading.value = false;
    }
  }

  async function handleRemoveDirectory(path: string) {
    isLoading.value = true;
    try {
      directories.value = await removeSgfDirectory(path);
    } catch (error) {
      // Error already handled by HTTP interceptor
    } finally {
      isLoading.value = false;
    }
  }

  async function handleRunIndexer() {
    isIndexing.value = true;
    indexProgress.value = null;

    try {
      await runIndexer((progress) => {
        indexProgress.value = progress;
      });
    } catch (error) {
      // Error already handled by HTTP interceptor or toast
    } finally {
      isIndexing.value = false;
    }
  }

  async function handleClearIndex() {
    if (
      !confirm(
        "Are you sure you want to clear all indexed games? This cannot be undone.",
      )
    ) {
      return;
    }

    isLoading.value = true;
    try {
      await clearIndex();
      indexProgress.value = null;
    } catch (error) {
      // Error already handled by HTTP interceptor
    } finally {
      isLoading.value = false;
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Index SGF Files"
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Directories List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
            SGF Directories
          </h3>
          {directories.value.length === 0 ? (
            <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">
              No directories configured yet
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {directories.value.map((dir) => (
                <div
                  key={dir}
                  className="
                    flex items-center justify-between gap-3 p-3 rounded-lg
                    bg-[var(--color-bg-secondary)]
                    border border-[var(--color-border)]
                  "
                >
                  <span className="text-sm text-[var(--color-text-primary)] break-all">
                    {dir}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveDirectory(dir)}
                    disabled={isLoading.value}
                    aria-label="Remove directory"
                  >
                    ✕
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Directory */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-[var(--color-text-secondary)]">
            Add New Directory
          </h3>
          <div className="flex gap-2">
            <SearchBox
              placeholder="/path/to/sgf/files"
              value={newDirectory.value}
              onChange={(e) => {
                newDirectory.value = e.target.value;
                setForceUpdate((prev) => prev + 1);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddDirectory();
                }
              }}
              className="flex-1"
            />
            <Button
              variant="primary"
              onClick={handleAddDirectory}
              disabled={isLoading.value || !newDirectory.value.trim()}
            >
              Add
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {indexProgress.value && (
          <div className="space-y-3 pt-4 border-t border-[var(--color-border)]">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-text-secondary)] font-medium capitalize">
                  {indexProgress.value.phase}
                </span>
                <span className="text-[var(--color-text-secondary)]">
                  {indexProgress.value.filesIndexed > 0 && (
                    <>
                      {indexProgress.value.filesIndexed} indexed
                      {indexProgress.value.filesSkipped > 0 &&
                        `, ${indexProgress.value.filesSkipped} skipped`}
                      {indexProgress.value.filesRemoved > 0 &&
                        `, ${indexProgress.value.filesRemoved} removed`}
                    </>
                  )}
                  {indexProgress.value.phase === "scanning" &&
                    `${indexProgress.value.filesScanned} files found`}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-[var(--color-bg-secondary)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--color-accent)] transition-all duration-300 ease-out"
                  style={{
                    width:
                      indexProgress.value.phase === "complete"
                        ? "100%"
                        : indexProgress.value.filesScanned > 0
                          ? `${Math.min(
                              100,
                              ((indexProgress.value.filesIndexed +
                                indexProgress.value.filesSkipped) /
                                indexProgress.value.filesScanned) *
                                100,
                            )}%`
                          : "0%",
                  }}
                />
              </div>
              {indexProgress.value.currentFile && (
                <p className="text-xs text-[var(--color-text-secondary)] truncate">
                  {indexProgress.value.currentFile}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading.value || isIndexing.value}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            variant="secondary"
            onClick={handleClearIndex}
            disabled={
              isLoading.value || isIndexing.value || directories.value.length === 0
            }
            className="flex-1"
          >
            Clear Index
          </Button>
          <Button
            variant="primary"
            onClick={handleRunIndexer}
            disabled={
              isLoading.value ||
              isIndexing.value ||
              directories.value.length === 0
            }
            className="flex-1"
          >
            {isIndexing.value ? "Indexing..." : "Run Indexer"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
