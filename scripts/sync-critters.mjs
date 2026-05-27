#!/usr/bin/env node
/**
 * Nookipedia MediaWiki Cargo extension에서 NH 곤충/물고기/해산물 데이터를
 * 받아와 src/data/critters.json 의 누락된 종을 보강한다.
 *
 * - 한국어 시드(현재 critters.json)는 절대 덮어쓰지 않는다.
 * - 누락된 종만 추가하고, name-map.json 매핑이 없으면 needsKoreanName 플래그를 단다.
 * - 변경이 있으면 critters.json을 다시 쓴다. (GitHub Actions가 PR 생성)
 * - 네트워크 실패는 조용히 skip (exit 0) — sync 실패가 사이트를 깨면 안 된다.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const CRITTERS_PATH = resolve(ROOT, 'src/data/critters.json');
const NAME_MAP_PATH = resolve(__dirname, 'name-map.json');

const USER_AGENT =
  'nooki-sync/1.0 (https://github.com/purisia/nooki; +https://purisia.github.io/nooki/)';
const API = 'https://nookipedia.com/w/api.php';
const TIMEOUT_MS = 15_000;

const TABLES = {
  fish: {
    table: 'nh_fish',
    fields: [
      'name=name',
      'sell_nook=price',
      'location=location',
      'shadow_size=shadow',
      'time=time',
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
      'n_m1=m1','n_m2=m2','n_m3=m3','n_m4=m4','n_m5=m5','n_m6=m6',
      'n_m7=m7','n_m8=m8','n_m9=m9','n_m10=m10','n_m11=m11','n_m12=m12',
    ],
  },
};

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

  // "4 AM – 9 PM" 또는 "4 AM - 9 PM" 같은 패턴
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

function buildIdFromExisting(seed, category) {
  const prefix = category === 'bugs' ? 'b' : category === 'fish' ? 'f' : 's';
  const max = seed.reduce((acc, item) => {
    const m = item.id?.match(new RegExp(`^${prefix}(\\d+)$`));
    return m ? Math.max(acc, parseInt(m[1])) : acc;
  }, 0);
  let counter = max;
  return () => `${prefix}${++counter}`;
}

async function main() {
  const [crittersRaw, nameMapRaw] = await Promise.all([
    readFile(CRITTERS_PATH, 'utf-8'),
    readFile(NAME_MAP_PATH, 'utf-8'),
  ]);
  const critters = JSON.parse(crittersRaw);
  const nameMap = JSON.parse(nameMapRaw);

  const changes = { bugs: [], fish: [], seafood: [] };

  const categories = /** @type {const} */ (['bugs', 'fish', 'seafood']);
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    if (i > 0) await new Promise((r) => setTimeout(r, 3000));
    const rows = await cargoQuery(category);
    if (rows === null) {
      console.error(`[${category}] skip — using existing data`);
      continue;
    }

    const existingNamesKo = new Set(
      (critters[category] ?? []).map((c) => c.name)
    );
    const existingEnglishLower = new Set(
      (critters[category] ?? [])
        .filter((c) => c.englishName)
        .map((c) => String(c.englishName).toLowerCase())
    );
    // Build case-insensitive map: lowercase English → Korean
    const mapForCategory = Object.fromEntries(
      Object.entries(nameMap[category] ?? {}).map(([k, v]) => [k.toLowerCase(), v])
    );

    const nextId = buildIdFromExisting(critters[category] ?? [], category);

    for (const row of rows) {
      const englishName = String(row.name ?? '').trim();
      if (!englishName) continue;
      const englishLower = englishName.toLowerCase();

      const koreanName = mapForCategory[englishLower];
      const finalName = koreanName ?? englishName;

      if (existingNamesKo.has(finalName)) continue;
      if (koreanName && existingNamesKo.has(koreanName)) continue;
      if (existingEnglishLower.has(englishLower)) continue;

      const months = rowToMonths(row);
      if (months.length === 0) continue;

      const price = parseInt(row.price) || 0;
      const time = normalizeTime(row.time);

      const item = {
        id: nextId(),
        name: finalName,
        price,
        time,
        rainOnly: false,
        condition: 'none',
        months,
      };

      if (row.location) item.location = String(row.location).trim();
      if (row.shadow) item.size = String(row.shadow).trim();
      if (row.speed) item.speed = String(row.speed).trim();
      if (!koreanName) item.needsKoreanName = true;
      // Always record English name for future re-matching even if Korean exists
      item.englishName = englishName;

      critters[category].push(item);
      changes[category].push({ english: englishName, addedAs: finalName, needsKoreanName: !koreanName });
    }
  }

  const totalChanges = changes.bugs.length + changes.fish.length + changes.seafood.length;
  if (totalChanges === 0) {
    console.log('No changes — critters.json is up to date.');
    return;
  }

  await writeFile(CRITTERS_PATH, JSON.stringify(critters, null, 2) + '\n');

  console.log(`Added ${totalChanges} new species:`);
  for (const cat of ['bugs', 'fish', 'seafood']) {
    if (changes[cat].length === 0) continue;
    console.log(`  ${cat}:`);
    for (const c of changes[cat]) {
      const mark = c.needsKoreanName ? '⚠️  needs Korean name' : '✅';
      console.log(`    ${mark}  ${c.english} → ${c.addedAs}`);
    }
  }
}

main().catch((e) => {
  console.error('Unexpected error (treating as soft-fail):', e);
  process.exit(0);
});
