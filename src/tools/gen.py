#!/usr/bin/env python3
"""Generate src/data/detail.ts from the scraped /tmp/detail.json."""
import json
import os
import re

ROOT = '/workspace/project/nan-clone'
PUB = f'{ROOT}/public/assets/books'
LOCAL = set(os.listdir(PUB))
d = json.load(open('/tmp/detail.json', encoding='utf-8'))


def map_img(remote):
    """remote /img/books/origin/<file> -> local /assets/books/<file> when present."""
    if not remote:
        return None
    b = os.path.basename(remote)
    for cand in (b, re.sub(r'^full_', '', b), 'full_' + b):
        if cand in LOCAL:
            return '/assets/books/' + cand
    return None


def ts(x):
    """python -> TS literal"""
    if isinstance(x, bool):
        return 'true' if x else 'false'
    if isinstance(x, (int, float)):
        return str(int(x)) if float(x) == int(x) else str(x)
    if x is None:
        return 'undefined'
    return json.dumps(x, ensure_ascii=False)


# ---- format → route mapping used by the listing pages -----------------------
FORMAT_HREF = {
    'Sách số': '#/sach/?type=ebooks',
    'Sách giấy': '#/sach/?type=paperbooks',
    'Sách nói': '#/sach/?type=audiobooks',
    'Phim tài liệu': '#/sach/?type=videobooks',
}

KIND = {
    'Mượn sách': 'pdf',
    'Sách giấy': 'paper',
    'Audio': 'audio',
    'Video': 'video',
    'Xem VR': 'vr',
}

known = {'/sach/' + re.sub(r'[\s\u00a0]+$', '', s) + '.html' for s in d}

by_norm = {re.sub(r'[\s\u00a0]+$', '', k): v for k, v in d.items()}
records = []

def norm(s):
    """canonical slug: the original emits a couple with a trailing nbsp"""
    return re.sub(r'[\s\u00a0]+$', '', s)


for raw_slug, v in d.items():
    slug = norm(raw_slug)
    title = v.get('title') or v.get('localTitle') or slug
    img = map_img(v.get('remoteImg')) or v['localImg']

    mid = [c for c in v['crumbs'] if not c['active']][2:]
    category = mid[0] if mid else None

    formats = [f for f in v.get('formats', []) if f]

    buttons = []
    for b in v['buttons']:
        kind = KIND.get(b['label'], 'paper')
        href = b['href']
        
        buttons.append({'label': b['label'], 'kind': kind,
                        'primary': b['primary'],
                        'href': href if href.startswith('/sach/') else ''})

    related = []
    for r in v['related']:
        rhref = '/sach/' + norm(r['href'].split('/sach/')[-1].replace('.html', '')) + '.html'
        if rhref not in known:
            continue  
        rslug = norm(r['href'].split('/sach/')[-1].replace('.html', ''))
        if rslug == slug:
            continue
        rimg = map_img(r['remoteImg']) or by_norm.get(rslug, {}).get('localImg')
        if not rimg:
            continue
        related.append({'slug': rslug})

    records.append({
        'slug': slug,
        'title': title,
        'author': v.get('author', ''),
        'img': img,
        'rating': v.get('rating', 0),
        'formats': formats,
        'category': category,
        'buttons': buttons,
        'catalog': v['catalog'],
        'summary': v['summary'],
        'related': [r['slug'] for r in related],
    })

records.sort(key=lambda r: r['slug'])

out = []
out.append("""import type { Book } from '../components/BookCard';

/**
 * Per-book detail records scraped from thuviennguyenanninh.vn.
 * One entry per book whose cover art ships in /public/assets/books.
 */

/** action button under the cover ("Mượn sách", "Audio", "Video"…) */
export type BookAction = {
  label: string;
  /** picks the icon and the click behaviour */
  kind: 'pdf' | 'paper' | 'audio' | 'video' | 'vr';
  /** filled = primary brown button, outline otherwise */
  primary: boolean;
  /** reader route on the live site; empty when the original opens a modal */
  href: string;
};

export type BookDetail = {
  slug: string;
  title: string;
  author: string;
  img: string;
  rating: number;
  /** "Định dạng" chips, e.g. ["Sách giấy", "Sách số"] */
  formats: string[];
  /** breadcrumb category, e.g. { label: 'Lịch sử', href: '/sach/lich-su/' } */
  category?: { label: string; href: string };
  actions: BookAction[];
  /** "Thông tin biên mục" rows */
  catalog: string[];
  /** "Nội dung sách" paragraphs */
  summary: string[];
  /** slugs of "Sách/ Tài liệu cùng thể loại" */
  related: string[];
};

/** listing route for a "Định dạng" chip */
export const FORMAT_HREF: Record<string, string> = {""")

for k, v in FORMAT_HREF.items():
    out.append(f'  {json.dumps(k, ensure_ascii=False)}: {json.dumps(v)},')
out.append('};\n')

out.append('export const bookDetails: BookDetail[] = [')
for r in records:
    out.append('  {')
    out.append(f'    slug: {ts(r["slug"])},')
    out.append(f'    title: {ts(r["title"])},')
    out.append(f'    author: {ts(r["author"])},')
    out.append(f'    img: {ts(r["img"])},')
    out.append(f'    rating: {ts(r["rating"])},')
    out.append(f'    formats: [{", ".join(ts(f) for f in r["formats"])}],')
    if r['category']:
        c = r['category']
        out.append(f'    category: {{ label: {ts(c["label"])}, href: {ts(c["href"])} }},')
    if r['actions'] if 'actions' in r else r['buttons']:
        out.append('    actions: [')
        for b in r['buttons']:
            out.append(f'      {{ label: {ts(b["label"])}, kind: {ts(b["kind"])}, '
                       f'primary: {ts(b["primary"])}, href: {ts(b["href"])} }},')
        out.append('    ],')
    else:
        out.append('    actions: [],')
    if r['catalog']:
        out.append('    catalog: [')
        for line in r['catalog']:
            out.append(f'      {ts(line)},')
        out.append('    ],')
    else:
        out.append('    catalog: [],')
    if r['summary']:
        out.append('    summary: [')
        for p in r['summary']:
            out.append(f'      {ts(p)},')
        out.append('    ],')
    else:
        out.append('    summary: [],')
    out.append(f'    related: [{", ".join(ts(s) for s in r["related"])}],')
    out.append('  },')
out.append('];\n')

out.append("""/** slug → record, for O(1) route lookups */
export const bookBySlug: Record<string, BookDetail> = Object.fromEntries(
  bookDetails.map((b) => [b.slug, b]),
);

/** detail record → BookCard shape, for the related-books row */
export function toCard(b: BookDetail): Book {
  return {
    title: b.title,
    author: b.author,
    img: b.img,
    href: `/sach/${b.slug}.html`,
    rating: b.rating,
  };
}

/**
 * "Sách/ Tài liệu cùng thể loại": the scraped list first, then same-category
 * books as filler so every page shows a full row like the original.
 */
export function relatedBooks(b: BookDetail, limit = 5): Book[] {
  const seen = new Set([b.slug]);
  const out: BookDetail[] = [];

  for (const slug of b.related) {
    const r = bookBySlug[slug];
    if (r && !seen.has(slug)) {
      seen.add(slug);
      out.push(r);
    }
  }

  if (out.length < limit && b.category) {
    for (const r of bookDetails) {
      if (out.length >= limit) break;
      if (!seen.has(r.slug) && r.category?.href === b.category.href) {
        seen.add(r.slug);
        out.push(r);
      }
    }
  }

  for (const r of bookDetails) {
    if (out.length >= limit) break;
    if (!seen.has(r.slug)) {
      seen.add(r.slug);
      out.push(r);
    }
  }

  return out.slice(0, limit).map(toCard);
}
""")

path = f'{ROOT}/src/data/detail.ts'
open(path, 'w', encoding='utf-8').write('\n'.join(out))
print('wrote', path, len('\n'.join(out)), 'bytes,', len(records), 'records')
print('with catalog:', sum(1 for r in records if r['catalog']))
print('with summary:', sum(1 for r in records if r['summary']))
print('with category:', sum(1 for r in records if r['category']))
print('with related:', sum(1 for r in records if r['related']))
print('multi-action:', sum(1 for r in records if len(r['buttons']) > 1))