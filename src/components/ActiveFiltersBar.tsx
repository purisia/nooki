import { X, SlidersHorizontal } from 'lucide-react';

export interface ActiveFilter {
  key: string;
  label: string;
  onClear: () => void;
}

/**
 * 모바일 전용 하단 고정 바. 현재 적용 중인 필터를 항상 노출해
 * "필터 켜진 줄 모르고 도감을 보다 헷갈리는" 상황을 막는다.
 * 데스크톱(md+)에서는 숨김 — 필터 패널이 화면에 같이 보이므로.
 */
export function ActiveFiltersBar({
  filters,
  onClearAll,
  onOpenFilters,
}: {
  filters: ActiveFilter[];
  onClearAll: () => void;
  onOpenFilters: () => void;
}) {
  const active = filters.length > 0;
  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      <div className="max-w-4xl mx-auto px-3 py-2 flex items-center gap-2">
        <button
          onClick={onOpenFilters}
          className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1.5 active:bg-emerald-100"
        >
          <SlidersHorizontal size={13} />
          필터
        </button>

        {active ? (
          <>
            <div
              className="flex-1 flex gap-1.5 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {filters.map((f) => (
                <button
                  key={f.key}
                  onClick={f.onClear}
                  className="shrink-0 inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full pl-2.5 pr-1.5 py-1 text-xs font-semibold active:bg-emerald-100"
                >
                  {f.label}
                  <X size={12} className="text-emerald-400" />
                </button>
              ))}
            </div>
            <button
              onClick={onClearAll}
              className="shrink-0 text-[11px] font-bold text-rose-500 active:text-rose-700 px-1"
            >
              전체 해제
            </button>
          </>
        ) : (
          <span className="flex-1 text-xs text-slate-400 font-medium">
            필터 없음 · 전체 보는 중
          </span>
        )}
      </div>
    </div>
  );
}
