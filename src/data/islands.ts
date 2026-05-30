/**
 * 마일 여행권(미스터리 투어) 섬 가이드 데이터.
 *
 * 섬 이름은 공식 명칭이 아니라 커뮤니티 통칭이며, 정확한 지도·등장 확률은
 * 데이터마이닝/위키 출처(SOURCES) 기준으로 정리했다. 데이터마이닝상 약 18종의
 * 고유 레이아웃이 존재하고, 일부는 세부 변형이다.
 *
 * 출처: Ninji(데이터마이닝), Nookipedia, ACNH Island Tours Wiki, Game8, dbltap.
 */

export type IslandPurpose =
  | 'starter'
  | 'bells'
  | 'bugs'
  | 'fish'
  | 'flowers'
  | 'materials'
  | 'fruit';

export type IslandRarity = 'common' | 'uncommon' | 'rare' | 'veryrare';

export interface MysteryIsland {
  id: string;
  emoji: string;
  name: string;
  aka: string; // 영문 통칭
  rateText: string; // 등장률 표기(출처마다 상이 → 대표값/구간)
  rarity: IslandRarity;
  summary: string;
  pros: string[];
  cons: string[];
  reqs?: string[]; // 접근에 필요한 도구/조건
  purposes: IslandPurpose[];
}

export const PURPOSE_META: Record<IslandPurpose, { label: string; emoji: string }> = {
  starter: { label: '기본', emoji: '🏝️' },
  bells: { label: '벨', emoji: '💰' },
  bugs: { label: '곤충', emoji: '🐛' },
  fish: { label: '물고기', emoji: '🐟' },
  flowers: { label: '꽃', emoji: '🌸' },
  materials: { label: '재료·목재', emoji: '🪵' },
  fruit: { label: '과일', emoji: '🍎' },
};

export const RARITY_META: Record<
  IslandRarity,
  { label: string; badgeClass: string }
> = {
  common: { label: '흔함', badgeClass: 'bg-slate-100 text-slate-600' },
  uncommon: { label: '보통', badgeClass: 'bg-emerald-100 text-emerald-700' },
  rare: { label: '드묾', badgeClass: 'bg-amber-100 text-amber-700' },
  veryrare: { label: '매우 드묾', badgeClass: 'bg-rose-100 text-rose-700' },
};

export const SOURCES: { title: string; url: string; note: string }[] = [
  {
    title: "Ninji's Mystery Tour Islands Guide",
    url: 'https://wuffs.org/acnh/mysterytour.html',
    note: '게임 데이터마이닝 — 가장 정확한 등장 확률/지도',
  },
  {
    title: 'Nookipedia · Mystery Tour',
    url: 'https://nookipedia.com/wiki/Mystery_Tour',
    note: '커뮤니티 위키(공신력)',
  },
  {
    title: 'ACNH Island Tours Wiki',
    url: 'https://acnhislandtours.fandom.com/wiki/All_Mystery_Islands',
    note: '섬별 지도·자원 상세 모음',
  },
  {
    title: 'Game8 · Mystery Island Types',
    url: 'https://game8.co/games/Animal-Crossing-New-Horizons/archives/284595',
    note: '대중적인 한눈 정리 가이드',
  },
];

export const ISLANDS: MysteryIsland[] = [
  {
    id: 'normal1',
    emoji: '🏝️',
    name: '기본섬 (짧은 강)',
    aka: 'Normal Island 1 / Short River',
    rateText: '약 9.7%',
    rarity: 'common',
    summary: '2층 + 폭포에서 시작하는 짧은 강. 가장 평범한 기본 레이아웃.',
    pros: ['모든 자원이 골고루', '강·바다·해변 다 있어 만능', '초보가 익히기 좋음'],
    cons: ['특별한 보상 없음', '2층은 사다리 필요'],
    reqs: ['2층 접근 시 사다리'],
    purposes: ['starter', 'fish', 'bugs'],
  },
  {
    id: 'normal2',
    emoji: '🏝️',
    name: '기본섬 (강+연못)',
    aka: 'Normal Island 2',
    rateText: '약 9.7%',
    rarity: 'common',
    summary: '짧은 강 레이아웃에 연못이 추가된 변형. 연못 어종도 노릴 수 있음.',
    pros: ['강+연못 어종 동시 공략', '균형 잡힌 자원'],
    cons: ['특별한 보상 없음'],
    purposes: ['starter', 'fish'],
  },
  {
    id: 'curly',
    emoji: '🌀',
    name: '나선 강섬',
    aka: 'Curly / Spiral River Island',
    rateText: '약 9.7%',
    rarity: 'common',
    summary: '강이 나선형으로 휘감긴 섬. 첫 여행 시 나오는 4개 기본섬 중 하나.',
    pros: ['낚시 포인트가 많음', '경치가 독특'],
    cons: ['지형이 좁아 이동 번거로움', '특별 보상 없음'],
    purposes: ['starter', 'fish'],
  },
  {
    id: 'bigpond',
    emoji: '🪷',
    name: '큰 연못섬',
    aka: 'Big Pond / "Fidget Spinner" Island',
    rateText: '약 9.7%',
    rarity: 'common',
    summary: '가운데 큰 연못(피젯 스피너 모양). 강이 없고 연못·바다 중심.',
    pros: ['잉어 등 연못 물고기 집중 공략', '잠자리류 곤충'],
    cons: ['강 어종 없음', '특별 보상 없음'],
    purposes: ['starter', 'fish'],
  },
  {
    id: 'bamboo',
    emoji: '🎋',
    name: '대나무섬',
    aka: 'Bamboo Island',
    rateText: '약 10% (최다 등장)',
    rarity: 'common',
    summary: '대나무·죽순만 가득. 과일·활엽수·삼나무가 없는 단층 섬.',
    pros: ['대나무·죽순 대량 채집', '여름엔 장수풍뎅이 사냥 명소'],
    cons: ['나무 종류가 단조로움', '벨 벌이는 평범'],
    purposes: ['materials', 'bugs'],
  },
  {
    id: 'fruit',
    emoji: '🍑',
    name: '과일섬',
    aka: 'Fruit Island',
    rateText: '약 9%',
    rarity: 'uncommon',
    summary: '내 섬과 다른 "자매 과일" 나무 19그루. 캐서 옮겨 심기 좋음.',
    pros: ['타지역 과일 확보·이식', '판매·요리 재료'],
    cons: ['그 외 자원은 평범', '매번 같은 과일 1종'],
    purposes: ['fruit'],
  },
  {
    id: 'tree',
    emoji: '🌳',
    name: '나무섬',
    aka: 'Tree(s) Island',
    rateText: '드묾 (~2%, 1일 1회)',
    rarity: 'rare',
    summary: '강·연못 없이 활엽수·야자수가 빽빽. 나무에 붙는 곤충만 등장.',
    pros: ['장수풍뎅이·사슴벌레 등 나무 곤충 집중', '목재·재료 대량'],
    cons: ['하루 1회 제한', '물고기 거의 없음'],
    reqs: ['도끼(목재)'],
    purposes: ['bugs', 'materials'],
  },
  {
    id: 'flower',
    emoji: '🌸',
    name: '꽃섬',
    aka: 'Flower Island',
    rateText: '드묾 (~2%, 1일 1회)',
    rarity: 'rare',
    summary: '연못 주변에 희귀 꽃·교배종이 가득. 꽃에 모이는 곤충만 등장.',
    pros: ['교배종 꽃 수급', '호랑나비·제왕나비 등 꽃 곤충'],
    cons: ['하루 1회 제한', '그 외 자원 빈약'],
    purposes: ['flowers', 'bugs'],
  },
  {
    id: 'moneyrock1',
    emoji: '💰',
    name: '벨 바위섬',
    aka: 'Money Rock Island',
    rateText: '약 5%',
    rarity: 'uncommon',
    summary: '바위가 전부 "벨 바위". 한 섬에서 약 8만 벨 채굴 가능.',
    pros: ['단시간 대량 벨 채굴', '삽으로 뒤 안 파이게 막고 연타'],
    cons: ['안내소 업그레이드 이후 등장', '벨 외 자원 거의 없음'],
    reqs: ['삽', '안내소(리졸 서비스) 건물 업그레이드'],
    purposes: ['bells'],
  },
  {
    id: 'moneyrock2',
    emoji: '💰',
    name: '벨 바위섬 (변형)',
    aka: 'Money Rock Island 2',
    rateText: '드묾',
    rarity: 'rare',
    summary: '벨 바위섬의 지형 변형판. 바위 배치/접근 동선이 다름.',
    pros: ['벨 바위 채굴 동일', '동선만 다른 보너스 변형'],
    cons: ['장대·사다리로 접근해야 하는 배치도 있음'],
    reqs: ['삽', '장대 / 사다리'],
    purposes: ['bells'],
  },
  {
    id: 'gold',
    emoji: '🪙',
    name: '금광섬',
    aka: 'Gold Island',
    rateText: '매우 드묾',
    rarity: 'veryrare',
    summary: '꽃·전갈·직사각 연못. 중앙 작은 섬의 바위에서 금광석이 나옴.',
    pros: ['금광석 다수 확보(귀한 재료)', '희귀 꽃도 덤'],
    cons: ['중앙 진입에 장대 필요', '등장 확률 극히 낮음'],
    reqs: ['장대', '삽'],
    purposes: ['materials', 'bells'],
  },
  {
    id: 'falls',
    emoji: '⛲',
    name: '폭포섬',
    aka: 'Falls Island',
    rateText: '드묾',
    rarity: 'rare',
    summary: '절벽과 폭포가 여러 단으로 이어진 섬. 경치·강 상류 낚시.',
    pros: ['절벽 위 폭포 낚시(특정 어종)', '독특한 지형'],
    cons: ['사다리 없으면 대부분 접근 불가'],
    reqs: ['사다리'],
    purposes: ['fish'],
  },
  {
    id: 'mountain',
    emoji: '⛰️',
    name: '산악섬',
    aka: 'Mountain / Cliff Island',
    rateText: '드묾',
    rarity: 'rare',
    summary: '다층 절벽 중심의 험한 지형. 위층 자원은 등반 필수.',
    pros: ['위층의 곤충·자원', '높은 곳 채집'],
    cons: ['사다리·장대 없으면 사실상 무의미'],
    reqs: ['사다리', '장대'],
    purposes: ['bugs', 'materials'],
  },
  {
    id: 'arachnid',
    emoji: '🕷️',
    name: '거미·전갈섬',
    aka: 'Arachnid (Tarantula/Scorpion) Island',
    rateText: '약 2% · 1일 1회 · 밤 19~04시',
    rarity: 'veryrare',
    summary: '타란튤라(겨울철) 또는 전갈(여름철)만 잔뜩. 마리당 8,000벨.',
    pros: ['단시간 초고수익(벨)', '도감 등록도 한 번에'],
    cons: ['밤 시간대(19~04시)에만', '하루 1회', '물리면 기절', '나무·꽃 치워 스폰 효율 올려야'],
    reqs: ['그물', '저녁~새벽 시간대'],
    purposes: ['bells', 'bugs'],
  },
  {
    id: 'fins',
    emoji: '🦈',
    name: '등지느러미(상어)섬',
    aka: 'Fins / Shark Island',
    rateText: '드묾',
    rarity: 'veryrare',
    summary: '중앙이 지느러미 모양. 바다에 상어류 등 등지느러미 어종이 집중.',
    pros: ['고래상어·톱상어·귀상어·개복치·빨판상어 등 고가 어종', '여름 한정 어종 효율 사냥'],
    cons: ['상어류는 대체로 여름·밤에 등장', '미끼 준비하면 효율↑'],
    reqs: ['낚싯대', '(권장) 미끼'],
    purposes: ['fish', 'bells'],
  },
  {
    id: 'bigfish1',
    emoji: '🐟',
    name: '큰 물고기섬 ①',
    aka: 'Big Fish Island 1',
    rateText: '드묾',
    rarity: 'rare',
    summary: '큰 그림자 어종이 잘 나오는 섬. 대형 어종 위주 낚시.',
    pros: ['대형 그림자 집중(고가 어종 확률↑)', '미끼와 궁합 좋음'],
    cons: ['작은 어종은 적음'],
    reqs: ['낚싯대'],
    purposes: ['fish', 'bells'],
  },
  {
    id: 'bigfish2',
    emoji: '🐡',
    name: '큰 물고기섬 ②',
    aka: 'Big Fish Island 2',
    rateText: '드묾',
    rarity: 'rare',
    summary: '아로와나·철갑상어·드래곤피쉬·말린 등 대형 어종 다수가 등장.',
    pros: ['희귀 대형 어종 도감/판매', '강·연못 대형 그림자'],
    cons: ['등장 확률 낮음'],
    reqs: ['낚싯대', '(권장) 미끼'],
    purposes: ['fish', 'bells'],
  },
];
