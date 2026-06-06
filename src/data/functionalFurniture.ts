/**
 * 동물의 숲(New Horizons) "기능성 가구" 가이드 데이터.
 *
 * 게임 내 가구 중 A 버튼으로 상호작용해 실제 기능을 하는 것들을 기능별로 묶었다.
 * Nookipedia 는 가구를 `function` 필드(Bed, Dresser, Storage, Mirror, Stereo,
 * Toilet 등)로 분류하지만, "옷 갈아입기(옷장)"/"요리"/"쓰레기 버리기" 같은 세부
 * 상호작용은 단일 필드로 안 잡히는 경우가 있어(예: 냉장고·냉동고는 외형은 주방이지만
 * 실제 기능은 '옷장') 위키 본문 기준으로 큐레이션했다.
 *
 * 각 그룹의 examples 는 대표/확실한 항목이며, 전체 목록은 source 링크에서 확인.
 * 한국어 명칭은 인게임 KRko 기준(불확실분은 영문 병기로 보강).
 *
 * 출처: Nookipedia(가구 function 분류 / 카테고리 목록).
 */

export interface FurnitureExample {
  ko: string; // 한국어 명칭(또는 통칭)
  en: string; // 영문 명칭
  note?: string; // 의외성/팁
}

export interface FunctionalGroup {
  id: string;
  emoji: string;
  title: string; // 기능명(한국어)
  enTitle: string; // 기능명(영문/Nookipedia function)
  what: string; // 이 기능으로 무엇을 할 수 있는지
  tips?: string[]; // 알아두면 좋은 점
  examples: FurnitureExample[];
  sourceUrl: string; // Nookipedia 관련 목록/문서
}

export const SOURCE_MAIN = {
  title: 'Nookipedia · New Horizons 가구 목록',
  url: 'https://nookipedia.com/wiki/Furniture/New_Horizons',
  note: '가구 function 분류 및 전체 목록(공신력 위키)',
};

export const FUNCTIONAL_GROUPS: FunctionalGroup[] = [
  {
    id: 'wardrobe',
    emoji: '👕',
    title: '옷장 (옷 갈아입기)',
    enTitle: 'Wardrobe',
    what: 'A로 열면 옷 갈아입기 화면이 떠서, 보관함의 옷을 바로 착용할 수 있습니다. 실외에 둬도 작동합니다.',
    tips: [
      '의외로 냉장고·냉동고 같은 "주방처럼 보이는" 가구도 실제론 옷장 기능을 합니다.',
      '마법봉(wand) 착장 코디를 등록·수정할 때도 옷장을 씁니다.',
    ],
    examples: [
      { ko: '나무 옷장', en: 'Wooden wardrobe' },
      { ko: '옷장', en: 'Wardrobe' },
      { ko: '옷 정리장', en: 'Clothes closet' },
      { ko: '냉장고', en: 'Refrigerator', note: '외형은 주방, 기능은 옷장' },
      { ko: '냉동고', en: 'Freezer', note: '외형은 주방, 기능은 옷장' },
      { ko: '탈의실', en: 'Changing room' },
    ],
    sourceUrl: 'https://nookipedia.com/wiki/Wardrobe',
  },
  {
    id: 'storage',
    emoji: '📦',
    title: '수납 (보관함 접근)',
    enTitle: 'Storage',
    what: '집 보관함에 직접 물건을 넣고 뺄 수 있습니다. New Horizons는 보관함이 집에 내장돼 있어 순수 "수납 가구"는 드뭅니다.',
    tips: [
      '창고(Storage Shed)는 마일 6,000으로 교환, 섬 어디서나 보관함을 열 수 있습니다.',
      '2.0 기준 순수 수납 유닛은 소수이고, 비슷하게 생긴 대부분은 사실 "옷장" 기능입니다.',
    ],
    examples: [
      { ko: '창고(헛간)', en: 'Storage shed', note: '섬 어디서나 보관함 접근' },
      { ko: '심플 수납장', en: 'Simple storage unit' },
    ],
    sourceUrl: 'https://nookipedia.com/wiki/Storage_unit',
  },
  {
    id: 'trash',
    emoji: '🗑️',
    title: '쓰레기통 (버리기)',
    enTitle: 'Trash / Waste bin',
    what: 'A로 상호작용해 팔 수 없거나 가치 낮은 아이템(분실물, 쓰레기 등)을 버립니다.',
    tips: ['낚시로 나온 빈 깡통·장화·타이어 같은 쓰레기 처리에 유용합니다.'],
    examples: [
      { ko: '쓰레기통', en: 'Trash can' },
      { ko: '페달 휴지통', en: 'Pedal-style trash can' },
      { ko: '오피스 휴지통', en: 'Garbage can', note: '사무용 금속 휴지통' },
      { ko: '쓰레기 봉투', en: 'Garbage bin' },
    ],
    sourceUrl: 'https://game8.co/games/Animal-Crossing-New-Horizons/archives/286717',
  },
  {
    id: 'kitchen',
    emoji: '🍳',
    title: '주방 (요리)',
    enTitle: 'Kitchenware (Cooking)',
    what: '2.0 업데이트 이후, 요리 레시피를 배우면 일부 주방 가구에서 음식을 만들 수 있습니다.',
    tips: [
      '요리하려면 먼저 "요리 DIY 레시피+"를 해금하고 재료(채소·생선 등)가 필요합니다.',
      '주방 외형이라도 요리가 되는 건 일부입니다(나머지는 옷장 기능인 경우 많음).',
    ],
    examples: [
      { ko: '시스템 키친', en: 'System kitchen' },
      { ko: '스톤 키친(돌 주방)', en: 'Stonework kitchen' },
      { ko: '키친 아일랜드', en: 'Kitchen island' },
      { ko: '랜치 키친', en: 'Ranch kitchen' },
      { ko: '주방 가스레인지', en: 'Kitchen stove' },
    ],
    sourceUrl: 'https://nookipedia.com/wiki/Furniture/New_Horizons/Kitchen',
  },
  {
    id: 'mirror',
    emoji: '🪞',
    title: '거울 (외모 변경)',
    enTitle: 'Mirror',
    what: 'A로 열면 헤어스타일·얼굴 등 외모를 바꿀 수 있습니다(미용 메뉴).',
    tips: ['전신 거울(姿見)은 옷 갈아입기까지 되는 경우가 있습니다.'],
    examples: [
      { ko: '전신 거울', en: 'Full-length mirror' },
      { ko: '탁상 거울', en: 'Vanity / Mirror' },
      { ko: '화장대', en: 'Dresser (vanity)' },
    ],
    sourceUrl: 'https://nookipedia.com/wiki/Furniture/New_Horizons',
  },
  {
    id: 'toilet',
    emoji: '🚽',
    title: '변기 (앉기 모션)',
    enTitle: 'Toilet',
    what: 'A로 상호작용해 앉는 모션을 합니다. 실제 효과는 없지만 인테리어 상호작용 가구입니다.',
    examples: [
      { ko: '양변기', en: 'Toilet' },
      { ko: '간이 화장실', en: 'Public-restroom toilet' },
    ],
    sourceUrl: 'https://nookipedia.com/wiki/Furniture/New_Horizons',
  },
  {
    id: 'bed',
    emoji: '🛏️',
    title: '침대 (눕기)',
    enTitle: 'Bed',
    what: 'A로 누울 수 있습니다. 자면 화면이 어두워지는 연출이 있습니다.',
    examples: [
      { ko: '통나무 침대', en: 'Log bed' },
      { ko: '천장 달린 침대', en: 'Canopy bed' },
      { ko: '병원 침대', en: 'Hospital bed' },
    ],
    sourceUrl: 'https://nookipedia.com/wiki/Furniture/New_Horizons',
  },
  {
    id: 'stereo',
    emoji: '🎵',
    title: '오디오 (음악 재생)',
    enTitle: 'Stereo / Audio',
    what: '보유한 K.K. 슬라이더 음악(뮤직)을 넣어 재생할 수 있습니다.',
    tips: ['일부 기기는 음질(라디오/하이파이)에 따라 재생 느낌이 다릅니다.'],
    examples: [
      { ko: '하이파이 스테레오', en: 'Hi-fi stereo' },
      { ko: '카세트 플레이어', en: 'Cassette player' },
      { ko: '레코드플레이어', en: 'Record player' },
    ],
    sourceUrl: 'https://nookipedia.com/wiki/Furniture/New_Horizons',
  },
  {
    id: 'seating',
    emoji: '🪑',
    title: '의자·소파 (앉기)',
    enTitle: 'Seating',
    what: 'A로 앉을 수 있습니다. 일부는 앉아서 도구를 쓰는 등 연출이 있습니다.',
    examples: [
      { ko: '나무 의자', en: 'Wooden chair' },
      { ko: '소파', en: 'Sofa' },
      { ko: '그루터기 의자', en: 'Log stool' },
    ],
    sourceUrl: 'https://nookipedia.com/wiki/Furniture/New_Horizons',
  },
  {
    id: 'lighting',
    emoji: '💡',
    title: '조명 (켜고 끄기)',
    enTitle: 'Lighting',
    what: 'A로 불을 켜고 끌 수 있습니다. 밤에 분위기를 낼 때 유용합니다.',
    examples: [
      { ko: '플로어 램프', en: 'Floor lamp' },
      { ko: '탁상 램프', en: 'Table lamp' },
      { ko: '초롱(랜턴)', en: 'Lantern' },
    ],
    sourceUrl: 'https://nookipedia.com/wiki/Furniture/New_Horizons',
  },
];
