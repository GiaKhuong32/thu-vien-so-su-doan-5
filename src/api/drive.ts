import { API_BASE_URL, toApiUrl } from '../config/api';
import { api, getToken } from './client';
import type { DriveNode } from '../types/drive';

export type FolderVisibility = 'public' | 'private';

export interface FolderResponseNoList {
  idFolder: string;
  folderName: string;
  description?: string;
  deletedAt?: string | null;
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
  parentFolder?: FolderResponseNoList | string | null;
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
  deletedAt?: string | null;
  folder?: string | { idFolder?: string } | null;
  idFolder?: string;
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

export interface CutCopyFilesRequest {
  files: string[];
}

function normalizeDate(value?: string): string {
  return value || new Date().toISOString();
}

function asFolderList(raw: unknown): FolderResponseNoList[] {
  if (Array.isArray(raw)) return raw as FolderResponseNoList[];

  const folder = raw as FolderResponse | null;
  if (folder?.childFolder) return folder.childFolder;
  if (folder?.idFolder) return [folder];

  return [];
}

function asDeletedFolderList(raw: unknown): FolderResponse[] {
  if (Array.isArray(raw)) return raw as FolderResponse[];
  if (raw && typeof raw === 'object' && 'idFolder' in (raw as FolderResponse)) {
    return [raw as FolderResponse];
  }
  return [];
}

function asFileList(raw: unknown): FileResponse[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object' && 'idFile' in raw) return [raw as FileResponse];
  return [];
}

function fileParentId(file: FileResponse): string | null {
  if (typeof file.folder === 'string') return file.folder;
  if (file.folder && typeof file.folder === 'object' && file.folder.idFolder) {
    return file.folder.idFolder;
  }
  return file.idFolder ?? null;
}

export function parentIdOf(folder: FolderResponse | FolderResponseNoList): string | null {
  if (!('parentFolder' in folder) || folder.parentFolder == null) return null;
  const parent = folder.parentFolder;
  if (typeof parent === 'string') return parent;
  return parent.idFolder ?? null;
}

function folderToNode(
  folder: FolderResponse | FolderResponseNoList,
  parentId: string | null,
  visibility?: 'private' | 'public',
  options?: { trashed?: boolean },
): DriveNode {
  const deletedAt = 'deletedAt' in folder ? folder.deletedAt : null;
  const trashed = options?.trashed ?? Boolean(deletedAt);

  return {
    id: folder.idFolder,
    parentId,
    name: folder.folderName,
    type: 'folder',
    size: 0,
    createdAt: new Date().toISOString(),
    updatedAt: deletedAt || new Date().toISOString(),
    favourite: false,
    trashed,
    trashedAt: trashed ? deletedAt ?? null : null,
    visibility,
  };
}

function fileToNode(
  file: FileResponse,
  parentId: string | null,
  options?: { trashed?: boolean },
): DriveNode {
  const fileUrl = file.partFile ? toApiUrl(file.partFile) : `${API_BASE_URL}/files/download/${file.idFile}`;
  const deletedAt = file.deletedAt ?? null;
  const trashed = options?.trashed ?? Boolean(deletedAt);

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
    trashed,
    trashedAt: trashed ? deletedAt : null,
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
  getRootDirectory: async (): Promise<DriveNode> => {
    const folder = await api.get<FolderResponseNoList>('/folder/rootDirectory');
    return folderToNode(folder, null);
  },

  getPublicRoots: async (): Promise<DriveNode[]> => {
    const folders = await api.get<FolderResponseNoList[]>('/folder/public/roots');

    return folders.map((folder) => folderToNode(folder, null, 'public'));
  },

  getPrivateRoot: async (): Promise<DriveNode> => {
    const folder = await api.get<FolderResponse>('/folder/private/my');
    return folderToNode(folder, null, 'private');
  },

  getPrivateRoots: async (): Promise<DriveNode[]> => {
    const folder = await api.get<FolderResponse>('/folder/private/my');
    return [folderToNode(folder, null, 'private')];
  },

  getFolder: async (folderId: string): Promise<FolderResponse> => {
    const encoded = encodeURIComponent(folderId);
    return api.get<FolderResponse>(`/folder/${encoded}`);
  },

  getFolderChain: async (folderId: string): Promise<DriveNode[]> => {
    const chain: DriveNode[] = [];
    let id: string | null = folderId;
    const seen = new Set<string>();

    while (id && !seen.has(id) && chain.length < 32) {
      seen.add(id);
      const folder = await driveApi.getFolder(id);
      const parentId = parentIdOf(folder);
      chain.unshift(folderToNode(folder, parentId));
      id = parentId;
    }

    return chain;
  },

  getFolderContents: async (
    folderId: string,
  ): Promise<{ current: DriveNode | null; ancestors: DriveNode[]; children: DriveNode[] }> => {
    const encoded = encodeURIComponent(folderId);
    const rawFolders = await api.get<FolderResponse | FolderResponseNoList[]>(
      `/folder/getChildFolder/${encoded}`,
    );

    let current: DriveNode | null = null;
    const ancestors: DriveNode[] = [];
    let childFolders: FolderResponseNoList[] = [];

    if (Array.isArray(rawFolders)) {
      childFolders = rawFolders;
    } else if (rawFolders) {
      current = folderToNode(rawFolders, parentIdOf(rawFolders));
      const parent = rawFolders.parentFolder;
      if (parent && typeof parent === 'object' && parent.idFolder) {
        ancestors.push(folderToNode(parent, null));
      }
      childFolders = rawFolders.childFolder ?? [];
    }

    const folders = childFolders.map((child) =>
      folderToNode(child, folderId, undefined, { trashed: false }),
    );

    let files: DriveNode[] = [];
    try {
      const rawFiles = await api.get<FileResponse[] | FileResponse>(
        `/files/folder/${encoded}`,
      );
      files = asFileList(rawFiles).map((file) => fileToNode(file, folderId, { trashed: false }));
    } catch {
      files = [];
    }

    return { current, ancestors, children: [...folders, ...files] };
  },

  getChildren: async (folderId: string): Promise<DriveNode[]> => {
    const contents = await driveApi.getFolderContents(folderId);
    return contents.children;
  },

  getDeleted: async (): Promise<DriveNode[]> => {
    let folders: DriveNode[] = [];
    let files: DriveNode[] = [];

    try {
      const rawFolders = await api.get<FolderResponse[] | FolderResponse>(
        '/folder/deleted',
      );
      folders = asDeletedFolderList(rawFolders).map((folder) =>
        folderToNode(folder, parentIdOf(folder), undefined, { trashed: true }),
      );
    } catch {
      folders = [];
    }

    try {
      const rawFiles = await api.get<FileResponse[] | FileResponse>(
        '/files/deleted',
      );
      files = asFileList(rawFiles).map((file) =>
        fileToNode(file, fileParentId(file), { trashed: true }),
      );
    } catch {
      files = [];
    }

    return [...folders, ...files];
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

    const nodeParentId = parentIdOf(folder) ?? parentId;
    return folderToNode(folder, nodeParentId, visibility);
  },

  renameFolder: async (id: string, name: string): Promise<DriveNode> => {
    const folder = await api.put<FolderResponse>(`/folder/${id}`, {
      folderName: name,
    } satisfies UpdateFolderRequest);

    const nodeParentId = parentIdOf(folder);
    return folderToNode(folder, nodeParentId);
  },

  moveFolder: async (id: string, targetParentId: string | null): Promise<DriveNode> => {
    const folder = await api.post<FolderResponse>(`/folder/${id}/move`, {
      parentFolder: targetParentId,
    } satisfies CopyMoveFolderRequest);

   const nodeParentId = parentIdOf(folder) ?? targetParentId;
    return folderToNode(folder, nodeParentId);
  },

  copyFolder: async (id: string, targetParentId: string | null): Promise<DriveNode> => {
    const folder = await api.post<FolderResponse>(`/folder/${id}/copy`, {
      parentFolder: targetParentId,
    } satisfies CopyMoveFolderRequest);

    const nodeParentId = parentIdOf(folder) ?? targetParentId;
    return folderToNode(folder, nodeParentId);
  },

  trashFolder: (id: string): Promise<void> => api.delete<void>(`/folder/${id}`),
  restoreFolder: (id: string): Promise<DriveNode> => api.put<DriveNode>(`/folder/restore/${id}`, {}),
  hardDeleteFolder: (id: string): Promise<void> => api.delete<void>(`/folder/hard/${id}`),

  trashFile: (id: string): Promise<void> => api.delete<void>(`/files/${id}`),
  restoreFile: (id: string): Promise<FileResponse> => api.put<FileResponse>(`/files/restore/${id}`, {}),
  hardDeleteFile: (id: string): Promise<void> => api.delete<void>(`/files/hard/${id}`),

  moveFiles: async (ids: string[], targetParentId: string): Promise<FileResponse[]> => {
    const encoded = encodeURIComponent(targetParentId);
    const raw = await api.post<FileResponse[] | FileResponse>(`/files/cut/${encoded}`, {
      files: ids,
    } satisfies CutCopyFilesRequest);
    return asFileList(raw);
  },

  copyFiles: async (ids: string[], targetParentId: string): Promise<FileResponse[]> => {
    const encoded = encodeURIComponent(targetParentId);
    const raw = await api.post<FileResponse[] | FileResponse>(`/files/copy/${encoded}`, {
      files: ids,
    } satisfies CutCopyFilesRequest);
    return asFileList(raw);
  },

  moveFile: async (id: string, targetParentId: string): Promise<FileResponse> => {
    const [file] = await driveApi.moveFiles([id], targetParentId);
    return file;
  },

  copyFile: async (id: string, targetParentId: string): Promise<FileResponse> => {
    const [file] = await driveApi.copyFiles([id], targetParentId);
    return file;
  },

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
    const rawResult = data?.Result ?? data?.result ?? data;
    const result: FileResponse[] = Array.isArray(rawResult) ? rawResult : [rawResult];

    return result.map((file) => fileToNode(file, folderId));
  },

  getViewUrl: (id: string) => {
    return toApiUrl(`/files/view/${encodeURIComponent(id)}`);
  },

  getDownloadUrl: (id: string) => {
    return toApiUrl(`/files/download/${encodeURIComponent(id)}`);
  },

  fetchFileBlob: async (id: string): Promise<{ objectUrl: string; contentType: string }> => {
    const token = getToken();
    const headers: Record<string, string> = {
      Accept: '*/*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const tryFetch = async (url: string) => {
      const response = await fetch(url, { method: 'GET', headers });
      const contentType = response.headers.get('content-type') || '';
      const buffer = await response.arrayBuffer();

      if (contentType.includes('application/json')) {
        const text = new TextDecoder().decode(buffer);
        let message = 'Không xem được file';
        try {
          const json = JSON.parse(text);
          message = json.message || json.Message || message;
        } catch {
          /* ignore */
        }
        throw new Error(message);
      }

      if (!response.ok) {
        throw new Error(`Không xem được file: ${response.status}`);
      }

      const blob = new Blob([buffer], {
        type: contentType || 'application/octet-stream',
      });

      return {
        objectUrl: URL.createObjectURL(blob),
        contentType: blob.type,
      };
    };

    try {
      return await tryFetch(driveApi.getViewUrl(id));
    } catch {
      return tryFetch(driveApi.getDownloadUrl(id));
    }
  },

  downloadFile: async (id: string, fileName?: string): Promise<void> => {
    const token = getToken();
    const headers: Record<string, string> = {
      Accept: '*/*',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(driveApi.getDownloadUrl(id), {
      method: 'GET',
      headers,
    });
    const contentType = response.headers.get('content-type') || '';
    const buffer = await response.arrayBuffer();
    if (contentType.includes('application/json')) {
      const text = new TextDecoder().decode(buffer);
      let message = 'Tải file thất bại';
      try {
        const json = JSON.parse(text);
        message = json.message || json.Message || message;
      } catch {
        /* ignore */
      }
      throw new Error(message);
    }
    if (!response.ok) {
      throw new Error(`Tải file thất bại: ${response.status}`);
    }
    const disposition = response.headers.get('content-disposition') || '';
    const utf8Name = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
    const asciiName = disposition.match(/filename="?([^"]+)"?/i)?.[1];
    const downloadedName = decodeURIComponent(utf8Name || asciiName || fileName || 'download');
    const blob = new Blob([buffer], {
      type: contentType || 'application/octet-stream',
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = downloadedName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(objectUrl);
  },
};