import canonicalData from '../data/critters.json';
import overlayData from '../data/overlay.json';
import locationMap from '../data/location-map.json';

export type CritterCategory = 'bugs' | 'fish' | 'seafood';

/** Wiki canonical (sync 스크립트가 매번 덮어쓰는 영문 데이터). */
interface CanonicalCritter {
  id: string;
  englishName: string;
  price: number;
  time: string;
  months: number[];
  location?: string; // 위키 원문(영문)
  size?: string;
  speed?: string;
  image?: string;
  number?: number;
  rarity?: string;
}

/** 손으로 관리하는 한국어 + 메타 오버레이. */
interface OverlayEntry {
  name?: string;
  location?: string; // 한국어 location 으로 덮어쓰기(생략하면 location-map 으로 자동 번역)
  condition?: string;
  rainOnly?: boolean;
  desc?: string;
}

/** UI 가 사용하는 병합된 모양 — 기존 코드와의 호환을 유지. */
export interface Critter {
  id: string;
  name: string;
  englishName: string;
  price: number;
  time: string;
  months: number[];
  location?: string;
  size?: string;
  speed?: string;
  image?: string;
  number?: number;
  rarity?: string;
  rainOnly: boolean;
  condition: string;
  desc?: string;
  /** overlay 에 한국어 이름이 없어 영문으로 표시되는 경우 true. */
  needsKoreanName?: boolean;
}

type CanonicalData = Record<CritterCategory, CanonicalCritter[]>;
type OverlayData = Record<CritterCategory, Record<string, OverlayEntry>>;
type LocationMap = Record<CritterCategory, Record<string, string>>;

const CANONICAL = canonicalData as unknown as CanonicalData;
const OVERLAY = overlayData as unknown as OverlayData;
const LOCATION_MAP = locationMap as unknown as LocationMap;

// 영문명 대소문자 변동(Nookipedia Title-Case ↔ 시드 lowercase)에도 매칭되도록
// 모듈 로드 시 한 번 lowercase-키 인덱스를 만든다.
const OVERLAY_INDEX: Record<CritterCategory, Record<string, OverlayEntry>> = {
  bugs: {},
  fish: {},
  seafood: {},
};
for (const cat of ['bugs', 'fish', 'seafood'] as const) {
  for (const [enName, entry] of Object.entries(OVERLAY[cat] ?? {})) {
    OVERLAY_INDEX[cat][enName.toLowerCase()] = entry;
  }
}

function resolveLocation(
  category: CritterCategory,
  overlay: OverlayEntry,
  canonicalLoc: string | undefined
): string | undefined {
  if (overlay.location) return overlay.location;
  if (canonicalLoc) {
    return LOCATION_MAP[category]?.[canonicalLoc] ?? canonicalLoc;
  }
  return undefined;
}

function mergeCritter(
  category: CritterCategory,
  canonical: CanonicalCritter
): Critter {
  const overlay = OVERLAY_INDEX[category][canonical.englishName.toLowerCase()] ?? {};
  const koreanName = overlay.name;
  return {
    id: canonical.id,
    englishName: canonical.englishName,
    name: koreanName ?? canonical.englishName,
    price: canonical.price,
    time: canonical.time,
    months: canonical.months,
    location: resolveLocation(category, overlay, canonical.location),
    size: canonical.size,
    speed: canonical.speed,
    image: canonical.image,
    number: canonical.number,
    rarity: canonical.rarity,
    rainOnly: overlay.rainOnly === true,
    condition: overlay.condition ?? 'none',
    desc: overlay.desc,
    needsKoreanName: koreanName == null,
  };
}

function buildAll(): Record<CritterCategory, Critter[]> {
  const out = { bugs: [] as Critter[], fish: [] as Critter[], seafood: [] as Critter[] };
  for (const cat of ['bugs', 'fish', 'seafood'] as const) {
    for (const c of CANONICAL[cat] ?? []) {
      out[cat].push(mergeCritter(cat, c));
    }
  }
  return out;
}

export const ALL_CRITTERS: Record<CritterCategory, Critter[]> = buildAll();

export function isAvailableNow(timeStr: string, hour: number): boolean {
  if (timeStr === '24시간') return true;
  const intervals = timeStr.split(',');
  return intervals.some((interval) => {
    const parts = interval.split('-');
    if (parts.length !== 2) return false;
    const start = parseInt(parts[0].trim().split(':')[0]);
    const end = parseInt(parts[1].trim().split(':')[0]);
    if (Number.isNaN(start) || Number.isNaN(end)) return false;
    if (start < end) return hour >= start && hour < end;
    return hour >= start || hour < end;
  });
}

export function checkIfNew(item: Critter, month: number | null): boolean {
  if (!month) return false;
  const prev = month === 1 ? 12 : month - 1;
  return !item.months.includes(prev);
}

export function checkIfLeaving(item: Critter, month: number | null): boolean {
  if (!month) return false;
  const next = month === 12 ? 1 : month + 1;
  return !item.months.includes(next);
}

export interface Progress {
  count: number;
  total: number;
  percentage: number;
}

export function getProgress(
  category: CritterCategory,
  selectedMonth: number | null,
  donated: Record<string, boolean>
): Progress {
  const list = selectedMonth
    ? ALL_CRITTERS[category].filter((i) => i.months.includes(selectedMonth))
    : ALL_CRITTERS[category];
  const total = list.length;
  const count = list.filter((i) => donated[i.id]).length;
  return {
    count,
    total,
    percentage: total > 0 ? Math.round((count / total) * 100) : 0,
  };
}

export function getLocations(category: CritterCategory): string[] {
  const items = ALL_CRITTERS[category] ?? [];
  const locs: string[] = [];
  for (const item of items) {
    if (item.location && !locs.includes(item.location)) {
      locs.push(item.location);
    }
  }
  return ['전체', ...locs];
}

/**
 * 물고기 그림자 크기 정규화.
 * 시드 잔존 한국어 "N단계" 표기와 Nookipedia 영문 라벨(Tiny~Huge, Long, "(finned)") 을
 * 하나의 카테고리 키로 통일한다.
 */
export interface FishSize {
  key: string; // '1'~'6' | 'long' | 'unknown'
  label: string;
  hasFin: boolean;
}

const ENGLISH_SIZE_LEVEL: Record<string, string> = {
  tiny: '1',
  small: '2',
  medium: '3',
  large: '4',
  'very large': '5',
  huge: '6',
};

export const FISH_SIZE_LABELS: Record<string, string> = {
  '1': '① 가장 작음',
  '2': '② 작음',
  '3': '③ 보통',
  '4': '④ 큼',
  '5': '⑤ 매우 큼',
  '6': '⑥ 가장 큼',
  long: '길쭉함 (장어류)',
};

const FISH_SIZE_ORDER = ['1', '2', '3', '4', '5', '6', 'long'];

export function normalizeFishSize(raw?: string): FishSize | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s) return null;
  const lower = s.toLowerCase();
  const hasFin = s.includes('등지느러미') || lower.includes('finned');

  const stage = s.match(/([1-6])\s*단계/);
  if (stage) {
    const key = stage[1];
    return { key, label: FISH_SIZE_LABELS[key], hasFin };
  }

  if (lower.includes('long')) {
    return { key: 'long', label: FISH_SIZE_LABELS.long, hasFin };
  }

  const base = lower.replace(/\s*\(finned\)\s*/, '').trim();
  const key = ENGLISH_SIZE_LEVEL[base];
  if (key) {
    return { key, label: FISH_SIZE_LABELS[key], hasFin };
  }

  return { key: 'unknown', label: s, hasFin };
}

export function getFishSizes(): { key: string; label: string }[] {
  const present = new Set<string>();
  for (const fish of ALL_CRITTERS.fish ?? []) {
    const size = normalizeFishSize(fish.size);
    if (size && size.key !== 'unknown') present.add(size.key);
  }
  return FISH_SIZE_ORDER.filter((k) => present.has(k)).map((key) => ({
    key,
    label: FISH_SIZE_LABELS[key],
  }));
}

const RARITY_META: Record<
  string,
  { order: number; label: string; badgeClass: string }
> = {
  'very common': {
    order: 1,
    label: '매우 흔함',
    badgeClass: 'bg-slate-100 text-slate-500',
  },
  common: { order: 2, label: '흔함', badgeClass: 'bg-slate-100 text-slate-600' },
  uncommon: {
    order: 3,
    label: '약간 드묾',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  rare: { order: 4, label: '희귀', badgeClass: 'bg-sky-100 text-sky-700' },
  'very rare': {
    order: 5,
    label: '매우 희귀',
    badgeClass: 'bg-purple-100 text-purple-700',
  },
  'ultra-rare': {
    order: 6,
    label: '초희귀',
    badgeClass: 'bg-fuchsia-100 text-fuchsia-700',
  },
};

export function rarityMeta(raw?: string): {
  label: string;
  badgeClass: string;
} | null {
  if (!raw) return null;
  const meta = RARITY_META[raw.trim().toLowerCase()];
  if (meta) return { label: meta.label, badgeClass: meta.badgeClass };
  return { label: raw.trim(), badgeClass: 'bg-amber-100 text-amber-700' };
}

/** 가격 슬라이더 — "최소 N벨 이상" 임계값 필터. 1,000벨 단위. */
export const PRICE_STEP = 1000;
export const PRICE_MAX = 15000; // 데이터상 상한(금송어 15,000)

export function matchesMinPrice(price: number, minPrice: number): boolean {
  return price >= minPrice;
}

export function formatMinPrice(minPrice: number): string {
  if (minPrice <= 0) return '전체 가격';
  return `${minPrice.toLocaleString()}벨 이상`;
}

export function getRarities(category: CritterCategory): string[] {
  const present = new Set<string>();
  for (const item of ALL_CRITTERS[category] ?? []) {
    if (item.rarity && item.rarity.trim()) present.add(item.rarity.trim());
  }
  const order = (r: string) => RARITY_META[r.toLowerCase()]?.order ?? 99;
  return [...present].sort((a, b) => order(a) - order(b) || a.localeCompare(b));
}
