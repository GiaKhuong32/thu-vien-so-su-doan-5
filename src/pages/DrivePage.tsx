import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload } from 'lucide-react';
import { useDrive } from '../hooks/useDrive';
import DriveSidebar from '../components/Drive/DriveSidebar';
import DriveTopbar from '../components/Drive/DriveTopbar';
import DriveToolbar from '../components/Drive/DriveToolbar';
import DriveItemsView from '../components/Drive/DriveItemsView';
import DriveContextMenu from '../components/Drive/DriveContextMenu';
import NewFolderModal from '../components/Drive/NewFolderModal';
import DriveInfoPanel from '../components/Drive/DriveInfoPanel';
import DriveUploadTray from '../components/Drive/DriveUploadTray';
import DriveSelectionBar from '../components/Drive/Driveselectionbar';
import ConfirmDialog from '../components/Drive/Confirmdialog';
import type { DriveNode } from '../types/drive';
import './DrivePage.css';

type CtxMenuState = { x: number; y: number; node: DriveNode | null } | null;

export default function DrivePage() {
  const drive = useDrive();
  const [ctxMenu, setCtxMenu] = useState<CtxMenuState>(null);
  const [folderModalOpen, setFolderModalOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [dropOverlay, setDropOverlay] = useState(false);
  const [confirmDeleteIds, setConfirmDeleteIds] = useState<string[] | null>(null);
  const dragCounter = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  /* ---------------- Tải lên ---------------- */

  const handleUpload = useCallback(
    async (files: FileList | File[]) => {
      const uploadCount = files.length;

      await drive.uploadFiles(files);

      showToast(`Đã tải lên ${uploadCount} tệp`);
    },
    [drive, showToast],
  );

  const handleDropOnFolder = useCallback(
    async (folderId: string, files: FileList | File[]) => {
      const uploadCount = files.length;

      await drive.uploadFiles(files, { parentId: folderId });
      await drive.navigateTo(folderId);

      showToast(`Đã tải lên ${uploadCount} tệp`);
    },
    [drive, showToast],
  );

  /* Kéo-thả tệp từ máy tính vào bất kỳ đâu trong khu vực nội dung */
  const onDragEnter = (e: React.DragEvent) => {
    if (!e.dataTransfer.types.includes('Files')) return;
    e.preventDefault();
    dragCounter.current += 1;
    if (drive.section === 'cloud') setDropOverlay(true);
  };
  const onDragOver = (e: React.DragEvent) => {
    if (e.dataTransfer.types.includes('Files')) e.preventDefault();
  };
  const onDragLeave = () => {
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setDropOverlay(false);
    }
  };
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDropOverlay(false);
    if (e.dataTransfer.files.length) handleUpload(e.dataTransfer.files);
  };

  /* ---------------- Thư mục mới ---------------- */

  const handleCreateFolder = async (name: string) => {
    try {
      await drive.createFolder({
        parentId: drive.section === 'cloud' ? drive.currentFolderId : null,
        name,
      });

      setFolderModalOpen(false);
      showToast('Đã tạo thư mục');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Tạo thư mục thất bại');
    }
  };

  /* ---------------- Menu chuột phải ---------------- */

  const closeCtxMenu = () => setCtxMenu(null);

  const cutIds = drive.clipboard?.mode === 'cut' ? new Set(drive.clipboard.ids) : undefined;

  /* ---------------- Xóa vĩnh viễn (có xác nhận) ---------------- */

  const requestDeleteForever = (ids: string[]) => setConfirmDeleteIds(ids);

  const confirmDeleteForever = async () => {
    if (!confirmDeleteIds) return;

    try {
      await drive.deleteForever(confirmDeleteIds);
      showToast(
        confirmDeleteIds.length > 1
          ? `Đã xóa vĩnh viễn ${confirmDeleteIds.length} mục`
          : 'Đã xóa vĩnh viễn',
      );
      setConfirmDeleteIds(null);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Xóa vĩnh viễn thất bại');
    }
  };

  const confirmDeleteName =
    confirmDeleteIds?.length === 1 ? drive.nodes.find((n) => n.id === confirmDeleteIds[0])?.name : null;

  /* ---------------- Chọn nhiều (thanh hành động hàng loạt) ---------------- */

  const handleBulkCut = () => {
    const ids = Array.from(drive.selectedIds);
    drive.cutToClipboard(ids);
    showToast(`Đã cắt ${ids.length} mục — vào thư mục đích rồi bấm "Dán"`);
  };

  const handleBulkTrash = async () => {
    const ids = Array.from(drive.selectedIds);
    try {
      await drive.moveToTrash(ids);
      showToast(`Đã chuyển ${ids.length} mục vào thùng rác`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Chuyển vào thùng rác thất bại');
    }
  };

  const handleBulkRestore = async () => {
    const ids = Array.from(drive.selectedIds);
    try {
      await drive.restore(ids);
      showToast(`Đã khôi phục ${ids.length} mục`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Khôi phục thất bại');
    }
  };

  return (
    <div className="drive-page">
      <DriveSidebar
        section={drive.section}
        onSectionChange={drive.setSection}
        counts={drive.counts}
        storage={drive.storage}
      />

      <main className="drive-main" onDragEnter={onDragEnter} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}>
        <DriveTopbar
          searchTerm={drive.searchTerm}
          onSearchChange={drive.setSearchTerm}
          onUpload={handleUpload}
          onNewFolder={() => setFolderModalOpen(true)}
        />

        <DriveToolbar
          section={drive.section}
          breadcrumbs={drive.breadcrumbs}
          onNavigate={drive.navigateTo}
          sort={drive.sort}
          onSortChange={drive.setSort}
          viewMode={drive.viewMode}
          onViewModeChange={drive.setViewMode}
          infoOpen={drive.infoOpen}
          onToggleInfo={() => drive.setInfoOpen((v) => !v)}
        />

        <div className="drive-content-wrap">
          <div className="drive-content">
            {dropOverlay && (
              <div className="drive-drop-overlay">
                <Upload size={40} strokeWidth={1.8} />
                <span>Thả tệp để tải lên</span>
              </div>
            )}

            <DriveSelectionBar
              count={drive.selectedIds.size}
              section={drive.section}
              onClear={drive.clearMultiSelect}
              onCut={handleBulkCut}
              onTrash={handleBulkTrash}
              onRestore={handleBulkRestore}
              onDeleteForever={() => requestDeleteForever(Array.from(drive.selectedIds))}
            />

            <DriveItemsView
              section={drive.section}
              nodes={drive.visibleNodes}
              viewMode={drive.viewMode}
              selectedId={drive.selectedId}
              onSelect={drive.select}
              onOpenFolder={(node) => drive.navigateTo(node.id)}
              onToggleFavourite={drive.toggleFavourite}
              onContextMenu={(e, node) => {
                drive.select(node.id);
                setCtxMenu({ x: e.clientX, y: e.clientY, node });
              }}
              onContextMenuEmpty={(e) => {
                e.preventDefault();
                drive.select(null);
                setCtxMenu({ x: e.clientX, y: e.clientY, node: null });
              }}
              onDropFilesToFolder={handleDropOnFolder}
              onUploadClick={() => document.querySelector<HTMLInputElement>('.drive-topbar input[type="file"]')?.click()}
              onRenameCommit={(id, name) => {
                drive.rename(id, name);
                setRenamingId(null);
              }}
              renamingId={renamingId}
              onTrash={async (id) => {
                try {
                  await drive.moveToTrash(id);
                  showToast('Đã chuyển vào thùng rác');
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'Chuyển vào thùng rác thất bại');
                }
              }}
              onRestore={async (id) => {
                try {
                  await drive.restore(id);
                  showToast('Đã khôi phục');
                } catch (err) {
                  showToast(err instanceof Error ? err.message : 'Khôi phục thất bại');
                }
              }}
              onDeleteForever={(id) => requestDeleteForever([id])}
              cutIds={cutIds}
              selectedIds={drive.selectedIds}
              onToggleMultiSelect={drive.toggleMultiSelect}
            />
          </div>

          <DriveInfoPanel
            open={drive.infoOpen}
            node={drive.selectedNode}
            nodes={drive.nodes}
            folderSize={drive.folderSize}
            onClose={() => drive.setInfoOpen(false)}
          />
        </div>
      </main>

      {ctxMenu && (
        <DriveContextMenu
          x={ctxMenu.x}
          y={ctxMenu.y}
          node={ctxMenu.node}
          canPaste={!!drive.clipboard}
          onClose={closeCtxMenu}
          onRename={() => ctxMenu.node && setRenamingId(ctxMenu.node.id)}
          onCopy={() => ctxMenu.node && drive.copyToClipboard(ctxMenu.node.id)}
          onCut={() => ctxMenu.node && drive.cutToClipboard(ctxMenu.node.id)}
          onPaste={() => {
            const targetId = ctxMenu.node?.type === 'folder' ? ctxMenu.node.id : drive.currentFolderId;
            drive.paste(drive.section === 'cloud' ? targetId : null);
            showToast('Đã dán');
          }}
          onToggleFavourite={() => ctxMenu.node && drive.toggleFavourite(ctxMenu.node.id)}
          onShowInfo={() => drive.setInfoOpen(true)}
          onTrash={async () => {
            if (ctxMenu.node) {
              try {
                await drive.moveToTrash(ctxMenu.node.id);
                showToast('Đã chuyển vào thùng rác');
              } catch (err) {
                showToast(err instanceof Error ? err.message : 'Chuyển vào thùng rác thất bại');
              }
            }
          }}
          onRestore={async () => {
            if (ctxMenu.node) {
              try {
                await drive.restore(ctxMenu.node.id);
                showToast('Đã khôi phục');
              } catch (err) {
                showToast(err instanceof Error ? err.message : 'Khôi phục thất bại');
              }
            }
          }}
          onDeleteForever={() => {
            if (ctxMenu.node) requestDeleteForever([ctxMenu.node.id]);
          }}
          onNewFolder={() => setFolderModalOpen(true)}
        />
      )}

      <NewFolderModal open={folderModalOpen} onClose={() => setFolderModalOpen(false)} onCreate={handleCreateFolder} />

      <DriveUploadTray tasks={drive.uploads} />

      <ConfirmDialog
        open={confirmDeleteIds !== null}
        title="Xóa vĩnh viễn?"
        message={
          confirmDeleteIds && confirmDeleteIds.length > 1
            ? `${confirmDeleteIds.length} mục sẽ bị xóa vĩnh viễn và không thể khôi phục.`
            : confirmDeleteName
              ? `"${confirmDeleteName}" sẽ bị xóa vĩnh viễn và không thể khôi phục.`
              : 'Mục này sẽ bị xóa vĩnh viễn và không thể khôi phục.'
        }
        confirmLabel="Xóa vĩnh viễn"
        danger
        onConfirm={confirmDeleteForever}
        onCancel={() => setConfirmDeleteIds(null)}
      />

      <div className={`drive-toast${toast ? ' is-show' : ''}`}>{toast}</div>
    </div>
  );
}