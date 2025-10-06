import { httpClient } from "./http.service";
import { showSuccessToast } from "./toast.service";

export interface SgfDirectoriesResponse {
  directories: string[];
  message?: string;
}

export async function getSgfDirectories(): Promise<string[]> {
  const response = await httpClient.get<SgfDirectoriesResponse>("/sgf-directories");
  return response.data.directories;
}

export async function addSgfDirectory(path: string): Promise<string[]> {
  const response = await httpClient.post<SgfDirectoriesResponse>("/sgf-directories", { path });
  showSuccessToast(response.data.message || "Directory added successfully");
  return response.data.directories;
}

export async function removeSgfDirectory(path: string): Promise<string[]> {
  const response = await httpClient.delete<SgfDirectoriesResponse>("/sgf-directories", {
    data: { path },
  });
  showSuccessToast(response.data.message || "Directory removed successfully");
  return response.data.directories;
}
