import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CloudUpload,
  Copy,
  Download,
  FolderOpen,
  Heart,
  LoaderCircle,
  Pencil,
  Scissors,
  Trash2,
  Undo2,
  Upload,
  X,
} from 'lucide-react';
import { useDrive } from '../../hooks/useDrive';
import type { DriveNode, DriveSection, DriveViewMode } from '../../types/drive';
import {
  DriveDialog,
  DriveMenu,
  DriveMenuItem,
  DriveMenuSeparator,
  type MenuPosition,
} from './DrivePrimitives';
import DriveGrid from './DriveGrid';
import DriveInfoPanel from './DriveInfoPanel';
import DriveList from './DriveList';
import DriveSidebar from './DriveSidebar';
import { DriveBreadcrumbs, DriveToolbar, DriveTopBar, DriveViewBar } from './DriveToolbar';
import { describeSelection, formatSize } from './driveUtils';
import './DriveManager.css';

/** Kiểu hộp thoại đang mở. */
type DialogState =
  | { kind: 'new-folder' }
  | { kind: 'rename'; node: DriveNode }
  | { kind: 'confirm-trash'; ids: string[] }
  | { kind: 'confirm-delete'; ids: string[] }
  | { kind: 'confirm-empty-trash' }
  | null;

/** Nội dung đang được kéo: các mục trong ứng dụng. */
const DRAG_MIME = 'application/x-mgd-nodes';

type Props = {
  /** Tiêu đề hiển thị ở thanh bên, mặc định giống MEGA. */
  className?: string;
};

export default function DriveManager({ className }: Props) {
  const drive = useDrive();

  const [view, setView] = useState<DriveViewMode>('list');
  const [sideCollapsed, setSideCollapsed] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [dialog, setDialog] = useState<DialogState>(null);

  // menu chuột phải / menu ba chấm
  const [nodeMenu, setNodeMenu] = useState<{ node: DriveNode; at: MenuPosition } | null>(
    null,
  );
  const [blankMenu, setBlankMenu] = useState<MenuPosition | null>(null);

  // trạng thái kéo thả
  const [isFileOver, setIsFileOver] = useState(false);
  const [dropNodeId, setDropNodeId] = useState<string | null>(null);
  const [dropCrumbId, setDropCrumbId] = useState<string | null | undefined>(undefined);
  const [dropSection, setDropSection] = useState<DriveSection | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);
  const dragDepth = useRef(0);
  const draggedIds = useRef<string[]>([]);
  const emptyInputRef = useRef<HTMLInputElement>(null);

  const isTrash = drive.section === 'trash';
  const canWrite = drive.section === 'cloud';
  const cutIds = drive.clipboard?.mode === 'cut' ? drive.clipboard.ids : [];

  /* == PHẦN 1: chọn mục + bàn phím ====================================== */

  const handleRowClick = useCallback(
    (node: DriveNode, event: React.MouseEvent) => {
      if (event.shiftKey) {
        drive.selectRangeTo(node.id);
        return;
      }
      if (event.ctrlKey || event.metaKey) {
        drive.toggleSelect(node.id);
        return;
      }
      drive.selectOne(node.id);
    },
    [drive],
  );

  const handleToggleAll = useCallback(() => {
    if (drive.selectedIds.length === drive.visibleNodes.length) {
      drive.clearSelection();
    } else {
      drive.selectAll();
    }
  }, [drive]);

  const openRenameDialog = useCallback((node: DriveNode) => {
    setDialog({ kind: 'rename', node });
  }, []);

  const requestTrash = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setDialog({ kind: 'confirm-trash', ids });
  }, []);

  const requestDelete = useCallback((ids: string[]) => {
    if (!ids.length) return;
    setDialog({ kind: 'confirm-delete', ids });
  }, []);

  /** Tải xuống là việc của backend nên ở đây chỉ báo cho người dùng. */
  const handleDownload = useCallback(
    (nodes: DriveNode[]) => {
      drive.pushToast(
        nodes.length === 1
          ? `Đang tải xuống “${nodes[0].name}”`
          : `Đang tải xuống ${nodes.length} mục`,
      );
    },
    [drive],
  );

  // Phím tắt: Ctrl+A/C/X/V, F2, Delete, Escape.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (typing || dialog) return;

      const mod = e.ctrlKey || e.metaKey;
      const ids = drive.selectedIds;

      if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        drive.selectAll();
        return;
      }
      if (mod && e.key.toLowerCase() === 'c' && ids.length && !isTrash) {
        e.preventDefault();
        drive.copySelection(ids);
        return;
      }
      if (mod && e.key.toLowerCase() === 'x' && ids.length && !isTrash) {
        e.preventDefault();
        drive.cutSelection(ids);
        return;
      }
      if (mod && e.key.toLowerCase() === 'v' && canWrite) {
        e.preventDefault();
        drive.paste();
        return;
      }
      if (e.key === 'F2' && ids.length === 1 && !isTrash) {
        e.preventDefault();
        const node = drive.visibleNodes.find((n) => n.id === ids[0]);
        if (node) openRenameDialog(node);
        return;
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && ids.length) {
        e.preventDefault();
        if (isTrash) requestDelete(ids);
        else requestTrash(ids);
        return;
      }
      if (e.key === 'Escape') {
        drive.clearSelection();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drive, dialog, isTrash, canWrite, openRenameDialog, requestDelete, requestTrash]);

  /* == PHẦN 2: kéo thả ================================================== */

  /** Kéo tệp tin từ máy tính vào? (khác với kéo mục trong ứng dụng) */
  const isExternalFileDrag = (event: React.DragEvent) =>
    Array.from(event.dataTransfer.types).includes('Files');

  const resetDragState = useCallback(() => {
    dragDepth.current = 0;
    setIsFileOver(false);
    setDropNodeId(null);
    setDropCrumbId(undefined);
    setDropSection(null);
  }, []);

  const handleDragEnter = useCallback(
    (event: React.DragEvent) => {
      if (!isExternalFileDrag(event) || !canWrite) return;
      event.preventDefault();
      dragDepth.current += 1;
      setIsFileOver(true);
    },
    [canWrite],
  );

  const handleDragOver = useCallback(
    (event: React.DragEvent) => {
      if (!canWrite) return;
      if (isExternalFileDrag(event) || draggedIds.current.length) {
        event.preventDefault();
        event.dataTransfer.dropEffect = isExternalFileDrag(event) ? 'copy' : 'move';
      }
    },
    [canWrite],
  );

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    if (!isExternalFileDrag(event)) return;
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setIsFileOver(false);
  }, []);

  /** Thả vào khoảng trống của thư mục đang mở. */
  const handleDropOnBlank = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const files = Array.from(event.dataTransfer.files || []);
      resetDragState();

      if (!canWrite) return;

      if (files.length) {
        drive.uploadFiles(files, drive.folderId);
        return;
      }

      // Kéo mục trong ứng dụng ra vùng trống = không đổi thư mục, bỏ qua.
      draggedIds.current = [];
    },
    [canWrite, drive, resetDragState],
  );

  const handleDragStartNode = useCallback(
    (node: DriveNode, event: React.DragEvent) => {
      if (isTrash) {
        event.preventDefault();
        return;
      }

      // Nếu mục đang kéo chưa được chọn thì coi như chọn riêng mục đó.
      const ids = drive.selectedIds.includes(node.id) ? drive.selectedIds : [node.id];
      if (!drive.selectedIds.includes(node.id)) drive.selectOne(node.id);

      draggedIds.current = ids;
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(DRAG_MIME, JSON.stringify(ids));
      event.dataTransfer.setData('text/plain', node.name);
    },
    [drive, isTrash],
  );

  const handleDragOverNode = useCallback(
    (node: DriveNode | null, event: React.DragEvent) => {
      if (!node) {
        setDropNodeId(null);
        return;
      }
      if (node.type !== 'folder') return;
      // Không cho thả chính mục đang kéo vào bản thân nó.
      if (draggedIds.current.includes(node.id)) return;

      event.dataTransfer.dropEffect = isExternalFileDrag(event) ? 'copy' : 'move';
      setDropNodeId(node.id);
    },
    [],
  );

  const handleDropOnNode = useCallback(
    (node: DriveNode, event: React.DragEvent) => {
      event.stopPropagation();
      const files = Array.from(event.dataTransfer.files || []);
      const ids = draggedIds.current;

      resetDragState();

      if (node.type !== 'folder') return;

      if (files.length) {
        drive.uploadFiles(files, node.id);
        return;
      }

      const movable = ids.filter((id) => id !== node.id);
      if (movable.length) drive.move(movable, node.id);
      draggedIds.current = [];
    },
    [drive, resetDragState],
  );

  const handleDropOnCrumb = useCallback(
    (id: string | null, event: React.DragEvent) => {
      event.stopPropagation();
      const files = Array.from(event.dataTransfer.files || []);
      const ids = draggedIds.current;

      resetDragState();

      if (files.length) {
        drive.uploadFiles(files, id);
        return;
      }
      if (ids.length) drive.move(ids, id);
      draggedIds.current = [];
    },
    [drive, resetDragState],
  );

  /** Thả vào mục ở thanh bên: Ổ Mây = về gốc, Thùng rác = xoá mềm. */
  const handleDropOnSection = useCallback(
    (section: DriveSection, event: React.DragEvent) => {
      const files = Array.from(event.dataTransfer.files || []);
      const ids = draggedIds.current;

      resetDragState();

      if (section === 'cloud') {
        if (files.length) drive.uploadFiles(files, null);
        else if (ids.length) drive.move(ids, null);
      } else if (section === 'trash' && ids.length) {
        requestTrash(ids);
      }

      draggedIds.current = [];
    },
    [drive, requestTrash, resetDragState],
  );

  useEffect(() => {
    const onDragEnd = () => {
      draggedIds.current = [];
      resetDragState();
    };
    document.addEventListener('dragend', onDragEnd);
    document.addEventListener('drop', onDragEnd);
    return () => {
      document.removeEventListener('dragend', onDragEnd);
      document.removeEventListener('drop', onDragEnd);
    };
  }, [resetDragState]);

  /* == PHẦN 3: menu và hộp thoại ======================================== */

  const openNodeMenu = useCallback(
    (node: DriveNode, event: React.MouseEvent) => {
      event.preventDefault();
      // Bấm chuột phải vào mục chưa chọn thì chuyển sang chọn mục đó.
      if (!drive.selectedIds.includes(node.id)) drive.selectOne(node.id);
      setBlankMenu(null);
      setNodeMenu({ node, at: { x: event.clientX, y: event.clientY } });
    },
    [drive],
  );

  const openBlankMenu = useCallback((event: React.MouseEvent) => {
    // Chỉ mở khi bấm vào vùng trống, không phải trên một dòng.
    if ((event.target as HTMLElement).closest('.mgd-row, .mgd-card')) return;
    event.preventDefault();
    setNodeMenu(null);
    setBlankMenu({ x: event.clientX, y: event.clientY });
  }, []);

  const closeMenus = useCallback(() => {
    setNodeMenu(null);
    setBlankMenu(null);
  }, []);

  const handleDialogConfirm = useCallback(
    (value: string) => {
      if (!dialog) return;

      switch (dialog.kind) {
        case 'new-folder':
          drive.createFolder(value);
          break;
        case 'rename':
          drive.rename(dialog.node.id, value);
          break;
        case 'confirm-trash':
          drive.trash(dialog.ids);
          break;
        case 'confirm-delete':
          drive.deleteForever(dialog.ids);
          break;
        case 'confirm-empty-trash':
          drive.emptyTrash();
          break;
      }

      setDialog(null);
    },
    [dialog, drive],
  );

  /** Nội dung hộp thoại tương ứng với trạng thái đang mở. */
  const dialogProps = useMemo(() => {
    if (!dialog) return null;

    switch (dialog.kind) {
      case 'new-folder':
        return {
          title: 'Thư mục mới',
          description: 'Nhập tên cho thư mục sẽ được tạo trong vị trí hiện tại.',
          confirmLabel: 'Tạo thư mục',
          withInput: true,
          inputLabel: 'Tên thư mục',
          defaultValue: 'Thư mục mới',
        };
      case 'rename':
        return {
          title: 'Đổi tên',
          description: `Đổi tên cho “${dialog.node.name}”.`,
          confirmLabel: 'Lưu',
          withInput: true,
          inputLabel: 'Tên mới',
          defaultValue: dialog.node.name,
        };
      case 'confirm-trash':
        return {
          title: 'Chuyển vào Thùng rác',
          description: `${dialog.ids.length} mục sẽ được chuyển vào Thùng rác. Bạn có thể khôi phục lại sau.`,
          confirmLabel: 'Chuyển vào Thùng rác',
          danger: true,
        };
      case 'confirm-delete':
        return {
          title: 'Xoá vĩnh viễn',
          description: `${dialog.ids.length} mục sẽ bị xoá vĩnh viễn và không thể khôi phục.`,
          confirmLabel: 'Xoá vĩnh viễn',
          danger: true,
        };
      case 'confirm-empty-trash':
        return {
          title: 'Dọn sạch Thùng rác',
          description:
            'Toàn bộ mục trong Thùng rác sẽ bị xoá vĩnh viễn và không thể khôi phục.',
          confirmLabel: 'Dọn sạch',
          danger: true,
        };
      default:
        return null;
    }
  }, [dialog]);

  /* == PHẦN 4: kết xuất giao diện ======================================= */

  const nodes = drive.visibleNodes;
  const selected = drive.selectedNodes;
  const isEmpty = !drive.loading && nodes.length === 0;

  const rowHandlers = {
    onRowClick: handleRowClick,
    onRowDoubleClick: drive.openNode,
    onToggleSelect: drive.toggleSelect,
    onContextMenu: openNodeMenu,
    onRowMenu: openNodeMenu,
    onDragStartNode: handleDragStartNode,
    onDragOverNode: handleDragOverNode,
    onDropOnNode: handleDropOnNode,
  };

  return (
    <div
      className={`mgd${sideCollapsed ? ' is-side-collapsed' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      <DriveSidebar
        section={drive.section}
        counts={drive.counts}
        storage={drive.storage}
        collapsed={sideCollapsed}
        dropTarget={dropSection}
        onToggleCollapse={() => setSideCollapsed((v) => !v)}
        onSelectSection={drive.goToSection}
        onDropOnSection={handleDropOnSection}
        onDragOverSection={(section) => setDropSection(section)}
      />

      <div className="mgd-main">
        <DriveTopBar
          query={drive.query}
          section={drive.section}
          onQueryChange={drive.setQuery}
        />

        <DriveToolbar
          section={drive.section}
          clipboard={drive.clipboard}
          trashCount={drive.counts.trash}
          hasSelection={selected.length > 0}
          onUploadFiles={(files) => drive.uploadFiles(files)}
          onNewFolder={() => setDialog({ kind: 'new-folder' })}
          onCopy={() => drive.copySelection(drive.selectedIds)}
          onCut={() => drive.cutSelection(drive.selectedIds)}
          onPaste={drive.paste}
          onEmptyTrash={() => setDialog({ kind: 'confirm-empty-trash' })}
          onRestoreAll={() => drive.restore(drive.selectedIds)}
        />

        <DriveBreadcrumbs
          items={drive.breadcrumbs}
          dropTargetId={dropCrumbId}
          canDrop={canWrite}
          onNavigate={drive.openFolder}
          onDragOverCrumb={(id) => setDropCrumbId(id)}
          onDropOnCrumb={handleDropOnCrumb}
        />

        {selected.length > 0 && (
          <div className="mgd-selbar">
            <span className="mgd-selbar__text">
              Đã chọn {selected.length} mục · {describeSelection(selected)} ·{' '}
              {formatSize(selected.reduce((sum, n) => sum + n.size, 0))}
            </span>

            <span className="mgd-selbar__actions">
              {isTrash ? (
                <>
                  <button
                    type="button"
                    className="mgd-chipbtn"
                    onClick={() => drive.restore(drive.selectedIds)}
                  >
                    <Undo2 className="mgd-icon mgd-icon--sm" />
                    Khôi phục
                  </button>
                  <button
                    type="button"
                    className="mgd-chipbtn is-danger"
                    onClick={() => requestDelete(drive.selectedIds)}
                  >
                    <Trash2 className="mgd-icon mgd-icon--sm" />
                    Xoá vĩnh viễn
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="mgd-chipbtn"
                    onClick={() => drive.toggleFavourite(drive.selectedIds)}
                  >
                    <Heart className="mgd-icon mgd-icon--sm" />
                    Ưa thích
                  </button>
                  <button
                    type="button"
                    className="mgd-chipbtn"
                    onClick={() => handleDownload(selected)}
                  >
                    <Download className="mgd-icon mgd-icon--sm" />
                    Tải xuống
                  </button>
                  <button
                    type="button"
                    className="mgd-chipbtn is-danger"
                    onClick={() => requestTrash(drive.selectedIds)}
                  >
                    <Trash2 className="mgd-icon mgd-icon--sm" />
                    Xoá
                  </button>
                </>
              )}
              <button
                type="button"
                className="mgd-chipbtn"
                onClick={drive.clearSelection}
              >
                <X className="mgd-icon mgd-icon--sm" />
                Bỏ chọn
              </button>
            </span>
          </div>
        )}

        <DriveViewBar
          total={nodes.length}
          sort={drive.sort}
          view={view}
          infoOpen={infoOpen}
          sortDisabled={drive.section === 'recent'}
          onSortChange={drive.setSort}
          onViewChange={setView}
          onToggleInfo={() => setInfoOpen((v) => !v)}
          onScrollTop={() =>
            contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
          }
        />

        <div className="mgd-body">
          <div
            ref={contentRef}
            className="mgd-content"
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDropOnBlank}
            onContextMenu={openBlankMenu}
            onClick={(e) => {
              // Bấm ra vùng trống thì bỏ chọn.
              if (!(e.target as HTMLElement).closest('.mgd-row, .mgd-card, button')) {
                drive.clearSelection();
              }
            }}
          >
            <div className={`mgd-drop${isFileOver ? ' is-over' : ''}`}>
              {isFileOver && (
                <div className="mgd-drop__hint">
                  <CloudUpload className="mgd-icon" style={{ width: 34, height: 34 }} />
                  Thả tệp tin để tải lên
                </div>
              )}

              {drive.loading && (
                <div className="mgd-loading">
                  <LoaderCircle className="mgd-icon mgd-spin" style={{ width: 28, height: 28 }} />
                  Đang tải dữ liệu…
                </div>
              )}

              {drive.error && !drive.loading && (
                <div className="mgd-loading">
                  {drive.error}
                  <button type="button" className="mgd-chipbtn" onClick={drive.reload}>
                    Thử lại
                  </button>
                </div>
              )}

              {isEmpty && !drive.error && renderEmptyState()}

              {!drive.loading && !drive.error && nodes.length > 0 && (
                view === 'list' ? (
                  <DriveList
                    {...rowHandlers}
                    nodes={nodes}
                    selectedIds={drive.selectedIds}
                    section={drive.section}
                    sort={drive.sort}
                    cutIds={cutIds}
                    dropTargetId={dropNodeId}
                    onSortChange={drive.setSort}
                    onToggleAll={handleToggleAll}
                  />
                ) : (
                  <DriveGrid
                    {...rowHandlers}
                    nodes={nodes}
                    selectedIds={drive.selectedIds}
                    section={drive.section}
                    cutIds={cutIds}
                    dropTargetId={dropNodeId}
                  />
                )
              )}
            </div>

            {canWrite && !drive.loading && (
              <>
                <div className="mgd-content__divider" />
                <div className="mgd-content__footer">
                  <CloudUpload className="mgd-icon" />
                  <button
                    type="button"
                    onClick={() =>
                      drive.pushToast('Chức năng chuyển nhập sẽ nối sau khi có backend')
                    }
                  >
                    Chuyển nhập từ một dịch vụ đám mây khác
                  </button>
                </div>
              </>
            )}
          </div>

          {infoOpen && (
            <DriveInfoPanel
              nodes={selected}
              allNodes={drive.allNodes}
              section={drive.section}
              onClose={() => setInfoOpen(false)}
              onRename={openRenameDialog}
              onToggleFavourite={drive.toggleFavourite}
              onTrash={requestTrash}
              onDownload={handleDownload}
            />
          )}
        </div>

        {drive.uploads.length > 0 && renderUploadTray()}
        {drive.toasts.length > 0 && (
          <div className="mgd-toasts">
            {drive.toasts.map((toast) => (
              <div
                key={toast.id}
                className={`mgd-toast${toast.tone === 'error' ? ' is-error' : ''}`}
                role="status"
              >
                {toast.message}
              </div>
            ))}
          </div>
        )}
      </div>

      {nodeMenu && renderNodeMenu()}
      {blankMenu && renderBlankMenu()}

      {dialogProps && (
        <DriveDialog
          open
          title={dialogProps.title}
          description={dialogProps.description}
          confirmLabel={dialogProps.confirmLabel}
          danger={dialogProps.danger}
          withInput={dialogProps.withInput}
          inputLabel={dialogProps.inputLabel}
          defaultValue={dialogProps.defaultValue}
          onConfirm={handleDialogConfirm}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );

  /* ---- các khối phụ, khai báo sau để phần return dễ đọc ---- */

  function renderEmptyState() {
    const emptyText: Record<DriveSection, { title: string; text: string }> = {
      cloud: {
        title: 'Kéo và thả tệp tin của bạn vào đây',
        text: drive.query
          ? 'Không tìm thấy mục nào khớp với từ khoá.'
          : 'Chưa có gì ở trong két sắt riêng của bạn',
      },
      recent: {
        title: 'Chưa có hoạt động nào',
        text: 'Các tệp tin bạn mở gần đây sẽ xuất hiện ở đây.',
      },
      favourite: {
        title: 'Chưa có mục ưa thích',
        text: 'Bấm chuột phải vào một mục và chọn “Ưa thích” để ghim vào đây.',
      },
      trash: {
        title: 'Thùng rác đang trống',
        text: 'Những mục bạn xoá sẽ được giữ tạm ở đây.',
      },
    };

    const { title, text } = emptyText[drive.section];

    return (
      <div className="mgd-empty">
        <div className="mgd-empty__art" aria-hidden="true">
          <span className="mgd-empty__card mgd-empty__card--red" />
          <span className="mgd-empty__card mgd-empty__card--blue" />
          <span className="mgd-empty__card mgd-empty__card--glass">
            <FolderOpen className="mgd-icon" style={{ width: 30, height: 30 }} />
          </span>
        </div>

        <h3 className="mgd-empty__title">{title}</h3>
        <p className="mgd-empty__text">{text}</p>

        {canWrite && (
          <div className="mgd-empty__action">
            <input
              ref={emptyInputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) drive.uploadFiles(files);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              className="mgd-btn mgd-btn--ghost"
              onClick={() => emptyInputRef.current?.click()}
            >
              <Upload className="mgd-icon" />
              Tải lên
            </button>
          </div>
        )}
      </div>
    );
  }

  function renderUploadTray() {
    return (
      <div className="mgd-uploads" role="status" aria-live="polite">
        <div className="mgd-uploads__head">
          <Upload className="mgd-icon mgd-icon--sm" />
          Đang tải lên ({drive.uploads.filter((u) => u.status === 'uploading').length}/
          {drive.uploads.length})
        </div>

        {drive.uploads.map((task) => (
          <div
            key={task.id}
            className={`mgd-uploads__item${
              task.status === 'done' ? ' is-done' : task.status === 'error' ? ' is-error' : ''
            }`}
          >
            <div className="mgd-uploads__row">
              <span className="mgd-uploads__name" title={task.name}>
                {task.name}
              </span>
              <span className="mgd-uploads__pct">
                {task.status === 'error' ? 'Lỗi' : `${task.progress}%`}
              </span>
              <button
                type="button"
                aria-label={`Ẩn ${task.name}`}
                onClick={() => drive.dismissUpload(task.id)}
              >
                <X className="mgd-icon mgd-icon--sm" />
              </button>
            </div>
            <div className="mgd-uploads__bar">
              <div className="mgd-uploads__fill" style={{ width: `${task.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderNodeMenu() {
    if (!nodeMenu) return null;

    const { node, at } = nodeMenu;
    const ids = drive.selectedIds.includes(node.id) ? drive.selectedIds : [node.id];
    const many = ids.length > 1;

    return (
      <DriveMenu position={at} onClose={closeMenus}>
        {isTrash ? (
          <>
            <DriveMenuItem
              icon={<Undo2 className="mgd-icon mgd-icon--sm" />}
              label="Khôi phục"
              onSelect={() => {
                closeMenus();
                drive.restore(ids);
              }}
            />
            <DriveMenuSeparator />
            <DriveMenuItem
              icon={<Trash2 className="mgd-icon mgd-icon--sm" />}
              label="Xoá vĩnh viễn"
              danger
              onSelect={() => {
                closeMenus();
                requestDelete(ids);
              }}
            />
          </>
        ) : (
          <>
            {node.type === 'folder' && !many && (
              <DriveMenuItem
                icon={<FolderOpen className="mgd-icon mgd-icon--sm" />}
                label="Mở"
                onSelect={() => {
                  closeMenus();
                  drive.openFolder(node.id);
                }}
              />
            )}
            <DriveMenuItem
              icon={<Download className="mgd-icon mgd-icon--sm" />}
              label="Tải xuống"
              onSelect={() => {
                closeMenus();
                handleDownload(nodes.filter((n) => ids.includes(n.id)));
              }}
            />
            <DriveMenuSeparator />
            <DriveMenuItem
              icon={<Copy className="mgd-icon mgd-icon--sm" />}
              label="Chép"
              hint="Ctrl+C"
              onSelect={() => {
                closeMenus();
                drive.copySelection(ids);
              }}
            />
            <DriveMenuItem
              icon={<Scissors className="mgd-icon mgd-icon--sm" />}
              label="Cắt"
              hint="Ctrl+X"
              onSelect={() => {
                closeMenus();
                drive.cutSelection(ids);
              }}
            />
            <DriveMenuItem
              icon={<Pencil className="mgd-icon mgd-icon--sm" />}
              label="Đổi tên"
              hint="F2"
              disabled={many}
              onSelect={() => {
                closeMenus();
                openRenameDialog(node);
              }}
            />
            <DriveMenuItem
              icon={<Heart className="mgd-icon mgd-icon--sm" />}
              label={node.favourite ? 'Bỏ khỏi Ưa Thích' : 'Thêm vào Ưa Thích'}
              onSelect={() => {
                closeMenus();
                drive.toggleFavourite(ids);
              }}
            />
            <DriveMenuSeparator />
            <DriveMenuItem
              icon={<Trash2 className="mgd-icon mgd-icon--sm" />}
              label="Chuyển vào Thùng rác"
              hint="Delete"
              danger
              onSelect={() => {
                closeMenus();
                requestTrash(ids);
              }}
            />
          </>
        )}
      </DriveMenu>
    );
  }

  function renderBlankMenu() {
    if (!blankMenu) return null;

    if (isTrash) {
      return (
        <DriveMenu position={blankMenu} onClose={closeMenus}>
          <DriveMenuItem
            icon={<Trash2 className="mgd-icon mgd-icon--sm" />}
            label="Dọn sạch Thùng rác"
            danger
            disabled={drive.counts.trash === 0}
            onSelect={() => {
              closeMenus();
              setDialog({ kind: 'confirm-empty-trash' });
            }}
          />
        </DriveMenu>
      );
    }

    return (
      <DriveMenu position={blankMenu} onClose={closeMenus}>
        <DriveMenuItem
          icon={<Upload className="mgd-icon mgd-icon--sm" />}
          label="Tải lên tệp tin"
          disabled={!canWrite}
          onSelect={() => {
            closeMenus();
            emptyInputRef.current?.click();
          }}
        />
        <DriveMenuItem
          icon={<FolderOpen className="mgd-icon mgd-icon--sm" />}
          label="Thư mục mới"
          disabled={!canWrite}
          onSelect={() => {
            closeMenus();
            setDialog({ kind: 'new-folder' });
          }}
        />
        <DriveMenuSeparator />
        <DriveMenuItem
          icon={<Copy className="mgd-icon mgd-icon--sm" />}
          label="Chọn tất cả"
          hint="Ctrl+A"
          disabled={nodes.length === 0}
          onSelect={() => {
            closeMenus();
            drive.selectAll();
          }}
        />
        <DriveMenuItem
          icon={<Scissors className="mgd-icon mgd-icon--sm" />}
          label="Dán vào đây"
          hint="Ctrl+V"
          disabled={!drive.clipboard?.ids.length || !canWrite}
          onSelect={() => {
            closeMenus();
            drive.paste();
          }}
        />
      </DriveMenu>
    );
  }
}