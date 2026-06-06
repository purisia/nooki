import { ExternalLink, Lightbulb } from 'lucide-react';
import {
  FUNCTIONAL_GROUPS,
  SOURCE_MAIN,
} from '../data/functionalFurniture';

export function FurnitureGuide() {
  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          🪑 기능성 가구 가이드
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          A 버튼으로 상호작용해 실제 기능을 하는 가구를 기능별로 정리했습니다. 외형과
          기능이 다른 경우(예:{' '}
          <strong className="text-slate-500">냉장고·냉동고가 옷장 역할</strong>)도 함께
          표시합니다. 가구가 워낙 많아 대표 항목 위주이며, 각 기능의 전체 목록은 카드의
          출처 링크에서 확인하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FUNCTIONAL_GROUPS.map((g) => (
          <div
            key={g.id}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl leading-none">{g.emoji}</span>
              <div className="min-w-0">
                <h4 className="font-bold text-slate-800 text-sm leading-tight">
                  {g.title}
                </h4>
                <p className="text-[10px] text-slate-400">{g.enTitle}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{g.what}</p>

            {g.tips && g.tips.length > 0 && (
              <div className="space-y-1">
                {g.tips.map((t, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-1.5 text-[11px] text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5"
                  >
                    <Lightbulb size={12} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            )}

            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                대표 가구
              </p>
              <div className="flex flex-col gap-1">
                {g.examples.map((ex) => (
                  <div
                    key={ex.en}
                    className="flex items-baseline gap-1.5 text-xs flex-wrap"
                  >
                    <span className="font-semibold text-slate-700">{ex.ko}</span>
                    <span className="text-[10px] text-slate-400">{ex.en}</span>
                    {ex.note && (
                      <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 rounded px-1 py-0.5">
                        {ex.note}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {g.cannot && (
              <div className="rounded-lg border border-rose-100 bg-rose-50/60 p-2">
                <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-1">
                  ✕ {g.cannot.label}
                </p>
                <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                  {g.cannot.items.map((ex) => (
                    <span
                      key={ex.en}
                      className="text-[11px] text-rose-700/80"
                      title={ex.en}
                    >
                      {ex.ko}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <a
              href={g.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 hover:text-sky-700"
            >
              전체 목록 보기
              <ExternalLink size={11} />
            </a>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          📚 출처
        </h3>
        <a
          href={SOURCE_MAIN.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group"
        >
          <div className="flex-1 min-w-0">
            <span className="flex items-center gap-1.5 font-bold text-slate-800 text-sm group-hover:text-sky-700">
              {SOURCE_MAIN.title}
              <ExternalLink size={12} className="text-slate-400 group-hover:text-sky-600" />
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">{SOURCE_MAIN.note}</p>
          </div>
        </a>
      </div>
    </div>
  );
}
