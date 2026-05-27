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
