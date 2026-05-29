import { useEffect, useMemo, useState } from 'react';
import { Search, X, Check } from 'lucide-react';
import type { CritterCategory } from '../lib/critterAvailability';

interface LocationSheetProps {
  open: boolean;
  onClose: () => void;
  category: CritterCategory;
  locations: string[]; // '전체' 포함된 리스트
  selected: string;
  onSelect: (loc: string) => void;
}

interface LocationGroup {
  title: string;
  icon: string;
  test: (loc: string) => boolean;
}

// 곤충: 23종을 의미별로 5그룹으로 분류. 매칭 안 되면 '기타' 로.
const BUG_GROUPS: LocationGroup[] = [
  { title: '공중', icon: '✈️', test: (l) => l.includes('공중') || l.includes('불빛') },
  { title: '나무', icon: '🌳', test: (l) => l.includes('나무') || l.includes('야자수') || l.includes('그루터기') },
  { title: '꽃', icon: '🌸', test: (l) => l.includes('꽃') },
  { title: '바위·땅', icon: '🪨', test: (l) => l.includes('바위') || l.includes('땅') || l.includes('해안') || l.includes('강') || l.includes('연못') },
];

const FISH_GROUPS: LocationGroup[] = [
  { title: '강·연못', icon: '💧', test: (l) => l.includes('강') || l.includes('연못') },
  { title: '바다', icon: '🌊', test: (l) => l.includes('바다') },
  { title: '부두', icon: '⚓', test: (l) => l.includes('부두') },
];

function groupLocations(
  locations: string[],
  category: CritterCategory
): { title: string; icon: string; items: string[] }[] {
  const groups = category === 'fish' ? FISH_GROUPS : BUG_GROUPS;
  const buckets = groups.map((g) => ({ title: g.title, icon: g.icon, items: [] as string[] }));
  const other: string[] = [];
  for (const loc of locations) {
    if (loc === '전체') continue;
    const idx = groups.findIndex((g) => g.test(loc));
    if (idx >= 0) buckets[idx].items.push(loc);
    else other.push(loc);
  }
  const out = buckets.filter((b) => b.items.length > 0);
  if (other.length > 0) out.push({ title: '기타', icon: '🐌', items: other });
  return out;
}

export function LocationSheet({
  open,
  onClose,
  category,
  locations,
  selected,
  onSelect,
}: LocationSheetProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (open) setQuery('');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const groups = useMemo(() => {
    const filtered = query.trim()
      ? locations.filter((l) => l.toLowerCase().includes(query.trim().toLowerCase()))
      : locations;
    return groupLocations(filtered, category);
  }, [locations, category, query]);

  if (!open) return null;

  const pickAndClose = (loc: string) => {
    onSelect(loc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-4xl bg-white rounded-t-3xl shadow-xl max-h-[80vh] flex flex-col">
        <div className="px-5 pt-3 pb-2 flex-shrink-0">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto mb-3" />
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
              📍 <span>출현 장소 선택</span>
            </h3>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="닫기"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="px-5 pb-3 flex-shrink-0">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              autoFocus
              placeholder="장소 검색..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
        </div>

        <div className="px-5 pb-5 overflow-y-auto flex-1 space-y-4">
          <button
            onClick={() => pickAndClose('전체')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              selected === '전체'
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>전체 장소</span>
            {selected === '전체' && <Check size={16} />}
          </button>

          {groups.length === 0 && query.trim() && (
            <p className="text-xs text-slate-400 text-center py-8">
              "{query}" 와 일치하는 장소가 없습니다.
            </p>
          )}

          {groups.map((g) => (
            <div key={g.title}>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                {g.icon} {g.title}{' '}
                <span className="text-slate-400 font-normal">({g.items.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((loc) => {
                  const active = loc === selected;
                  return (
                    <button
                      key={loc}
                      onClick={() => pickAndClose(loc)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        active
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-200'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {loc}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
