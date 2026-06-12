import { useMemo, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import {
  SPECIES_META,
  COLOR_META,
  SEEDS,
  fastestPaths,
  seedColors,
  islandGenotypes,
  type FlowerSpecies,
  type FlowerColor,
  type ColorPath,
  type StartStock,
} from '../lib/flowerGenetics';
import { useFlowerColors } from '../lib/flowerColors';
import type { User } from '../lib/firebase';

function Petal({ color, size = 20 }: { color: FlowerColor; size?: number }) {
  const meta = COLOR_META[color];
  return (
    <span
      className="inline-block rounded-full border shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: meta.hex,
        borderColor: color === 'white' ? '#cbd5e1' : 'rgba(0,0,0,0.12)',
      }}
      aria-hidden
    />
  );
}

// 난이도: 세대수 기반(0=씨앗, 1=쉬움, 2=보통, 3+=어려움)
function difficulty(steps: number): { label: string; cls: string } {
  if (steps === 0) return { label: '씨앗', cls: 'bg-slate-100 text-slate-500' };
  if (steps === 1) return { label: '쉬움', cls: 'bg-emerald-100 text-emerald-700' };
  if (steps === 2) return { label: '보통', cls: 'bg-amber-100 text-amber-700' };
  return { label: '어려움', cls: 'bg-rose-100 text-rose-700' };
}

const CIRCLED = ['①', '②', '③', '④', '⑤', '⑥'];

/** 부모 유전자형의 출처: 씨앗인지, 아니면 몇 번 단계에서 만든 것인지. */
function OriginTag({ origin }: { origin: string }) {
  const cls =
    origin === '씨앗'
      ? 'bg-slate-100 text-slate-500'
      : origin === '마일섬'
        ? 'bg-emerald-100 text-emerald-700'
        : 'bg-pink-100 text-pink-700';
  return <span className={`text-[9px] font-bold px-1 py-px rounded ${cls}`}>{origin}</span>;
}

function Parent({
  color,
  origin,
}: {
  color: FlowerColor;
  origin: string;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <Petal color={color} size={14} />
      {COLOR_META[color].label}
      <OriginTag origin={origin} />
    </span>
  );
}

function StepRow({
  step,
  idx,
  originOf,
}: {
  step: ColorPath['steps'][number];
  idx: number;
  originOf: (geno: string) => string;
}) {
  return (
    <li className="flex items-center gap-1.5 flex-wrap text-xs">
      <span className="shrink-0 w-5 h-5 rounded-full bg-pink-500 text-white text-[10px] font-bold flex items-center justify-center">
        {idx + 1}
      </span>
      <Parent color={step.parentAColor} origin={originOf(step.parentA)} />
      <span className="text-slate-400">×</span>
      <Parent color={step.parentBColor} origin={originOf(step.parentB)} />
      <ArrowRight size={12} className="text-slate-400" />
      <span className="inline-flex items-center gap-1 font-bold text-slate-800">
        <Petal color={step.resultColor} size={14} />
        {COLOR_META[step.resultColor].label}
        <span className="text-[9px] font-bold px-1 py-px rounded bg-pink-100 text-pink-700">
          {CIRCLED[idx] ?? `${idx + 1}`}
        </span>
      </span>
      <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 rounded px-1">
        {(step.prob * 100).toFixed(step.prob < 0.1 ? 1 : 0)}%
      </span>
    </li>
  );
}

export function FlowerGuide({
  user,
  authReady,
}: {
  user: User | null;
  authReady: boolean;
}) {
  const [species, setSpecies] = useState<FlowerSpecies>('rose');
  const [stock, setStock] = useState<StartStock>('seed');
  const { has, toggle } = useFlowerColors(user, authReady);

  const meta = SPECIES_META.find((s) => s.id === species)!;
  const paths = useMemo(() => fastestPaths(species, stock), [species, stock]);
  const seeds = useMemo(() => seedColors(species), [species]);
  const islandColors = useMemo(
    () => new Set(Object.values(islandGenotypes(species))),
    [species]
  );

  const ownedKey = (c: FlowerColor) => `${species}:${c}`;
  const ownedCount = paths.filter((p) => has(ownedKey(p.color))).length;
  const missing = paths.filter((p) => !has(ownedKey(p.color)));

  return (
    <div className="space-y-5">
      {/* 꽃 선택 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          🌸 꽃 교배 가이드
        </h3>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          가진 색을 체크하면 아직 없는 색과 <strong className="text-slate-500">가장 빠른
          교배 경로</strong>를 알려줍니다. 같은 색이라도 유전자형이 달라, 출발 꽃은
          유전자형이 확실한 것만 씁니다.
        </p>

        {/* 출발 꽃 선택: 씨앗 vs 마일섬 */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => setStock('seed')}
            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
              stock === 'seed'
                ? 'bg-slate-800 text-white border-transparent'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            🛒 상점 씨앗으로 시작
          </button>
          <button
            onClick={() => setStock('island')}
            className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
              stock === 'island'
                ? 'bg-emerald-700 text-white border-transparent'
                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
            }`}
          >
            🏝️ 마일섬 꽃 활용
          </button>
        </div>
        {stock === 'island' && (
          <p className="text-[11px] text-emerald-700 bg-emerald-50 rounded-lg px-2.5 py-2 mb-3 leading-relaxed">
            마일섬 하이브리드 꽃은 유전자형이 우월해서 어려운 색을 훨씬 빨리 만들 수
            있어요(예: 파란 장미). 단, 마일섬 하이브리드는 1.2 업데이트 이후 새로 못
            얻으니 <strong>예전에 얻어둔 꽃</strong> 기준입니다.
          </p>
        )}

        <div className="grid grid-cols-4 gap-2">
          {SPECIES_META.map((s) => (
            <button
              key={s.id}
              onClick={() => setSpecies(s.id)}
              className={`py-2.5 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all border text-xs ${
                species === s.id
                  ? 'bg-pink-600 text-white border-transparent shadow-sm shadow-pink-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-lg leading-none">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 보유 색 체크 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-700 flex items-center gap-1.5">
            {meta.emoji} {meta.label} — 내가 가진 색
          </h3>
          <span className="text-xs font-bold text-pink-600 bg-pink-50 rounded-full px-2.5 py-1">
            {ownedCount} / {paths.length}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {paths.map((p) => {
            const owned = has(ownedKey(p.color));
            return (
              <button
                key={p.color}
                onClick={() => toggle(ownedKey(p.color))}
                className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1.5 rounded-full text-xs font-semibold border-2 transition-all ${
                  owned
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Petal color={p.color} size={18} />
                {COLOR_META[p.color].label}
                {owned && <Check size={13} className="text-emerald-500" />}
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap mt-2.5 text-[10px] text-slate-400">
          <span className="font-bold text-slate-500">씨앗 색:</span>
          {[...seeds].map((c) => (
            <span key={c} className="inline-flex items-center gap-0.5">
              <Petal color={c} size={12} />
              {COLOR_META[c].label}
            </span>
          ))}
          <span>— 상점 씨앗 봉투로 바로 구매</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">
          탭하면 보유 체크 ↔ 해제 · 로그인 시 기기 간 동기화(미로그인은 쿠키 저장)
        </p>
      </div>

      {/* 없는 색 교배 가이드 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-5 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-700 mb-3">
          🎯 아직 없는 색 ({missing.length})
        </h3>
        {missing.length === 0 ? (
          <div className="text-center py-8 text-emerald-700">
            <span className="text-3xl block mb-1">🎉</span>
            <p className="font-bold text-sm">{meta.label} 전 색상 컴플리트!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {missing.map((p) => {
              const diff = difficulty(p.steps.length);
              const isSeedColor = seeds.has(p.color);
              const isIslandStart = stock === 'island' && islandColors.has(p.color);
              // 유전자형 → 출처 라벨. 씨앗이면 "씨앗", 마일섬 출발 꽃이면 "마일섬",
              // 아니면 그 결과를 만든 단계의 동그라미 번호.
              const seedGenos = new Set(Object.values(SEEDS[species]));
              const islandGenos = new Set(Object.keys(islandGenotypes(species)));
              const originOf = (geno: string): string => {
                if (seedGenos.has(geno)) return '씨앗';
                if (stock === 'island' && islandGenos.has(geno)) return '마일섬';
                const stepIdx = p.steps.findIndex((s) => s.result === geno);
                return stepIdx >= 0 ? CIRCLED[stepIdx] ?? `${stepIdx + 1}` : '씨앗';
              };
              return (
                <div
                  key={p.color}
                  className="border border-slate-200 rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-bold text-slate-800 text-sm">
                      <Petal color={p.color} size={20} />
                      {COLOR_META[p.color].label}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${diff.cls}`}
                    >
                      {diff.label}
                      {p.steps.length > 0 && ` · ${p.steps.length}단계`}
                    </span>
                  </div>

                  {isSeedColor ? (
                    <p className="text-xs text-slate-500">
                      🛒 상점 씨앗으로 바로 구할 수 있어요(씨앗 봉투 구매).
                    </p>
                  ) : isIslandStart && p.steps.length === 0 ? (
                    <p className="text-xs text-emerald-700">
                      🏝️ 마일섬에서 직접 얻는 색이에요(예전 미스터리 투어 한정).
                    </p>
                  ) : (
                    <ol className="space-y-1.5">
                      {p.steps.map((s, i) => (
                        <StepRow key={i} step={s} idx={i} originOf={originOf} />
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
          <span className="font-bold text-slate-500">씨앗</span> = 상점 씨앗 봉투,{' '}
          <span className="font-bold text-emerald-600">마일섬</span> = 마일섬 하이브리드,{' '}
          <span className="font-bold text-pink-600">①②③</span> = 그 번호 단계에서 만든
          꽃을 부모로 씁니다. 같은 색이라도 출처(유전자형)가 달라요 — 예: 같은 “빨강”도
          씨앗 빨강과 <span className="text-pink-600 font-bold">②</span> 빨강은 다릅니다.
          확률이 낮을수록 여러 번 시도가 필요합니다.
        </p>
      </div>

      <p className="text-[11px] text-slate-400 text-center leading-relaxed">
        유전자형 데이터:{' '}
        <a
          href="https://aiterusawato.github.io/satogu/acnh/flowers/genotypes.html"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-pink-600"
        >
          Satogu (게임 데이터)
        </a>{' '}
        · 교배 확률은 멘델 유전으로 계산
      </p>
    </div>
  );
}
