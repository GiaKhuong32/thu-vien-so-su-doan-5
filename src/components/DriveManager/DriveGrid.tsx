import { Heart, MoreVertical } from 'lucide-react';
import type { DriveNode, DriveSection } from '../../types/drive';
import { DriveCheckbox, FileTypeIcon } from './DrivePrimitives';
import type { RowHandlers } from './DriveList';
import { formatDate, formatSize, getFileKind } from './driveUtils';

type Props = RowHandlers & {
  nodes: DriveNode[];
  selectedIds: string[];
  section: DriveSection;
  cutIds: string[];
  dropTargetId: string | null;
};

export default function DriveGrid({
  nodes,
  selectedIds,
  section,
  cutIds,
  dropTargetId,
  onRowClick,
  onRowDoubleClick,
  onToggleSelect,
  onContextMenu,
  onRowMenu,
  onDragStartNode,
  onDragOverNode,
  onDropOnNode,
}: Props) {
  return (
    <div className="mgd-grid">
      {nodes.map((node) => {
        const isSelected = selectedIds.includes(node.id);
        const kind = getFileKind(node);
        const dateValue = section === 'trash' ? node.trashedAt : node.updatedAt;

        return (
          <div
            key={node.id}
            className={`mgd-card${isSelected ? ' is-selected' : ''}${
              cutIds.includes(node.id) ? ' is-cut' : ''
            }${dropTargetId === node.id ? ' is-drop-target' : ''}`}
            role="button"
            tabIndex={0}
            aria-selected={isSelected}
            draggable={section !== 'trash'}
            onClick={(e) => onRowClick(node, e)}
            onDoubleClick={() => onRowDoubleClick(node)}
            onContextMenu={(e) => onContextMenu(node, e)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRowDoubleClick(node);
            }}
            onDragStart={(e) => onDragStartNode(node, e)}
            onDragOver={(e) => {
              if (node.type !== 'folder' || section === 'trash') return;
              e.preventDefault();
              onDragOverNode(node, e);
            }}
            onDragLeave={(e) => onDragOverNode(null, e)}
            onDrop={(e) => {
              if (node.type !== 'folder' || section === 'trash') return;
              e.preventDefault();
              onDropOnNode(node, e);
            }}
          >
            <div className="mgd-card__top">
              <DriveCheckbox
                checked={isSelected}
                label={`Chọn ${node.name}`}
                onChange={() => onToggleSelect(node.id)}
              />
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {node.favourite && (
                  <Heart
                    className="mgd-icon mgd-icon--sm mgd-row__fav"
                    fill="currentColor"
                    aria-label="Ưa thích"
                  />
                )}
                <button
                  type="button"
                  className="mgd-iconbtn"
                  style={{ width: 26, height: 26 }}
                  aria-label={`Tác vụ cho ${node.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowMenu(node, e);
                  }}
                >
                  <MoreVertical className="mgd-icon mgd-icon--sm" />
                </button>
              </span>
            </div>

            <div className={`mgd-card__thumb mgd-ftype--${kind}`}>
              {node.previewUrl ? (
                <img src={node.previewUrl} alt={node.name} />
              ) : (
                <FileTypeIcon node={node} />
              )}
            </div>

            <div className="mgd-card__name" title={node.name}>
              {node.name}
            </div>
            <div className="mgd-card__meta">
              {node.type === 'folder' && node.size === 0
                ? formatDate(dateValue)
                : `${formatSize(node.size)} · ${formatDate(dateValue)}`}
            </div>
          </div>
        );
      })}
    </div>
  );
}