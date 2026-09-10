import { ChevronDown, ChevronUp, Heart, MoreVertical } from 'lucide-react';
import type {
  DriveNode,
  DriveSection,
  DriveSort,
  DriveSortKey,
} from '../../types/drive';
import { DriveCheckbox, FileTypeIcon } from './DrivePrimitives';
import {
  SORT_LABELS,
  formatDate,
  formatSize,
  getKindLabel,
} from './driveUtils';

export type RowHandlers = {
  onRowClick: (node: DriveNode, event: React.MouseEvent) => void;
  onRowDoubleClick: (node: DriveNode) => void;
  onToggleSelect: (id: string) => void;
  onContextMenu: (node: DriveNode, event: React.MouseEvent) => void;
  onRowMenu: (node: DriveNode, event: React.MouseEvent) => void;
  onDragStartNode: (node: DriveNode, event: React.DragEvent) => void;
  onDragOverNode: (node: DriveNode | null, event: React.DragEvent) => void;
  onDropOnNode: (node: DriveNode, event: React.DragEvent) => void;
};

type Props = RowHandlers & {
  nodes: DriveNode[];
  selectedIds: string[];
  section: DriveSection;
  sort: DriveSort;
  cutIds: string[];
  dropTargetId: string | null;
  onSortChange: (sort: DriveSort) => void;
  onToggleAll: () => void;
};

const COLUMNS: { key: DriveSortKey; className: string }[] = [
  { key: 'size', className: 'mgd-col-size' },
  { key: 'type', className: 'mgd-col-type' },
  { key: 'updatedAt', className: 'mgd-col-date' },
];

export default function DriveList({
  nodes,
  selectedIds,
  section,
  sort,
  cutIds,
  dropTargetId,
  onSortChange,
  onToggleAll,
  onRowClick,
  onRowDoubleClick,
  onToggleSelect,
  onContextMenu,
  onRowMenu,
  onDragStartNode,
  onDragOverNode,
  onDropOnNode,
}: Props) {
  const allSelected = nodes.length > 0 && selectedIds.length === nodes.length;
  const someSelected = selectedIds.length > 0 && !allSelected;

  // Mục "Gần Đây" giữ thứ tự thời gian nên không cho đổi cách sắp xếp.
  const sortable = section !== 'recent';

  const toggleSort = (key: DriveSortKey) => {
    if (!sortable) return;
    onSortChange({
      key,
      order: sort.key === key && sort.order === 'asc' ? 'desc' : 'asc',
    });
  };

  const SortIcon = sort.order === 'asc' ? ChevronUp : ChevronDown;

  const dateLabel = section === 'trash' ? 'Ngày xoá' : 'Ngày sửa đổi';

  return (
    <table className="mgd-table">
      <thead>
        <tr>
          <th className="mgd-col-check">
            <DriveCheckbox
              checked={allSelected}
              partial={someSelected}
              label={allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              onChange={onToggleAll}
            />
          </th>

          <th
            className={`${sortable ? 'is-sortable' : ''}${
              sort.key === 'name' ? ' is-active' : ''
            }`}
            onClick={() => toggleSort('name')}
          >
            <span className="mgd-th">
              {SORT_LABELS.name}
              {sortable && sort.key === 'name' && (
                <SortIcon className="mgd-icon mgd-icon--sm" />
              )}
            </span>
          </th>

          {COLUMNS.map(({ key, className }) => (
            <th
              key={key}
              className={`${className}${sortable ? ' is-sortable' : ''}${
                sort.key === key ? ' is-active' : ''
              }`}
              onClick={() => toggleSort(key)}
            >
              <span className="mgd-th">
                {key === 'updatedAt' ? dateLabel : SORT_LABELS[key]}
                {sortable && sort.key === key && (
                  <SortIcon className="mgd-icon mgd-icon--sm" />
                )}
              </span>
            </th>
          ))}

          <th className="mgd-col-menu">
            <span className="mgd-sr">Tác vụ</span>
          </th>
        </tr>
      </thead>

      <tbody>
        {nodes.map((node) => {
          const isSelected = selectedIds.includes(node.id);
          const dateValue =
            section === 'trash' ? node.trashedAt : node.updatedAt;

          return (
            <tr
              key={node.id}
              className={`mgd-row${isSelected ? ' is-selected' : ''}${
                cutIds.includes(node.id) ? ' is-cut' : ''
              }${dropTargetId === node.id ? ' is-drop-target' : ''}`}
              aria-selected={isSelected}
              draggable={section !== 'trash'}
              onClick={(e) => onRowClick(node, e)}
              onDoubleClick={() => onRowDoubleClick(node)}
              onContextMenu={(e) => onContextMenu(node, e)}
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
              <td>
                <DriveCheckbox
                  checked={isSelected}
                  label={`Chọn ${node.name}`}
                  onChange={() => onToggleSelect(node.id)}
                />
              </td>

              <td>
                <span className="mgd-row__name">
                  <FileTypeIcon node={node} />
                  <span className="mgd-row__label" title={node.name}>
                    {node.name}
                  </span>
                  {node.favourite && (
                    <Heart
                      className="mgd-icon mgd-icon--sm mgd-row__fav"
                      fill="currentColor"
                      aria-label="Ưa thích"
                    />
                  )}
                </span>
              </td>

              <td className="mgd-col-size mgd-row__muted">
                {node.type === 'folder' && node.size === 0 ? '—' : formatSize(node.size)}
              </td>
              <td className="mgd-col-type mgd-row__muted">{getKindLabel(node)}</td>
              <td className="mgd-col-date mgd-row__muted">{formatDate(dateValue)}</td>

              <td className="mgd-col-menu">
                <button
                  type="button"
                  className="mgd-iconbtn"
                  aria-label={`Tác vụ cho ${node.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRowMenu(node, e);
                  }}
                >
                  <MoreVertical className="mgd-icon mgd-icon--sm" />
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}