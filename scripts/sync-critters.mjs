#!/usr/bin/env node
/**
 * Nookipedia MediaWiki Cargo extension 에서 NH 곤충/물고기/해산물 데이터를 받아와
 * src/data/critters.json (canonical) 을 업데이트한다.
 *
 * 새 구조:
 *  - src/data/critters.json — 위키에서 받은 영문 데이터(canonical, 매 sync마다 덮어씀)
 *  - src/data/overlay.json — 손으로 관리하는 한국어 이름/메타(sync 가 절대 안 건드림)
 *
 * 동작 규칙:
 *  - 영문 이름(englishName) 이 1차 키.
 *  - 기존 entry 의 id 는 영문 이름 매칭으로 보존(기증 기록 안 깨짐).
 *  - 위키에 새로 생긴 종은 다음 id 를 할당해 추가.
 *  - 위키에서 사라진 종은 보존(데이터 일시 누락 대비) — 다음 PR 리뷰에서 결정.
 *  - 네트워크 실패는 조용히 skip(exit 0) — sync 실패가 사이트를 깨면 안 된다.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CRITTERS_PATH = resolve(ROOT, 'src/data/critters.json');

const USER_AGENT =
  'nooki-sync/1.0 (https://github.com/purisia/nooki; +https://purisia.github.io/nooki/)';
const API = 'https://nookipedia.com/w/api.php';
const TIMEOUT_MS = 15_000;

const COMMON_EXTRA = ['image=image', 'number=number', 'rarity=rarity'];

const TABLES = {
  fish: {
    table: 'nh_fish',
    fields: [
      'name=name',
      'sell_nook=price',
      'location=location',
      'shadow_size=shadow',
      'time=time',
      ...COMMON_EXTRA,
      'n_m1=m1','n_m2=m2','n_m3=m3','n_m4=m4','n_m5=m5','n_m6=m6',
      'n_m7=m7','n_m8=m8','n_m9=m9','n_m10=m10','n_m11=m11','n_m12=m12',
    ],
  },
  bugs: {
    table: 'nh_bug',
    fields: [
      'name=name',
      'sell_nook=price',
      'location=location',
      'time=time',
      ...COMMON_EXTRA,
      'n_m1=m1','n_m2=m2','n_m3=m3','n_m4=m4','n_m5=m5','n_m6=m6',
      'n_m7=m7','n_m8=m8','n_m9=m9','n_m10=m10','n_m11=m11','n_m12=m12',
    ],
  },
  seafood: {
    table: 'nh_sea_creature',
    fields: [
      'name=name',
      'sell_nook=price',
      'shadow_movement=speed',
      'time=time',
      ...COMMON_EXTRA,
      'n_m1=m1','n_m2=m2','n_m3=m3','n_m4=m4','n_m5=m5','n_m6=m6',
      'n_m7=m7','n_m8=m8','n_m9=m9','n_m10=m10','n_m11=m11','n_m12=m12',
    ],
  },
};

const ID_PREFIX = { bugs: 'b', fish: 'f', seafood: 's' };

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...opts,
      signal: ctrl.signal,
      headers: { 'User-Agent': USER_AGENT, ...(opts.headers ?? {}) },
    });
  } finally {
    clearTimeout(t);
  }
}

async function cargoQuery(category) {
  const { table, fields } = TABLES[category];
  const url = new URL(API);
  url.searchParams.set('action', 'cargoquery');
  url.searchParams.set('format', 'json');
  url.searchParams.set('tables', table);
  url.searchParams.set('fields', fields.join(','));
  url.searchParams.set('limit', '500');

  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) {
      const backoff = 5000 * attempt;
      console.error(`[${category}] backoff ${backoff}ms before retry ${attempt + 1}`);
      await new Promise((r) => setTimeout(r, backoff));
    }
    try {
      const res = await fetchWithTimeout(url.toString());
      if (res.status === 403) {
        console.error(`[${category}] 403 Forbidden — likely transient throttle on this IP`);
        lastErr = new Error('HTTP 403');
        continue;
      }
      if (!res.ok) {
        lastErr = new Error(`HTTP ${res.status}`);
        continue;
      }
      const json = await res.json();
      if (!json?.cargoquery) {
        lastErr = new Error('Missing cargoquery in response');
        continue;
      }
      return json.cargoquery.map((row) => row.title);
    } catch (e) {
      lastErr = e;
      console.error(`[${category}] attempt ${attempt + 1} failed: ${e.message}`);
    }
  }
  console.error(`[${category}] giving up: ${lastErr?.message}`);
  return null;
}

const NUM_MONTHS = ['m1','m2','m3','m4','m5','m6','m7','m8','m9','m10','m11','m12'];

function rowToMonths(row) {
  const months = [];
  NUM_MONTHS.forEach((k, i) => {
    if (row[k] && String(row[k]).trim() && row[k] !== '0' && row[k] !== 'NA') {
      months.push(i + 1);
    }
  });
  return months;
}

function normalizeTime(timeRaw) {
  if (!timeRaw) return '24시간';
  const t = String(timeRaw).trim();
  if (!t || t.toLowerCase().includes('all day')) return '24시간';

  const ampmToHour = (token) => {
    const m = token.match(/(\d+)\s*(AM|PM|am|pm)/);
    if (!m) return null;
    let h = parseInt(m[1]);
    const ap = m[2].toUpperCase();
    if (ap === 'PM' && h !== 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
    return h.toString().padStart(2, '0');
  };

  const segments = t.split(/;|,|、/).map((s) => s.trim()).filter(Boolean);
  const parts = segments.map((seg) => {
    const range = seg.split(/[–\-—~]/).map((x) => x.trim());
    if (range.length !== 2) return null;
    const a = ampmToHour(range[0]);
    const b = ampmToHour(range[1]);
    if (!a || !b) return null;
    return `${a}:00 - ${b}:00`;
  }).filter(Boolean);

  return parts.length > 0 ? parts.join(', ') : '24시간';
}

// Cargo 의 image 컬럼은 파일명(예: "Common Butterfly NH Icon.png")만 반환한다.
// Nookipedia 의 MediaWiki 파일 호스팅 규약(파일명 MD5 → 첫 1글자/2글자 디렉터리)으로
// CDN URL 을 합성한다. imageinfo API 응답과 일치 확인됨.
function wikiImageUrl(filename) {
  const norm = filename.replace(/ /g, '_');
  const h = createHash('md5').update(norm).digest('hex');
  return `https://dodo.ac/np/images/${h[0]}/${h.slice(0, 2)}/${norm}`;
}

function nextIdAllocator(existing, category) {
  const prefix = ID_PREFIX[category];
  let max = existing.reduce((acc, item) => {
    const m = item.id?.match(new RegExp(`^${prefix}(\\d+)$`));
    return m ? Math.max(acc, parseInt(m[1])) : acc;
  }, 0);
  return () => `${prefix}${++max}`;
}

// 위키 row → canonical entry. id 는 호출 측에서 보존/할당.
function rowToCanonical(row, id) {
  const englishName = String(row.name ?? '').trim();
  const months = rowToMonths(row);
  const out = {
    id,
    englishName,
    price: parseInt(row.price) || 0,
    time: normalizeTime(row.time),
    months,
  };
  if (row.location) {
    const loc = String(row.location).trim();
    if (loc) out.location = loc;
  }
  if (row.shadow) {
    const s = String(row.shadow).trim();
    if (s) out.size = s;
  }
  if (row.speed) {
    const s = String(row.speed).trim();
    if (s) out.speed = s;
  }
  if (row.image) {
    const img = String(row.image).trim();
    if (img) out.image = wikiImageUrl(img);
  }
  if (row.number != null && String(row.number).trim() !== '') {
    const n = parseInt(row.number);
    if (!Number.isNaN(n)) out.number = n;
  }
  if (row.rarity) {
    const r = String(row.rarity).trim();
    if (r) out.rarity = r;
  }
  return out;
}

async function main() {
  const crittersRaw = await readFile(CRITTERS_PATH, 'utf-8');
  const critters = JSON.parse(crittersRaw);

  const summary = { updated: 0, added: 0, untouched: 0, missing: [] };
  const categories = /** @type {const} */ (['bugs', 'fish', 'seafood']);

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    if (i > 0) await new Promise((r) => setTimeout(r, 3000));
    const rows = await cargoQuery(category);
    if (rows === null) {
      console.error(`[${category}] skip — keeping existing canonical`);
      continue;
    }

    const existing = critters[category] ?? [];
    // 영문 이름(소문자) → 기존 entry. id 보존용.
    const byEnglish = new Map();
    for (const c of existing) {
      if (c.englishName) byEnglish.set(c.englishName.toLowerCase(), c);
    }
    const nextId = nextIdAllocator(existing, category);
    const seenEnglish = new Set();
    const next = [];

    for (const row of rows) {
      const englishName = String(row.name ?? '').trim();
      if (!englishName) continue;
      const key = englishName.toLowerCase();
      if (seenEnglish.has(key)) continue; // 위키 응답 자체에 중복 있을 경우 가드
      seenEnglish.add(key);

      const months = rowToMonths(row);
      if (months.length === 0) continue;

      const existingEntry = byEnglish.get(key);
      const id = existingEntry?.id ?? nextId();
      const canonical = rowToCanonical(row, id);
      next.push(canonical);

      if (existingEntry) summary.updated++;
      else summary.added++;
    }

    // 위키에서 사라진 종은 보존(데이터 일시 누락 / 잠시 다른 표기 대비).
    for (const c of existing) {
      const key = (c.englishName ?? '').toLowerCase();
      if (key && !seenEnglish.has(key)) {
        next.push(c);
        summary.untouched++;
        summary.missing.push(`${category}/${c.englishName} (${c.id})`);
      }
    }

    // 안정적인 id 순으로 정렬해서 diff 가 작게 유지되도록.
    const prefix = ID_PREFIX[category];
    next.sort((a, b) => {
      const na = parseInt(String(a.id).slice(prefix.length)) || 0;
      const nb = parseInt(String(b.id).slice(prefix.length)) || 0;
      return na - nb;
    });
    critters[category] = next;
  }

  await writeFile(CRITTERS_PATH, JSON.stringify(critters, null, 2) + '\n');

  console.log(`Sync complete:`);
  console.log(`  updated  : ${summary.updated}`);
  console.log(`  added    : ${summary.added}`);
  console.log(`  preserved: ${summary.untouched} (not in current Cargo response)`);
  if (summary.missing.length > 0) {
    console.log(`  preserved list:`);
    for (const m of summary.missing) console.log(`    - ${m}`);
  }
}

main().catch((e) => {
  console.error('Unexpected error (treating as soft-fail):', e);
  process.exit(0);
});
