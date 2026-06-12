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

export const SPECIES_META: {
  id: FlowerSpecies;
  label: string;
  emoji: string;
  repColor: FlowerColor;
}[] = [
  { id: 'rose', label: '장미', emoji: '🌹', repColor: 'red' },
  { id: 'tulip', label: '튤립', emoji: '🌷', repColor: 'red' },
  { id: 'pansy', label: '팬지', emoji: '🌼', repColor: 'yellow' },
  { id: 'cosmo', label: '코스모스', emoji: '🌸', repColor: 'red' },
  { id: 'lily', label: '백합', emoji: '⚜️', repColor: 'white' },
  { id: 'hyacinth', label: '히아신스', emoji: '🌺', repColor: 'red' },
  { id: 'windflower', label: '아네모네', emoji: '🌷', repColor: 'red' },
  { id: 'mum', label: '국화', emoji: '🏵️', repColor: 'red' },
];

// 꽃 종류별 영문 복수형(Nookipedia 파일명 규칙용).
const SPECIES_PLURAL: Record<FlowerSpecies, string> = {
  rose: 'Roses',
  tulip: 'Tulips',
  pansy: 'Pansies',
  cosmo: 'Cosmos',
  lily: 'Lilies',
  hyacinth: 'Hyacinths',
  windflower: 'Windflowers',
  mum: 'Mums',
};

const COLOR_EN: Record<FlowerColor, string> = {
  red: 'Red',
  orange: 'Orange',
  yellow: 'Yellow',
  pink: 'Pink',
  white: 'White',
  black: 'Black',
  purple: 'Purple',
  blue: 'Blue',
  green: 'Green',
};

// 경량 MD5(브라우저용) — Nookipedia 파일 호스팅 경로 해시 합성에만 사용.
function md5(input: string): string {
  function rl(n: number, c: number) {
    return (n << c) | (n >>> (32 - c));
  }
  function add(x: number, y: number) {
    const l = (x & 0xffff) + (y & 0xffff);
    return (((x >> 16) + (y >> 16) + (l >> 16)) << 16) | (l & 0xffff);
  }
  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    return add(rl(add(add(a, q), add(x, t)), s), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function toBlocks(str: string): number[] {
    const bytes: number[] = [];
    for (let i = 0; i < str.length; i++) {
      const c = str.charCodeAt(i);
      if (c < 128) bytes.push(c);
      else if (c < 2048) bytes.push(192 | (c >> 6), 128 | (c & 63));
      else bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63));
    }
    const len = bytes.length;
    const nblk = ((len + 8) >> 6) + 1;
    const blks = new Array(nblk * 16).fill(0);
    for (let i = 0; i < len; i++) blks[i >> 2] |= bytes[i] << ((i % 4) * 8);
    blks[len >> 2] |= 0x80 << ((len % 4) * 8);
    blks[nblk * 16 - 2] = len * 8;
    return blks;
  }
  const x = toBlocks(input);
  let a = 1732584193,
    b = -271733879,
    c = -1732584194,
    d = 271733878;
  for (let i = 0; i < x.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, x[i], 7, -680876936); d = ff(d, a, b, c, x[i + 1], 12, -389564586);
    c = ff(c, d, a, b, x[i + 2], 17, 606105819); b = ff(b, c, d, a, x[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, x[i + 4], 7, -176418897); d = ff(d, a, b, c, x[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, x[i + 6], 17, -1473231341); b = ff(b, c, d, a, x[i + 7], 22, -45705983);
    a = ff(a, b, c, d, x[i + 8], 7, 1770035416); d = ff(d, a, b, c, x[i + 9], 12, -1958414417);
    c = ff(c, d, a, b, x[i + 10], 17, -42063); b = ff(b, c, d, a, x[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, x[i + 12], 7, 1804603682); d = ff(d, a, b, c, x[i + 13], 12, -40341101);
    c = ff(c, d, a, b, x[i + 14], 17, -1502002290); b = ff(b, c, d, a, x[i + 15], 22, 1236535329);
    a = gg(a, b, c, d, x[i + 1], 5, -165796510); d = gg(d, a, b, c, x[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, x[i + 11], 14, 643717713); b = gg(b, c, d, a, x[i], 20, -373897302);
    a = gg(a, b, c, d, x[i + 5], 5, -701558691); d = gg(d, a, b, c, x[i + 10], 9, 38016083);
    c = gg(c, d, a, b, x[i + 15], 14, -660478335); b = gg(b, c, d, a, x[i + 4], 20, -405537848);
    a = gg(a, b, c, d, x[i + 9], 5, 568446438); d = gg(d, a, b, c, x[i + 14], 9, -1019803690);
    c = gg(c, d, a, b, x[i + 3], 14, -187363961); b = gg(b, c, d, a, x[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, x[i + 13], 5, -1444681467); d = gg(d, a, b, c, x[i + 2], 9, -51403784);
    c = gg(c, d, a, b, x[i + 7], 14, 1735328473); b = gg(b, c, d, a, x[i + 12], 20, -1926607734);
    a = hh(a, b, c, d, x[i + 5], 4, -378558); d = hh(d, a, b, c, x[i + 8], 11, -2022574463);
    c = hh(c, d, a, b, x[i + 11], 16, 1839030562); b = hh(b, c, d, a, x[i + 14], 23, -35309556);
    a = hh(a, b, c, d, x[i + 1], 4, -1530992060); d = hh(d, a, b, c, x[i + 4], 11, 1272893353);
    c = hh(c, d, a, b, x[i + 7], 16, -155497632); b = hh(b, c, d, a, x[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, x[i + 13], 4, 681279174); d = hh(d, a, b, c, x[i], 11, -358537222);
    c = hh(c, d, a, b, x[i + 3], 16, -722521979); b = hh(b, c, d, a, x[i + 6], 23, 76029189);
    a = hh(a, b, c, d, x[i + 9], 4, -640364487); d = hh(d, a, b, c, x[i + 12], 11, -421815835);
    c = hh(c, d, a, b, x[i + 15], 16, 530742520); b = hh(b, c, d, a, x[i + 2], 23, -995338651);
    a = ii(a, b, c, d, x[i], 6, -198630844); d = ii(d, a, b, c, x[i + 7], 10, 1126891415);
    c = ii(c, d, a, b, x[i + 14], 15, -1416354905); b = ii(b, c, d, a, x[i + 5], 21, -57434055);
    a = ii(a, b, c, d, x[i + 12], 6, 1700485571); d = ii(d, a, b, c, x[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, x[i + 10], 15, -1051523); b = ii(b, c, d, a, x[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, x[i + 8], 6, 1873313359); d = ii(d, a, b, c, x[i + 15], 10, -30611744);
    c = ii(c, d, a, b, x[i + 6], 15, -1560198380); b = ii(b, c, d, a, x[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, x[i + 4], 6, -145523070); d = ii(d, a, b, c, x[i + 11], 10, -1120210379);
    c = ii(c, d, a, b, x[i + 2], 15, 718787259); b = ii(b, c, d, a, x[i + 9], 21, -343485551);
    a = add(a, oa); b = add(b, ob); c = add(c, oc); d = add(d, od);
  }
  const hex = (n: number) => {
    let s = '';
    for (let i = 0; i < 4; i++) s += ((n >> (i * 8 + 4)) & 15).toString(16) + ((n >> (i * 8)) & 15).toString(16);
    return s;
  };
  return hex(a) + hex(b) + hex(c) + hex(d);
}

/**
 * 꽃 색 → Nookipedia 인벤토리 아이콘 URL(dodo.ac CDN).
 * 파일명 규칙: "{Color} {FlowerPlural} NH Inv Icon.png" (도감 이미지와 동일 합성 방식).
 */
export function flowerImageUrl(species: FlowerSpecies, color: FlowerColor): string {
  const filename = `${COLOR_EN[color]}_${SPECIES_PLURAL[species]}_NH_Inv_Icon.png`;
  const h = md5(filename);
  return `https://dodo.ac/np/images/${h[0]}/${h.slice(0, 2)}/${filename}`;
}

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

// ─────────────────────────────────────────────────────────────────────────
// "가장 빠른 교배 경로" 솔버 (색깔 기반 X — 유전자형 기반)
//
// 보유한 하이브리드 꽃은 유전자형을 알 수 없으므로(같은 분홍이라도 유전자형이
// 다름) 교배 입력으로 신뢰할 수 없다. 따라서 경로는 항상 유전자형이 확실한
// "씨앗"에서 출발한다. 세대수(steps)가 가장 적고, 동률이면 각 단계 성공확률의
// 곱이 가장 높은 경로를 BFS 로 찾는다.
// ─────────────────────────────────────────────────────────────────────────

export interface PathStep {
  parentA: string;
  parentB: string;
  parentAColor: FlowerColor;
  parentBColor: FlowerColor;
  result: string; // 목표(자식) 유전자형
  resultColor: FlowerColor;
  prob: number; // 이 교배에서 result 가 나올 확률
}

export interface ColorPath {
  color: FlowerColor;
  fromSeed: boolean;
  genotype: string; // 목표 유전자형(대표)
  steps: PathStep[]; // 씨앗 → 목표까지 단계(빈 배열이면 씨앗으로 바로)
  totalProb: number; // 단계 확률의 곱(난이도 가늠용)
}

interface Reached {
  geno: string;
  steps: PathStep[]; // 이 유전자형에 도달하는 전체 경로(불변)
  totalProb: number;
}

function pathColor(species: FlowerSpecies, geno: string): FlowerColor {
  return PHENOTYPES[species][geno];
}

/**
 * 씨앗에서 출발해 도달 가능한 유전자형들을 BFS 로 확장하고,
 * 색상별로 "가장 빠른(세대 최소·확률 최대)" 경로를 고른다.
 */
export type StartStock = 'seed' | 'island';

/**
 * 마일섬(미스터리 투어)에서 실제로 스폰되는 하이브리드 색.
 * 마일섬 하이브리드는 "그 색의 가장 우성(테이블상 마지막) 유전자형"을 가져,
 * 씨앗 꽃과 색이 같아도 유전자형이 달라 보라/파랑 등 고차 하이브리드를 훨씬
 * 빨리 만드는 재료가 된다. (1.2 업데이트 이후 신규 입수 불가 — 보유분 활용)
 *
 * 스폰 색 출처: AC Flower Factory / Nookipedia(미스터리섬 하이브리드).
 * 장미만 스폰 색이 분홍·주황(드물게 검정 등)이며, 여기서는 보수적으로
 * 정설로 정리된 색만 포함한다.
 */
const ISLAND_SPAWN_COLORS: Record<FlowerSpecies, FlowerColor[]> = {
  rose: ['pink', 'orange'],
  tulip: ['black', 'orange', 'pink'],
  pansy: ['blue', 'orange'],
  cosmo: ['pink', 'orange'],
  lily: ['black', 'pink', 'orange'],
  hyacinth: ['blue', 'pink', 'orange'],
  windflower: ['blue', 'pink'],
  mum: ['purple', 'pink'],
};

/**
 * 마일섬 하이브리드의 유전자형(색 → 가장 우성 유전자형).
 * 스폰되는 색만, 각 색에서 "가장 우성(사전순 마지막 = 2가 많은)" 유전자형.
 */
export function islandGenotypes(species: FlowerSpecies): Record<string, FlowerColor> {
  const table = PHENOTYPES[species];
  const spawn = new Set(ISLAND_SPAWN_COLORS[species]);
  const byColor = new Map<FlowerColor, string>();
  for (const geno of Object.keys(table)) {
    const color = table[geno];
    if (!spawn.has(color)) continue;
    const cur = byColor.get(color);
    if (!cur || geno > cur) byColor.set(color, geno);
  }
  const out: Record<string, FlowerColor> = {};
  for (const [color, geno] of byColor) out[geno] = color;
  return out;
}

export function fastestPaths(
  species: FlowerSpecies,
  stock: StartStock = 'seed'
): ColorPath[] {
  const table = PHENOTYPES[species];
  const seeds = [...new Set(Object.values(SEEDS[species]).filter(Boolean))] as string[];
  // 마일섬 모드: 씨앗 + 마일섬 하이브리드 유전자형을 출발점(depth 0)으로.
  const islandSet = new Set(
    stock === 'island' ? Object.keys(islandGenotypes(species)) : []
  );
  const startGenos = [...new Set([...seeds, ...islandSet])];

  // geno → 최단/최고확률 경로
  const reached = new Map<string, Reached>();
  for (const s of startGenos) reached.set(s, { geno: s, steps: [], totalProb: 1 });

  let frontier = new Set(startGenos);
  const MAX_GENERATIONS = 8;

  for (let gen = 0; gen < MAX_GENERATIONS; gen++) {
    const pool = [...reached.keys()];
    const newlyImproved = new Set<string>();

    for (let i = 0; i < pool.length; i++) {
      for (let j = i; j < pool.length; j++) {
        const a = pool[i];
        const b = pool[j];
        // 적어도 한쪽은 직전 세대에 갱신된 것이어야 새 조합 (조합 폭발 억제)
        if (!frontier.has(a) && !frontier.has(b)) continue;

        const ra = reached.get(a)!;
        const rb = reached.get(b)!;
        const baseProb = ra.totalProb * rb.totalProb;
        const baseDepth = Math.max(ra.steps.length, rb.steps.length);

        for (const [childGeno, childProb] of hybridize(a, b)) {
          if (childProb <= 0) continue;
          const newDepth = baseDepth + 1;
          const newTotal = baseProb * childProb;
          const existing = reached.get(childGeno);

          // 더 적은 세대, 또는 같은 세대면 더 높은 확률일 때만 갱신
          const better =
            !existing ||
            newDepth < existing.steps.length ||
            (newDepth === existing.steps.length && newTotal > existing.totalProb);
          if (!better) continue;

          const step: PathStep = {
            parentA: a,
            parentB: b,
            parentAColor: table[a],
            parentBColor: table[b],
            result: childGeno,
            resultColor: table[childGeno],
            prob: childProb,
          };
          reached.set(childGeno, {
            geno: childGeno,
            steps: [...maxPath(ra, rb), step],
            totalProb: newTotal,
          });
          newlyImproved.add(childGeno);
        }
      }
    }
    if (newlyImproved.size === 0) break;
    frontier = newlyImproved;
  }

  // 색상별 최적 경로 선정
  const colorOrder = Object.keys(COLOR_META) as FlowerColor[];
  const best = new Map<FlowerColor, Reached>();
  for (const node of reached.values()) {
    const color = pathColor(species, node.geno);
    const cur = best.get(color);
    const better =
      !cur ||
      node.steps.length < cur.steps.length ||
      (node.steps.length === cur.steps.length && node.totalProb > cur.totalProb);
    if (better) best.set(color, node);
  }

  const startSet = new Set(startGenos);
  const out: ColorPath[] = [];
  for (const color of colorOrder) {
    const node = best.get(color);
    if (!node) continue;
    out.push({
      color,
      fromSeed: startSet.has(node.geno),
      genotype: node.geno,
      steps: topoSortSteps(node.steps, startSet),
      totalProb: node.totalProb,
    });
  }
  return out;
}

// 두 부모 경로를 합쳐 더 긴 쪽을 기준으로 잡되, 짧은 쪽 단계도 포함(중복 제거).
// 단계 순서: 먼저 만들어야 하는 것이 앞에 오도록 result 기준 dedupe.
function maxPath(a: Reached, b: Reached): PathStep[] {
  const seen = new Set<string>();
  const merged: PathStep[] = [];
  for (const s of [...a.steps, ...b.steps]) {
    if (seen.has(s.result)) continue;
    seen.add(s.result);
    merged.push(s);
  }
  return merged;
}

// 각 단계의 부모(씨앗 아님)는 반드시 앞선 단계의 result 여야 한다.
// 의존성을 만족하도록 위상정렬해 "만드는 순서"대로 배열한다.
function topoSortSteps(steps: PathStep[], seedSet: Set<string>): PathStep[] {
  const byResult = new Map(steps.map((s) => [s.result, s]));
  const ordered: PathStep[] = [];
  const done = new Set<string>();
  const visit = (geno: string, guard: Set<string>) => {
    if (seedSet.has(geno) || done.has(geno)) return;
    const step = byResult.get(geno);
    if (!step || guard.has(geno)) return;
    guard.add(geno);
    visit(step.parentA, guard);
    visit(step.parentB, guard);
    done.add(geno);
    ordered.push(step);
  };
  for (const s of steps) visit(s.result, new Set());
  return ordered;
}

export function allColors(species: FlowerSpecies): FlowerColor[] {
  const colorOrder = Object.keys(COLOR_META) as FlowerColor[];
  const present = new Set(Object.values(PHENOTYPES[species]));
  return colorOrder.filter((c) => present.has(c));
}

export function seedColors(species: FlowerSpecies): Set<FlowerColor> {
  const out = new Set<FlowerColor>();
  for (const g of Object.values(SEEDS[species])) {
    if (g) out.add(PHENOTYPES[species][g]);
  }
  return out;
}
