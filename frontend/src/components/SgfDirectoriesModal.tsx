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

const directories = signal<string[]>([]);
const isLoading = signal(false);
const newDirectory = signal("");

interface SgfDirectoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SgfDirectoriesModal({ isOpen, onClose }: SgfDirectoriesModalProps) {
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

  function handleRunIndexer() {
    // TODO: Implement indexer functionality
    console.log("Run indexer clicked");
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Index SGF Files" className="max-w-2xl">
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
                setForceUpdate(prev => prev + 1);
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

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-[var(--color-border)]">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading.value}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleRunIndexer}
            disabled={isLoading.value || directories.value.length === 0}
            className="flex-1"
          >
            Run Indexer
          </Button>
        </div>
      </div>
    </Modal>
  );
}
