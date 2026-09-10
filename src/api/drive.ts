import type {
  CreateFolderInput,
  DriveNode,
  DriveStorage,
  UploadFileInput,
} from '../types/drive';

/**
 * ---------------------------------------------------------------------------
 * LỚP DỮ LIỆU CỦA TRÌNH QUẢN LÝ TỆP TIN (giả lập)
 * ---------------------------------------------------------------------------
 * Toàn bộ giao diện chỉ gọi các hàm được export ở file này, không nơi nào tự
 * giữ dữ liệu. Khi nối backend thật, chỉ cần thay phần thân mỗi hàm bằng
 * `api.get/post/...` trong `src/api/client.ts` là xong, không phải sửa
 * component. Ví dụ:
 *
 *   export async function fetchNodes() {
 *     return api.get<DriveNode[]>('/drive/nodes');
 *   }
 *
 *   export async function uploadFile({ parentId, file, onProgress }: UploadFileInput) {
 *     const form = new FormData();
 *     form.append('file', file);
 *     if (parentId) form.append('parentId', parentId);
 *     // dùng axios (đã có trong dự án) để lấy được tiến trình tải lên:
 *     const { data } = await axios.post(`${API_BASE_URL}/drive/upload`, form, {
 *       onUploadProgress: (e) =>
 *         onProgress?.(Math.round((e.loaded * 100) / (e.total || file.size))),
 *     });
 *     return data.Result as DriveNode;
 *   }
 * ---------------------------------------------------------------------------
 */

/** Tổng dung lượng mô phỏng: 20 GB, giống gói miễn phí của MEGA. */
const TOTAL_QUOTA = 20 * 1024 * 1024 * 1024;

const LATENCY = 260;

function delay(ms = LATENCY) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function iso(daysAgo: number, hour = 9): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

function folder(
  id: string,
  name: string,
  parentId: string | null,
  daysAgo: number,
  extra: Partial<DriveNode> = {},
): DriveNode {
  return {
    id,
    parentId,
    name,
    type: 'folder',
    size: 0,
    createdAt: iso(daysAgo + 3),
    updatedAt: iso(daysAgo),
    favourite: false,
    trashed: false,
    trashedAt: null,
    openedAt: null,
    ...extra,
  };
}

function file(
  id: string,
  name: string,
  parentId: string | null,
  size: number,
  mimeType: string,
  daysAgo: number,
  extra: Partial<DriveNode> = {},
): DriveNode {
  return {
    id,
    parentId,
    name,
    type: 'file',
    size,
    mimeType,
    createdAt: iso(daysAgo + 2),
    updatedAt: iso(daysAgo),
    favourite: false,
    trashed: false,
    trashedAt: null,
    openedAt: null,
    ...extra,
  };
}

const KB = 1024;
const MB = 1024 * KB;

/** Dữ liệu mẫu mang màu sắc thư viện số để dễ hình dung khi xem giao diện. */
let nodes: DriveNode[] = [
  folder('f-tai-lieu', 'Tài liệu số hoá', null, 1),
  folder('f-sach-noi', 'Sách nói', null, 4),
  folder('f-luu-tru', 'Lưu trữ Nam Bộ', null, 9),
  folder('f-anh-bia', 'Ảnh bìa sách', 'f-tai-lieu', 2),

  file('n-1', 'Địa chí Nam Bộ.pdf', null, 18 * MB, 'application/pdf', 0, {
    favourite: true,
    openedAt: iso(0, 14),
  }),
  file('n-2', 'Danh mục sách 2026.xlsx', null, 320 * KB, 'application/vnd.ms-excel', 2, {
    openedAt: iso(1, 10),
  }),
  file('n-3', 'Biên bản kiểm kê kho.docx', null, 96 * KB, 'application/msword', 5),
  file('n-4', 'Nguyễn An Ninh - tư liệu.pdf', 'f-tai-lieu', 42 * MB, 'application/pdf', 3, {
    favourite: true,
    openedAt: iso(2, 16),
  }),
  file('n-5', 'Bản thảo scan trang 1-20.pdf', 'f-tai-lieu', 64 * MB, 'application/pdf', 6),
  file('n-6', 'bia-sach-01.jpg', 'f-anh-bia', 1.6 * MB, 'image/jpeg', 2),
  file('n-7', 'bia-sach-02.png', 'f-anh-bia', 2.4 * MB, 'image/png', 2),
  file('n-8', 'Chuong-01.mp3', 'f-sach-noi', 27 * MB, 'audio/mpeg', 4, {
    openedAt: iso(3, 20),
  }),
  file('n-9', 'Chuong-02.mp3', 'f-sach-noi', 31 * MB, 'audio/mpeg', 4),
  file('n-10', 'Giới thiệu thư viện.mp4', 'f-luu-tru', 148 * MB, 'video/mp4', 11),
  file('n-11', 'sao-luu-metadata.zip', 'f-luu-tru', 8.5 * MB, 'application/zip', 12),
  file('n-12', 'ghi-chu-bien-muc.txt', null, 4 * KB, 'text/plain', 8),
  file('n-13', 'Phiếu mượn sách (mẫu).pdf', null, 210 * KB, 'application/pdf', 14, {
    trashed: true,
    trashedAt: iso(1, 11),
  }),
  file('n-14', 'anh-cu-hong.jpg', null, 900 * KB, 'image/jpeg', 20, {
    trashed: true,
    trashedAt: iso(3, 15),
  }),
];

function clone(node: DriveNode): DriveNode {
  return { ...node };
}

function findById(id: string): DriveNode | undefined {
  return nodes.find((n) => n.id === id);
}

/** Lấy id của node và toàn bộ con cháu — dùng khi xoá / khôi phục thư mục. */
function collectSubtreeIds(rootIds: string[]): string[] {
  const result = new Set<string>(rootIds);
  let added = true;

  while (added) {
    added = false;
    for (const node of nodes) {
      if (node.parentId && result.has(node.parentId) && !result.has(node.id)) {
        result.add(node.id);
        added = true;
      }
    }
  }

  return [...result];
}

/** Chặn kéo/dán một thư mục vào chính nó hoặc vào thư mục con của nó. */
function isDescendant(candidateId: string, ancestorId: string): boolean {
  let current = findById(candidateId);

  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    current = findById(current.parentId);
  }

  return false;
}

/** Tự thêm hậu tố (1), (2)... khi tên bị trùng trong cùng thư mục. */
function uniqueName(parentId: string | null, name: string, ignoreId?: string): string {
  const siblings = nodes.filter(
    (n) => n.parentId === parentId && !n.trashed && n.id !== ignoreId,
  );
  const taken = new Set(siblings.map((n) => n.name.toLowerCase()));

  if (!taken.has(name.toLowerCase())) return name;

  const dot = name.lastIndexOf('.');
  const hasExt = dot > 0;
  const base = hasExt ? name.slice(0, dot) : name;
  const ext = hasExt ? name.slice(dot) : '';

  let index = 1;
  let candidate = `${base} (${index})${ext}`;

  while (taken.has(candidate.toLowerCase())) {
    index += 1;
    candidate = `${base} (${index})${ext}`;
  }

  return candidate;
}

/* -------------------------------------------------------------------------- */
/* Đọc dữ liệu                                                                */
/* -------------------------------------------------------------------------- */

export async function fetchNodes(): Promise<DriveNode[]> {
  await delay();
  return nodes.map(clone);
}

export async function fetchStorage(): Promise<DriveStorage> {
  await delay(120);
  const used = nodes
    .filter((n) => n.type === 'file' && !n.trashed)
    .reduce((sum, n) => sum + n.size, 0);

  return { used, total: TOTAL_QUOTA, planName: 'Miễn phí' };
}

/* -------------------------------------------------------------------------- */
/* Ghi dữ liệu                                                                */
/* -------------------------------------------------------------------------- */

export async function createFolder({
  parentId,
  name,
}: CreateFolderInput): Promise<DriveNode> {
  await delay(200);

  const now = new Date().toISOString();
  const created: DriveNode = {
    id: makeId(),
    parentId,
    name: uniqueName(parentId, name.trim() || 'Thư mục mới'),
    type: 'folder',
    size: 0,
    createdAt: now,
    updatedAt: now,
    favourite: false,
    trashed: false,
    trashedAt: null,
    openedAt: null,
  };

  nodes = [...nodes, created];
  return clone(created);
}

/**
 * Giả lập tải lên: phát tiến trình theo từng nhịp để khay tiến trình có thứ
 * để vẽ. Khi nối backend thật, dùng `onUploadProgress` của axios.
 */
export async function uploadFile({
  parentId,
  file: source,
  onProgress,
}: UploadFileInput): Promise<DriveNode> {
  const steps = 12;

  for (let step = 1; step <= steps; step += 1) {
    await delay(70);
    onProgress?.(Math.round((step / steps) * 100));
  }

  const now = new Date().toISOString();
  const created: DriveNode = {
    id: makeId(),
    parentId,
    name: uniqueName(parentId, source.name),
    type: 'file',
    size: source.size,
    mimeType: source.type || 'application/octet-stream',
    createdAt: now,
    updatedAt: now,
    favourite: false,
    trashed: false,
    trashedAt: null,
    openedAt: now,
    previewUrl: source.type.startsWith('image/') ? URL.createObjectURL(source) : null,
  };

  nodes = [...nodes, created];
  return clone(created);
}

export async function renameNode(id: string, name: string): Promise<DriveNode> {
  await delay(180);

  const target = findById(id);
  if (!target) throw new Error('Không tìm thấy mục cần đổi tên');

  const nextName = uniqueName(target.parentId, name.trim() || target.name, id);
  const updated: DriveNode = {
    ...target,
    name: nextName,
    updatedAt: new Date().toISOString(),
  };

  nodes = nodes.map((n) => (n.id === id ? updated : n));
  return clone(updated);
}

/** Di chuyển (dùng cho Cắt → Dán và kéo thả vào thư mục). */
export async function moveNodes(
  ids: string[],
  targetParentId: string | null,
): Promise<DriveNode[]> {
  await delay(220);

  const movable = ids.filter((id) => {
    if (id === targetParentId) return false;
    if (targetParentId && isDescendant(targetParentId, id)) return false;
    return true;
  });

  const now = new Date().toISOString();

  nodes = nodes.map((n) => {
    if (!movable.includes(n.id)) return n;
    return {
      ...n,
      parentId: targetParentId,
      name: uniqueName(targetParentId, n.name, n.id),
      updatedAt: now,
    };
  });

  return nodes.filter((n) => movable.includes(n.id)).map(clone);
}

/** Sao chép (dùng cho Chép → Dán), có nhân bản cả cây con. */
export async function copyNodes(
  ids: string[],
  targetParentId: string | null,
): Promise<DriveNode[]> {
  await delay(240);

  const now = new Date().toISOString();
  const created: DriveNode[] = [];

  const duplicate = (sourceId: string, parentId: string | null) => {
    const source = findById(sourceId);
    if (!source) return;
    if (parentId && isDescendant(parentId, sourceId)) return;

    const copy: DriveNode = {
      ...source,
      id: makeId(),
      parentId,
      name: uniqueName(parentId, source.name),
      createdAt: now,
      updatedAt: now,
      favourite: false,
      trashed: false,
      trashedAt: null,
    };

    nodes = [...nodes, copy];
    created.push(copy);

    const children = nodes.filter((n) => n.parentId === sourceId && !n.trashed);
    for (const child of children) {
      duplicate(child.id, copy.id);
    }
  };

  for (const id of ids) {
    duplicate(id, targetParentId);
  }

  return created.map(clone);
}

export async function setFavourite(ids: string[], favourite: boolean): Promise<DriveNode[]> {
  await delay(150);

  nodes = nodes.map((n) => (ids.includes(n.id) ? { ...n, favourite } : n));
  return nodes.filter((n) => ids.includes(n.id)).map(clone);
}

/** Đưa vào Thùng rác (xoá mềm), kéo theo toàn bộ thư mục con. */
export async function trashNodes(ids: string[]): Promise<string[]> {
  await delay(200);

  const affected = collectSubtreeIds(ids);
  const now = new Date().toISOString();

  nodes = nodes.map((n) =>
    affected.includes(n.id) ? { ...n, trashed: true, trashedAt: now } : n,
  );

  return affected;
}

export async function restoreNodes(ids: string[]): Promise<string[]> {
  await delay(200);

  const affected = collectSubtreeIds(ids);

  nodes = nodes.map((n) => {
    if (!affected.includes(n.id)) return n;

    // Nếu thư mục cha vẫn còn trong thùng rác thì trả mục này về gốc Ổ Mây.
    const parent = n.parentId ? findById(n.parentId) : null;
    const parentStillTrashed = !!parent && parent.trashed && !affected.includes(parent.id);

    return {
      ...n,
      trashed: false,
      trashedAt: null,
      parentId: parentStillTrashed ? null : n.parentId,
    };
  });

  return affected;
}

/** Xoá vĩnh viễn. */
export async function deleteNodes(ids: string[]): Promise<string[]> {
  await delay(220);

  const affected = collectSubtreeIds(ids);
  nodes = nodes.filter((n) => !affected.includes(n.id));

  return affected;
}

export async function emptyTrash(): Promise<void> {
  await delay(260);
  nodes = nodes.filter((n) => !n.trashed);
}

/** Ghi nhận thời điểm mở để mục "Gần Đây" có dữ liệu. */
export async function touchNode(id: string): Promise<void> {
  const now = new Date().toISOString();
  nodes = nodes.map((n) => (n.id === id ? { ...n, openedAt: now } : n));
}
