import { useMemo, useState } from 'react';
import { Flower2, ArrowRight, Sparkles } from 'lucide-react';
import {
  SPECIES_META,
  COLOR_META,
  PHENOTYPES,
  breed,
  colorOf,
  defaultParents,
  genotypeOptionsByColor,
  type FlowerSpecies,
  type FlowerColor,
} from '../lib/flowerGenetics';

function Swatch({ color, size = 18 }: { color: FlowerColor; size?: number }) {
  const meta = COLOR_META[color];
  return (
    <span
      className="inline-block rounded-full border flex-shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: meta.hex,
        borderColor: color === 'white' ? '#cbd5e1' : 'rgba(0,0,0,0.15)',
      }}
      aria-hidden
    />
  );
}

function fmtPct(p: number): string {
  const pct = p * 100;
  return `${Number(pct.toFixed(2))}%`;
}

function ParentPicker({
  species,
  label,
  value,
  onChange,
}: {
  species: FlowerSpecies;
  label: string;
  value: string;
  onChange: (g: string) => void;
}) {
  const groups = useMemo(() => genotypeOptionsByColor(species), [species]);
  const color = colorOf(species, value);
  return (
    <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Swatch color={color} /> {COLOR_META[color].label}
        </span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-lg py-2 px-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      >
        {groups.map((g) => (
          <optgroup key={g.color} label={COLOR_META[g.color].label}>
            {g.options.map((o) => (
              <option key={o.genotype} value={o.genotype}>
                {COLOR_META[o.color].label} · {o.genotype}
                {o.isSeed ? ' · 씨앗' : ''}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export function FlowerBreeder() {
  const [species, setSpecies] = useState<FlowerSpecies>('rose');
  const initial = defaultParents('rose');
  const [p1, setP1] = useState(initial[0]);
  const [p2, setP2] = useState(initial[1]);

  const switchSpecies = (s: FlowerSpecies) => {
    setSpecies(s);
    const [a, b] = defaultParents(s);
    setP1(a);
    setP2(b);
  };

  const outcomes = useMemo(() => breed(species, p1, p2), [species, p1, p2]);
  const geneLen = PHENOTYPES[species] ? Object.keys(PHENOTYPES[species])[0].length : 3;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Flower2 size={14} />
          <span>꽃 종류</span>
        </h3>
        <div className="grid grid-cols-4 gap-2">
          {SPECIES_META.map((s) => (
            <button
              key={s.id}
              onClick={() => switchSpecies(s.id)}
              className={`py-2.5 px-1 rounded-xl font-bold flex flex-col items-center justify-center gap-1 transition-all border text-xs ${
                species === s.id
                  ? 'bg-emerald-700 text-white border-transparent shadow-sm shadow-emerald-200'
                  : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'
              }`}
            >
              <span className="text-lg leading-none">{s.emoji}</span>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <Sparkles size={14} />
          <span>부모 꽃 ({geneLen}자리 유전자형)</span>
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <ParentPicker species={species} label="부모 A" value={p1} onChange={setP1} />
          <div className="flex sm:flex-col items-center justify-center text-slate-300 font-bold">
            ✕
          </div>
          <ParentPicker species={species} label="부모 B" value={p2} onChange={setP2} />
        </div>
        <p className="mt-3 text-[11px] text-slate-400 leading-relaxed">
          숫자는 유전자형(0=열성쌍·1=이형접합·2=우성쌍)입니다. “씨앗” 표시는 상점 씨앗으로
          얻는 꽃이라 교배 출발점으로 확실합니다. 섬에 자생하거나 선물받은 꽃은 유전자형이
          다를 수 있어요.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 border border-slate-200">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <ArrowRight size={14} />
          <span>교배 결과 (자손 색상 확률)</span>
        </h3>
        <div className="space-y-3">
          {outcomes.map((o) => (
            <div key={o.color} className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Swatch color={o.color} size={20} />
                <span className="font-bold text-slate-800 text-sm w-12">
                  {COLOR_META[o.color].label}
                </span>
                <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${o.prob * 100}%`,
                      backgroundColor: COLOR_META[o.color].hex,
                    }}
                  />
                </div>
                <span className="text-sm font-bold text-emerald-700 w-16 text-right">
                  {fmtPct(o.prob)}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 pl-7">
                {o.genotypes.map((g) => (
                  <span
                    key={g.genotype}
                    className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-md px-1.5 py-0.5"
                  >
                    <span className="font-mono">{g.genotype}</span>
                    <span className="text-slate-400">{fmtPct(g.prob)}</span>
                    <button
                      onClick={() => setP1(g.genotype)}
                      className="text-emerald-600 hover:text-emerald-800"
                      title="부모 A로 사용"
                    >
                      A
                    </button>
                    <button
                      onClick={() => setP2(g.genotype)}
                      className="text-sky-600 hover:text-sky-800"
                      title="부모 B로 사용"
                    >
                      B
                    </button>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[11px] text-slate-400 leading-relaxed">
          확률은 한 번 교배 시 각 색이 나올 확률입니다. 결과의 특정 유전자형을{' '}
          <span className="font-semibold text-emerald-600">A</span>/
          <span className="font-semibold text-sky-600">B</span> 버튼으로 다음 세대 부모에
          넣어 여러 세대 교배를 이어갈 수 있어요. 유전자형 색상표 출처:{' '}
          aiterusawato/satogu (게임 데이터).
        </p>
      </div>
    </div>
  );
}
