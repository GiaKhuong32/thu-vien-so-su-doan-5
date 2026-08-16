#!/usr/bin/env python3
"""Scrape detail pages for the 60 books referenced in src/data/*.ts."""
import glob
import html
import json
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = '/workspace/project/nan-clone'
CACHE = '/tmp/pages'
BASE = 'https://thuviennguyenanninh.vn'
os.makedirs(CACHE, exist_ok=True)


def local_books():
    """slug -> {title, author, img} from the local data files."""
    out = {}
    for f in glob.glob(f'{ROOT}/src/data/*.ts'):
        s = open(f, encoding='utf-8').read()
        for blk in re.findall(r'\{\s*title:.*?\}', s, re.S):
            t = re.search(r'title:\s*"((?:[^"\\]|\\.)*)"', blk)
            a = re.search(r'author:\s*"((?:[^"\\]|\\.)*)"', blk)
            i = re.search(r'img:\s*"([^"]+)"', blk)
            h = re.search(r'href:\s*"([^"]+)"', blk)
            if not (t and i and h):
                continue
            href = html.unescape(h.group(1).replace('&#xA0;', ' '))
            slug = href.split('/sach/')[-1].replace('.html', '')
            out.setdefault(slug, {
                'slug': slug,
                'title': html.unescape(t.group(1)),
                'author': html.unescape(a.group(1)) if a else '',
                'img': i.group(1),
            })
    return out


def fetch(slug):
    p = f'{CACHE}/{slug}.html'
    if os.path.exists(p) and os.path.getsize(p) > 5000:
        return open(p, encoding='utf-8', errors='replace').read()
    url = f'{BASE}/sach/{slug}.html'
    for _ in range(3):
        r = subprocess.run(['curl', '-sL', '--max-time', '45', '-A', 'Mozilla/5.0',
                            url, '-o', p], capture_output=True)
        if r.returncode == 0 and os.path.exists(p) and os.path.getsize(p) > 5000:
            return open(p, encoding='utf-8', errors='replace').read()
    print('FAIL', slug, file=sys.stderr)
    return None


def clean(x):
    x = re.sub(r'<[^>]+>', '', x)
    x = html.unescape(x).replace('\xa0', ' ')
    return re.sub(r'\s+', ' ', x).strip()


def paras(block):
    """<p> rows -> list of clean strings (catalogue lines / summary paragraphs)."""
    items = re.findall(r'<p[^>]*>(.*?)</p>', block, re.S)
    if not items:
        items = re.split(r'<br\s*/?>', block)
    out = []
    for it in items:
        t = clean(it).lstrip('-').strip()
        if t:
            out.append(t)
    return out


def parse(slug, s):
    d = {'slug': slug}

    i = s.find('class="row brief')
    brief = s[i:i + 6000] if i >= 0 else ''

    m = re.search(r'<h1 class="[^"]*">\s*(.*?)\s*</h1>', brief, re.S)
    if m:
        d['title'] = clean(m.group(1))

    m = re.search(r'label">Tác giả:</span>.*?fw-bold">(.*?)</span>', brief, re.S)
    d['author'] = clean(m.group(1)) if m else ''

    m = re.search(r'<img src="([^"]+)"', brief)
    if m:
        d['remoteImg'] = m.group(1)

    m = re.search(r'rate-point[^>]*>\s*([\d.]+)/5', brief)
    d['rating'] = float(m.group(1)) if m else 0.0

    # "Định dạng" chips
    fm = re.search(r'label">Định dạng:</span>(.*?)(?=<div class="mb-3 group-button|</div>\s*</div>\s*<div class="mb-3)', brief, re.S)
    d['formats'] = [clean(x) for x in re.findall(r'<div class="category">(.*?)</div>', fm.group(1), re.S)] if fm else []

    # "Thể loại" chips (links)
    cm = re.search(r'label">Thể loại:</span>(.*?)(?=<div class="mb-3|<div class="mb-4|</div>\s*</div>\s*<div)', brief, re.S)
    cats = []
    if cm:
        for href, lab in re.findall(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', cm.group(1), re.S):
            lab = clean(lab)
            if lab:
                cats.append({'label': lab, 'href': href})
    d['categories'] = cats

    # action buttons
    btns = []
    lb = re.search(r'<div class="list-button">(.*?)</div>\s*</div>', brief, re.S)
    if lb:
        for tag in re.findall(r'<a\s[^>]*class="btn[^"]*".*?</a>', lb.group(1), re.S):
            label = clean(re.sub(r'<i[^>]*>.*?</i>', '', tag))
            href = re.search(r'href="([^"]*)"', tag)
            primary = 'btn-primary' in re.search(r'class="([^"]*)"', tag).group(1)
            icon = re.search(r'<i class="([^"]*)"', tag)
            if label:
                btns.append({
                    'label': label,
                    'href': href.group(1) if href else '#',
                    'primary': primary,
                    'icon': icon.group(1) if icon else '',
                })
    d['buttons'] = btns

    # breadcrumb (skip Trang chủ / Thư viện / active title)
    bc = re.search(r'<ol class="breadcrumb">(.*?)</ol>', s, re.S)
    crumbs = []
    if bc:
        for li in re.findall(r'<li class="breadcrumb-item([^"]*)">(.*?)</li>', bc.group(1), re.S):
            a = re.search(r'href="([^"]*)"[^>]*>(.*?)</a>', li[1], re.S)
            if a:
                crumbs.append({'label': clean(a.group(2)), 'href': a.group(1),
                               'active': 'active' in li[0]})
    d['crumbs'] = crumbs

    # catalogue
    cat = re.search(r'Thông tin biên mục.*?<div class="toggle-group[^"]*">(.*?)</div>', s, re.S)
    d['catalog'] = paras(cat.group(1)) if cat else []

    # summary
    sm = re.search(r'Nội dung sách.*?<div class="desc[^"]*">(.*?)</div>', s, re.S)
    d['summary'] = paras(sm.group(1)) if sm else []

    # related books
    rel = []
    rb = s.find('block-other-products')
    if rb > 0:
        for blk in re.findall(r'<div class="block">(.*?)</div>\s*</div>\s*</div>', s[rb:], re.S)[:12]:
            h = re.search(r'href="(/sach/[^"]+)"', blk)
            t = re.search(r'<h3 class="tt">(.*?)</h3>', blk, re.S)
            im = re.search(r'<img src="([^"]+)"', blk)
            au = re.search(r'name-author">(.*?)</div>', blk, re.S)
            if h and t:
                rel.append({'href': h.group(1), 'title': clean(t.group(1)),
                            'remoteImg': im.group(1) if im else '',
                            'author': clean(au.group(1)) if au else ''})
    d['related'] = rel
    return d


def main():
    books = local_books()
    print('local books:', len(books), file=sys.stderr)
    results = {}

    def work(slug):
        s = fetch(slug)
        if not s:
            return slug, None
        return slug, parse(slug, s)

    with ThreadPoolExecutor(max_workers=6) as ex:
        for slug, d in ex.map(work, list(books)):
            if d:
                d['localImg'] = books[slug]['img']
                d['localTitle'] = books[slug]['title']
                results[slug] = d
            else:
                results[slug] = {'slug': slug, 'failed': True, **books[slug]}

    json.dump(results, open('/tmp/detail.json', 'w', encoding='utf-8'),
              ensure_ascii=False, indent=1)
    ok = [k for k, v in results.items() if not v.get('failed')]
    print('scraped ok:', len(ok), '/', len(books), file=sys.stderr)
    print('with catalog:', sum(1 for k in ok if results[k]['catalog']), file=sys.stderr)
    print('with summary:', sum(1 for k in ok if results[k]['summary']), file=sys.stderr)
    print('with cats:', sum(1 for k in ok if results[k]['categories']), file=sys.stderr)
    print('with related:', sum(1 for k in ok if results[k]['related']), file=sys.stderr)


main()