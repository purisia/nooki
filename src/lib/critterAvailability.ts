import crittersData from '../data/critters.json';

export interface Critter {
  id: string;
  name: string;
  price: number;
  time: string;
  location?: string;
  size?: string;
  speed?: string;
  rainOnly: boolean;
  condition?: string;
  months: number[];
  desc?: string;
  needsKoreanName?: boolean;
  englishName?: string;
}

export type CritterCategory = 'bugs' | 'fish' | 'seafood';

export const ALL_CRITTERS = crittersData as Record<CritterCategory, Critter[]>;

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
 * 시드 데이터는 한국어 "N단계", Nookipedia 동기화분은 영문 라벨(Tiny~Huge, Long,
 * "(finned)")을 쓰기 때문에 둘을 하나의 카테고리 키로 통일한다.
 */
export interface FishSize {
  key: string; // 필터/그룹 키: '1'~'6' | 'long' | 'unknown'
  label: string; // 표시용 한국어 라벨
  hasFin: boolean; // 등지느러미 여부
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

  // 한국어 "N단계"
  const stage = s.match(/([1-6])\s*단계/);
  if (stage) {
    const key = stage[1];
    return { key, label: FISH_SIZE_LABELS[key], hasFin };
  }

  // 길쭉한 그림자 (장어류)
  if (lower.includes('long')) {
    return { key: 'long', label: FISH_SIZE_LABELS.long, hasFin };
  }

  // Nookipedia 영문 라벨 ("Very large (finned)" → "very large")
  const base = lower.replace(/\s*\(finned\)\s*/, '').trim();
  const key = ENGLISH_SIZE_LEVEL[base];
  if (key) {
    return { key, label: FISH_SIZE_LABELS[key], hasFin };
  }

  return { key: 'unknown', label: s, hasFin };
}

/** 물고기 데이터에 실제로 존재하는 크기 카테고리만 정렬해 반환. */
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
