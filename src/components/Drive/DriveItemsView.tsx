import { useState } from 'react';
import { Heart } from 'lucide-react';
import type { DriveNode, DriveSection, DriveViewMode } from '../../types/drive';
import { DriveNodeIcon } from './driveIcons';
import { formatBytes, formatDate } from './driveFormat';
import DriveEmptyState from './DriveEmptyState';
import './DriveItemsView.css';

type Props = {
  section: DriveSection;
  nodes: DriveNode[];
  viewMode: DriveViewMode;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onOpenFolder: (node: DriveNode) => void;
  onToggleFavourite: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, node: DriveNode) => void;
  onContextMenuEmpty: (e: React.MouseEvent) => void;
  onDropFilesToFolder: (folderId: string, files: FileList) => void;
  onUploadClick?: () => void;
  onRenameCommit: (id: string, name: string) => void;
  renamingId: string | null;
};

function FavButton({ node, onToggleFavourite }: { node: DriveNode; onToggleFavourite: (id: string) => void }) {
  return (
    <button
      type="button"
      className="drive-fav-btn"
      title={node.favourite ? 'Bỏ ưa thích' : 'Thêm vào ưa thích'}
      onClick={(e) => {
        e.stopPropagation();
        onToggleFavourite(node.id);
      }}
    >
      <Heart size={14} strokeWidth={2} fill={node.favourite ? 'currentColor' : 'none'} />
    </button>
  );
}

function EditableName({
  node,
  onCommit,
  className,
}: {
  node: DriveNode;
  onCommit: (id: string, name: string) => void;
  className?: string;
}) {
  const [value, setValue] = useState(node.name);
  return (
    <input
      className={className}
      value={value}
      autoFocus
      onFocus={(e) => e.target.select()}
      onChange={(e) => setValue(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onBlur={() => onCommit(node.id, value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') {
          setValue(node.name);
          onCommit(node.id, node.name);
        }
      }}
    />
  );
}

export default function DriveItemsView({
  section,
  nodes,
  viewMode,
  selectedId,
  onSelect,
  onOpenFolder,
  onToggleFavourite,
  onContextMenu,
  onContextMenuEmpty,
  onDropFilesToFolder,
  onUploadClick,
  onRenameCommit,
  renamingId,
}: Props) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const folderDragHandlers = (node: DriveNode) =>
    node.type === 'folder' && !node.trashed
      ? {
          onDragOver: (e: React.DragEvent) => {
            if (!e.dataTransfer.types.includes('Files')) return;
            e.preventDefault();
            e.stopPropagation();
            setDragOverId(node.id);
          },
          onDragLeave: () => setDragOverId((cur) => (cur === node.id ? null : cur)),
          onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragOverId(null);
            if (e.dataTransfer.files.length) onDropFilesToFolder(node.id, e.dataTransfer.files);
          },
        }
      : {};

  if (nodes.length === 0) {
    return (
      <div onContextMenu={section === 'cloud' ? onContextMenuEmpty : undefined}>
        <DriveEmptyState section={section} onUploadClick={onUploadClick} />
      </div>
    );
  }

  if (viewMode === 'grid') {
    return (
      <div
        className="drive-grid"
        onClick={() => onSelect(null)}
        onContextMenu={section === 'cloud' ? onContextMenuEmpty : undefined}
      >
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`drive-card${node.id === selectedId ? ' is-selected' : ''}${node.favourite ? ' is-fav' : ''}${dragOverId === node.id ? ' is-drop-target' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(node.id);
            }}
            onDoubleClick={() => node.type === 'folder' && onOpenFolder(node)}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(node.id);
              onContextMenu(e, node);
            }}
            {...folderDragHandlers(node)}
          >
            <div className="drive-card__thumb">
              {node.type === 'file' && node.previewUrl ? (
                <img src={node.previewUrl} alt="" />
              ) : (
                <DriveNodeIcon node={node} size={30} />
              )}
            </div>
            <FavButton node={node} onToggleFavourite={onToggleFavourite} />
            {renamingId === node.id ? (
              <EditableName node={node} onCommit={onRenameCommit} className="drive-card__name-input" />
            ) : (
              <div className="drive-card__name">{node.name}</div>
            )}
            <div className="drive-card__meta">{node.type === 'folder' ? 'Thư mục' : formatBytes(node.size)}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div onClick={() => onSelect(null)} onContextMenu={section === 'cloud' ? onContextMenuEmpty : undefined}>
      <div className="drive-list-head">
        <span>Tên</span>
        <span />
        <span>Ngày</span>
        <span>Dung lượng</span>
      </div>
      {nodes.map((node) => (
        <div
          key={node.id}
          className={`drive-list-row${node.id === selectedId ? ' is-selected' : ''}${node.favourite ? ' is-fav' : ''}${dragOverId === node.id ? ' is-drop-target' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node.id);
          }}
          onDoubleClick={() => node.type === 'folder' && onOpenFolder(node)}
          onContextMenu={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(node.id);
            onContextMenu(e, node);
          }}
          {...folderDragHandlers(node)}
        >
          <div className="drive-list-name">
            <span className="drive-list-name__icon">
              <DriveNodeIcon node={node} size={16} />
            </span>
            {renamingId === node.id ? (
              <EditableName node={node} onCommit={onRenameCommit} className="drive-list-name__input" />
            ) : (
              <span>{node.name}</span>
            )}
          </div>
          <div className="drive-list-fav">
            <FavButton node={node} onToggleFavourite={onToggleFavourite} />
          </div>
          <div className="drive-list-sub">{formatDate(node.updatedAt)}</div>
          <div className="drive-list-sub">{node.type === 'folder' ? '—' : formatBytes(node.size)}</div>
        </div>
      ))}
    </div>
  );
}
