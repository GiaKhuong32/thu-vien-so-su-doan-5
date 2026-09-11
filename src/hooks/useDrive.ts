import { useCallback, useMemo, useState } from 'react';
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


const STORAGE_TOTAL_BYTES = 20 * 1024 * 1024 * 1024;
const STORAGE_PLAN_NAME = 'Dung lượng';
const IMAGE_PREVIEW_MAX_BYTES = 3 * 1024 * 1024; 

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
  const [clipboard, setClipboard] = useState<DriveClipboard>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [infoOpen, setInfoOpen] = useState(false);
  const [uploads, setUploads] = useState<DriveUploadTask[]>([]);

  const setSection = useCallback((next: DriveSection) => {
    setSectionState(next);
    setSelectedId(null);
  }, []);

  const navigateTo = useCallback((folderId: string | null) => {
    setSectionState('cloud');
    setCurrentFolderId(folderId);
    setSelectedId(null);
  }, []);

  const select = useCallback((id: string | null) => setSelectedId(id), []);

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

  const createFolder = useCallback(({ parentId, name }: CreateFolderInput) => {
    const now = new Date().toISOString();
    const node: DriveNode = {
      id: makeId(),
      parentId,
      name: name.trim() || 'Thư mục mới',
      type: 'folder',
      size: 0,
      createdAt: now,
      updatedAt: now,
      favourite: false,
      trashed: false,
    };
    setNodes((prev) => [...prev, node]);
    return node;
  }, []);

  const uploadFiles = useCallback(
    (files: FileList | File[], opts?: { parentId?: string | null }) => {
      const list = Array.from(files);
      if (list.length === 0) return;
      const parentId = opts && 'parentId' in opts ? (opts.parentId ?? null) : section === 'cloud' ? currentFolderId : null;

      const tasks: DriveUploadTask[] = list.map((file) => ({
        id: makeId(),
        name: file.name,
        size: file.size,
        progress: 0,
        status: 'uploading',
      }));
      setUploads((prev) => [...prev, ...tasks]);

      list.forEach((file, idx) => {
        const taskId = tasks[idx].id;
        const finish = (previewUrl: string | null) => {
          const now = new Date().toISOString();
          const node: DriveNode = {
            id: makeId(),
            parentId,
            name: file.name,
            type: 'file',
            size: file.size,
            mimeType: file.type || 'application/octet-stream',
            createdAt: now,
            updatedAt: now,
            favourite: false,
            trashed: false,
            previewUrl,
          };
          setNodes((prev) => [...prev, node]);

          // Chạy thanh tiến trình giả lập rồi dọn khỏi khay sau khi xong.
          let progress = 0;
          const tick = () => {
            progress = Math.min(100, progress + 20 + Math.random() * 30);
            setUploads((prev) =>
              prev.map((t) =>
                t.id === taskId
                  ? { ...t, progress, status: progress >= 100 ? 'done' : 'uploading' }
                  : t,
              ),
            );
            if (progress < 100) {
              setTimeout(tick, 110);
            } else {
              setTimeout(() => setUploads((prev) => prev.filter((t) => t.id !== taskId)), 1200);
            }
          };
          tick();
        };

        const isPreviewableImage = file.type.startsWith('image/') && file.size < IMAGE_PREVIEW_MAX_BYTES;
        if (isPreviewableImage) {
          const reader = new FileReader();
          reader.onload = () => finish(typeof reader.result === 'string' ? reader.result : null);
          reader.onerror = () => finish(null);
          reader.readAsDataURL(file);
        } else {
          finish(null);
        }
      });

      if (section !== 'cloud') setSectionState('cloud');
    },
    [section, currentFolderId],
  );

  const toggleFavourite = useCallback((id: string) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, favourite: !n.favourite } : n)));
  }, []);

  const moveToTrash = useCallback(
    (id: string) => {
      const affected = new Set<string>([id]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const n of nodes) {
          if (n.parentId && affected.has(n.parentId) && !affected.has(n.id)) {
            affected.add(n.id);
            grew = true;
          }
        }
      }
      const now = new Date().toISOString();
      setNodes((prev) =>
        prev.map((n) => (affected.has(n.id) ? { ...n, trashed: true, trashedAt: now } : n)),
      );
      setSelectedId((cur) => (cur && affected.has(cur) ? null : cur));
    },
    [nodes],
  );

  const restore = useCallback(
    (id: string) => {
      const affected = new Set<string>([id]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const n of nodes) {
          if (n.parentId && affected.has(n.parentId) && !affected.has(n.id)) {
            affected.add(n.id);
            grew = true;
          }
        }
      }
      setNodes((prev) =>
        prev.map((n) => (affected.has(n.id) ? { ...n, trashed: false, trashedAt: null } : n)),
      );
    },
    [nodes],
  );

  const deleteForever = useCallback(
    (id: string) => {
      const toRemove = new Set<string>([id]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const n of nodes) {
          if (n.parentId && toRemove.has(n.parentId) && !toRemove.has(n.id)) {
            toRemove.add(n.id);
            grew = true;
          }
        }
      }
      setNodes((prev) => prev.filter((n) => !toRemove.has(n.id)));
      setSelectedId((cur) => (cur && toRemove.has(cur) ? null : cur));
    },
    [nodes],
  );

  const emptyTrash = useCallback(() => {
    setNodes((prev) => prev.filter((n) => !n.trashed));
  }, []);

  const copyToClipboard = useCallback((id: string) => {
    setClipboard({ mode: 'copy', ids: [id] });
  }, []);

  const cutToClipboard = useCallback((id: string) => {
    setClipboard({ mode: 'cut', ids: [id] });
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
            if (n.type === 'folder' && isInsideOwnSubtree(n.id, targetParentId)) return n;
            const siblingNames = prev.filter((s) => s.parentId === targetParentId && !s.trashed && s.id !== n.id).map((s) => s.name);
            return { ...n, parentId: targetParentId, name: nextAvailableName(n.name, siblingNames), updatedAt: now };
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
    selectedNode,
    clipboard,
    searchTerm,
    infoOpen,
    uploads,
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
