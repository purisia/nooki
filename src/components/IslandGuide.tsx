import { useMemo, useState } from 'react';
import { ExternalLink, Check, AlertTriangle, Wrench } from 'lucide-react';
import {
  ISLANDS,
  PURPOSE_META,
  RARITY_META,
  SOURCES,
  type IslandPurpose,
} from '../data/islands';

const PURPOSE_ORDER: IslandPurpose[] = [
  'starter',
  'bells',
  'bugs',
  'fish',
  'flowers',
  'materials',
  'fruit',
];

export function IslandGuide() {
  const [purpose, setPurpose] = useState<IslandPurpose | 'all'>('all');

  const list = useMemo(
    () =>
      purpose === 'all'
        ? ISLANDS
        : ISLANDS.filter((i) => i.purposes.includes(purpose)),
    [purpose]
  );

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          🏝️ 마일섬 (미스터리 투어) 가이드
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          마일 여행권으로 가는 섬 종류 정리. 섬 이름은 커뮤니티 통칭이며, 등장률은
          출처마다 다를 수 있어 대표값으로 표기했습니다. 정확한 지도·확률은 하단 출처를
          확인하세요. <strong className="text-slate-500">장대·사다리</strong>는 꼭 챙기세요.
        </p>
        <div className="flex flex-wrap gap-1.5">
          <PurposeChip
            active={purpose === 'all'}
            onClick={() => setPurpose('all')}
            label={`전체 (${ISLANDS.length})`}
          />
          {PURPOSE_ORDER.map((p) => (
            <PurposeChip
              key={p}
              active={purpose === p}
              onClick={() => setPurpose(p)}
              label={`${PURPOSE_META[p].emoji} ${PURPOSE_META[p].label}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {list.map((island) => {
          const rarity = RARITY_META[island.rarity];
          return (
            <div
              key={island.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 flex flex-col gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-2xl leading-none">{island.emoji}</span>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight">
                        {island.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 truncate">{island.aka}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${rarity.badgeClass}`}
                  >
                    {rarity.label}
                  </span>
                </div>
                <div className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-100 rounded-md px-1.5 py-0.5">
                  🎲 등장률 {island.rateText}
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{island.summary}</p>

              <div className="space-y-1">
                {island.pros.map((p, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                    <Check size={13} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span>{p}</span>
                  </div>
                ))}
                {island.cons.map((c, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-slate-500">
                    <AlertTriangle size={13} className="text-amber-500 mt-0.5 shrink-0" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>

              {island.reqs && island.reqs.length > 0 && (
                <div className="flex items-start gap-1.5 text-[11px] text-slate-500 bg-slate-50 rounded-lg px-2 py-1.5">
                  <Wrench size={12} className="text-slate-400 mt-0.5 shrink-0" />
                  <span>필요: {island.reqs.join(' · ')}</span>
                </div>
              )}

              <div className="flex flex-wrap gap-1 mt-auto pt-1">
                {island.purposes.map((p) => (
                  <span
                    key={p}
                    className="text-[10px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5"
                  >
                    {PURPOSE_META[p].emoji} {PURPOSE_META[p].label}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          📚 출처 (공신력 있는 자료)
        </h3>
        <div className="space-y-2">
          {SOURCES.map((s) => (
            <a
              key={s.url}
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 transition-all group"
            >
              <div className="flex-1 min-w-0">
                <span className="flex items-center gap-1.5 font-bold text-slate-800 text-sm group-hover:text-sky-700">
                  {s.title}
                  <ExternalLink size={12} className="text-slate-400 group-hover:text-sky-600" />
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">{s.note}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function PurposeChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
        active
          ? 'bg-emerald-700 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
