import { useMemo, useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import {
  SPECIES_META,
  COLOR_META,
  fastestPaths,
  seedColors,
  type FlowerSpecies,
  type FlowerColor,
  type ColorPath,
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

function StepRow({ step, idx }: { step: ColorPath['steps'][number]; idx: number }) {
  return (
    <li className="flex items-center gap-1.5 flex-wrap text-xs">
      <span className="shrink-0 w-4 h-4 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold flex items-center justify-center">
        {idx + 1}
      </span>
      <span className="inline-flex items-center gap-1">
        <Petal color={step.parentAColor} size={14} />
        {COLOR_META[step.parentAColor].label}
      </span>
      <span className="text-slate-400">×</span>
      <span className="inline-flex items-center gap-1">
        <Petal color={step.parentBColor} size={14} />
        {COLOR_META[step.parentBColor].label}
      </span>
      <ArrowRight size={12} className="text-slate-400" />
      <span className="inline-flex items-center gap-1 font-bold text-slate-800">
        <Petal color={step.resultColor} size={14} />
        {COLOR_META[step.resultColor].label}
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
  const { has, toggle } = useFlowerColors(user, authReady);

  const meta = SPECIES_META.find((s) => s.id === species)!;
  const paths = useMemo(() => fastestPaths(species), [species]);
  const seeds = useMemo(() => seedColors(species), [species]);

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
          교배 경로</strong>를 알려줍니다. 교배는 유전자형이 확실한{' '}
          <strong className="text-slate-500">씨앗·마일섬 꽃</strong>에서 시작하는 게
          정확합니다(같은 분홍이라도 유전자형이 다를 수 있어서예요).
        </p>
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
        <p className="text-[10px] text-slate-400 mt-2">
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
              const isSeed = seeds.has(p.color);
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

                  {isSeed ? (
                    <p className="text-xs text-slate-500">
                      🛒 상점 씨앗(또는 마일섬)으로 바로 구할 수 있어요.
                    </p>
                  ) : (
                    <ol className="space-y-1.5">
                      {p.steps.map((s, i) => (
                        <StepRow key={i} step={s} idx={i} />
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        )}
        <p className="text-[10px] text-slate-400 mt-3 leading-relaxed">
          확률은 한 번 교배 시 그 색이 나올 확률입니다. 낮을수록 여러 번 시도가
          필요해요. 각 단계의 부모는 씨앗이거나 앞 단계 결과입니다.
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
