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
  const dragCounter = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cutIds = drive.clipboard?.mode === 'cut' ? new Set(drive.clipboard.ids) : undefined;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 1900);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  const handleUpload = useCallback(
    (files: FileList) => {
      drive.uploadFiles(files);
      showToast(`Đã tải lên ${files.length} tệp`);
    },
    [drive, showToast],
  );

  const handleDropOnFolder = useCallback(
    (folderId: string, files: FileList) => {
      drive.uploadFiles(files, { parentId: folderId });
      drive.navigateTo(folderId);
      showToast(`Đã tải lên ${files.length} tệp`);
    },
    [drive, showToast],
  );

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

  const handleCreateFolder = (name: string) => {
    drive.createFolder({ parentId: drive.section === 'cloud' ? drive.currentFolderId : null, name });
    setFolderModalOpen(false);
    showToast('Đã tạo thư mục');
  };
  const closeCtxMenu = () => setCtxMenu(null);

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
              onTrash={(id) => { drive.moveToTrash(id); showToast('Đã chuyển vào thùng rác'); }}
              onRestore={(id) => { drive.restore(id); showToast('Đã khôi phục'); }}
              onDeleteForever={(id) => { drive.deleteForever(id); showToast('Đã xóa vĩnh viễn'); }}
              cutIds={cutIds}
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
          onTrash={() => {
            if (ctxMenu.node) {
              drive.moveToTrash(ctxMenu.node.id);
              showToast('Đã chuyển vào thùng rác');
            }
          }}
          onRestore={() => {
            if (ctxMenu.node) {
              drive.restore(ctxMenu.node.id);
              showToast('Đã khôi phục');
            }
          }}
          onDeleteForever={() => {
            if (ctxMenu.node) {
              drive.deleteForever(ctxMenu.node.id);
              showToast('Đã xóa vĩnh viễn');
            }
          }}
          onNewFolder={() => setFolderModalOpen(true)}
        />
      )}

      <NewFolderModal open={folderModalOpen} onClose={() => setFolderModalOpen(false)} onCreate={handleCreateFolder} />

      <DriveUploadTray tasks={drive.uploads} />

      <div className={`drive-toast${toast ? ' is-show' : ''}`}>{toast}</div>
    </div>
  );
}
