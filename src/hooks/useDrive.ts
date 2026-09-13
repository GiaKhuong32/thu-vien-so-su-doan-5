import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  CreateFolderInput,
  DriveBreadcrumb,
  DriveClipboard,
  DriveNode,
  DriveSection,
  DriveSort,
  DriveStorage,
  DriveUploadTask,
  DriveViewMode,
} from '../types/drive';
import { isAuthenticated } from '../api/auth';
import { driveApi, type FolderVisibility } from '../api/drive';
const STORAGE_TOTAL_BYTES = 20 * 1024 * 1024 * 1024; 
const STORAGE_PLAN_NAME = 'Miễn phí'; 

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nextAvailableName(name: string, siblingNames: string[]): string {
  if (!siblingNames.includes(name)) return name;
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let n = 1;
  let candidate: string;
  do {
    candidate = `${base} (bản sao${n > 1 ? ` ${n}` : ''})${ext}`;
    n++;
  } while (siblingNames.includes(candidate));
  return candidate;
}

export function useDrive() {
  const [nodes, setNodes] = useState<DriveNode[]>([]);
  const [section, setSectionState] = useState<DriveSection>('cloud');
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<DriveViewMode>('grid');
  const [sort, setSort] = useState<DriveSort>({ key: 'name', order: 'asc' });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [clipboard, setClipboard] = useState<DriveClipboard>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const [uploads, setUploads] = useState<DriveUploadTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visibility, setVisibility] = useState<FolderVisibility>(
    isAuthenticated() ? 'private' : 'public',
  );
  const [rootFolderId, setRootFolderId] = useState<string | null>(null);

  const setSection = useCallback((next: DriveSection) => {
    setSectionState(next);
    setSelectedId(null);
    setSelectedIds(new Set());
  }, []);

  const select = useCallback((id: string | null) => setSelectedId(id), []);

  const toggleMultiSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearMultiSelect = useCallback(() => setSelectedIds(new Set()), []);

  const loadRoots = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const root = isAuthenticated()
        ? await driveApi.getPrivateRoot()
        : (await driveApi.getPublicRoots())[0];

      setVisibility(isAuthenticated() ? 'private' : 'public');
      setRootFolderId(root?.id ?? null);
      setCurrentFolderId(null);

      if (!root?.id) {
        setNodes([]);
        return;
      }

      const children = await driveApi.getChildren(root.id);
      setNodes([
        { ...root, parentId: null },
        ...children.map((node) =>
          node.parentId === root.id ? { ...node, parentId: null } : node,
        ),
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được thư mục');
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveBackendParentId = useCallback(
    (parentId: string | null) => parentId ?? rootFolderId,
    [rootFolderId],
  );

  const navigateTo = useCallback(async (folderId: string | null) => {
    setSectionState('cloud');
    setCurrentFolderId(folderId);
    setSelectedId(null);
    setSelectedIds(new Set());

    if (!folderId) {
      await loadRoots();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const children = await driveApi.getChildren(folderId);

      setNodes((prev) => [
        ...prev.filter((node) => node.parentId !== folderId),
        ...children,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được nội dung thư mục');
    } finally {
      setLoading(false);
    }
  }, [loadRoots]);

  useEffect(() => {
    loadRoots();
  }, [loadRoots]);

  /* ---------------- Dữ liệu dẫn xuất ---------------- */

  const breadcrumbs = useMemo<DriveBreadcrumb[]>(() => {
    if (section !== 'cloud') return [];
    const trail: DriveBreadcrumb[] = [];
    let cursor = currentFolderId;
    while (cursor) {
      const node = nodes.find((n) => n.id === cursor);
      if (!node) break;
      trail.unshift({ id: node.id, name: node.name });
      cursor = node.parentId;
    }
    return trail;
  }, [nodes, currentFolderId, section]);

  const visibleNodes = useMemo<DriveNode[]>(() => {
    let list: DriveNode[];
    if (section === 'cloud') {
      list = nodes.filter((n) => !n.trashed && n.parentId === currentFolderId);
    } else if (section === 'recent') {
      list = nodes
        .filter((n) => !n.trashed)
        .slice()
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
        .slice(0, 60);
    } else if (section === 'favourite') {
      list = nodes.filter((n) => n.favourite && !n.trashed);
    } else {
      list = nodes.filter((n) => n.trashed);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      list = list.filter((n) => n.name.toLowerCase().includes(q));
    }

    if (section === 'recent') return list; // đã sắp theo thời gian mở/cập nhật gần nhất

    return list.slice().sort((a, b) => {
      if (sort.key === 'name' && a.type !== b.type) return a.type === 'folder' ? -1 : 1;
      let cmp = 0;
      if (sort.key === 'name') cmp = a.name.localeCompare(b.name, 'vi');
      else if (sort.key === 'size') cmp = a.size - b.size;
      else if (sort.key === 'type') cmp = a.type.localeCompare(b.type);
      else cmp = +new Date(a.updatedAt) - +new Date(b.updatedAt);
      return sort.order === 'asc' ? cmp : -cmp;
    });
  }, [nodes, section, currentFolderId, searchTerm, sort]);

  const storage = useMemo<DriveStorage>(() => {
    const used = nodes
      .filter((n) => n.type === 'file' && !n.trashed)
      .reduce((sum, n) => sum + n.size, 0);
    return { used, total: STORAGE_TOTAL_BYTES, planName: STORAGE_PLAN_NAME };
  }, [nodes]);

  const counts = useMemo(
    () => ({
      cloud: nodes.filter((n) => !n.trashed && n.parentId === null).length,
      favourite: nodes.filter((n) => n.favourite && !n.trashed).length,
      trash: nodes.filter((n) => n.trashed).length,
    }),
    [nodes],
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  );

  const folderSize = useCallback(
    (folderId: string): number => {
      let sum = 0;
      const stack = [folderId];
      while (stack.length) {
        const cur = stack.pop()!;
        for (const n of nodes) {
          if (n.parentId !== cur || n.trashed) continue;
          if (n.type === 'file') sum += n.size;
          else stack.push(n.id);
        }
      }
      return sum;
    },
    [nodes],
  );

  /* ---------------- Hành động ---------------- */

  const createFolder = useCallback(
    async ({ parentId, name }: CreateFolderInput) => {
      const backendParentId = resolveBackendParentId(parentId);

      if (!backendParentId) {
        throw new Error('Không tìm thấy thư mục gốc để tạo thư mục con');
      }

      const node = await driveApi.createFolder(
        name.trim() || 'Thư mục mới',
        backendParentId,
        visibility,
      );

      setNodes((prev) => [
        ...prev,
        {
          ...node,
          parentId,
        },
      ]);

      return node;
    },
    [resolveBackendParentId, visibility],
  );

  const uploadFiles = useCallback(
    async (files: FileList | File[], opts?: { parentId?: string | null }) => {
      const list = Array.from(files);
      if (list.length === 0) return;

      const parentId =
        opts && 'parentId' in opts
          ? opts.parentId ?? null
          : section === 'cloud'
            ? currentFolderId
            : null;

      const backendParentId = resolveBackendParentId(parentId);

      if (!backendParentId) {
        setError('Không tìm thấy thư mục gốc để tải file lên');
        return;
      }

      const tasks: DriveUploadTask[] = list.map((file) => ({
        id: makeId(),
        name: file.name,
        size: file.size,
        progress: 20,
        status: 'uploading',
      }));

      setUploads((prev) => [...prev, ...tasks]);

      try {
        await driveApi.uploadFilesToFolder(backendParentId, list);

        const children = await driveApi.getChildren(backendParentId);

        setNodes((prev) => [
          ...prev.filter((node) => node.parentId !== parentId),
          ...children.map((node) =>
            node.parentId === backendParentId ? { ...node, parentId } : node,
          ),
        ]);

        setUploads((prev) =>
          prev.map((task) =>
            tasks.some((item) => item.id === task.id)
              ? { ...task, progress: 100, status: 'done' }
              : task,
          ),
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload thất bại');

        setUploads((prev) =>
          prev.map((task) =>
            tasks.some((item) => item.id === task.id)
              ? {
                  ...task,
                  progress: 100,
                  status: 'error',
                  error: err instanceof Error ? err.message : 'Upload thất bại',
                }
              : task,
          ),
        );
      } finally {
        setTimeout(() => {
          setUploads((prev) =>
            prev.filter((task) => !tasks.some((item) => item.id === task.id)),
          );
        }, 1200);
      }

      if (section !== 'cloud') setSectionState('cloud');
    },
    [section, currentFolderId],
  );

  const toggleFavourite = useCallback((id: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, favourite: !n.favourite } : n)));
  }, []);

  function collectDescendantIds(rootIds: string[], allNodes: DriveNode[]): string[] {
    const affected = new Set(rootIds);
    let grew = true;

    while (grew) {
      grew = false;

      for (const node of allNodes) {
        if (node.parentId && affected.has(node.parentId) && !affected.has(node.id)) {
          affected.add(node.id);
          grew = true;
        }
      }
    }

    return Array.from(affected);
  }

  const refreshCurrentFolder = useCallback(async () => {
    const backendParentId = resolveBackendParentId(currentFolderId);

    if (!backendParentId) {
      await loadRoots();
      return;
    }

    const children = await driveApi.getChildren(backendParentId);

    setNodes((prev) => [
      ...prev.filter((node) => node.parentId !== currentFolderId),
      ...children.map((node) =>
        node.parentId === backendParentId ? { ...node, parentId: currentFolderId } : node,
      ),
    ]);
  }, [currentFolderId, loadRoots, resolveBackendParentId]);

  const moveToTrash = useCallback(
    async (idOrIds: string | string[]) => {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      const affectedIds = collectDescendantIds(ids, nodes);
      const selectedNodes = nodes.filter((node) => ids.includes(node.id));

      setError(null);

      try {
        await Promise.all(
          selectedNodes.map((node) =>
            node.type === 'folder'
              ? driveApi.trashFolder(node.id)
              : driveApi.trashFile(node.id),
          ),
        );

        const now = new Date().toISOString();

        setNodes((prev) =>
          prev.map((node) =>
            affectedIds.includes(node.id)
              ? { ...node, trashed: true, trashedAt: now }
              : node,
          ),
        );

        setSelectedId((cur) => (cur && affectedIds.includes(cur) ? null : cur));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          affectedIds.forEach((id) => next.delete(id));
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Chuyển vào thùng rác thất bại');
        await refreshCurrentFolder();
        throw err;
      }
    },
    [nodes, refreshCurrentFolder],
  );

  const restore = useCallback(
    async (idOrIds: string | string[]) => {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      const affectedIds = collectDescendantIds(ids, nodes);
      const selectedNodes = nodes.filter((node) => ids.includes(node.id));

      setError(null);

      try {
        await Promise.all(
          selectedNodes.map((node) =>
            node.type === 'folder'
              ? driveApi.restoreFolder(node.id)
              : driveApi.restoreFile(node.id),
          ),
        );

        setNodes((prev) =>
          prev.map((node) =>
            affectedIds.includes(node.id)
              ? { ...node, trashed: false, trashedAt: null }
              : node,
          ),
        );

        setSelectedIds((prev) => {
          const next = new Set(prev);
          affectedIds.forEach((id) => next.delete(id));
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Khôi phục thất bại');
        throw err;
      }
    },
    [nodes],
  );

  const deleteForever = useCallback(
    async (idOrIds: string | string[]) => {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      const removeIds = collectDescendantIds(ids, nodes);
      const selectedNodes = nodes.filter((node) => ids.includes(node.id));

      setError(null);

      try {
        await Promise.all(
          selectedNodes.map((node) =>
            node.type === 'folder'
              ? driveApi.hardDeleteFolder(node.id)
              : driveApi.hardDeleteFile(node.id),
          ),
        );

        setNodes((prev) => prev.filter((node) => !removeIds.includes(node.id)));
        setSelectedId((cur) => (cur && removeIds.includes(cur) ? null : cur));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          removeIds.forEach((id) => next.delete(id));
          return next;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Xóa vĩnh viễn thất bại');
        await refreshCurrentFolder();
        throw err;
      }
    },
    [nodes, refreshCurrentFolder],
  );

  const emptyTrash = useCallback(() => {
    setNodes((prev) => prev.filter((n) => !n.trashed));
  }, []);

  const copyToClipboard = useCallback((idOrIds: string | string[]) => {
    setClipboard({ mode: 'copy', ids: Array.isArray(idOrIds) ? idOrIds : [idOrIds] });
  }, []);

  const cutToClipboard = useCallback((idOrIds: string | string[]) => {
    setClipboard({ mode: 'cut', ids: Array.isArray(idOrIds) ? idOrIds : [idOrIds] });
  }, []);

  const duplicateNode = useCallback(
    (source: DriveNode, targetParentId: string | null, all: DriveNode[]): DriveNode[] => {
      const siblingNames = all.filter((n) => n.parentId === targetParentId && !n.trashed).map((n) => n.name);
      const now = new Date().toISOString();
      const copy: DriveNode = {
        ...source,
        id: makeId(),
        parentId: targetParentId,
        name: nextAvailableName(source.name, siblingNames),
        createdAt: now,
        updatedAt: now,
        trashed: false,
        trashedAt: null,
      };
      let result = [...all, copy];
      if (source.type === 'folder') {
        const children = all.filter((n) => n.parentId === source.id && !n.trashed);
        for (const child of children) {
          result = duplicateNode(child, copy.id, result);
        }
      }
      return result;
    },
    [],
  );

  const paste = useCallback(
    (targetParentId: string | null) => {
      if (!clipboard) return;
      setSelectedIds(new Set());

      if (clipboard.mode === 'cut') {
        setNodes((prev) => {
          const isInsideOwnSubtree = (rootId: string, target: string | null): boolean => {
            let cursor = target;
            while (cursor) {
              if (cursor === rootId) return true;
              cursor = prev.find((n) => n.id === cursor)?.parentId ?? null;
            }
            return false;
          };
          const now = new Date().toISOString();
          return prev.map((n) => {
            if (!clipboard.ids.includes(n.id)) return n;
            // Không cho thả một thư mục vào chính bên trong nó.
            if (n.type === 'folder' && isInsideOwnSubtree(n.id, targetParentId)) return n;
            const siblingNames = prev
              .filter((s) => s.parentId === targetParentId && !s.trashed && s.id !== n.id)
              .map((s) => s.name);
            return {
              ...n,
              parentId: targetParentId,
              name: nextAvailableName(n.name, siblingNames),
              updatedAt: now,
            };
          });
        });
        setClipboard(null);
        return;
      }

      setNodes((prev) => {
        let result = prev;
        for (const id of clipboard.ids) {
          const source = result.find((n) => n.id === id);
          if (source) result = duplicateNode(source, targetParentId, result);
        }
        return result;
      });
    },
    [clipboard, duplicateNode],
  );

  const rename = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const now = new Date().toISOString();
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, name: trimmed, updatedAt: now } : n)));
  }, []);

  return {
    // state
    nodes,
    section,
    currentFolderId,
    viewMode,
    sort,
    selectedId,
    selectedIds,
    selectedNode,
    clipboard,
    searchTerm,
    infoOpen,
    uploads,
    loading,
    error,
    visibility,
    rootFolderId,
    // derived
    breadcrumbs,
    visibleNodes,
    storage,
    counts,
    folderSize,
    // setters
    setSection,
    navigateTo,
    setViewMode,
    setSort,
    setSearchTerm,
    setInfoOpen,
    select,
    toggleMultiSelect,
    clearMultiSelect,
    // actions
    createFolder,
    uploadFiles,
    toggleFavourite,
    moveToTrash,
    restore,
    deleteForever,
    emptyTrash,
    copyToClipboard,
    cutToClipboard,
    paste,
    rename,
  };
}

export type UseDriveReturn = ReturnType<typeof useDrive>;