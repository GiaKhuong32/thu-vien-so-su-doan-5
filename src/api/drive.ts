import { API_BASE_URL, toApiUrl } from '../config/api';
import { api, getToken } from './client';
import type { DriveNode } from '../types/drive';

export type FolderVisibility = 'public' | 'private';

export interface FolderResponseNoList {
  idFolder: string;
  folderName: string;
  description?: string;
}

export interface DocumentResponseNoList {
  idDocument: string;
  title: string;
  content?: string;
  summary?: string;
  publishedAt?: string;
  slug?: string;
  status?: string;
  typeDocument?: string;
  thumbnail?: string;
}

export interface FolderResponse {
  idFolder: string;
  folderName: string;
  description?: string;
  parentFolder?: FolderResponseNoList | null;
  childFolder?: FolderResponseNoList[];
  documentEntity?: DocumentResponseNoList[];
}

export interface FileResponse {
  idFile: string;
  fileName: string;
  partFile?: string;
  typeFile?: string;
  size?: number;
  createdAt?: string;
  bookFile?: string;
  thumbnail?: string;
}

export interface CreateFolderRequest {
  folderName: string;
  description?: string;
  parentFolder?: string | null;
  visibility: boolean;
}

export interface UpdateFolderRequest {
  folderName: string;
}

export interface CopyMoveFolderRequest {
  parentFolder: string | null;
}

function normalizeDate(value?: string): string {
  return value || new Date().toISOString();
}

function folderToNode(folder: FolderResponse | FolderResponseNoList, parentId: string | null): DriveNode {
  return {
    id: folder.idFolder,
    parentId,
    name: folder.folderName,
    type: 'folder',
    size: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    favourite: false,
    trashed: false,
  };
}

function fileToNode(file: FileResponse, parentId: string | null): DriveNode {
  const fileUrl = file.partFile ? toApiUrl(file.partFile) : `${API_BASE_URL}/files/download/${file.idFile}`;

  return {
    id: file.idFile,
    parentId,
    name: file.fileName,
    type: 'file',
    size: file.size ?? 0,
    mimeType: file.typeFile,
    createdAt: normalizeDate(file.createdAt),
    updatedAt: normalizeDate(file.createdAt),
    favourite: false,
    trashed: false,
    previewUrl: file.thumbnail ? toApiUrl(file.thumbnail) : fileUrl,
  };
}

export function mapFolderChildrenToNodes(folder: FolderResponse): DriveNode[] {
  const parentId = folder.idFolder;

  const folders = (folder.childFolder ?? []).map((child) => folderToNode(child, parentId));
  const files = (folder.documentEntity ?? []).map((doc) => ({
    id: doc.idDocument,
    parentId,
    name: doc.title,
    type: 'file' as const,
    size: 0,
    mimeType: doc.typeDocument,
    createdAt: normalizeDate(doc.publishedAt),
    updatedAt: normalizeDate(doc.publishedAt),
    favourite: false,
    trashed: false,
    previewUrl: doc.thumbnail ? toApiUrl(doc.thumbnail) : null,
  }));

  return [...folders, ...files];
}

export const driveApi = {
  getPublicRoots: async (): Promise<DriveNode[]> => {
    const folders = await api.get<FolderResponse[]>('/folder/public/roots');
    return folders.map((folder) => folderToNode(folder, null));
  },

  getPrivateRoots: async (): Promise<DriveNode[]> => {
    const folders = await api.get<FolderResponse[]>('/folder/private/my');
    return folders.map((folder) => folderToNode(folder, null));
  },

  getChildren: async (folderId: string): Promise<DriveNode[]> => {
    const folder = await api.get<FolderResponse>(`/folder/getChildFolder/${folderId}`);
    const files = await api.get<FileResponse[]>(`/files/folder/${folderId}`);

    return [
      ...mapFolderChildrenToNodes(folder),
      ...files.map((file) => fileToNode(file, folderId)),
    ];
  },

  getDeleted: async (): Promise<DriveNode[]> => {
    const folders = await api.get<FolderResponse[]>('/folder/deleted');
    const files = await api.get<FileResponse[]>('/files/deleted');

    return [
      ...folders.map((folder) => ({ ...folderToNode(folder, folder.parentFolder?.idFolder ?? null), trashed: true })),
      ...files.map((file) => ({ ...fileToNode(file, null), trashed: true })),
    ];
  },

  createFolder: async (
    name: string,
    parentId: string | null,
    visibility: FolderVisibility,
  ): Promise<DriveNode> => {
    const folder = await api.post<FolderResponse>('/folder', {
      folderName: name,
      description: '',
      parentFolder: parentId,
      visibility: visibility === 'public',
    } satisfies CreateFolderRequest);

    return folderToNode(folder, folder.parentFolder?.idFolder ?? parentId);
  },

  renameFolder: async (id: string, name: string): Promise<DriveNode> => {
    const folder = await api.put<FolderResponse>(`/folder/${id}`, {
      folderName: name,
    } satisfies UpdateFolderRequest);

    return folderToNode(folder, folder.parentFolder?.idFolder ?? null);
  },

  moveFolder: async (id: string, targetParentId: string | null): Promise<DriveNode> => {
    const folder = await api.post<FolderResponse>(`/folder/${id}/move`, {
      parentFolder: targetParentId,
    } satisfies CopyMoveFolderRequest);

    return folderToNode(folder, targetParentId);
  },

  copyFolder: async (id: string, targetParentId: string | null): Promise<DriveNode> => {
    const folder = await api.post<FolderResponse>(`/folder/${id}/copy`, {
      parentFolder: targetParentId,
    } satisfies CopyMoveFolderRequest);

    return folderToNode(folder, targetParentId);
  },

  trashFolder: (id: string): Promise<void> => api.delete<void>(`/folder/${id}`),
  restoreFolder: (id: string): Promise<DriveNode> => api.put<DriveNode>(`/folder/restore/${id}`, {}),
  hardDeleteFolder: (id: string): Promise<void> => api.delete<void>(`/folder/hard/${id}`),

  trashFile: (id: string): Promise<void> => api.delete<void>(`/files/${id}`),
  restoreFile: (id: string): Promise<FileResponse> => api.put<FileResponse>(`/files/restore/${id}`, {}),
  hardDeleteFile: (id: string): Promise<void> => api.delete<void>(`/files/hard/${id}`),

  uploadFilesToFolder: async (folderId: string, files: File[]): Promise<DriveNode[]> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/files/upload/folder/${folderId}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const result: FileResponse[] = data?.Result ?? data?.result ?? data;

    return result.map((file) => fileToNode(file, folderId));
  },
};