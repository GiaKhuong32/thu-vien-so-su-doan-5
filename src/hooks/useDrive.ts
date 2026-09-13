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
const STORAGE_PLAN_NAME = 'Dung lượng'; 

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

export function useDrive(initialFolderId?: string | null) {
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

  const selectAll = useCallback(() => {
    const visibleNodeIds = nodes
      .filter((n) => {
        if (section === 'trash') {
          if (!n.trashed) return false;
          return !n.parentId || !nodes.some((p) => p.id === n.parentId && p.trashed);
        }
        return !n.trashed && n.parentId === currentFolderId;
      })
      .map((n) => n.id);

    const isAllSelected = visibleNodeIds.length > 0 && visibleNodeIds.every((id) => selectedIds.has(id));

    if (isAllSelected) {
      // Nếu đã chọn tất cả, bỏ chọn tất cả
      setSelectedIds(new Set());
    } else {
      // Chọn tất cả visible nodes
      setSelectedIds(new Set(visibleNodeIds));
    }
  }, [nodes, currentFolderId, selectedIds, section]);

function mergeTrashed(prev: DriveNode[], deleted: DriveNode[]): DriveNode[] {
  const prevById = new Map(prev.map((n) => [n.id, n]));
  const deletedIds = new Set(deleted.map((n) => n.id));
  const live = prev.filter((n) => !n.trashed && !deletedIds.has(n.id));
  const trash = deleted.map((node) => {
    const previous = prevById.get(node.id);
    return {
      ...node,
      parentId: node.parentId ?? previous?.parentId ?? null,
    };
  });
  return [...live, ...trash];
}

function firstRejectedReason(results: PromiseSettledResult<unknown>[]): unknown {
  const rejected = results.find((result) => result.status === 'rejected');
  return rejected && rejected.status === 'rejected' ? rejected.reason : null;
}

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

  const loadTrash = useCallback(async (silent = false, excludeIds?: Set<string>) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const deleted = (await driveApi.getDeleted()).filter((node) => !excludeIds?.has(node.id));
      setNodes((prev) => mergeTrashed(prev, deleted));
    } catch (err) {
      if (!silent) setError(errorMessage(err, 'Không tải được thùng rác'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  const setSection = useCallback((next: DriveSection) => {
    setSectionState(next);
    setSelectedId(null);
    setSelectedIds(new Set());
    if (next === 'trash') {
      void loadTrash();
    }
  }, [loadTrash]);

  const loadRoots = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (isAuthenticated()) {
        // Load cả private và public roots khi đã login
        const [privateRoot, publicRoots] = await Promise.allSettled([
          driveApi.getPrivateRoot(),
          driveApi.getPublicRoots(),
        ]);

        const allRoots: DriveNode[] = [];

        // Thêm private root nếu thành công
        if (privateRoot.status === 'fulfilled' && privateRoot.value?.id) {
          allRoots.push({
            ...privateRoot.value,
            parentId: null,
            visibility: 'private' as const,
          });
        }

        // Thêm public roots nếu thành công
        if (publicRoots.status === 'fulfilled' && publicRoots.value.length > 0) {
          const publicNodes = publicRoots.value.map((root) => ({
            ...root,
            parentId: null,
            visibility: 'public' as const,
          }));
          allRoots.push(...publicNodes);
        }

        setVisibility('private');
        setRootFolderId(allRoots[0]?.id ?? null);
        setCurrentFolderId(null); // Set về null khi về root
        setNodes(allRoots);
      } else {
        // Chỉ load public roots khi chưa login
        const publicRoots = await driveApi.getPublicRoots();
        const publicNodes = publicRoots.map((root) => ({
          ...root,
          parentId: null,
          visibility: 'public' as const,
        }));

        setVisibility('public');
        setRootFolderId(publicNodes[0]?.id ?? null);
        setCurrentFolderId(null);
        setNodes(publicNodes);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được thư mục');
    } finally {
      setLoading(false);
    }
  }, []);

  const resolveBackendParentId = useCallback(
    (parentId: string | null) => {
      // Nếu có parentId cụ thể, dùng nó
      if (parentId) return parentId;

      // Nếu không có parentId (đang ở root), dùng currentFolderId
      // currentFolderId sẽ là ID của folder đang đứng (private root hoặc public root)
      if (currentFolderId) return currentFolderId;

      // Fallback về rootFolderId (để bảo đảm)
      return rootFolderId;
    },
    [currentFolderId, rootFolderId],
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
      const { current, ancestors, children } = await driveApi.getFolderContents(folderId);

      setNodes((prev) => {
        const next = new Map(prev.map((node) => [node.id, node]));
        const trashById = new Map(
          prev.filter((node) => node.trashed).map((node) => [node.id, node]),
        );

        for (const node of [...ancestors, ...(current ? [current] : [])]) {
          const existing = next.get(node.id);
          next.set(
            node.id,
            existing
              ? { ...existing, ...node, visibility: existing.visibility ?? node.visibility, trashed: existing.trashed }
              : node,
          );
        }

        for (const [id, node] of next) {
          if (node.parentId === folderId && !node.trashed) next.delete(id);
        }

        for (const child of children) {
          next.set(child.id, {
            ...child,
            trashed: false,
            trashedAt: null,
            visibility: trashById.get(child.id)?.visibility ?? child.visibility,
          });
        }

        return Array.from(next.values());
      });
    } catch (err) {
      setError(errorMessage(err, 'Không tải được nội dung thư mục'));
    } finally {
      setLoading(false);
    }
  }, [loadRoots]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (initialFolderId) {
        await navigateTo(initialFolderId);
      } else {
        await loadRoots();
      }
      if (cancelled) return;
      await loadTrash(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [initialFolderId]);

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
      const trashed = nodes.filter((n) => n.trashed);
      const trashedIds = new Set(trashed.map((n) => n.id));
      list = trashed.filter((n) => !n.parentId || !trashedIds.has(n.parentId));
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
      cloud: currentFolderId === null
        ? nodes.filter((n) => !n.trashed && n.parentId === null).length
        : nodes.filter((n) => !n.trashed && n.parentId === currentFolderId).length,
      favourite: nodes.filter((n) => n.favourite && !n.trashed).length,
      trash: nodes.filter((n) => {
        if (!n.trashed) return false;
        return !n.parentId || !nodes.some((p) => p.id === n.parentId && p.trashed);
      }).length,
    }),
    [nodes, currentFolderId],
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

      // Reload lại folder hiện tại từ backend để đảm bảo dữ liệu đồng bộ
      if (currentFolderId) {
        try {
          const children = await driveApi.getChildren(currentFolderId);
          setNodes((prev) => [
            ...prev.filter((n) => n.parentId !== currentFolderId),
            ...children,
          ]);
        } catch (err) {
          console.error('Error reloading folder after create:', err);
        }
      } else {
        // Nếu đang ở root, thêm node mới vào state
        setNodes((prev) => [
          ...prev,
          {
            ...node,
            parentId,
          },
        ]);
      }

      return node;
    },
    [resolveBackendParentId, visibility, currentFolderId],
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
    if (section === 'trash') {
      await loadTrash(true);
      return;
    }

    const backendParentId = resolveBackendParentId(currentFolderId);

    if (!backendParentId || currentFolderId === null) {
      await loadRoots();
      await loadTrash(true);
      return;
    }

    const children = await driveApi.getChildren(backendParentId);

    setNodes((prev) => {
      const trash = prev.filter((node) => node.trashed);
      const kept = prev.filter(
        (node) => node.parentId !== currentFolderId && !node.trashed,
      );
      const restoredIds = new Set(children.map((node) => node.id));
      const stillTrash = trash.filter((node) => !restoredIds.has(node.id));
      return [...kept, ...stillTrash, ...children];
    });
  }, [currentFolderId, loadRoots, loadTrash, resolveBackendParentId, section]);

  const moveToTrash = useCallback(
    async (idOrIds: string | string[]) => {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      const affectedIds = collectDescendantIds(ids, nodes);
      const selectedNodes = nodes.filter((node) => ids.includes(node.id) && !node.trashed);

      if (selectedNodes.length === 0) return;

      setError(null);
      setLoading(true);

      try {
        const results = await Promise.allSettled(
          selectedNodes.map((node) =>
            node.type === 'folder'
              ? driveApi.trashFolder(node.id)
              : driveApi.trashFile(node.id),
          ),
        );

        const failed = firstRejectedReason(results);
        const now = new Date().toISOString();
        const succeededIds = selectedNodes
          .filter((_, index) => results[index]?.status === 'fulfilled')
          .map((node) => node.id);
        const succeededTree = collectDescendantIds(succeededIds, nodes);

        setNodes((prev) =>
          prev.map((node) =>
            succeededTree.includes(node.id)
              ? { ...node, trashed: true, trashedAt: now }
              : node,
          ),
        );

        setSelectedId((cur) => (cur && succeededTree.includes(cur) ? null : cur));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          succeededTree.forEach((id) => next.delete(id));
          return next;
        });

        await loadTrash(true);

        if (failed && succeededIds.length === 0) {
          throw failed instanceof Error ? failed : new Error('Chuyển vào thùng rác thất bại');
        }
        if (failed) {
          setError(errorMessage(failed, 'Một số mục không chuyển vào thùng rác được'));
        }
      } catch (err) {
        setError(errorMessage(err, 'Chuyển vào thùng rác thất bại'));
        await refreshCurrentFolder();
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [nodes, refreshCurrentFolder, loadTrash],
  );

  const restore = useCallback(
    async (idOrIds: string | string[]) => {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      const selectedNodes = nodes.filter((node) => ids.includes(node.id) && node.trashed);

      if (selectedNodes.length === 0) return;

      setError(null);
      setLoading(true);

      try {
        const results = await Promise.allSettled(
          selectedNodes.map((node) =>
            node.type === 'folder'
              ? driveApi.restoreFolder(node.id)
              : driveApi.restoreFile(node.id),
          ),
        );

        const failed = firstRejectedReason(results);
        const succeededIds = new Set(
          selectedNodes
            .filter((_, index) => results[index]?.status === 'fulfilled')
            .map((node) => node.id),
        );

        setNodes((prev) =>
          prev.map((node) =>
            succeededIds.has(node.id)
              ? { ...node, trashed: false, trashedAt: null }
              : node,
          ),
        );

        setSelectedIds((prev) => {
          const next = new Set(prev);
          succeededIds.forEach((id) => next.delete(id));
          return next;
        });

        await loadTrash(true, succeededIds);

        if (section === 'cloud' && currentFolderId) {
          await refreshCurrentFolder();
        }

        if (failed && succeededIds.size === 0) {
          throw failed instanceof Error ? failed : new Error('Khôi phục thất bại');
        }
        if (failed) {
          setError(errorMessage(failed, 'Một số mục không khôi phục được'));
        }
      } catch (err) {
        setError(errorMessage(err, 'Khôi phục thất bại'));
        await loadTrash(true);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [nodes, currentFolderId, loadTrash, refreshCurrentFolder, section],
  );

  const deleteForever = useCallback(
    async (idOrIds: string | string[]) => {
      const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
      const selectedNodes = nodes.filter((node) => ids.includes(node.id));

      if (selectedNodes.length === 0) return;

      setError(null);
      setLoading(true);

      try {
        const results = await Promise.allSettled(
          selectedNodes.map((node) =>
            node.type === 'folder'
              ? driveApi.hardDeleteFolder(node.id)
              : driveApi.hardDeleteFile(node.id),
          ),
        );

        const failed = firstRejectedReason(results);
        const succeededIds = selectedNodes
          .filter((_, index) => results[index]?.status === 'fulfilled')
          .map((node) => node.id);
        const removeIds = collectDescendantIds(succeededIds, nodes);

        setNodes((prev) => prev.filter((node) => !removeIds.includes(node.id)));
        setSelectedId((cur) => (cur && removeIds.includes(cur) ? null : cur));
        setSelectedIds((prev) => {
          const next = new Set(prev);
          removeIds.forEach((id) => next.delete(id));
          return next;
        });

        if (section === 'trash') {
          await loadTrash(true);
        } else {
          await refreshCurrentFolder();
        }

        if (failed && succeededIds.length === 0) {
          throw failed instanceof Error ? failed : new Error('Xóa vĩnh viễn thất bại');
        }
        if (failed) {
          setError(errorMessage(failed, 'Một số mục không xóa được'));
        }
      } catch (err) {
        setError(errorMessage(err, 'Xóa vĩnh viễn thất bại'));
        if (section === 'trash') await loadTrash(true);
        else await refreshCurrentFolder();
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [nodes, refreshCurrentFolder, loadTrash, section],
  );

  const emptyTrash = useCallback(async () => {
    const trashed = nodes.filter((n) => {
      if (!n.trashed) return false;
      return !n.parentId || !nodes.some((p) => p.id === n.parentId && p.trashed);
    });

    setError(null);
    setLoading(true);

    try {
      const results = await Promise.allSettled(
        trashed.map((node) =>
          node.type === 'folder'
            ? driveApi.hardDeleteFolder(node.id)
            : driveApi.hardDeleteFile(node.id),
        ),
      );

      const failed = firstRejectedReason(results);
      await loadTrash(true);

      if (failed) {
        setError(errorMessage(failed, 'Không xóa hết được thùng rác'));
        throw failed instanceof Error ? failed : new Error('Không xóa hết được thùng rác');
      }

      setNodes((prev) => prev.filter((n) => !n.trashed));
    } finally {
      setLoading(false);
    }
  }, [nodes, loadTrash]);

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
    async (targetParentId: string | null) => {
      if (!clipboard) return;

      const backendParentId = resolveBackendParentId(targetParentId);
      if (!backendParentId) {
        setError('Không tìm thấy thư mục đích để dán');
        return;
      }

      const selected = nodes.filter((node) => clipboard.ids.includes(node.id) && !node.trashed);
      if (selected.length === 0) {
        setClipboard(null);
        return;
      }

      const isInsideOwnSubtree = (rootId: string, target: string | null): boolean => {
        let cursor = target;
        while (cursor) {
          if (cursor === rootId) return true;
          cursor = nodes.find((n) => n.id === cursor)?.parentId ?? null;
        }
        return false;
      };

      const movable = selected.filter(
        (node) => !(node.type === 'folder' && isInsideOwnSubtree(node.id, backendParentId)),
      );

      if (movable.length === 0) {
        setError('Không thể dán thư mục vào chính nó');
        return;
      }

      setSelectedIds(new Set());
      setError(null);
      setLoading(true);

      try {
        const folders = movable.filter((node) => node.type === 'folder');
        const files = movable.filter((node) => node.type === 'file');
        const cut = clipboard.mode === 'cut';

        const jobs: Promise<unknown>[] = folders.map((node) =>
          cut ? driveApi.moveFolder(node.id, backendParentId) : driveApi.copyFolder(node.id, backendParentId),
        );

        if (files.length > 0) {
          const fileIds = files.map((file) => file.id);
          jobs.push(cut ? driveApi.moveFiles(fileIds, backendParentId) : driveApi.copyFiles(fileIds, backendParentId));
        }

        const results = await Promise.allSettled(jobs);

        const failed = firstRejectedReason(results);
        if (clipboard.mode === 'cut') setClipboard(null);

        if (targetParentId && targetParentId !== currentFolderId) {
          const children = await driveApi.getChildren(backendParentId);
          setNodes((prev) => {
            const trash = prev.filter((node) => node.trashed);
            const kept = prev.filter(
              (node) => node.parentId !== backendParentId && !node.trashed,
            );
            const restoredIds = new Set(children.map((node) => node.id));
            const stillTrash = trash.filter((node) => !restoredIds.has(node.id));
            return [...kept, ...stillTrash, ...children];
          });
        }

        await refreshCurrentFolder();

        if (failed) {
          const message = errorMessage(failed, 'Một số mục không dán được');
          setError(message);
          throw failed instanceof Error ? failed : new Error(message);
        }
      } catch (err) {
        setError(errorMessage(err, 'Dán thất bại'));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [clipboard, nodes, resolveBackendParentId, currentFolderId, refreshCurrentFolder],
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
    selectAll,
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