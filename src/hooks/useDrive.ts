import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as driveApi from '../api/drive';
import type {
  DriveBreadcrumb,
  DriveClipboard,
  DriveNode,
  DriveSection,
  DriveSort,
  DriveStorage,
  DriveUploadTask,
} from '../types/drive';
import {
  computeFolderSize,
  matchesQuery,
  sortNodes,
} from '../components/DriveManager/driveUtils';

const EMPTY_STORAGE: DriveStorage = {
  used: 0,
  total: 20 * 1024 * 1024 * 1024,
  planName: 'Miễn phí',
};

type Toast = { id: string; message: string; tone: 'info' | 'error' };

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `t-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Toàn bộ trạng thái + hành vi của trình quản lý tệp tin.
 * Component chỉ nhận dữ liệu đã tính sẵn và gọi hàm, không tự xử lý logic.
 */
export function useDrive() {
  const [allNodes, setAllNodes] = useState<DriveNode[]>([]);
  const [storage, setStorage] = useState<DriveStorage>(EMPTY_STORAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [section, setSection] = useState<DriveSection>('cloud');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<DriveSort>({ key: 'name', order: 'asc' });

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [clipboard, setClipboard] = useState<DriveClipboard>(null);
  const [uploads, setUploads] = useState<DriveUploadTask[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const lastClickedId = useRef<string | null>(null);

  const pushToast = useCallback((message: string, tone: Toast['tone'] = 'info') => {
    const id = newId();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const refreshStorage = useCallback(async () => {
    try {
      setStorage(await driveApi.fetchStorage());
    } catch {
      // Không chặn giao diện nếu chỉ có phần dung lượng lỗi.
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [list, quota] = await Promise.all([
        driveApi.fetchNodes(),
        driveApi.fetchStorage(),
      ]);
      setAllNodes(list);
      setStorage(quota);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  /* ---------------------------------------------------------------------- */
  /* Điều hướng                                                             */
  /* ---------------------------------------------------------------------- */

  const goToSection = useCallback((next: DriveSection) => {
    setSection(next);
    setFolderId(null);
    setSelectedIds([]);
    setQuery('');
  }, []);

  const openFolder = useCallback((id: string | null) => {
    setSection('cloud');
    setFolderId(id);
    setSelectedIds([]);
  }, []);

  const breadcrumbs = useMemo<DriveBreadcrumb[]>(() => {
    const labels: Record<DriveSection, string> = {
      cloud: 'Ổ Mây',
      recent: 'Gần Đây',
      favourite: 'Ưa Thích',
      trash: 'Thùng rác',
    };

    if (section !== 'cloud') return [{ id: null, name: labels[section] }];

    const chain: DriveBreadcrumb[] = [];
    let current = folderId ? allNodes.find((n) => n.id === folderId) : undefined;

    while (current) {
      chain.unshift({ id: current.id, name: current.name });
      current = current.parentId
        ? allNodes.find((n) => n.id === current!.parentId)
        : undefined;
    }

    return [{ id: null, name: 'Ổ Mây' }, ...chain];
  }, [section, folderId, allNodes]);

  /* ---------------------------------------------------------------------- */
  /* Danh sách đang hiển thị                                                */
  /* ---------------------------------------------------------------------- */

  const visibleNodes = useMemo<DriveNode[]>(() => {
    let list: DriveNode[];

    switch (section) {
      case 'recent':
        list = allNodes
          .filter((n) => !n.trashed && n.type === 'file' && n.openedAt)
          .sort(
            (a, b) =>
              new Date(b.openedAt as string).getTime() -
              new Date(a.openedAt as string).getTime(),
          )
          .slice(0, 30);
        break;
      case 'favourite':
        list = allNodes.filter((n) => !n.trashed && n.favourite);
        break;
      case 'trash':
        list = allNodes.filter((n) => {
          if (!n.trashed) return false;
          // Chỉ hiện mục gốc: nếu cha cũng bị xoá thì ẩn để tránh trùng lặp.
          const parent = n.parentId ? allNodes.find((p) => p.id === n.parentId) : null;
          return !parent || !parent.trashed;
        });
        break;
      case 'cloud':
      default:
        list = allNodes.filter((n) => !n.trashed && n.parentId === folderId);
        break;
    }

    const filtered = list.filter((n) => matchesQuery(n, query));

    // Thư mục hiển thị tổng dung lượng bên trong.
    const withSizes = filtered.map((n) =>
      n.type === 'folder' ? { ...n, size: computeFolderSize(allNodes, n.id) } : n,
    );

    // "Gần Đây" giữ nguyên thứ tự thời gian, các mục khác áp dụng sắp xếp.
    return section === 'recent' ? withSizes : sortNodes(withSizes, sort);
  }, [allNodes, section, folderId, query, sort]);

  const selectedNodes = useMemo(
    () => visibleNodes.filter((n) => selectedIds.includes(n.id)),
    [visibleNodes, selectedIds],
  );

  const counts = useMemo(
    () => ({
      cloud: allNodes.filter((n) => !n.trashed && n.parentId === null).length,
      recent: allNodes.filter((n) => !n.trashed && n.type === 'file' && n.openedAt).length,
      favourite: allNodes.filter((n) => !n.trashed && n.favourite).length,
      trash: allNodes.filter((n) => n.trashed).length,
    }),
    [allNodes],
  );

  /* ---------------------------------------------------------------------- */
  /* Chọn mục                                                               */
  /* ---------------------------------------------------------------------- */

  const selectOne = useCallback((id: string) => {
    lastClickedId.current = id;
    setSelectedIds([id]);
  }, []);

  const toggleSelect = useCallback((id: string) => {
    lastClickedId.current = id;
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  /** Chọn khoảng bằng Shift, tính theo thứ tự đang hiển thị. */
  const selectRangeTo = useCallback(
    (id: string) => {
      const anchor = lastClickedId.current;
      if (!anchor) {
        setSelectedIds([id]);
        lastClickedId.current = id;
        return;
      }

      const ids = visibleNodes.map((n) => n.id);
      const from = ids.indexOf(anchor);
      const to = ids.indexOf(id);

      if (from === -1 || to === -1) {
        setSelectedIds([id]);
        return;
      }

      const [start, end] = from < to ? [from, to] : [to, from];
      setSelectedIds(ids.slice(start, end + 1));
    },
    [visibleNodes],
  );

  const selectAll = useCallback(() => {
    setSelectedIds(visibleNodes.map((n) => n.id));
  }, [visibleNodes]);

  const clearSelection = useCallback(() => setSelectedIds([]), []);

  /* ---------------------------------------------------------------------- */
  /* Thao tác trên tệp tin / thư mục                                        */
  /* ---------------------------------------------------------------------- */

  const runAction = useCallback(
    async (action: () => Promise<unknown>, successMessage?: string) => {
      try {
        await action();
        const list = await driveApi.fetchNodes();
        setAllNodes(list);
        await refreshStorage();
        if (successMessage) pushToast(successMessage);
      } catch (err) {
        pushToast(
          err instanceof Error ? err.message : 'Thao tác không thành công',
          'error',
        );
      }
    },
    [pushToast, refreshStorage],
  );

  const createFolder = useCallback(
    (name: string) =>
      runAction(
        () => driveApi.createFolder({ parentId: folderId, name }),
        `Đã tạo thư mục “${name}”`,
      ),
    [folderId, runAction],
  );

  const rename = useCallback(
    (id: string, name: string) =>
      runAction(() => driveApi.renameNode(id, name), 'Đã đổi tên'),
    [runAction],
  );

  const toggleFavourite = useCallback(
    (ids: string[]) => {
      if (!ids.length) return Promise.resolve();
      const shouldAdd = ids.some(
        (id) => !allNodes.find((n) => n.id === id)?.favourite,
      );
      return runAction(
        () => driveApi.setFavourite(ids, shouldAdd),
        shouldAdd ? 'Đã thêm vào Ưa Thích' : 'Đã bỏ khỏi Ưa Thích',
      );
    },
    [allNodes, runAction],
  );

  const trash = useCallback(
    (ids: string[]) => {
      if (!ids.length) return Promise.resolve();
      setSelectedIds([]);
      return runAction(() => driveApi.trashNodes(ids), 'Đã chuyển vào Thùng rác');
    },
    [runAction],
  );

  const restore = useCallback(
    (ids: string[]) => {
      if (!ids.length) return Promise.resolve();
      setSelectedIds([]);
      return runAction(() => driveApi.restoreNodes(ids), 'Đã khôi phục');
    },
    [runAction],
  );

  const deleteForever = useCallback(
    (ids: string[]) => {
      if (!ids.length) return Promise.resolve();
      setSelectedIds([]);
      return runAction(() => driveApi.deleteNodes(ids), 'Đã xoá vĩnh viễn');
    },
    [runAction],
  );

  const emptyTrash = useCallback(() => {
    setSelectedIds([]);
    return runAction(() => driveApi.emptyTrash(), 'Đã dọn sạch Thùng rác');
  }, [runAction]);

  const move = useCallback(
    (ids: string[], targetParentId: string | null) => {
      if (!ids.length) return Promise.resolve();
      setSelectedIds([]);
      return runAction(() => driveApi.moveNodes(ids, targetParentId), 'Đã di chuyển');
    },
    [runAction],
  );

  /* ---------------------------------------------------------------------- */
  /* Chép / Cắt / Dán                                                       */
  /* ---------------------------------------------------------------------- */

  const copySelection = useCallback(
    (ids: string[]) => {
      if (!ids.length) return;
      setClipboard({ mode: 'copy', ids });
      pushToast(`Đã chép ${ids.length} mục`);
    },
    [pushToast],
  );

  const cutSelection = useCallback(
    (ids: string[]) => {
      if (!ids.length) return;
      setClipboard({ mode: 'cut', ids });
      pushToast(`Đã cắt ${ids.length} mục`);
    },
    [pushToast],
  );

  const paste = useCallback(async () => {
    if (!clipboard?.ids.length) return;

    const { mode, ids } = clipboard;
    await runAction(
      () =>
        mode === 'copy'
          ? driveApi.copyNodes(ids, folderId)
          : driveApi.moveNodes(ids, folderId),
      mode === 'copy' ? 'Đã dán bản sao' : 'Đã di chuyển vào đây',
    );

    if (mode === 'cut') setClipboard(null);
  }, [clipboard, folderId, runAction]);

  /* ---------------------------------------------------------------------- */
  /* Tải lên                                                                */
  /* ---------------------------------------------------------------------- */

  const uploadFiles = useCallback(
    async (files: File[], targetParentId: string | null = folderId) => {
      if (!files.length) return;

      const tasks: DriveUploadTask[] = files.map((f) => ({
        id: newId(),
        name: f.name,
        size: f.size,
        progress: 0,
        status: 'uploading',
      }));

      setUploads((prev) => [...prev, ...tasks]);

      await Promise.all(
        files.map(async (source, index) => {
          const task = tasks[index];
          try {
            await driveApi.uploadFile({
              parentId: targetParentId,
              file: source,
              onProgress: (percent) =>
                setUploads((prev) =>
                  prev.map((t) => (t.id === task.id ? { ...t, progress: percent } : t)),
                ),
            });
            setUploads((prev) =>
              prev.map((t) =>
                t.id === task.id ? { ...t, progress: 100, status: 'done' } : t,
              ),
            );
          } catch (err) {
            setUploads((prev) =>
              prev.map((t) =>
                t.id === task.id
                  ? {
                      ...t,
                      status: 'error',
                      error: err instanceof Error ? err.message : 'Tải lên lỗi',
                    }
                  : t,
              ),
            );
          }
        }),
      );

      const list = await driveApi.fetchNodes();
      setAllNodes(list);
      await refreshStorage();
      pushToast(`Đã tải lên ${files.length} tệp tin`);

      // Dọn khay tiến trình sau khi xong.
      setTimeout(() => {
        setUploads((prev) => prev.filter((t) => t.status === 'uploading'));
      }, 2600);
    },
    [folderId, pushToast, refreshStorage],
  );

  const dismissUpload = useCallback((id: string) => {
    setUploads((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openNode = useCallback(
    (node: DriveNode) => {
      if (node.type === 'folder') {
        if (node.trashed) return;
        openFolder(node.id);
        return;
      }
      driveApi.touchNode(node.id).then(() => {
        setAllNodes((prev) =>
          prev.map((n) =>
            n.id === node.id ? { ...n, openedAt: new Date().toISOString() } : n,
          ),
        );
      });
      pushToast(`Đang mở “${node.name}”`);
    },
    [openFolder, pushToast],
  );

  return {
    // dữ liệu
    allNodes,
    visibleNodes,
    selectedNodes,
    storage,
    counts,
    breadcrumbs,
    loading,
    error,
    uploads,
    toasts,
    clipboard,

    // trạng thái điều hướng
    section,
    folderId,
    query,
    sort,
    selectedIds,

    // đổi trạng thái
    setQuery,
    setSort,
    goToSection,
    openFolder,
    openNode,
    reload,

    // chọn
    selectOne,
    toggleSelect,
    selectRangeTo,
    selectAll,
    clearSelection,

    // thao tác
    createFolder,
    rename,
    toggleFavourite,
    trash,
    restore,
    deleteForever,
    emptyTrash,
    move,
    copySelection,
    cutSelection,
    paste,
    uploadFiles,
    dismissUpload,
    pushToast,
  };
}

export type UseDriveReturn = ReturnType<typeof useDrive>;
