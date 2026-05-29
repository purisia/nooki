/**
 * 모동숲(New Horizons) 꽃 교배 유전자 시뮬레이터.
 *
 * 교배는 단순 "A+B=C" 표가 아니라 유전자형(genotype) 기반이다. 꽃마다 유전자
 * 3개(장미만 4개)가 있고 각 유전자는 0/1/2(열성쌍·이형접합·우성쌍)로 표기된다.
 * 자손은 부모로부터 각 유전자의 대립유전자 하나씩을 물려받으며(멘델 유전),
 * 최종 색은 유전자형→색 표(phenotype)로 결정된다.
 *
 * 유전자형→색 표 데이터 출처(게임 데이터마이닝, 사실 데이터):
 *   https://aiterusawato.github.io/satogu/acnh/flowers/genotypes.html
 * 교배 확률 로직(멘델 유전)은 표준 유전학으로 직접 구현.
 */

export type FlowerSpecies =
  | 'rose'
  | 'tulip'
  | 'pansy'
  | 'cosmo'
  | 'lily'
  | 'hyacinth'
  | 'windflower'
  | 'mum';

export type FlowerColor =
  | 'red'
  | 'orange'
  | 'yellow'
  | 'pink'
  | 'white'
  | 'black'
  | 'purple'
  | 'blue'
  | 'green';

const COLOR_CODE: Record<string, FlowerColor> = {
  r: 'red',
  o: 'orange',
  y: 'yellow',
  p: 'pink',
  w: 'white',
  b: 'black',
  l: 'purple',
  u: 'blue',
  g: 'green',
};

export const COLOR_META: Record<FlowerColor, { label: string; hex: string }> = {
  red: { label: '빨강', hex: '#e8453c' },
  orange: { label: '주황', hex: '#f08a35' },
  yellow: { label: '노랑', hex: '#f3cf3f' },
  pink: { label: '분홍', hex: '#f3a4c0' },
  white: { label: '하양', hex: '#fafafa' },
  black: { label: '검정', hex: '#3f3f46' },
  purple: { label: '보라', hex: '#8b4ec0' },
  blue: { label: '파랑', hex: '#4a6fd6' },
  green: { label: '초록', hex: '#5cae73' },
};

export const SPECIES_META: { id: FlowerSpecies; label: string; emoji: string }[] = [
  { id: 'rose', label: '장미', emoji: '🌹' },
  { id: 'tulip', label: '튤립', emoji: '🌷' },
  { id: 'pansy', label: '팬지', emoji: '🌼' },
  { id: 'cosmo', label: '코스모스', emoji: '🌸' },
  { id: 'lily', label: '백합', emoji: '⚜️' },
  { id: 'hyacinth', label: '히아신스', emoji: '🌺' },
  { id: 'windflower', label: '아네모네', emoji: '🌷' },
  { id: 'mum', label: '국화', emoji: '🏵️' },
];

// 9개 행(첫 두 유전자 0~2 조합) × 길이 3 문자열(셋째 유전자 0~2) → 27 유전자형.
function expand3(...rows: string[]): Record<string, FlowerColor> {
  const d: Record<string, FlowerColor> = {};
  for (let i0 = 0; i0 < 3; i0++)
    for (let i1 = 0; i1 < 3; i1++)
      for (let i2 = 0; i2 < 3; i2++) {
        d[`${i0}${i1}${i2}`] = COLOR_CODE[rows[i0 * 3 + i1][i2]];
      }
  return d;
}

// 장미 전용: 유전자 4개 → 81 유전자형.
function expand4(...rows: string[]): Record<string, FlowerColor> {
  const d: Record<string, FlowerColor> = {};
  for (let i0 = 0; i0 < 3; i0++)
    for (let i1 = 0; i1 < 3; i1++)
      for (let i2 = 0; i2 < 3; i2++)
        for (let i3 = 0; i3 < 3; i3++) {
          d[`${i0}${i1}${i2}${i3}`] = COLOR_CODE[rows[i0 * 3 + i1][i2 * 3 + i3]];
        }
  return d;
}

export const PHENOTYPES: Record<FlowerSpecies, Record<string, FlowerColor>> = {
  rose: expand4(
    'wwwwwwlll',
    'yyywwwlll',
    'yyyyyywww',
    'rpwrpwrpl',
    'oyyrpwrpl',
    'oyyoyyrpw',
    'brpbrpbrp',
    'ooyrrwbrl',
    'ooyooyurw'
  ),
  tulip: expand3('www', 'yyw', 'yyy', 'ppw', 'oyy', 'oyy', 'brr', 'brr', 'lll'),
  pansy: expand3('wwu', 'yyu', 'yyy', 'rru', 'ooo', 'yyy', 'rrl', 'rrl', 'ool'),
  cosmo: expand3('www', 'yyw', 'yyy', 'ppp', 'oop', 'ooo', 'rrr', 'oor', 'bbr'),
  lily: expand3('www', 'yww', 'yyw', 'rpw', 'oyy', 'oyy', 'brp', 'brp', 'oow'),
  hyacinth: expand3('wwu', 'yyw', 'yyy', 'rpw', 'oyy', 'oyy', 'rrr', 'urr', 'lll'),
  windflower: expand3('wwu', 'oou', 'ooo', 'rru', 'ppp', 'ooo', 'rrl', 'rrl', 'ppl'),
  mum: expand3('wwl', 'yyw', 'yyy', 'ppp', 'yrp', 'lll', 'rrr', 'llr', 'ggr'),
};

// 상점 씨앗으로 얻는 꽃의 고정 유전자형(교배 출발점).
export const SEEDS: Record<FlowerSpecies, Partial<Record<FlowerColor, string>>> = {
  rose: { white: '0010', yellow: '0200', red: '2001' },
  tulip: { white: '001', yellow: '020', red: '201' },
  pansy: { white: '001', yellow: '020', red: '200' },
  cosmo: { white: '001', yellow: '021', red: '200' },
  lily: { white: '002', yellow: '020', red: '201' },
  hyacinth: { white: '001', yellow: '020', red: '201' },
  windflower: { white: '001', orange: '020', red: '200' },
  mum: { white: '001', yellow: '020', red: '200' },
};

// 유전자 값(0/1/2)이 가진 대립유전자 쌍. 0=열성쌍, 1=이형접합, 2=우성쌍.
function alleles(v: number): [number, number] {
  return v === 0 ? [0, 0] : v === 2 ? [1, 1] : [0, 1];
}

// 한 유전자 위치의 부모 두 값 → 자손 값 확률분포(멘델: 각 부모서 대립유전자 1개씩).
function mixGene(a: number, b: number): Map<number, number> {
  const out = new Map<number, number>();
  const [a0, a1] = alleles(a);
  const [b0, b1] = alleles(b);
  for (const x of [a0, a1])
    for (const y of [b0, b1]) {
      const g = x + y;
      out.set(g, (out.get(g) ?? 0) + 0.25);
    }
  return out;
}

/** 두 유전자형 문자열 교배 → 자손 유전자형별 확률(합 1). */
export function hybridize(g1: string, g2: string): Map<string, number> {
  let mixes = new Map<string, number>([['', 1]]);
  for (let i = 0; i < g1.length; i++) {
    const opts = mixGene(Number(g1[i]), Number(g2[i]));
    const next = new Map<string, number>();
    for (const [prefix, pp] of mixes)
      for (const [g, gp] of opts) {
        const key = prefix + g;
        next.set(key, (next.get(key) ?? 0) + pp * gp);
      }
    mixes = next;
  }
  return mixes;
}

export interface ColorOutcome {
  color: FlowerColor;
  prob: number;
  genotypes: { genotype: string; prob: number }[];
}

/** 교배 결과를 색상별로 집계(확률 내림차순). 같은 색 안에 가능한 유전자형도 보존. */
export function breed(
  species: FlowerSpecies,
  g1: string,
  g2: string
): ColorOutcome[] {
  const table = PHENOTYPES[species];
  const byColor = new Map<FlowerColor, { prob: number; genos: Map<string, number> }>();
  for (const [geno, prob] of hybridize(g1, g2)) {
    if (prob <= 0) continue;
    const color = table[geno];
    const entry = byColor.get(color) ?? { prob: 0, genos: new Map() };
    entry.prob += prob;
    entry.genos.set(geno, (entry.genos.get(geno) ?? 0) + prob);
    byColor.set(color, entry);
  }
  return [...byColor.entries()]
    .map(([color, e]) => ({
      color,
      prob: e.prob,
      genotypes: [...e.genos.entries()]
        .map(([genotype, p]) => ({ genotype, prob: p }))
        .sort((a, b) => b.prob - a.prob),
    }))
    .sort((a, b) => b.prob - a.prob);
}

export interface GenotypeOption {
  genotype: string;
  color: FlowerColor;
  isSeed: boolean;
}

/** 해당 꽃의 모든 유전자형을 색상별로 묶어 반환(부모 선택용). 씨앗이 먼저. */
export function genotypeOptionsByColor(
  species: FlowerSpecies
): { color: FlowerColor; options: GenotypeOption[] }[] {
  const table = PHENOTYPES[species];
  const seedSet = new Set(Object.values(SEEDS[species]));
  const grouped = new Map<FlowerColor, GenotypeOption[]>();
  for (const genotype of Object.keys(table)) {
    const color = table[genotype];
    if (!grouped.has(color)) grouped.set(color, []);
    grouped.get(color)!.push({ genotype, color, isSeed: seedSet.has(genotype) });
  }
  const colorOrder = Object.keys(COLOR_META) as FlowerColor[];
  return [...grouped.entries()]
    .map(([color, options]) => ({
      color,
      options: options.sort(
        (a, b) =>
          Number(b.isSeed) - Number(a.isSeed) || a.genotype.localeCompare(b.genotype)
      ),
    }))
    .sort((a, b) => colorOrder.indexOf(a.color) - colorOrder.indexOf(b.color));
}

export function colorOf(species: FlowerSpecies, genotype: string): FlowerColor {
  return PHENOTYPES[species][genotype];
}

/** 기본 부모 한 쌍(빨강 씨앗 × 하양 씨앗 우선)을 골라준다. */
export function defaultParents(species: FlowerSpecies): [string, string] {
  const seeds = SEEDS[species];
  const colors = Object.values(seeds).filter(Boolean) as string[];
  const first = seeds.red ?? colors[0];
  const second = seeds.white ?? colors[1] ?? colors[0];
  return [first, second];
}
